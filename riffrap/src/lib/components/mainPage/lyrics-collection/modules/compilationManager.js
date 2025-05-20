/**
 * Compilation management system for lyrics collection
 * 
 * This module handles combining multiple lyric snippets into a single one
 * and provides undo functionality.
 */

import { playCompileSound, playEditSound } from './soundIntegration.js';
import { combineSnippets } from './textUtils';

/**
 * Create a compilation manager for lyrics
 * 
 * @param {Function} saveToStorage - Function to save to storage
 * @returns {Object} Compilation manager functions
 */
export function createCompilationManager(saveToStorage) {
  // State for compilation
  let originalSnippets = [];
  let isUndoAvailable = false;
  
  /**
   * Combine multiple snippets into a single one
   * 
   * @param {Array} snippets - Array of snippets to combine
   * @param {Function} onSuccess - Callback on success to update UI
   * @param {Function} onError - Callback on error
   * @returns {Object} Result object with success status and combined snippet
   */
  function compileSnippets(snippets, onSuccess, onError) {
    // Don't do anything if there are no snippets
    if (!snippets || snippets.length === 0) {
      if (onError) onError('No snippets to compile');
      return { success: false };
    }

    // Don't do anything if there's only one snippet and it's already compiled
    if (snippets.length === 1 && snippets[0].isCompiled) {
      if (onError) onError('Already combined into one card!');
      return { success: false };
    }
    
    // Play the special compile sound
    playCompileSound();

    try {
      // Store original snippets for potential undo
      originalSnippets = [...snippets];
      isUndoAvailable = true;

      // Combine the text from all snippets
      const combinedText = combineSnippets(snippets);

      // Create a new single card with all text
      const newSnippet = {
        id: Date.now().toString(),
        text: combinedText,
        timestamp: new Date().toISOString(),
        order: 0, // Put it at the top
        isParagraph: true, // Treat as paragraph since it will have multiple lines
        isCompiled: true, // Flag to identify this as a compiled card
        originalCount: snippets.length // Store how many snippets were combined
      };

      // Save to storage if a function was provided
      if (saveToStorage && typeof saveToStorage === 'function') {
        saveToStorage([newSnippet], originalSnippets, isUndoAvailable);
      }

      // Trigger success callback
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(newSnippet);
      }

      return {
        success: true,
        snippet: newSnippet
      };
    } catch (error) {
      console.error('Error compiling snippets:', error);
      if (onError) onError('Error compiling snippets');
      return { success: false };
    }
  }

  /**
   * Undo compilation and restore original snippets
   * 
   * @param {Function} onSuccess - Callback on success to update UI
   * @param {Function} onError - Callback on error
   * @returns {Object} Result object with success status and original snippets
   */
  function undoCompilation(onSuccess, onError) {
    if (!isUndoAvailable || originalSnippets.length === 0) {
      if (onError) onError('Nothing to undo');
      return { success: false };
    }

    try {
      // Play undo sound (use edit sound as it's appropriate for this action)
      playEditSound();
      
      // Create a copy of the original snippets
      const restoredSnippets = [...originalSnippets];
      
      // Reset undo availability
      isUndoAvailable = false;
      
      // Save to storage if a function was provided
      if (saveToStorage && typeof saveToStorage === 'function') {
        saveToStorage(restoredSnippets, [], false);
      }
      
      // Trigger success callback
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(restoredSnippets);
      }
      
      return {
        success: true,
        snippets: restoredSnippets
      };
    } catch (error) {
      console.error('Error undoing compilation:', error);
      if (onError) onError('Error undoing compilation');
      return { success: false };
    }
  }

  /**
   * Check if undo is available
   * 
   * @returns {boolean} Whether undo is available
   */
  function canUndo() {
    return isUndoAvailable && originalSnippets.length > 0;
  }
  
  /**
   * Get the original snippets
   * 
   * @returns {Array} The original snippets before compilation
   */
  function getOriginalSnippets() {
    return [...originalSnippets];
  }
  
  /**
   * Set the compilation state (for initialization from storage)
   * 
   * @param {Array} originals - Original snippets
   * @param {boolean} undoAvailable - Whether undo is available
   */
  function setCompilationState(originals, undoAvailable = false) {
    originalSnippets = originals || [];
    isUndoAvailable = undoAvailable;
  }

  return {
    compileSnippets,
    undoCompilation,
    canUndo,
    getOriginalSnippets,
    setCompilationState
  };
}