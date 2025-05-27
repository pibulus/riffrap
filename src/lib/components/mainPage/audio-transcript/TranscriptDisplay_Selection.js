/**
 * TranscriptDisplay_Selection.js
 * 
 * Text selection system for the TranscriptDisplay component.
 * This module handles all aspects of text selection within the transcript,
 * including selection detection, highlighting, and selection utilities.
 */

import {
  editableTranscriptStore, transcriptBoxRefStore, 
  selectionActiveStore, selectionLeftStore, selectionTopStore,
  selectedTextStore, currentSelectionStore, dispatchStore,
  parentContainerStore
} from './TranscriptDisplay_Core.js';

import { get } from 'svelte/store';

// Smart selection system - automatically detects chunks vs individual lines

// Export selection-related functions
export function handleTextSelection(event) {
  const editableTranscript = get(editableTranscriptStore);
  if (!editableTranscript || !editableTranscript.contains(event.target)) {
    hideSelectionButton();
    return;
  }
  
  // Get the current selection
  if (window.getSelection) {
    const selection = window.getSelection();
    let selectionText = selection.toString().trim();
    
    // Check if we have a click (rather than a drag selection)
    // We can determine this by checking if the selection is empty
    if (selectionText.length === 0 && event.type === 'mouseup' && event.target.nodeName !== 'BUTTON') {
      // Smart selection: check if the clicked line is part of a chunk (paragraph)
      // If it is, select the whole chunk; otherwise, select just the line
      const shouldSelectChunk = isPartOfChunk(event.target);
      
      if (shouldSelectChunk) {
        // Select the entire chunk/paragraph
        selectEntireParagraph(event.target);
      } else {
        // Select just the single line
        selectEntireLine(event.target);
      }
      
      // After selecting the line, get the new selection
      const newSelection = window.getSelection();
      selectionText = newSelection.toString().trim();
      
      // Add refined haptic feedback pattern designed to feel satisfying
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        // Two-stage tactile feedback: quick double-tap sensation
        // First a short sharp pulse, then a slightly longer one with perfect timing
        window.navigator.vibrate([8, 20, 25]); // Optimized for perceptual satisfaction
      }
      
      // ✨ NEW: Auto-grab the lyric when clicking on a line
      if (selectionText && selectionText.length > 0 && event.type === 'mouseup') {
        // Add visual highlight to the clicked line
        const lineElement = event.target.closest('.lyric-line');
        if (lineElement) {
          // First remove grabbed class from any other line
          const allLines = editableTranscript.querySelectorAll('.lyric-line');
          allLines.forEach(line => line.classList.remove('lyric-line-grabbed'));
          
          // Add grabbed class to current line with a more persistent selection feel
          lineElement.classList.add('lyric-line-grabbed');
          
          // Keep the selection visible for a little longer so the user can see it
          setTimeout(() => {
            if (lineElement.classList.contains('lyric-line-grabbed')) {
              lineElement.classList.remove('lyric-line-grabbed');
            }
          }, 1500);
        }
        
        // Store selected text globally for collection
        if (typeof window !== 'undefined') {
          window.transcriptSelectedText = selectionText;
        }
        
        // Position the selection button and activate it (but keep it invisible)
        if (lineElement) {
          const transcriptBoxRef = get(transcriptBoxRefStore);
          const rect = lineElement.getBoundingClientRect();
          const containerRect = transcriptBoxRef.getBoundingClientRect();
          selectionLeftStore.set(rect.right - containerRect.left - 160); // Position to the right
          selectionTopStore.set(rect.top - containerRect.top + 3); // Slightly below the line
          selectionActiveStore.set(true);
          selectedTextStore.set(selectionText);
        }
        
        // CRITICAL: Find and click the "Grab Lyrics" button in the LyricsPanel
        // Use a flag to prevent duplicate collection
        if (typeof window !== 'undefined' && !window.collectionInProgress) {
          window.collectionInProgress = true;
          console.log('Setting collection in progress flag to prevent duplicates');
          
          setTimeout(() => {
            // Look for a button with specific class
            let grabLyricsButton = document.querySelector('.collect-button');
                  
            if (grabLyricsButton) {
              console.log('Found Grab Lyrics button, triggering click!');
              grabLyricsButton.click();
              
              // Show success notification - use dispatch from store
              const dispatch = get(dispatchStore);
              if (dispatch) {
                dispatch('notification', {
                  message: 'Line collected!',
                  type: 'success'
                });
              }
              
              // Reset collection flag after a delay
              setTimeout(() => {
                window.collectionInProgress = false;
                console.log('Resetting collection in progress flag');
              }, 500);
              
              return; // Exit if we successfully found and clicked the button
            }
            
            // Fallback to direct method if button wasn't found
            if (typeof window !== 'undefined' && 
                typeof window.addToMainCollectionBox === 'function') {
              console.log('Using direct window.addToMainCollectionBox method');
              const result = window.addToMainCollectionBox(selectionText);
              
              if (result) {
                const dispatch = get(dispatchStore);
                if (dispatch) {
                  dispatch('notification', {
                    message: 'Line collected!',
                    type: 'success'
                  });
                }
                
                // Reset collection flag after a delay
                setTimeout(() => {
                  window.collectionInProgress = false;
                  console.log('Resetting collection in progress flag');
                }, 500);
                
                return; // Exit if direct method worked
              }
            }
            
            // Reset collection flag if we didn't succeed with the first two methods
            window.collectionInProgress = false;
          }, 50);
        } else {
          console.log('Collection already in progress, skipping duplicate collection');
        }
        
        // Fallback: Try using parent container method only if collection not in progress
        // Short delay to allow visual selection first
        setTimeout(() => {
          // Skip fallback if collection is already in progress
          if (typeof window !== 'undefined' && window.collectionInProgress) {
            console.log('Collection in progress, skipping fallback methods');
            return;
          }
          
          // Flag to prevent duplicate collection
          if (typeof window !== 'undefined') {
            window.collectionInProgress = true;
          }
          
          // Check if parent container is available before trying to use it
          const parentContainer = get(parentContainerStore);
          if (parentContainer && typeof parentContainer.addLyricsSnippet === 'function') {
            const dispatch = get(dispatchStore);
            if (dispatch) {
              dispatch('collect', { text: selectionText });
            }
            
            // Reset collection flag after a delay
            if (typeof window !== 'undefined') {
              setTimeout(() => {
                window.collectionInProgress = false;
                console.log('Resetting collection in progress flag (fallback method)');
              }, 500);
            }
          } else {
            // No valid collection method found - try setting global trigger
            if (typeof window !== 'undefined') {
              console.log('Using global trigger for collection');
              window.transcriptCollectTrigger = true;
              
              // Show notification and use global method if available
              setTimeout(() => {
                // Check if collection was successful
                const dispatch = get(dispatchStore);
                if (dispatch) {
                  if (window.transcriptCollectTrigger === false) {
                    dispatch('notification', {
                      message: 'Line collected!',
                      type: 'success'
                    });
                  } else {
                    window.transcriptCollectTrigger = false;
                    dispatch('notification', {
                      message: 'Line collected!',
                      type: 'success'
                    });
                  }
                }
                
                // Reset collection flag
                window.collectionInProgress = false;
              }, 300);
            } else {
              const dispatch = get(dispatchStore);
              if (dispatch) {
                dispatch('notification', {
                  message: 'Collection not available. Try using the Grab Lyrics button.',
                  type: 'info'
                });
              }
              
              // Reset collection flag
              if (typeof window !== 'undefined') {
                window.collectionInProgress = false;
              }
            }
          }
        }, 100);
      }
    }
    
    // Make sure we have a valid selection - but only process if it wasn't already handled by click-to-grab
    if (selectionText.length > 0 && event.type !== 'mouseup') {
      // Store the selected text for collection
      selectedTextStore.set(selectionText);
      currentSelectionStore.set(selection);
      
      // IMPORTANT: Make the selected text available globally so collection boxes can access it
      if (typeof window !== 'undefined') {
        window.transcriptSelectedText = selectionText;
        // No longer need to set selectionActive since we don't show buttons anymore
      }
      
      console.log('Selected text:', selectionText);
    } else if (selectionText.length === 0) {
      selectedTextStore.set('');
      if (typeof window !== 'undefined') {
        window.transcriptSelectedText = '';
      }
    }
  }
}

