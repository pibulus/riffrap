/**
 * Drag and drop management system for the lyrics collection component
 * 
 * This module provides drag and drop functionality for reordering lyrics
 * cards within the collection.
 */

import { playDragStartSound, playDropSound, playGrabSound } from './soundIntegration.js';

/**
 * Configuration object for sortable behavior
 */
export const sortableConfig = {
  animation: 150, // animation speed (not too high)
  ghostClass: 'drag-ghost',
  chosenClass: 'drag-chosen',
  dragClass: 'drag-active',
  fallbackOnBody: true,
  swapThreshold: 0.65
};

/**
 * Initialize drag and drop handlers for a collection of elements
 * 
 * @param {Function} findItemById - Function to find item by ID
 * @param {Function} reorderItems - Function to reorder items after drop
 * @param {Function} showNotification - Function to display notifications
 * @returns {Object} Object containing all drag and drop handler functions
 */
export function initDragDrop(findItemById, reorderItems, showNotification) {
  // State for drag operations
  let dragSource = null;
  let isDragging = false;

  /**
   * Handle drag start event
   * 
   * @param {DragEvent} event - The drag start event
   * @param {string} id - The ID of the item being dragged
   */
  function handleDragStart(event, id) {
    dragSource = id;
    isDragging = true;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', id);

    // Add styling to the dragged element
    event.target.classList.add('dragging');
    event.target.classList.add('drag-active');

    // Play grab sound
    playDragStartSound();
    
    // Also play grab sound for tactile feeling
    playGrabSound();
  }

  /**
   * Handle drag over event
   * 
   * @param {DragEvent} event - The drag over event
   * @param {string} id - The ID of the item being dragged over
   */
  function handleDragOver(event, id) {
    event.preventDefault();

    // Only proceed if we have a valid drag operation
    if (!dragSource || dragSource === id) return;

    // Highlight the drop target - more visible now
    const snippetItem = event.target.closest('.snippet-item');
    if (snippetItem) {
      snippetItem.classList.add('drag-over');

      // Add a visual indicator for drop position
      const sourceIndex = findItemById(dragSource);
      const targetIndex = findItemById(id);

      if (sourceIndex < targetIndex) {
        snippetItem.classList.add('drop-below');
      } else {
        snippetItem.classList.add('drop-above');
      }
    }
  }

  /**
   * Handle drag leave event
   * 
   * @param {DragEvent} event - The drag leave event
   */
  function handleDragLeave(event) {
    const snippetItem = event.target.closest('.snippet-item');
    if (snippetItem) {
      snippetItem.classList.remove('drag-over', 'drop-below', 'drop-above');
    }
  }

  /**
   * Handle drop event
   * 
   * @param {DragEvent} event - The drop event
   * @param {string} id - The ID of the drop target
   */
  function handleDrop(event, id) {
    event.preventDefault();

    // Remove the highlight from the drop target
    const snippetItem = event.target.closest('.snippet-item');
    if (snippetItem) {
      snippetItem.classList.remove('drag-over', 'drop-below', 'drop-above');
    }
    
    // Play drop sound for tactile feedback
    playDropSound();

    // Only proceed if we have a valid drag operation
    if (!dragSource || dragSource === id) return;

    // Reorder the items
    reorderItems(dragSource, id);

    // Show notification feedback
    showNotification('Lyrics reordered');

    // Play a snap animation on the reordered item
    setTimeout(() => {
      const reorderedElement = document.querySelector(`[data-id="${dragSource}"]`);
      if (reorderedElement) {
        reorderedElement.classList.add('snap-animation');
        setTimeout(() => {
          reorderedElement.classList.remove('snap-animation');
        }, 500);
      }
    }, 10);

    // Reset drag source
    dragSource = null;
    isDragging = false;
  }

  /**
   * Handle drag end event
   * 
   * @param {DragEvent} event - The drag end event
   */
  function handleDragEnd(event) {
    // Remove styling from the dragged element
    event.target.classList.remove('dragging');
    event.target.classList.remove('drag-active');

    // Reset drag source
    dragSource = null;
    isDragging = false;
  }

  /**
   * Get the current drag state
   * 
   * @returns {Object} Object containing dragSource and isDragging
   */
  function getDragState() {
    return {
      dragSource,
      isDragging
    };
  }

  // Return all handlers in a single object
  return {
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    getDragState
  };
}