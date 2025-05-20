/**
 * TranscriptDisplay_Notification.js
 * 
 * Notification and feedback system for the TranscriptDisplay component.
 * This module handles user feedback interactions including collecting snippets,
 * showing notifications, and handling collection errors.
 */

import {
  notificationStore, notificationTimeoutStore, parentContainerStore, 
  selectedTextStore, editableTranscriptStore, dispatchStore,
  selectionActiveStore
} from './TranscriptDisplay_Core.js';

import { get } from 'svelte/store';

// Export notification functions
export function showNotification({ message, type = 'info' }) {
  // Clear any existing notification timeout
  const notificationTimeout = get(notificationTimeoutStore);
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }
  
  // For success notifications (including visual effect for text selection)
  if (type === 'success' && message.includes('collected') || message === 'Line collected!') {
    // Find both the transcription box and the selected text element
    const transcriptBox = document.querySelector('.transcript-box');
    const editableTranscript = get(editableTranscriptStore);
    const selectedLine = editableTranscript?.querySelector('.lyric-line-grabbed') || 
                        editableTranscript?.querySelector('.selected');
    if (!transcriptBox || !selectedLine) {
      // If we can't find the elements, just show a global notification
      notificationStore.set({ message, type });
      
      const newTimeout = setTimeout(() => {
        notificationStore.set(null);
      }, 2000);
      
      notificationTimeoutStore.set(newTimeout);
      return;
    }
    
    // Add a subtle pulse animation to the selected line
    selectedLine.classList.add('lyric-pulse-collected');
    
    // Remove the animation class after it completes
    setTimeout(() => {
      if (selectedLine.classList.contains('lyric-pulse-collected')) {
        selectedLine.classList.remove('lyric-pulse-collected');
      }
    }, 1500);
    
    // ALWAYS set global notification for collection actions
    notificationStore.set({ message, type });
    
    const newTimeout = setTimeout(() => {
      notificationStore.set(null);
    }, 1500);
    
    notificationTimeoutStore.set(newTimeout);
    return;
  }
  
  // For other notifications, set the global notification
  notificationStore.set({ message, type });
  
  // Auto-hide after shorter time for success notifications
  const hideDelay = type === 'success' ? 1500 : 2500;
  
  const newTimeout = setTimeout(() => {
    notificationStore.set(null);
  }, hideDelay);
  
  notificationTimeoutStore.set(newTimeout);
}

export function handleCollectSnippet(event) {
  // Get the text from the event detail
  const { text, success } = event.detail;
  let collectionSuccessful = false;
  
  // Skip if collection already in progress
  if (typeof window !== 'undefined' && window.collectionInProgress) {
    console.log('Collection already in progress in handleCollectSnippet, skipping');
    return;
  }
  
  // Set flag to prevent duplicate collection
  if (typeof window !== 'undefined') {
    window.collectionInProgress = true;
    console.log('Setting collection in progress flag in handleCollectSnippet');
  }
  
  const parentContainer = get(parentContainerStore);
  
  console.log('TranscriptDisplay.handleCollectSnippet called with text:', text);
  console.log('parentContainer exists:', !!parentContainer);
  
  if (parentContainer) {
    console.log('parentContainer addLyricsSnippet exists:', typeof parentContainer.addLyricsSnippet === 'function');
  }
  
  if (text && text.trim()) {
    // Try multiple collection methods in order of preference
    
    // 1. Direct window method (preferred) - from PurpleStyleCollectionBox global export
    if (typeof window !== 'undefined' && typeof window.addToMainCollectionBox === 'function') {
      console.log('Using direct window.addToMainCollectionBox method');
      try {
        const added = window.addToMainCollectionBox(text);
        if (added) {
          console.log('Collection successful via window.addToMainCollectionBox');
          collectionSuccessful = true;
        }
      } catch (err) {
        console.error('Error using window.addToMainCollectionBox:', err);
      }
    }
    
    // 2. Parent container method (if direct method failed)
    if (!collectionSuccessful && parentContainer && typeof parentContainer.addLyricsSnippet === 'function') {
      console.log('TranscriptDisplay: Trying parentContainer.addLyricsSnippet as fallback');
      try {
        const added = parentContainer.addLyricsSnippet(text);
        console.log('TranscriptDisplay: parentContainer.addLyricsSnippet returned:', added);
        
        if (added) {
          console.log('Collection successful via parent container');
          collectionSuccessful = true;
        }
      } catch (err) {
        console.error('Error using parentContainer.addLyricsSnippet:', err);
      }
    }
    
    // 3. Global trigger method (last resort)
    if (!collectionSuccessful && typeof window !== 'undefined') {
      console.log('Attempting collection via global trigger mechanism');
      window.transcriptSelectedText = text.trim();
      window.transcriptCollectTrigger = true;
      
      // We'll assume this worked since we have no way to check synchronously
      // The collection boxes should be monitoring for this flag
      collectionSuccessful = true;
    }
    
    // Show appropriate notification based on collection result
    if (collectionSuccessful) {
      showNotification({
        message: 'Line collected!',
        type: 'success'
      });
      
      // Add to window for debugging
      if (typeof window !== 'undefined') {
        window.lastCollectedText = text;
      }
    } else {
      console.error('All collection methods failed');
      showNotification({
        message: 'Try using the Grab Lyrics button instead',
        type: 'info'
      });
    }
    
    // Reset collection flag after a delay
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.collectionInProgress = false;
        console.log('Resetting collection in progress flag in handleCollectSnippet');
      }, 500);
    }
    
    // Always clear the selection regardless of collection success
    selectedTextStore.set(''); // Reset the text AFTER collection is complete
    hideSelectionButton();
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
    }
  } else {
    // No valid text
    showNotification({
      message: 'No text selected',
      type: 'error'
    });
    
    // Reset collection flag
    if (typeof window !== 'undefined') {
      window.collectionInProgress = false;
      console.log('Resetting collection in progress flag - no valid text');
    }
  }
}

