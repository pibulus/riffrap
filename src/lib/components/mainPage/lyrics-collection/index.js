/**
 * Lyrics collection system for LineSnap
 * 
 * This is the main entry point for the lyrics collection functionality.
 * It exports all modules and components related to lyrics collection.
 */

// Export main modules
export { themes, loadSavedTheme, applyTheme } from './modules/themeManager';
export { saveCollectionToStorage, loadCollectionFromStorage } from './modules/storageManager';
export { formatText, combineSnippets, formatLyricsForDownload } from './modules/textUtils';
export { initDragDrop, sortableConfig } from './modules/dragDropManager';
export { createNotificationSystem } from './modules/notificationSystem';
export { copyToClipboard, downloadLyricsAsText } from './modules/exportManager';
export { createCompilationManager } from './modules/compilationManager';
export { createTranscriptMonitor } from './modules/transcriptMonitor';

// Export store
export { lyricsStore } from './stores/lyricsStore';

// Global compatibility layer for legacy code
if (typeof window !== 'undefined') {
  import('./stores/lyricsStore').then(({ lyricsStore }) => {
    // Maintain backward compatibility with existing code
    window.addToMainCollectionBox = (text) => {
      return lyricsStore.addSnippet(text);
    };
    
    // Legacy compatibility
    window.addToCollectionBox = window.addToMainCollectionBox;
    window.addToFixedPanel = window.addToMainCollectionBox;
  });
}