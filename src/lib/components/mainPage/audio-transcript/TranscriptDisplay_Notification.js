/**
 * TranscriptDisplay_Notification.js
 *
 * Notification and feedback system for the TranscriptDisplay component.
 * This module handles user feedback interactions including collecting snippets,
 * showing notifications, and handling collection errors.
 *
 * These are plain functions that operate on the component's `ctx` object
 * (see TranscriptDisplay_Core.js for the shape). No Svelte stores.
 */

import { dev } from "$app/environment";
import { hideSelectionButton } from "./TranscriptDisplay_Selection.js";

// This file's console.log calls are leftover DOM-hunting debug scaffolding
// (selected text, fallback-path tracing) — gate them so they never leak
// user transcript content to a production console.
function debugLog(...args) {
  if (dev) {
    console.log(...args);
  }
}

// Export notification functions
export function showNotification(ctx, { message, type = "info" }) {
  // Clear any existing notification timeout
  const notificationTimeout = ctx.getNotificationTimeout();
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }

  // For success notifications (including visual effect for text selection)
  if (
    (type === "success" && message.includes("collected")) ||
    message === "Line collected!"
  ) {
    // Find both the transcription box and the selected text element
    const transcriptBox = document.querySelector(".transcript-box");
    const editableTranscript = ctx.getEditableTranscript();
    const selectedLine =
      editableTranscript?.querySelector(".lyric-line-grabbed") ||
      editableTranscript?.querySelector(".selected");
    if (!transcriptBox || !selectedLine) {
      // If we can't find the elements, just show a global notification
      ctx.setNotification({ message, type });

      const newTimeout = setTimeout(() => {
        ctx.setNotification(null);
      }, 2000);

      ctx.setNotificationTimeout(newTimeout);
      return;
    }

    // Add a subtle pulse animation to the selected line
    selectedLine.classList.add("lyric-pulse-collected");

    // Remove the animation class after it completes
    setTimeout(() => {
      if (selectedLine.classList.contains("lyric-pulse-collected")) {
        selectedLine.classList.remove("lyric-pulse-collected");
      }
    }, 1500);

    // ALWAYS set global notification for collection actions
    ctx.setNotification({ message, type });

    const newTimeout = setTimeout(() => {
      ctx.setNotification(null);
    }, 1500);

    ctx.setNotificationTimeout(newTimeout);
    return;
  }

  // For other notifications, set the global notification
  ctx.setNotification({ message, type });

  // Auto-hide after shorter time for success notifications
  const hideDelay = type === "success" ? 1500 : 2500;

  const newTimeout = setTimeout(() => {
    ctx.setNotification(null);
  }, hideDelay);

  ctx.setNotificationTimeout(newTimeout);
}

export function handleCollectSnippet(ctx, event) {
  // Get the text from the event detail
  const { text } = event.detail;
  let collectionSuccessful = false;

  // Skip if collection already in progress
  if (typeof window !== "undefined" && window.collectionInProgress) {
    debugLog(
      "Collection already in progress in handleCollectSnippet, skipping",
    );
    return;
  }

  // Set flag to prevent duplicate collection
  if (typeof window !== "undefined") {
    window.collectionInProgress = true;
    debugLog("Setting collection in progress flag in handleCollectSnippet");
  }

  const parentContainer = ctx.getParentContainer();

  debugLog("TranscriptDisplay.handleCollectSnippet called with text:", text);
  debugLog("parentContainer exists:", !!parentContainer);

  if (parentContainer) {
    debugLog(
      "parentContainer addLyricsSnippet exists:",
      typeof parentContainer.addLyricsSnippet === "function",
    );
  }

  if (text && text.trim()) {
    // Try multiple collection methods in order of preference

    // 1. Direct window method (preferred) - from LyricsPanel global export
    if (
      typeof window !== "undefined" &&
      typeof window.addToMainCollectionBox === "function"
    ) {
      debugLog("Using direct window.addToMainCollectionBox method");
      try {
        const added = window.addToMainCollectionBox(text);
        if (added) {
          debugLog("Collection successful via window.addToMainCollectionBox");
          collectionSuccessful = true;
        }
      } catch (err) {
        console.error("Error using window.addToMainCollectionBox:", err);
      }
    }

    // 2. Parent container method (if direct method failed)
    if (
      !collectionSuccessful &&
      parentContainer &&
      typeof parentContainer.addLyricsSnippet === "function"
    ) {
      debugLog(
        "TranscriptDisplay: Trying parentContainer.addLyricsSnippet as fallback",
      );
      try {
        const added = parentContainer.addLyricsSnippet(text);
        debugLog(
          "TranscriptDisplay: parentContainer.addLyricsSnippet returned:",
          added,
        );

        if (added) {
          debugLog("Collection successful via parent container");
          collectionSuccessful = true;
        }
      } catch (err) {
        console.error("Error using parentContainer.addLyricsSnippet:", err);
      }
    }

    // 3. Global trigger method (last resort)
    if (!collectionSuccessful && typeof window !== "undefined") {
      debugLog("Attempting collection via global trigger mechanism");
      window.transcriptSelectedText = text.trim();
      window.transcriptCollectTrigger = true;

      // We'll assume this worked since we have no way to check synchronously
      // The collection boxes should be monitoring for this flag
      collectionSuccessful = true;
    }

    // Show appropriate notification based on collection result
    if (collectionSuccessful) {
      showNotification(ctx, {
        message: "Line collected!",
        type: "success",
      });

      // Add to window for debugging
      if (typeof window !== "undefined") {
        window.lastCollectedText = text;
      }
    } else {
      console.error("All collection methods failed");
      showNotification(ctx, {
        message: "Try using the Grab Lyrics button instead",
        type: "info",
      });
    }

    // Reset collection flag after a delay
    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.collectionInProgress = false;
        debugLog(
          "Resetting collection in progress flag in handleCollectSnippet",
        );
      }, 500);
    }

    // Always clear the selection regardless of collection success
    ctx.setSelectedText(""); // Reset the text AFTER collection is complete
    hideSelectionButton(ctx);
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
    }
  } else {
    // No valid text
    showNotification(ctx, {
      message: "No text selected",
      type: "error",
    });

    // Reset collection flag
    if (typeof window !== "undefined") {
      window.collectionInProgress = false;
      debugLog("Resetting collection in progress flag - no valid text");
    }
  }
}