export function handleCollectionError(event) {
  const { message } = event.detail;
  
  showNotification({
    message: message || 'Failed to collect snippet',
    type: 'error'
  });
  
  // Reset collection flag
  if (typeof window !== 'undefined') {
    window.collectionInProgress = false;
    console.log('Resetting collection in progress flag in handleCollectionError');
  }
}

export function handleDirectCollection(event) {
  const { text } = event.detail;
  let collectionSuccessful = false;
  
  // Skip if collection already in progress
  if (typeof window !== 'undefined' && window.collectionInProgress) {
    console.log('Collection already in progress in handleDirectCollection, skipping');
    return;
  }
  
  // Set flag to prevent duplicate collection
  if (typeof window !== 'undefined') {
    window.collectionInProgress = true;
    console.log('Setting collection in progress flag in handleDirectCollection');
  }
  
  if (!text || !text.trim()) {
    showNotification({
      message: 'No text selected for direct collection',
      type: 'error'
    });
    
    // Reset collection flag
    if (typeof window !== 'undefined') {
      window.collectionInProgress = false;
    }
    
    return;
  }
  
  console.log('TranscriptDisplay: Direct collection requested:', text);
  
  // Try multiple collection methods in order of preference
  const parentContainer = get(parentContainerStore);
  
  // 1. Direct window method (preferred) 
  if (typeof window !== 'undefined' && typeof window.addToMainCollectionBox === 'function') {
    try {
      console.log('Using direct window.addToMainCollectionBox method for direct collection');
      const added = window.addToMainCollectionBox(text);
      if (added) {
        console.log('Direct collection successful via window.addToMainCollectionBox');
        collectionSuccessful = true;
      }
    } catch (err) {
      console.error('Error using window.addToMainCollectionBox for direct collection:', err);
    }
  }
  
  // 2. Parent container method (if direct method failed)
  if (!collectionSuccessful && parentContainer && typeof parentContainer.addLyricsSnippet === 'function') {
    try {
      console.log('Using parentContainer.addLyricsSnippet as fallback for direct collection');
      const success = parentContainer.addLyricsSnippet(text);
      
      if (success) {
        console.log('Direct collection successful via parent container');
        collectionSuccessful = true;
      }
    } catch (err) {
      console.error('Error using parentContainer.addLyricsSnippet for direct collection:', err);
    }
  }
  
  // 3. Global trigger method (last resort)
  if (!collectionSuccessful && typeof window !== 'undefined') {
    console.log('Attempting direct collection via global trigger mechanism');
    window.transcriptSelectedText = text.trim();
    window.transcriptCollectTrigger = true;
    
    // We'll assume this worked since we have no way to check synchronously
    collectionSuccessful = true;
  }
  
  // Show appropriate notification and clear selection
  if (collectionSuccessful) {
    showNotification({
      message: 'Line collected!',
      type: 'success'
    });
    
    // Clear the selection
    selectedTextStore.set('');
    hideSelectionButton();
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
    }
  } else {
    console.error('All direct collection methods failed');
    showNotification({
      message: 'Collection failed, try the Grab Lyrics button instead',
      type: 'info'
    });
  }
  
  // Reset collection flag after a delay
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      window.collectionInProgress = false;
      console.log('Resetting collection in progress flag in handleDirectCollection');
    }, 500);
  }
}

export function handleClickOutside(event) {
  const editableTranscript = get(editableTranscriptStore);
  
  // Don't hide if clicking on the selection button
  const isSelectButton = event.target.closest('.selection-button-container');
  if (isSelectButton) {
    console.log('Click on selection button, keeping visible');
    return;
  }
  
  if (editableTranscript && !editableTranscript.contains(event.target)) {
    console.log('Click outside transcript, hiding selection button');
    hideSelectionButton();
  }
}

export function handleKeyboardShortcut(event) {
  const selectedText = get(selectedTextStore);
  
  // Debug shortcut: Ctrl+Shift+A adds test snippet
  if (event.ctrlKey && event.shiftKey && event.key === 'A') {
    console.log('Debug shortcut: Adding current selection');
    if (selectedText) {
      handleCollectSnippet({ detail: { text: selectedText } });
    } else {
      // Add generic test text
      handleCollectSnippet({ 
        detail: { 
          text: `Test text from keyboard shortcut at ${new Date().toLocaleTimeString()}` 
        } 
      });
    }
  }
}

// Import hideSelectionButton from TranscriptDisplay_Selection
// but use direct functionality to avoid circular dependency
function hideSelectionButton() {
  if (typeof window.getSelection === 'function') {
    window.getSelection().removeAllRanges();
  }
  
  // Set the active state to false via store
  const editableTranscript = get(editableTranscriptStore);
  if (editableTranscript) {
    const allLines = editableTranscript.querySelectorAll('.lyric-line');
    allLines.forEach(line => line.classList.remove('selected'));
  }
  
  // Use local logic instead of importing from Selection module
  selectionActiveStore.set(false);
}