/**
 * TranscriptDisplay_Core.js
 * 
 * Core state and configuration for the TranscriptDisplay component.
 * This module contains all props, refs, state variables, and basic UI handlers.
 */

import { ANIMATION, ATTRIBUTION } from '$lib/constants';
import { onMount, onDestroy } from 'svelte';
import { geminiService } from '$lib/services/geminiService';
import { transcriptionService } from '$lib/services/transcription/transcriptionService';
import { transcriptionText, uiActions, transcriptionState } from '$lib/services';
import { get, writable, derived } from 'svelte/store';

// Do NOT create event dispatcher here - it needs to be created inside a component
// We'll export a function that creates it instead

// Props and state as Svelte stores
export const transcriptStore = writable('');

// FIXED: Create a derived store that syncs with the app's transcription state
// This ensures transcriptStore always reflects the current transcript text
transcriptionText.subscribe(text => {
  if (text && text !== get(transcriptStore)) {
    console.log('[DEBUG] TranscriptDisplay_Core: Updating transcriptStore from transcriptionText', text.substring(0, 30));
    transcriptStore.set(text);
  }
});

export const showCopyTooltipStore = writable(false);
export const responsiveFontSizeStore = writable('text-base');
export const parentContainerStore = writable(null);

// DOM references as Svelte stores
export const editableTranscriptStore = writable(null);
export const copyButtonRefStore = writable(null);
export const transcriptBoxRefStore = writable(null);

// Notification system state as Svelte stores
export const notificationStore = writable(null);
export const notificationTimeoutStore = writable(null);

// UI state flags as Svelte stores
export const tooltipHoverCountStore = writable(0);
export const hasUsedCopyButtonStore = writable(false);
export const isScrollableStore = writable(false);
export const showRerollTooltipStore = writable(false);
export const isRerollingStore = writable(false);

// Text selection state as Svelte stores
export const selectionActiveStore = writable(false);
export const selectionLeftStore = writable(0);
export const selectionTopStore = writable(0);
export const selectedTextStore = writable('');
export const currentSelectionStore = writable(null);

// Export event dispatcher store - will be set by the component
export const dispatchStore = writable(null);

// Export basic UI interaction handlers
export function getEditedTranscript() {
  const editableTranscript = get(editableTranscriptStore);
  const transcript = get(transcriptStore);
  
  if (!editableTranscript) return transcript;
  
  // Get all lyric lines and join them with newlines
  const lyricLines = editableTranscript.querySelectorAll('.lyric-line');
  if (lyricLines.length > 0) {
    return Array.from(lyricLines).map(line => line.textContent).join('\n');
  }
  
  // Fallback to innerText if no lyric lines found
  return editableTranscript.innerText;
}

export function handleTooltipMouseEnter() {
  const hasUsedCopyButton = get(hasUsedCopyButtonStore);
  const tooltipHoverCount = get(tooltipHoverCountStore);
  
  if (typeof window !== 'undefined' && 
      window.innerWidth >= 640 &&
      !hasUsedCopyButton &&
      tooltipHoverCount < ANIMATION.COPY.TOOLTIP_MAX_COUNT) {
    showCopyTooltipStore.set(true);
    tooltipHoverCountStore.set(tooltipHoverCount + 1);
  }
}

export function checkScrollable() {
  const transcriptBoxRef = get(transcriptBoxRefStore);
  
  if (transcriptBoxRef) {
    const hasOverflow = transcriptBoxRef.scrollHeight > transcriptBoxRef.clientHeight + 20; // Add buffer for more reliable detection
    isScrollableStore.set(hasOverflow);
    const isScrollable = hasOverflow;
    
    // We could also check if we're near the bottom to hide the indicator
    // but for simplicity, we'll just show it whenever there's overflow
    console.log(`Transcript scrollable: ${isScrollable}, height: ${transcriptBoxRef.scrollHeight}, visible: ${transcriptBoxRef.clientHeight}`);
  }
}

export function isWebShareSupported() {
  return (
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    navigator.share &&
    typeof navigator.share === 'function'
  );
}

export function handleRerollTooltipMouseEnter() {
  if (typeof window !== 'undefined' && 
      window.innerWidth >= 640) {
    showRerollTooltipStore.set(true);
  }
}

