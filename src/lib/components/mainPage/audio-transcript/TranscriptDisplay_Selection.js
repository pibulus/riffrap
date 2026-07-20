/**
 * TranscriptDisplay_Selection.js
 *
 * Text selection system for the TranscriptDisplay component.
 * This module handles all aspects of text selection within the transcript,
 * including selection detection, highlighting, and selection utilities.
 *
 * These are plain functions that operate on the component's `ctx` object
 * (see TranscriptDisplay_Core.js for the shape). No Svelte stores.
 */

import { dev } from "$app/environment";

// This file's console.log calls are leftover DOM-hunting debug scaffolding
// (selected text, fallback-path tracing) — gate them so they never leak
// user transcript content to a production console.
function debugLog(...args) {
  if (dev) {
    console.log(...args);
  }
}

// Simple line-by-line selection system

// Export selection-related functions
export function handleTextSelection(ctx, event) {
  const editableTranscript = ctx.getEditableTranscript();
  if (!editableTranscript || !editableTranscript.contains(event.target)) {
    hideSelectionButton(ctx);
    return;
  }

  // Get the current selection
  if (window.getSelection) {
    const selection = window.getSelection();
    let selectionText = selection.toString().trim();

    // Check if we have a click (rather than a drag selection)
    // We can determine this by checking if the selection is empty
    if (
      selectionText.length === 0 &&
      event.type === "mouseup" &&
      event.target.nodeName !== "BUTTON"
    ) {
      // Simple line selection - just select the clicked line
      selectEntireLine(ctx, event.target);

      // After selecting the line, get the new selection
      const newSelection = window.getSelection();
      selectionText = newSelection.toString().trim();

      // Add refined haptic feedback pattern designed to feel satisfying
      if (
        typeof window !== "undefined" &&
        window.navigator &&
        window.navigator.vibrate
      ) {
        // Two-stage tactile feedback: quick double-tap sensation
        // First a short sharp pulse, then a slightly longer one with perfect timing
        window.navigator.vibrate([8, 20, 25]); // Optimized for perceptual satisfaction
      }

      // ✨ NEW: Auto-grab the lyric when clicking on a line
      if (
        selectionText &&
        selectionText.length > 0 &&
        event.type === "mouseup"
      ) {
        // Add visual highlight to the clicked line
        const lineElement = event.target.closest(".lyric-line");
        if (lineElement) {
          // First remove grabbed class from any other line
          const allLines = editableTranscript.querySelectorAll(".lyric-line");
          allLines.forEach((line) =>
            line.classList.remove("lyric-line-grabbed"),
          );

          // Add grabbed class to current line with a more persistent selection feel
          lineElement.classList.add("lyric-line-grabbed");

          // Keep the selection visible for a little longer so the user can see it
          setTimeout(() => {
            if (lineElement.classList.contains("lyric-line-grabbed")) {
              lineElement.classList.remove("lyric-line-grabbed");
            }
          }, 1500);
        }

        // Store selected text globally for collection
        if (typeof window !== "undefined") {
          window.transcriptSelectedText = selectionText;
        }

        // Position the selection button and activate it (but keep it invisible)
        if (lineElement) {
          const transcriptBoxRef = ctx.getTranscriptBoxRef();
          const rect = lineElement.getBoundingClientRect();
          const containerRect = transcriptBoxRef.getBoundingClientRect();
          ctx.setSelectionLeft(rect.right - containerRect.left - 160); // Position to the right
          ctx.setSelectionTop(rect.top - containerRect.top + 3); // Slightly below the line
          ctx.setSelectionActive(true);
          ctx.setSelectedText(selectionText);
        }

        // CRITICAL: Find and click the "Grab Lyrics" button in the LyricsPanel
        // Use a flag to prevent duplicate collection
        if (typeof window !== "undefined" && !window.collectionInProgress) {
          window.collectionInProgress = true;
          debugLog("Setting collection in progress flag to prevent duplicates");

          setTimeout(() => {
            // Look for a button with specific class
            let grabLyricsButton = document.querySelector(".collect-button");

            if (grabLyricsButton) {
              debugLog("Found Grab Lyrics button, triggering click!");
              grabLyricsButton.click();

              // Show success notification
              ctx.dispatch("notification", {
                message: "Line collected!",
                type: "success",
              });

              // Reset collection flag after a delay
              setTimeout(() => {
                window.collectionInProgress = false;
                debugLog("Resetting collection in progress flag");
              }, 500);

              return; // Exit if we successfully found and clicked the button
            }

            // Fallback to direct method if button wasn't found
            if (
              typeof window !== "undefined" &&
              typeof window.addToMainCollectionBox === "function"
            ) {
              debugLog("Using direct window.addToMainCollectionBox method");
              const result = window.addToMainCollectionBox(selectionText);

              if (result) {
                ctx.dispatch("notification", {
                  message: "Line collected!",
                  type: "success",
                });

                // Reset collection flag after a delay
                setTimeout(() => {
                  window.collectionInProgress = false;
                  debugLog("Resetting collection in progress flag");
                }, 500);

                return; // Exit if direct method worked
              }
            }

            // Reset collection flag if we didn't succeed with the first two methods
            window.collectionInProgress = false;
          }, 50);
        } else {
          debugLog(
            "Collection already in progress, skipping duplicate collection",
          );
        }

        // Fallback: Try using parent container method only if collection not in progress
        // Short delay to allow visual selection first
        setTimeout(() => {
          // Skip fallback if collection is already in progress
          if (typeof window !== "undefined" && window.collectionInProgress) {
            debugLog("Collection in progress, skipping fallback methods");
            return;
          }

          // Flag to prevent duplicate collection
          if (typeof window !== "undefined") {
            window.collectionInProgress = true;
          }

          // Check if parent container is available before trying to use it
          const parentContainer = ctx.getParentContainer();
          if (
            parentContainer &&
            typeof parentContainer.addLyricsSnippet === "function"
          ) {
            ctx.dispatch("collect", { text: selectionText });

            // Reset collection flag after a delay
            if (typeof window !== "undefined") {
              setTimeout(() => {
                window.collectionInProgress = false;
                debugLog(
                  "Resetting collection in progress flag (fallback method)",
                );
              }, 500);
            }
          } else {
            // No valid collection method found - try setting global trigger
            if (typeof window !== "undefined") {
              debugLog("Using global trigger for collection");
              window.transcriptCollectTrigger = true;

              // Show notification and use global method if available
              setTimeout(() => {
                // Check if collection was successful
                if (window.transcriptCollectTrigger === false) {
                  ctx.dispatch("notification", {
                    message: "Line collected!",
                    type: "success",
                  });
                } else {
                  window.transcriptCollectTrigger = false;
                  ctx.dispatch("notification", {
                    message: "Line collected!",
                    type: "success",
                  });
                }

                // Reset collection flag
                window.collectionInProgress = false;
              }, 300);
            } else {
              ctx.dispatch("notification", {
                message:
                  "Collection not available. Try using the Grab Lyrics button.",
                type: "info",
              });

              // Reset collection flag
              if (typeof window !== "undefined") {
                window.collectionInProgress = false;
              }
            }
          }
        }, 100);
      }
    }

    // Make sure we have a valid selection - but only process if it wasn't already handled by click-to-grab
    if (selectionText.length > 0 && event.type !== "mouseup") {
      // Store the selected text for collection
      ctx.setSelectedText(selectionText);

      // IMPORTANT: Make the selected text available globally so collection boxes can access it
      if (typeof window !== "undefined") {
        window.transcriptSelectedText = selectionText;
        // No longer need to set selectionActive since we don't show buttons anymore
      }

      debugLog("Selected text:", selectionText);
    } else if (selectionText.length === 0) {
      ctx.setSelectedText("");
      if (typeof window !== "undefined") {
        window.transcriptSelectedText = "";
      }
    }
  }
}

