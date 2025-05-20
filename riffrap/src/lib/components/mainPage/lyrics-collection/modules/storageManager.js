/**
 * Storage management system for the lyrics collection component
 * 
 * This module handles saving and loading lyrics collections to/from localStorage,
 * ensuring persistence across page reloads.
 */

/**
 * Storage keys used for lyrics collection data
 */
const STORAGE_KEYS = {
  LYRICS_COLLECTION: 'lineSnap-lyrics-collection',
  LYRICS_ORIGINALS: 'lineSnap-lyrics-originals'
};

/**
 * Save the current collection to localStorage
 * 
 * @param {Array} collectedSnippets - The array of snippets to save
 * @param {Array} originalSnippets - The array of original snippets (for undo)
 * @param {boolean} isUndoAvailable - Whether undo functionality is available
 * @returns {boolean} Success status of the save operation
 */
export function saveCollectionToStorage(collectedSnippets, originalSnippets = [], isUndoAvailable = false) {
  if (typeof window === 'undefined') return false;

  try {
    // Save the current snippets
    const collectionString = JSON.stringify(collectedSnippets);
    localStorage.setItem(STORAGE_KEYS.LYRICS_COLLECTION, collectionString);

    // If we have original snippets, save those too
    if (isUndoAvailable && originalSnippets.length > 0) {
      const originalsString = JSON.stringify(originalSnippets);
      localStorage.setItem(STORAGE_KEYS.LYRICS_ORIGINALS, originalsString);
    } else if (!isUndoAvailable) {
      // Clear original snippets if undo is not available
      localStorage.removeItem(STORAGE_KEYS.LYRICS_ORIGINALS);
    }

    return true;
  } catch (error) {
    console.error('Error saving lyrics collection to localStorage:', error);
    return false;
  }
}

/**
 * Load collection from localStorage
 * 
 * @returns {Object} Object containing loaded snippets, originals, and undo status
 */
export function loadCollectionFromStorage() {
  if (typeof window === 'undefined') {
    return { 
      collectedSnippets: [], 
      originalSnippets: [], 
      isUndoAvailable: false 
    };
  }

  try {
    // Initialize return values
    let collectedSnippets = [];
    let originalSnippets = [];
    let isUndoAvailable = false;

    // Try to load the saved collection
    const savedCollection = localStorage.getItem(STORAGE_KEYS.LYRICS_COLLECTION);
    if (savedCollection) {
      collectedSnippets = JSON.parse(savedCollection);

      // Try to load original snippets for undo functionality
      const savedOriginalSnippets = localStorage.getItem(STORAGE_KEYS.LYRICS_ORIGINALS);
      if (savedOriginalSnippets) {
        originalSnippets = JSON.parse(savedOriginalSnippets);

        // Check if we have a compiled card and original snippets, enable undo if so
        if (
          collectedSnippets.length === 1 &&
          collectedSnippets[0].isCompiled &&
          originalSnippets.length > 0
        ) {
          isUndoAvailable = true;
        }
      }
    }

    return { 
      collectedSnippets, 
      originalSnippets, 
      isUndoAvailable 
    };
  } catch (error) {
    console.error('Error loading lyrics collection from localStorage:', error);
    return { 
      collectedSnippets: [], 
      originalSnippets: [], 
      isUndoAvailable: false 
    };
  }
}

/**
 * Clear all lyrics storage data
 * 
 * @returns {boolean} Success status of the clear operation
 */
export function clearAllStorage() {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.removeItem(STORAGE_KEYS.LYRICS_COLLECTION);
    localStorage.removeItem(STORAGE_KEYS.LYRICS_ORIGINALS);
    return true;
  } catch (error) {
    console.error('Error clearing lyrics storage:', error);
    return false;
  }
}