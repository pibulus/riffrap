/**
 * Transcript monitoring system for lyrics collection
 * 
 * This module handles monitoring for text selections and
 * collection triggers from transcript components.
 */

import { getCurrentSelection } from './textUtils';

/**
 * Create a transcript monitor
 * 
 * @param {Function} addSnippet - Function to add a snippet when triggered
 * @returns {Object} Monitor functions and controls
 */
export function createTranscriptMonitor(addSnippet) {
  // State for monitoring
  let monitorInterval = null;
  let lastSelection = '';
  let hasTranscriptContent = false;
  
  /**
   * Start monitoring for selections and collection triggers
   * 
   * @param {number} checkInterval - Interval in ms to check for changes (default: 100ms)
   * @returns {Object} Monitor state
   */
  function startMonitoring(checkInterval = 100) {
    if (typeof window === 'undefined') return { active: false };
    
    // Clear any existing interval first
    if (monitorInterval) {
      clearInterval(monitorInterval);
    }

    // Set up an interval to check for selection changes
    monitorInterval = setInterval(() => {
      const currentSelection = getCurrentSelection();

      // Check if there's a new selection
      if (currentSelection && currentSelection !== lastSelection) {
        lastSelection = currentSelection;
        hasTranscriptContent = true;
      } else if (currentSelection === '') {
        hasTranscriptContent = false;
      }

      // Check if there's content in the transcript
      if (window.transcriptSelectedText) {
        hasTranscriptContent = true;
      }

      // Check for global trigger flag
      if (window.transcriptCollectTrigger === true && window.transcriptSelectedText) {
        addSnippet(window.transcriptSelectedText);
        window.transcriptCollectTrigger = false; // Reset the trigger
      }
    }, checkInterval);
    
    return {
      active: true,
      interval: checkInterval
    };
  }
  
  /**
   * Stop monitoring
   */
  function stopMonitoring() {
    if (monitorInterval) {
      clearInterval(monitorInterval);
      monitorInterval = null;
    }
    
    return { active: false };
  }
  
  /**
   * Get current monitoring state
   * 
   * @returns {Object} Current state
   */
  function getState() {
    return {
      active: !!monitorInterval,
      hasContent: hasTranscriptContent,
      lastSelection
    };
  }
  
  /**
   * Check if there's content available to collect
   * 
   * @returns {boolean} Whether there's content to collect
   */
  function hasContent() {
    // Update the content state by checking both selection and global variable
    if (typeof window !== 'undefined') {
      const selection = getCurrentSelection();
      return !!selection || !!window.transcriptSelectedText;
    }
    
    return hasTranscriptContent;
  }
  
  /**
   * Collect current content manually
   * 
   * @returns {boolean} Success status
   */
  function collectContent() {
    // Try to collect from global variable first
    if (typeof window !== 'undefined' && window.transcriptSelectedText) {
      return addSnippet(window.transcriptSelectedText);
    }
    
    // Fall back to current selection
    const selection = getCurrentSelection();
    if (selection) {
      return addSnippet(selection);
    }
    
    return false;
  }
  
  /**
   * Clean up resources
   */
  function cleanup() {
    stopMonitoring();
  }

  return {
    startMonitoring,
    stopMonitoring,
    getState,
    hasContent,
    collectContent,
    cleanup
  };
}