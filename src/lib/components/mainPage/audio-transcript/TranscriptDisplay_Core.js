/**
 * TranscriptDisplay_Core.js
 *
 * Core helpers for the TranscriptDisplay component.
 *
 * These are plain functions that operate on a `ctx` object owned by the
 * component (props down / callbacks up — the same pattern the
 * lyrics-collection/modules use). No Svelte stores: the component holds its
 * own `let` state and passes accessors in through `ctx`.
 *
 * The `ctx` shape (built once in TranscriptDisplay.svelte):
 * {
 *   dispatch,                      // createEventDispatcher() result
 *   getTranscript(),               // current transcript string
 *   getEditableTranscript(),       // contenteditable DOM node
 *   getTranscriptBoxRef(),         // scroll container DOM node
 *   getParentContainer(),          // parent collection container
 *   getSelectedText(), setSelectedText(v),
 *   getSelectionActive(),
 *   setSelectionActive(v), setSelectionLeft(v), setSelectionTop(v),
 *   getNotificationTimeout(), setNotificationTimeout(v),
 *   setNotification(v),
 *   setIsScrollable(v),
 *   setIsRerolling(v), getIsRerolling(),
 * }
 */

import { dev } from "$app/environment";
import { onMount } from "svelte";
import { transcriptionState } from "$lib/services";

// Read the current transcript text out of the editable DOM, falling back to
// the component's transcript string.
export function getEditedTranscript(ctx) {
  const editableTranscript = ctx.getEditableTranscript();
  const transcript = ctx.getTranscript();

  if (!editableTranscript) return transcript;

  // Get all lyric lines and join them with newlines
  const lyricLines = editableTranscript.querySelectorAll(".lyric-line");
  if (lyricLines.length > 0) {
    return Array.from(lyricLines)
      .map((line) => line.textContent)
      .join("\n");
  }

  // Fallback to innerText if no lyric lines found
  return editableTranscript.innerText;
}

export function checkScrollable(ctx) {
  const transcriptBoxRef = ctx.getTranscriptBoxRef();

  if (transcriptBoxRef) {
    const hasOverflow =
      transcriptBoxRef.scrollHeight > transcriptBoxRef.clientHeight + 20; // Add buffer for more reliable detection
    ctx.setIsScrollable(hasOverflow);
  }
}

export function isWebShareSupported() {
  return (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    navigator.share &&
    typeof navigator.share === "function"
  );
}

export function handleReroll(ctx) {
  if (ctx.getIsRerolling()) return; // Prevent multiple simultaneous re-rolls

  try {
    ctx.setIsRerolling(true);

    // Instead of directly accessing the blob (which we don't have here),
    // we'll dispatch an event to the parent to request a re-roll
    ctx.dispatch("reroll");

    // Note: We no longer manually set the text here since the transcription text
    // is managed by the transcriptionState store from the parent component
    // and will be automatically updated there
  } catch (error) {
    console.error("Error re-rolling transcript:", error);
    // Return to original state if there's an error
    ctx.setIsRerolling(false);
  }
}

// Lifecycle management — wires up global listeners and the transcription-state
// subscription. Returns a cleanup function the component calls onDestroy.
export function setupLifecycleHooks(ctx, handlers) {
  const {
    handleTextSelection,
    handleClickOutside,
    handleKeyboardShortcut,
    handleCollectSnippet,
    handleDirectCollection,
  } = handlers;
  let cleanupFromMount = null;
  const transcriptionStateUnsubscribe = transcriptionState.subscribe(
    (state) => {
      if (!state.inProgress && !state.rerolling) {
        ctx.setIsRerolling(false);
      }
    },
  );

  onMount(() => {
    // Check if content is scrollable on mount
    checkScrollable(ctx);

    // Initialize collection in progress flag
    if (typeof window !== "undefined") {
      window.collectionInProgress = false;
    }

    // Make this component available globally for debugging in local dev only.
    if (dev && typeof window !== "undefined") {
      window.forceCollect = (text) => {
        handleCollectSnippet({ detail: { text: text || ctx.getSelectedText() } });
      };

      // Create a debug monitor object to track transcript selection state
      window.transcriptDebug = {
        getSelectedText: () => ctx.getSelectedText(),
        forceCollect: (text) => {
          handleCollectSnippet({ detail: { text: text || ctx.getSelectedText() } });
          return "Collection triggered";
        },
        forceDirectCollect: (text) => {
          handleDirectCollection({ detail: { text: text || ctx.getSelectedText() } });
          return "Direct collection triggered";
        },
        resetCollectionFlag: () => {
          window.collectionInProgress = false;
          return "Collection flag reset";
        },
        getComponentInfo: () => {
          const parentContainer = ctx.getParentContainer();

          return {
            hasParentContainer: !!parentContainer,
            parentContainerHasAddMethod:
              parentContainer &&
              typeof parentContainer.addLyricsSnippet === "function",
            currentSelectedText: ctx.getSelectedText(),
            isSelectionActive: ctx.getSelectionActive(),
            collectionInProgress: window.collectionInProgress,
          };
        },
      };
    }

    // Watch for content changes to update scrollable state
    const resizeObserver = new ResizeObserver(() => {
      checkScrollable(ctx);
    });

    const transcriptBoxRef = ctx.getTranscriptBoxRef();
    if (transcriptBoxRef) {
      resizeObserver.observe(transcriptBoxRef);
    }

    // Add event listeners for selection
    document.addEventListener("mouseup", handleTextSelection);
    document.addEventListener("touchend", handleTextSelection);
    document.addEventListener("click", handleClickOutside);

    // Add keyboard shortcut handler
    document.addEventListener("keydown", handleKeyboardShortcut);

    cleanupFromMount = () => {
      const boxRef = ctx.getTranscriptBoxRef();
      if (boxRef) {
        resizeObserver.unobserve(boxRef);
      }

      // Remove event listeners
      document.removeEventListener("mouseup", handleTextSelection);
      document.removeEventListener("touchend", handleTextSelection);
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyboardShortcut);

      // Clear any notification timeout
      const notificationTimeout = ctx.getNotificationTimeout();
      if (notificationTimeout) {
        clearTimeout(notificationTimeout);
      }
    };

    return () => {
      if (cleanupFromMount) {
        cleanupFromMount();
        cleanupFromMount = null;
      }
    };
  });

  // Return a cleanup function
  return () => {
    transcriptionStateUnsubscribe();

    if (cleanupFromMount) {
      cleanupFromMount();
      cleanupFromMount = null;
    }

    const notificationTimeout = ctx.getNotificationTimeout();
    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
    }
  };
}