export function handleReroll() {
  const isRerolling = get(isRerollingStore);
  const dispatch = get(dispatchStore);
  
  if (isRerolling || !dispatch) return; // Prevent multiple simultaneous re-rolls
  
  try {
    isRerollingStore.set(true);
    
    // Instead of directly accessing the blob (which we don't have here), 
    // we'll dispatch an event to the parent to request a re-roll
    dispatch('reroll');
    
    // Note: We no longer manually set the text here since the transcription text
    // is managed by the transcriptionState store from the parent component
    // and will be automatically updated there
  } catch (error) {
    console.error("Error re-rolling transcript:", error);
    // Return to original state if there's an error
    isRerollingStore.set(false);
  } finally {
    // Set a timeout to reset the isRerolling state after a reasonable time
    // This ensures we can re-roll again if something goes wrong
    setTimeout(() => {
      isRerollingStore.set(false);
    }, 5000);
  }
}

// Lifecycle management
export function setupLifecycleHooks(handlers) {
  const { handleTextSelection, handleClickOutside, handleKeyboardShortcut, handleCollectSnippet, handleDirectCollection } = handlers;
  
  onMount(() => {
    // Check if content is scrollable on mount
    checkScrollable();
    
    // Initialize collection in progress flag
    if (typeof window !== 'undefined') {
      window.collectionInProgress = false;
    }
    
    // Make this component available globally for debugging
    if (typeof window !== 'undefined') {
      window.transcriptDisplay = { stores: {
        transcriptStore,
        showCopyTooltipStore,
        editableTranscriptStore,
        selectedTextStore,
        selectionActiveStore
      }};
      
      window.forceCollect = (text) => {
        const selectedText = get(selectedTextStore);
        handleCollectSnippet({ detail: { text: text || selectedText } });
      };
      
      // Create a debug monitor object to track transcript selection state
      window.transcriptDebug = {
        getSelectedText: () => get(selectedTextStore),
        forceCollect: (text) => {
          const selectedText = get(selectedTextStore);
          handleCollectSnippet({ detail: { text: text || selectedText } });
          return 'Collection triggered';
        },
        forceDirectCollect: (text) => {
          const selectedText = get(selectedTextStore);
          handleDirectCollection({ detail: { text: text || selectedText } });
          return 'Direct collection triggered';
        },
        resetCollectionFlag: () => {
          window.collectionInProgress = false;
          return 'Collection flag reset';
        },
        getComponentInfo: () => {
          const parentContainer = get(parentContainerStore);
          const selectedText = get(selectedTextStore);
          const selectionActive = get(selectionActiveStore);
          
          return {
            hasParentContainer: !!parentContainer,
            parentContainerHasAddMethod: parentContainer && typeof parentContainer.addLyricsSnippet === 'function',
            currentSelectedText: selectedText,
            isSelectionActive: selectionActive,
            collectionInProgress: window.collectionInProgress
          };
        }
      };
      
      console.log('TranscriptDisplay debug functions available at window.transcriptDebug');
    }
    
    // Watch for content changes to update scrollable state
    const resizeObserver = new ResizeObserver(() => {
      checkScrollable();
    });
    
    const transcriptBoxRef = get(transcriptBoxRefStore);
    if (transcriptBoxRef) {
      resizeObserver.observe(transcriptBoxRef);
    }
    
    // Add event listeners for selection
    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('touchend', handleTextSelection);
    document.addEventListener('click', handleClickOutside);
    
    // Add keyboard shortcut handler
    document.addEventListener('keydown', handleKeyboardShortcut);
    
    return () => {
      const transcriptBoxRef = get(transcriptBoxRefStore);
      if (transcriptBoxRef) {
        resizeObserver.unobserve(transcriptBoxRef);
      }
      
      // Remove event listeners
      document.removeEventListener('mouseup', handleTextSelection);
      document.removeEventListener('touchend', handleTextSelection);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyboardShortcut);
      
      // Clear any notification timeout
      const notificationTimeout = get(notificationTimeoutStore);
      if (notificationTimeout) {
        clearTimeout(notificationTimeout);
      }
    };
  });
  
  // Return a cleanup function
  return () => {
    const notificationTimeout = get(notificationTimeoutStore);
    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
    }
  };
}