export function handleCollectionError(ctx, event) {
  const { message } = event.detail;

  showNotification(ctx, {
    message: message || "Failed to collect snippet",
    type: "error",
  });

  // Reset collection flag
  if (typeof window !== "undefined") {
    window.collectionInProgress = false;
    debugLog("Resetting collection in progress flag in handleCollectionError");
  }
}

export function handleDirectCollection(ctx, event) {
  const { text } = event.detail;
  let collectionSuccessful = false;

  // Skip if collection already in progress
  if (typeof window !== "undefined" && window.collectionInProgress) {
    debugLog(
      "Collection already in progress in handleDirectCollection, skipping",
    );
    return;
  }

  // Set flag to prevent duplicate collection
  if (typeof window !== "undefined") {
    window.collectionInProgress = true;
    debugLog("Setting collection in progress flag in handleDirectCollection");
  }

  if (!text || !text.trim()) {
    showNotification(ctx, {
      message: "No text selected for direct collection",
      type: "error",
    });

    // Reset collection flag
    if (typeof window !== "undefined") {
      window.collectionInProgress = false;
    }

    return;
  }

  debugLog("TranscriptDisplay: Direct collection requested:", text);

  // Try multiple collection methods in order of preference
  const parentContainer = ctx.getParentContainer();

  // 1. Direct window method (preferred)
  if (
    typeof window !== "undefined" &&
    typeof window.addToMainCollectionBox === "function"
  ) {
    try {
      debugLog(
        "Using direct window.addToMainCollectionBox method for direct collection",
      );
      const added = window.addToMainCollectionBox(text);
      if (added) {
        debugLog(
          "Direct collection successful via window.addToMainCollectionBox",
        );
        collectionSuccessful = true;
      }
    } catch (err) {
      console.error(
        "Error using window.addToMainCollectionBox for direct collection:",
        err,
      );
    }
  }

  // 2. Parent container method (if direct method failed)
  if (
    !collectionSuccessful &&
    parentContainer &&
    typeof parentContainer.addLyricsSnippet === "function"
  ) {
    try {
      debugLog(
        "Using parentContainer.addLyricsSnippet as fallback for direct collection",
      );
      const success = parentContainer.addLyricsSnippet(text);

      if (success) {
        debugLog("Direct collection successful via parent container");
        collectionSuccessful = true;
      }
    } catch (err) {
      console.error(
        "Error using parentContainer.addLyricsSnippet for direct collection:",
        err,
      );
    }
  }

  // 3. Global trigger method (last resort)
  if (!collectionSuccessful && typeof window !== "undefined") {
    debugLog("Attempting direct collection via global trigger mechanism");
    window.transcriptSelectedText = text.trim();
    window.transcriptCollectTrigger = true;

    // We'll assume this worked since we have no way to check synchronously
    collectionSuccessful = true;
  }

  // Show appropriate notification and clear selection
  if (collectionSuccessful) {
    showNotification(ctx, {
      message: "Line collected!",
      type: "success",
    });

    // Clear the selection
    ctx.setSelectedText("");
    hideSelectionButton(ctx);
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
    }
  } else {
    console.error("All direct collection methods failed");
    showNotification(ctx, {
      message: "Collection failed, try the Grab Lyrics button instead",
      type: "info",
    });
  }

  // Reset collection flag after a delay
  if (typeof window !== "undefined") {
    setTimeout(() => {
      window.collectionInProgress = false;
      debugLog(
        "Resetting collection in progress flag in handleDirectCollection",
      );
    }, 500);
  }
}

export function handleClickOutside(ctx, event) {
  const editableTranscript = ctx.getEditableTranscript();

  // Don't hide if clicking on the selection button
  const isSelectButton = event.target.closest(".selection-button-container");
  if (isSelectButton) {
    debugLog("Click on selection button, keeping visible");
    return;
  }

  if (editableTranscript && !editableTranscript.contains(event.target)) {
    debugLog("Click outside transcript, hiding selection button");
    hideSelectionButton(ctx);
  }
}

export function handleKeyboardShortcut(ctx, event) {
  const selectedText = ctx.getSelectedText();

  // Debug shortcut: Ctrl+Shift+A adds test snippet
  if (dev && event.ctrlKey && event.shiftKey && event.key === "A") {
    debugLog("Debug shortcut: Adding current selection");
    if (selectedText) {
      handleCollectSnippet(ctx, { detail: { text: selectedText } });
    } else {
      // Add generic test text
      handleCollectSnippet(ctx, {
        detail: {
          text: `Test text from keyboard shortcut at ${new Date().toLocaleTimeString()}`,
        },
      });
    }
  }
}