export function selectEntireLine(node) {
  const editableTranscript = get(editableTranscriptStore);
  
  // Remove selected class from all lines first
  if (editableTranscript) {
    const allLines = editableTranscript.querySelectorAll('.lyric-line');
    allLines.forEach(line => line.classList.remove('selected'));
  }
  
  // If the node is the main contenteditable container
  if (node === editableTranscript) {
    // Try to select the first lyric line
    const firstLine = editableTranscript.querySelector('.lyric-line');
    if (firstLine) {
      firstLine.classList.add('selected');
      selectElementContents(firstLine);
      return;
    }
    return; // No lyric lines found
  }
  
  // Find the lyric-line element containing this node
  let lineElement = node;
  while (lineElement && !lineElement.classList?.contains('lyric-line') && lineElement !== editableTranscript) {
    lineElement = lineElement.parentNode;
  }
  
  // If we found a line element, select its contents and add selected class
  if (lineElement && lineElement.classList?.contains('lyric-line')) {
    lineElement.classList.add('selected');
    selectElementContents(lineElement);
    return;
  }
  
  // Fallback to old behavior if no line element found
  // Find the text node we clicked on or nearest to the click
  let textNode = findTextNode(node);
  if (!textNode) return; // No text node found
  
  // Get the content of the text node
  const text = textNode.textContent;
  
  // Find the start and end of the line
  let startPos = 0;
  let endPos = text.length;
  
  // Create a range for the line
  const range = document.createRange();
  range.setStart(textNode, startPos);
  range.setEnd(textNode, endPos);
  
  // Apply the selection
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

export function markChunkLines() {
  const editableTranscript = get(editableTranscriptStore);
  if (!editableTranscript) return;
  
  const allLines = editableTranscript.querySelectorAll('.lyric-line');
  
  allLines.forEach((line, index) => {
    const allLinesArray = Array.from(allLines);
    let isPartOfChunk = false;
    
    // Check if there are adjacent non-empty lines
    // Check previous line
    if (index > 0) {
      const prevText = allLinesArray[index - 1].textContent.trim();
      if (prevText !== '' && prevText !== ' ') {
        isPartOfChunk = true;
      }
    }
    
    // Check next line
    if (index < allLinesArray.length - 1) {
      const nextText = allLinesArray[index + 1].textContent.trim();
      if (nextText !== '' && nextText !== ' ') {
        isPartOfChunk = true;
      }
    }
    
    // Apply or remove the class
    if (isPartOfChunk) {
      line.classList.add('part-of-chunk');
    } else {
      line.classList.remove('part-of-chunk');
    }
  });
}

export function isPartOfChunk(node) {
  const editableTranscript = get(editableTranscriptStore);
  
  // Find the lyric-line element containing this node
  let lineElement = node;
  while (lineElement && !lineElement.classList?.contains('lyric-line') && lineElement !== editableTranscript) {
    lineElement = lineElement.parentNode;
  }
  
  if (!lineElement || !lineElement.classList?.contains('lyric-line')) {
    return false;
  }
  
  // Get all lines
  const allLines = Array.from(editableTranscript.querySelectorAll('.lyric-line'));
  const currentIndex = allLines.indexOf(lineElement);
  
  if (currentIndex === -1) {
    return false;
  }
  
  // Check if there are adjacent non-empty lines (indicating this line is part of a chunk)
  let hasAdjacentLines = false;
  
  // Check previous line
  if (currentIndex > 0) {
    const prevLine = allLines[currentIndex - 1];
    const prevText = prevLine.textContent.trim();
    if (prevText !== '' && prevText !== ' ') {
      hasAdjacentLines = true;
    }
  }
  
  // Check next line  
  if (currentIndex < allLines.length - 1) {
    const nextLine = allLines[currentIndex + 1];
    const nextText = nextLine.textContent.trim();
    if (nextText !== '' && nextText !== ' ') {
      hasAdjacentLines = true;
    }
  }
  
  return hasAdjacentLines;
}

export function selectEntireParagraph(node) {
  const editableTranscript = get(editableTranscriptStore);
  
  // Remove selected class from all lines first
  if (editableTranscript) {
    const allLines = editableTranscript.querySelectorAll('.lyric-line');
    allLines.forEach(line => line.classList.remove('selected'));
  }
  
  // Find the lyric-line element containing this node
  let lineElement = node;
  while (lineElement && !lineElement.classList?.contains('lyric-line') && lineElement !== editableTranscript) {
    lineElement = lineElement.parentNode;
  }
  
  if (!lineElement || !lineElement.classList?.contains('lyric-line')) {
    // Fallback to single line selection
    selectEntireLine(node);
    return;
  }
  
  // Find the paragraph boundaries (consecutive non-empty lines)
  const allLines = Array.from(editableTranscript.querySelectorAll('.lyric-line'));
  const currentIndex = allLines.indexOf(lineElement);
  
  if (currentIndex === -1) {
    selectEntireLine(node);
    return;
  }
  
  // Find paragraph start - go backwards until we hit an empty line or start
  let paragraphStart = currentIndex;
  while (paragraphStart > 0) {
    const prevLine = allLines[paragraphStart - 1];
    const prevText = prevLine.textContent.trim();
    
    // If previous line is empty or just whitespace, stop here
    if (prevText === '' || prevText === ' ') {
      break;
    }
    paragraphStart--;
  }
  
  // Find paragraph end - go forwards until we hit an empty line or end
  let paragraphEnd = currentIndex;
  while (paragraphEnd < allLines.length - 1) {
    const nextLine = allLines[paragraphEnd + 1];
    const nextText = nextLine.textContent.trim();
    
    // If next line is empty or just whitespace, stop here
    if (nextText === '' || nextText === ' ') {
      break;
    }
    paragraphEnd++;
  }
  
  // Select all lines in the paragraph
  const paragraphLines = allLines.slice(paragraphStart, paragraphEnd + 1);
  paragraphLines.forEach(line => line.classList.add('selected'));
  
  // Create a range that encompasses all paragraph lines
  if (paragraphLines.length > 0) {
    const range = document.createRange();
    range.setStartBefore(paragraphLines[0]);
    range.setEndAfter(paragraphLines[paragraphLines.length - 1]);
    
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

export function selectElementContents(element) {
  if (!element) return;
  
  const range = document.createRange();
  range.selectNodeContents(element);
  
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

export function getNodeOffset(node) {
  if (!window.getSelection) return 0;
  
  const selection = window.getSelection();
  if (selection.rangeCount === 0) return 0;
  
  const range = selection.getRangeAt(0);
  return range.startOffset;
}

export function findFirstTextNode(element) {
  if (!element) return null;
  
  // If this is a text node, return it
  if (element.nodeType === Node.TEXT_NODE) return element;
  
  // Otherwise, search through child nodes
  for (let i = 0; i < element.childNodes.length; i++) {
    const found = findFirstTextNode(element.childNodes[i]);
    if (found) return found;
  }
  
  return null;
}

export function findTextNode(node) {
  const editableTranscript = get(editableTranscriptStore);
  
  // If this is a text node, return it
  if (node.nodeType === Node.TEXT_NODE) return node;
  
  // If this is an element, check its parent
  let parent = node.parentNode;
  while (parent && parent !== editableTranscript) {
    if (parent.nodeType === Node.TEXT_NODE) return parent;
    parent = parent.parentNode;
  }
  
  // No text node found, return the first text node in the transcript
  return findFirstTextNode(editableTranscript);
}

export function hideSelectionButton() {
  selectionActiveStore.set(false);
  
  // Remove selected class from all lines
  const editableTranscript = get(editableTranscriptStore);
  if (editableTranscript) {
    const allLines = editableTranscript.querySelectorAll('.lyric-line');
    allLines.forEach(line => line.classList.remove('selected'));
  }
  // We no longer clear selectedText here to ensure it's available when the collect button is clicked
}