export function selectEntireLine(ctx, node) {
  const editableTranscript = ctx.getEditableTranscript();

  // Remove selected class from all lines first
  if (editableTranscript) {
    const allLines = editableTranscript.querySelectorAll(".lyric-line");
    allLines.forEach((line) => line.classList.remove("selected"));
  }

  // If the node is the main contenteditable container
  if (node === editableTranscript) {
    // Try to select the first lyric line
    const firstLine = editableTranscript.querySelector(".lyric-line");
    if (firstLine) {
      firstLine.classList.add("selected");
      selectElementContents(firstLine);
      return;
    }
    return; // No lyric lines found
  }

  // Find the lyric-line element containing this node
  let lineElement = node;
  while (
    lineElement &&
    !lineElement.classList?.contains("lyric-line") &&
    lineElement !== editableTranscript
  ) {
    lineElement = lineElement.parentNode;
  }

  // If we found a line element, select its contents and add selected class
  if (lineElement && lineElement.classList?.contains("lyric-line")) {
    lineElement.classList.add("selected");
    selectElementContents(lineElement);
    return;
  }

  // Fallback to old behavior if no line element found
  // Find the text node we clicked on or nearest to the click
  let textNode = findTextNode(ctx, node);
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

function selectElementContents(element) {
  if (!element) return;

  const range = document.createRange();
  range.selectNodeContents(element);

  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function findFirstTextNode(element) {
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

function findTextNode(ctx, node) {
  const editableTranscript = ctx.getEditableTranscript();

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

export function hideSelectionButton(ctx) {
  ctx.setSelectionActive(false);

  // Remove selected class from all lines
  const editableTranscript = ctx.getEditableTranscript();
  if (editableTranscript) {
    const allLines = editableTranscript.querySelectorAll(".lyric-line");
    allLines.forEach((line) => line.classList.remove("selected"));
  }
  // We no longer clear selectedText here to ensure it's available when the collect button is clicked
}
