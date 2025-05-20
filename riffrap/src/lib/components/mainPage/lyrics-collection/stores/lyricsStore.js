/**
 * Lyrics collection store for maintaining state across components
 * 
 * This store centralizes all lyrics collection operations and state,
 * replacing the local component state approach.
 */

import { writable } from 'svelte/store';
import { formatSnippet, formatText } from '../modules/textUtils';
import { saveCollectionToStorage, loadCollectionFromStorage } from '../modules/storageManager';
import { playEditSound, playDeleteSound, playDropSound, playGrabSound } from '../modules/soundIntegration.js';

// Load the initial state from storage
const initialState = loadCollectionFromStorage();

// Create the store
function createLyricsStore() {
  // Initialize with data from localStorage
  const { subscribe, set, update } = writable({
    snippets: initialState.collectedSnippets || [],
    originalSnippets: initialState.originalSnippets || [],
    isUndoAvailable: initialState.isUndoAvailable || false,
    editingSnippetId: null
  });

  // Helper function to save state to localStorage
  const persistState = (state) => {
    saveCollectionToStorage(
      state.snippets,
      state.originalSnippets,
      state.isUndoAvailable
    );
    return state;
  };

  return {
    subscribe,
    
    /**
     * Load data from storage
     */
    loadFromStorage: () => {
      const loadedState = loadCollectionFromStorage();
      update(state => ({
        ...state,
        snippets: loadedState.collectedSnippets || [],
        originalSnippets: loadedState.originalSnippets || [],
        isUndoAvailable: loadedState.isUndoAvailable || false
      }));
    },
    
    /**
     * Save the current state with original snippets
     * 
     * @param {Array} snippets - The snippets to save
     * @param {Array} originalSnippets - The original snippets to save
     * @param {boolean} isUndoAvailable - Whether undo is available
     */
    saveWithOriginals: (snippets, originalSnippets, isUndoAvailable) => {
      update(state => persistState({
        ...state,
        snippets,
        originalSnippets,
        isUndoAvailable
      }));
    },
    
    /**
     * Replace all snippets with new ones
     * 
     * @param {Array} snippets - The new snippets to use
     */
    replaceAllSnippets: (snippets) => {
      update(state => persistState({
        ...state,
        snippets
      }));
    },
    
    /**
     * Add a new snippet to the collection
     * 
     * @param {string} text - The text to add
     * @returns {boolean} Success status
     */
    addSnippet: (text) => {
      if (!text || !text.trim()) {
        console.error('No text provided to collect');
        return false;
      }

      const formattedText = formatText(text);
      console.log('Adding snippet:', formattedText);

      update(state => {
        const newSnippet = {
          id: Date.now().toString(),
          text: formattedText,
          timestamp: new Date().toISOString(),
          order: state.snippets.length, // Add to the end by default
          isParagraph: formattedText.includes('\n') // Track if multi-line
        };

        // Play grab sound for feedback
        playGrabSound();

        return persistState({
          ...state,
          snippets: [...state.snippets, newSnippet]
        });
      });

      return true;
    },

    /**
     * Remove a snippet from the collection
     * 
     * @param {string} id - The ID of the snippet to remove
     */
    removeSnippet: (id) => {
      update(state => {
        // Filter out the specified snippet
        const updatedSnippets = state.snippets.filter(s => s.id !== id);

        // Play delete sound for feedback
        playDeleteSound();

        return persistState({
          ...state,
          snippets: updatedSnippets
        });
      });
    },

    /**
     * Move a snippet up in the collection order
     * 
     * @param {string} id - The ID of the snippet to move
     */
    moveSnippetUp: (id) => {
      update(state => {
        const index = state.snippets.findIndex(s => s.id === id);
        if (index <= 0) return state; // Already at the top

        // Create a new array to hold the updated snippets
        const updatedSnippets = [...state.snippets];
        
        // Swap the positions
        [updatedSnippets[index - 1], updatedSnippets[index]] = [
          updatedSnippets[index],
          updatedSnippets[index - 1]
        ];

        return persistState({
          ...state,
          snippets: updatedSnippets
        });
      });
    },

    /**
     * Move a snippet down in the collection order
     * 
     * @param {string} id - The ID of the snippet to move
     */
    moveSnippetDown: (id) => {
      update(state => {
        const index = state.snippets.findIndex(s => s.id === id);
        if (index === -1 || index >= state.snippets.length - 1) {
          return state; // Already at the bottom
        }

        // Create a new array to hold the updated snippets
        const updatedSnippets = [...state.snippets];
        
        // Swap the positions
        [updatedSnippets[index], updatedSnippets[index + 1]] = [
          updatedSnippets[index + 1],
          updatedSnippets[index]
        ];

        return persistState({
          ...state,
          snippets: updatedSnippets
        });
      });
    },

    /**
     * Start editing a snippet
     * 
     * @param {string} id - The ID of the snippet to edit
     */
    startEditingSnippet: (id) => {
      update(state => ({
        ...state,
        editingSnippetId: id
      }));
    },

    /**
     * Save the edited snippet
     * 
     * @param {string} id - The ID of the snippet being edited
     * @param {string} newText - The new text for the snippet
     * @returns {boolean} Success status
     */
    saveEditedSnippet: (id, newText) => {
      if (!newText || !newText.trim()) {
        return false; // Don't save empty snippets
      }

      update(state => {
        // Find and update the snippet
        const updatedSnippets = state.snippets.map(snippet => {
          if (snippet.id === id) {
            return {
              ...snippet,
              text: newText.trim(),
              edited: true, // Add a flag to indicate it was edited
              isParagraph: newText.trim().includes('\n') // Update paragraph flag
            };
          }
          return snippet;
        });

        // Play edit sound for feedback
        playEditSound();

        return persistState({
          ...state,
          snippets: updatedSnippets,
          editingSnippetId: null // Exit edit mode
        });
      });

      return true;
    },

    /**
     * Cancel the current edit operation
     */
    cancelEditing: () => {
      update(state => ({
        ...state,
        editingSnippetId: null
      }));
    },

    /**
     * Clear all snippets from the collection
     */
    clearAllSnippets: () => {
      update(state => {
        // Play delete sound for feedback
        playDeleteSound();

        return persistState({
          ...state,
          snippets: [],
          originalSnippets: [],
          isUndoAvailable: false
        });
      });
    },

    /**
     * Reorder snippets using drag and drop
     * 
     * @param {string} sourceId - The ID of the snippet being moved
     * @param {string} targetId - The ID of the target position
     */
    reorderSnippets: (sourceId, targetId) => {
      update(state => {
        // Get the source and target indices
        const sourceIndex = state.snippets.findIndex(s => s.id === sourceId);
        const targetIndex = state.snippets.findIndex(s => s.id === targetId);

        // Validate the indices
        if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
          return state;
        }

        // Create a new array with the new order
        const updatedSnippets = [...state.snippets];
        const [movedItem] = updatedSnippets.splice(sourceIndex, 1);
        updatedSnippets.splice(targetIndex, 0, movedItem);

        // Play drop sound for feedback
        playDropSound();

        return persistState({
          ...state,
          snippets: updatedSnippets
        });
      });
    },
    
    /**
     * Get all snippets
     * 
     * @returns {Array} All snippets
     */
    getAllSnippets: () => {
      let allSnippets = [];
      subscribe(state => {
        allSnippets = [...state.snippets];
      })();
      return allSnippets;
    },
    
    /**
     * Get the original snippets
     * 
     * @returns {Array} Original snippets
     */
    getOriginalSnippets: () => {
      let originals = [];
      subscribe(state => {
        originals = [...state.originalSnippets];
      })();
      return originals;
    },
    
    /**
     * Check if undo is available
     * 
     * @returns {boolean} Whether undo is available
     */
    isUndoAvailable: () => {
      let undoAvailable = false;
      subscribe(state => {
        undoAvailable = state.isUndoAvailable;
      })();
      return undoAvailable;
    }
  };
}

// Create and export the store
export const lyricsStore = createLyricsStore();

// Expose the store to the window for backwards compatibility
if (typeof window !== 'undefined') {
  // This allows direct access for debugging
  window.lyricsStore = lyricsStore;
  
  // This maintains compatibility with existing code
  window.addToMainCollectionBox = (text) => {
    return lyricsStore.addSnippet(text);
  };
}