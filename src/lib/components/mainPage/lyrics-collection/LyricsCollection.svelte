<!--
  === COMPONENT OVERVIEW ===
  
  LyricsCollection Component
  
  This component provides the lyrics collection functionality for LineSnap, 
  allowing users to collect, edit, organize, and export lyrics from transcripts.
  
  It uses a modular architecture with specialized modules for different parts of functionality:
  - lyricsStore: Central state management
  - themeManager: Handles theme styling
  - dragDropManager: Drag-and-drop reordering of snippets
  - notificationSystem: User feedback notifications
  - exportManager: Copy and download functionality
  - compilationManager: Combining snippets with undo support
  - transcriptMonitor: Monitoring transcript selection
  
  REF: This component is the result of Phase 3 modularization in cleanup_checklist.md
  
  TRAIL MARKER (Unit Cleanup): See sanitation_manifest.md for the Route's overall plan.
-->

<script>
  // === PROCESSING ZONE: IMPORTS AND DEPENDENCIES ===
  // === IMPORTS CHUNK START ===
  import { onMount, onDestroy } from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';
  import Confetti from '$lib/components/ui/effects/Confetti.svelte';
  import { eventBridge } from '$lib/services/infrastructure/eventBridge';
  import { createLogger } from '$lib/services/infrastructure/loggerService';
  import { 
    playGrabSound, 
    playEditSound, 
    playDeleteSound, 
    playDragStartSound, 
    playDropSound, 
    playCopySound, 
    playHoverSound,
    playCompileSound,
    playCardHoverSound
  } from '../sound-integration.js';
  // === IMPORTS CHUNK END ===
  // === END PROCESSING ZONE: IMPORTS AND DEPENDENCIES ===
  
  // === PROCESSING ZONE: COMPONENT IMPORTS ===
  // === COMPONENT IMPORTS CHUNK START ===
  // Import extracted components
  import { 
    SnippetItem, 
    HeaderActions, 
    EmptyState,
    NotificationDisplay,
    MemoizedSnippetList
  } from './components';
  // === COMPONENT IMPORTS CHUNK END ===
  // === END PROCESSING ZONE: COMPONENT IMPORTS ===

  // === PROCESSING ZONE: MODULE IMPORTS ===
  // === MODULE IMPORTS CHUNK START ===
  // Import all specialized modules for functionality
  
  // Central state management for lyrics snippets
  // Dependencies: storageManager.js, soundIntegration.js
  import { lyricsStore } from './stores/lyricsStore';
  
  // Theme management for visual styling
  // Dependencies: localStorage
  import { loadSavedTheme, applyTheme } from './modules/themeManager';
  
  // Drag and drop reordering of snippets
  // Dependencies: lyricsStore (for reordering), notificationSystem (for feedback)
  import { initDragDrop } from './modules/dragDropManager';
  
  // User feedback notification system 
  // No direct dependencies on other modules
  import { createNotificationSystem } from './modules/notificationSystem';
  
  // Export functionality (copy/download)
  // No direct dependencies on other modules
  import { copyToClipboard, downloadLyricsAsText } from './modules/exportManager';
  
  // Snippet combination/compilation with undo support
  // Dependencies: lyricsStore (for saving state)
  import { createCompilationManager } from './modules/compilationManager';
  
  // Monitoring transcript content for selection
  // Dependencies: lyricsStore (for adding snippets)
  import { createTranscriptMonitor } from './modules/transcriptMonitor';
  // === MODULE IMPORTS CHUNK END ===
  // === END PROCESSING ZONE: MODULE IMPORTS ===
  
  // TRAIL MARKER (Unit Cleanup): These modules represent the modular architecture of the LyricsCollection component

  // Create a logger for this component
  const logger = createLogger('LyricsCollection');

  // === PROCESSING ZONE: REACTIVE STATE ===
  // === REACTIVE STATE CHUNK START ===
  // Local reactive stores for snippets and state
  // These declarations create reactive variables that update
  // whenever the underlying store values change
  
  // All snippets from the lyrics store, used throughout the template
  // to render the snippet list and for operations like copy/combine
  $: snippets = $lyricsStore.snippets;
  
  // Currently editing snippet ID - controls which snippet shows
  // the editing interface vs display interface in the template
  $: editingSnippetId = $lyricsStore.editingSnippetId;
  // === REACTIVE STATE CHUNK END ===
  // === END PROCESSING ZONE: REACTIVE STATE ===

  // === PROCESSING ZONE: UI STATE ===
  // === UI STATE CHUNK START ===
  // Visual feedback and animation state
  // These variables control various visual feedback elements
  // but don't affect the core functionality
  
  // Copy success indicator - shows button highlight
  let copySuccess = false;
  // Timeout reference for clearing copy success indicator
  let copyTimeout;
  
  // Compile success indicator - shows button highlight and triggers confetti
  let compileSuccess = false;
  // Timeout reference for clearing compile success indicator
  let compileTimeout;
  
  // Controls confetti animation visibility when combining snippets
  let showConfetti = false;
  // === UI STATE CHUNK END ===
  // === END PROCESSING ZONE: UI STATE ===

  // === PROCESSING ZONE: MODULE INITIALIZATION ===
  // === MODULE INITIALIZATION CHUNK START ===
  // Initialize all modules with proper callbacks to connect them together
  // This section follows a dependency injection pattern where each module
  // is initialized with callbacks to other modules it needs to interact with
  
  // Notification system for user feedback
  // This module has no dependencies, so it's initialized first
  // Outputs: showNotification function used by other modules
  const notificationSystem = createNotificationSystem();
  
  // Compilation manager for combining snippets
  // This manager handles snippet combination and maintains undo history
  // Inputs: 
  //   - Callback to save changes to lyricsStore
  // Outputs:
  //   - compileSnippets function to combine snippets
  //   - undoCompilation function to restore previous state
  //   - canUndo function to check if undo is available
  const compilationManager = createCompilationManager((snippets, originals, undoAvailable) => {
    // Save to storage via the store
    // This callback connects compilationManager to lyricsStore
    lyricsStore.saveWithOriginals(snippets, originals, undoAvailable);
  });

  // Initialize with any existing compilation state
  // This loads any previously saved undo state from the store
  compilationManager.setCompilationState(
    $lyricsStore.originalSnippets, 
    $lyricsStore.isUndoAvailable
  );

  // Initialize drag and drop system
  // This system handles UI interactions for reordering snippets via drag & drop
  // Inputs:
  //   - Callback to find snippet index in lyricsStore
  //   - Callback to reorder snippets in lyricsStore
  //   - Callback to show notifications via notificationSystem
  // Outputs:
  //   - Event handlers for drag operations (used in the template)
  const {
    handleDragStart,  // Called when drag starts
    handleDragOver,   // Called when dragging over potential drop target
    handleDragLeave,  // Called when leaving potential drop target
    handleDrop,       // Called when item is dropped
    handleDragEnd     // Called when drag operation ends
  } = initDragDrop(
    // Find item index by ID - this connects to lyricsStore
    (id) => $lyricsStore.snippets.findIndex(s => s.id === id),
    // Reorder items - this connects to lyricsStore
    (sourceId, targetId) => {
      lyricsStore.reorderSnippets(sourceId, targetId);
    },
    // Show notification - this connects to notificationSystem
    (message) => notificationSystem.showNotification(message)
  );

  // Initialize transcript monitoring system
  // This system watches for transcript selections to collect as lyrics
  // Inputs:
  //   - Callback to add text to lyricsStore
  // Outputs:
  //   - collectContent function to manually grab transcript text
  //   - hasContent function to check if transcript has content
  const transcriptMonitor = createTranscriptMonitor((text) => {
    // This callback connects transcriptMonitor to lyricsStore
    return lyricsStore.addSnippet(text);
  });

  // Theme system initialization
  // Loads the saved theme from localStorage
  // Output: currentTheme object used for styling
  let currentTheme = loadSavedTheme();
  
  // Initialize theme listener variable with a no-op function
  // This prevents "undefined" errors if the component unmounts before mount completes
  let removeThemeListener = () => {};
  // === MODULE INITIALIZATION CHUNK END ===
  // === END PROCESSING ZONE: MODULE INITIALIZATION ===
  
  // TRAIL MARKER (Unit Cleanup): The module initialization follows a dependency injection pattern

  // === PROCESSING ZONE: EVENT HANDLERS ===
  // === EVENT HANDLERS CHUNK START ===
  // All event handlers and user interaction functions
  // These functions connect UI interactions to module operations
  // and provide visual feedback to the user
  
  // == THEME SYSTEM HANDLERS ==
  /**
   * Handles theme changes from UI or events
   * 
   * @param {string} themeId - The ID of the theme to apply
   * @side-effects 
   *   - Updates currentTheme state variable
   *   - Calls themeManager.applyTheme which updates localStorage and CSS variables
   */
  function handleThemeChange(themeId) {
    currentTheme = applyTheme(themeId);
  }

  // == EXPORT/COPY HANDLERS ==
  /**
   * Handles copying all snippets to clipboard
   * 
   * @side-effects
   *   - Uses exportManager.copyToClipboard to copy snippets
   *   - Sets copySuccess state for visual feedback
   *   - Shows notification on error via notificationSystem
   *   - Sets timeout to clear success state after delay
   */
  function handleCopySnippets() {
    copyToClipboard(snippets, 
      // Success callback
      () => {
        // Set visual feedback state
        copySuccess = true;
        
        // Clear any existing timeout to prevent multiple timers
        if (copyTimeout) clearTimeout(copyTimeout);
        
        // Set timeout to clear success state after 2 seconds
        copyTimeout = setTimeout(() => {
          copySuccess = false;
        }, 2000);
      },
      // Error callback
      (error) => {
        // Show error notification using notificationSystem
        notificationSystem.showNotification('Failed to copy: ' + error, 'error');
      }
    );
  }

  /**
   * Handles downloading lyrics as a text file
   * 
   * @side-effects
   *   - Uses exportManager.downloadLyricsAsText to create and download file
   *   - Shows notification for success/error via notificationSystem
   */
  function handleDownloadLyrics() {
    downloadLyricsAsText(snippets, '', 
      // Success callback
      (message) => {
        notificationSystem.showNotification(message, 'success');
      },
      // Error callback
      (error) => {
        notificationSystem.showNotification(error, 'error');
      }
    );
  }

  // == SNIPPET MANIPULATION HANDLERS ==
  /**
   * Handles combining multiple snippets into a single compiled snippet
   * Complex function with multiple side effects and animations
   * 
   * @side-effects
   *   - Uses compilationManager to combine snippets
   *   - Updates lyricsStore with the combined snippet
   *   - Shows visual feedback (button highlight, confetti)
   *   - Animates the compiled card with highlight effect
   *   - Shows notification on error via notificationSystem
   *   - Sets multiple timeouts for animation sequencing
   */
  function handleCombineSnippets() {
    compilationManager.compileSnippets(snippets,
      // Success callback
      (newSnippet) => {
        // Step 1: Update UI state for visual feedback
        compileSuccess = true;
        showConfetti = true;
        
        // Step 2: Update store with compiled snippet
        // This triggers reactivity to update the list
        lyricsStore.replaceAllSnippets([newSnippet]);
        
        // Step 3: Set up animation sequence
        // Clear any existing timeout to prevent multiple timers
        if (compileTimeout) clearTimeout(compileTimeout);
        
        // Animation timeline:
        // 1. Button highlight for 2 seconds
        compileTimeout = setTimeout(() => {
          compileSuccess = false;
        }, 2000);
        
        // 2. Confetti effect for 2.8 seconds
        setTimeout(() => {
          showConfetti = false;
        }, 2800);
        
        // 3. Card highlight animation after a short delay
        // (allows DOM to update with new compiled card first)
        setTimeout(() => {
          const compiledCard = document.querySelector('.compiled-card');
          if (compiledCard) {
            // Add highlight class for visual emphasis
            compiledCard.classList.add('highlight-compiled');
            
            // Remove the highlight after animation completes
            setTimeout(() => {
              compiledCard.classList.remove('highlight-compiled');
            }, 1500);
          }
        }, 100);
      },
      // Error callback - shows informational message
      (error) => {
        notificationSystem.showNotification(error, 'info');
      }
    );
  }

  /**
   * Handles undoing a previous combine operation
   * 
   * @side-effects
   *   - Uses compilationManager to restore original snippets
   *   - Updates lyricsStore with the restored snippets
   *   - Shows notification for feedback/error via notificationSystem
   */
  function handleUndoCombine() {
    compilationManager.undoCompilation(
      // Success callback
      (restoredSnippets) => {
        // Update store with restored snippets
        // This triggers reactivity to update the list
        lyricsStore.replaceAllSnippets(restoredSnippets);
        
        // Show success notification
        notificationSystem.showNotification('Combination undone!');
      },
      // Error callback
      (error) => {
        notificationSystem.showNotification(error, 'error');
      }
    );
  }

  /**
   * Handles clearing all snippets after confirmation
   * 
   * @side-effects
   *   - Shows browser confirmation dialog
   *   - If confirmed, calls lyricsStore.clearAllSnippets
   *   - lyricsStore will handle persistence and sound effects
   */
  function handleClearAll() {
    // Show browser confirmation dialog to prevent accidental clearing
    if (confirm('Are you sure you want to clear all collected lyrics?')) {
      // Clear all snippets from the store
      // This operation cannot be undone
      lyricsStore.clearAllSnippets();
    }
  }
  
  /**
   * Handles snippet item events
   */
  function handleSnippetDelete(event) {
    lyricsStore.removeSnippet(event.detail);
  }
  
  function handleSnippetEdit(event) {
    lyricsStore.startEditingSnippet(event.detail);
  }
  
  function handleSnippetSave(event) {
    lyricsStore.saveEditedSnippet(event.detail.id, event.detail.text);
  }
  
  function handleSnippetNavigation(event) {
    const { direction, snippetId } = event.detail;
    const snippetIndex = snippets.findIndex((s) => s.id === snippetId);
    
    if (direction === 'prev' && snippetIndex > 0) {
      const prevSnippet = snippets[snippetIndex - 1];
      lyricsStore.saveEditedSnippet(snippetId, snippets[snippetIndex].text);
      setTimeout(() => lyricsStore.startEditingSnippet(prevSnippet.id), 10);
    } else if (direction === 'next' && snippetIndex < snippets.length - 1) {
      const nextSnippet = snippets[snippetIndex + 1];
      lyricsStore.saveEditedSnippet(snippetId, snippets[snippetIndex].text);
      setTimeout(() => lyricsStore.startEditingSnippet(nextSnippet.id), 10);
    }
  }
  // === EVENT HANDLERS CHUNK END ===
  // === END PROCESSING ZONE: EVENT HANDLERS ===
  
  // TRAIL MARKER (Unit Cleanup): Event handlers connect user interactions to module operations

  // === PROCESSING ZONE: LIFECYCLE HOOKS ===
  // === LIFECYCLE HOOKS CHUNK START ===
  // Component initialization and cleanup
  // These hooks ensure proper setup and teardown of the component
  
  /**
   * Component initialization on mount
   * Sets up all event listeners, global APIs, and module initializations
   * 
   * @lifecycle
   * @side-effects
   *   - Loads data from storage via lyricsStore
   *   - Starts transcript monitoring
   *   - Adds theme change event listeners
   *   - Exposes global API for backward compatibility
   *   - Dispatches ready event for other components
   */
  onMount(() => {
    if (typeof window !== 'undefined') {
      // Step 1: Initialize data and monitoring
      // Load saved lyrics from storage
      lyricsStore.loadFromStorage();
      
      // Start monitoring for transcript selections
      // This enables the "Grab Lyrics" functionality
      transcriptMonitor.startMonitoring();
      
      // Step 2: Set up event listeners using eventBridge
      // This handles both LineSnap and TalkType events
      const removeThemeListener = eventBridge.addSettingChangeListener('theme', (value) => {
        logger.info('Theme change detected:', value);
        handleThemeChange(value);
      });
      
      // Step 3: Expose global API for compatibility
      // This allows other components to control the theme
      window.purpleStyleCollectionBox = {
        applyTheme: handleThemeChange
      };
      
      // Step 4: Signal component readiness using eventBridge
      // Dispatch an app event to let other components know we're ready
      eventBridge.dispatchAppEvent('lyricscollectionboxready', {
        id: Date.now(),
        theme: currentTheme.id
      });
    }
  });

  /**
   * Component cleanup on destroy
   * Ensures all resources are properly released
   * 
   * @lifecycle
   * @side-effects
   *   - Cleans up module resources
   *   - Clears timeout references
   *   - Removes event listeners
   */
  onDestroy(() => {
    // Step 1: Clean up module resources
    // Some modules need explicit cleanup
    notificationSystem.cleanup();
    transcriptMonitor.cleanup();
    
    // Step 2: Clear any active timeouts
    if (copyTimeout) clearTimeout(copyTimeout);
    if (compileTimeout) clearTimeout(compileTimeout);
    
    // Step 3: Remove event listeners
    if (typeof window !== 'undefined' && removeThemeListener) {
      // Clean up the theme change listener
      removeThemeListener();
    }
  });
  // === LIFECYCLE HOOKS CHUNK END ===
  // === END PROCESSING ZONE: LIFECYCLE HOOKS ===
  
  // TRAIL MARKER (Unit Cleanup): Lifecycle hooks handle component initialization and cleanup

  // === PROCESSING ZONE: REACTIVE DECLARATIONS ===
  // === REACTIVE DECLARATIONS CHUNK START ===
  // Additional reactive declarations for UI state
  // These declarations create derived state that updates automatically
  // whenever the underlying values change
  
  /**
   * Reactive notification state
   * Updates whenever notification system state changes
   * Used in the template to render notification messages
   * 
   * @reactive
   * @depends-on notificationSystem internal state
   */
  $: notificationState = notificationSystem.getNotificationState();
  
  /**
   * Reactive flag for whether transcript has content to grab
   * Controls visibility of the "Grab Lyrics" button
   * 
   * @reactive
   * @depends-on transcriptMonitor internal state
   */
  $: hasTranscriptContent = transcriptMonitor.hasContent();
  
  /**
   * Reactive flag for whether undo operation is available
   * Controls visibility of the undo button on compiled snippets
   * 
   * @reactive
   * @depends-on compilationManager internal state
   */
  $: canUndo = compilationManager.canUndo();
  // === REACTIVE DECLARATIONS CHUNK END ===
  // === END PROCESSING ZONE: REACTIVE DECLARATIONS ===
  
  // TRAIL MARKER (Unit Cleanup): Reactive declarations create derived state that updates automatically
</script>

<!--
  === TEMPLATE SECTION ===
  The component's markup is organized into sections:
  1. Main container with header and body sections
  2. Empty state display when no snippets exist
  3. Snippet list with edit/display modes for each item
  4. Visual feedback elements (confetti, notifications)
-->

<!-- === MAIN CONTAINER CHUNK START === -->
<div
  class="lyrics-collection-box {snippets.length === 0 ? 'empty-collection' : ''}"
  style="border: none; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05), 0 2px 8px rgba(0, 0, 0, 0.08); background-color: #ffffff;"
  aria-label="Lyrics Collection"
  role="region"
>
  <!-- === HEADER SECTION CHUNK START === -->
  <!-- Header with actions and button controls -->
  <div
    class="panel-header relative mb-2 flex items-center overflow-visible rounded-t-2xl px-4 py-3 shadow-sm backdrop-blur-sm"
    style="background: #FFFFFF;"
  >
    <!-- Header layout with consistent styling -->
    <div class="flex w-full items-center justify-between">
      <!-- Left: Title -->
      <h2 class="text-lg font-semibold text-neutral-800">Lyrics Collection</h2>

      <!-- Right: Actions -->
      <HeaderActions 
        hasSnippets={snippets.length > 0}
        hasTranscriptContent={hasTranscriptContent}
        editingSnippetId={editingSnippetId}
        copySuccess={copySuccess}
        compileSuccess={compileSuccess}
        on:grabLyrics={() => transcriptMonitor.collectContent()}
        on:copySnippets={handleCopySnippets}
        on:combineSnippets={handleCombineSnippets}
        on:downloadLyrics={handleDownloadLyrics}
        on:clearAll={handleClearAll}
      />
    </div>
  </div>
  <!-- === HEADER SECTION CHUNK END === -->

  <!-- === CONTENT SECTION CHUNK START === -->
  <!-- Main content area with snippets or empty state -->
  <div
    class="panel-body overflow-y-auto p-5 pt-6 backdrop-blur-sm"
    style="background-color: white;"
  >
    {#if snippets.length === 0}
      <!-- === EMPTY STATE CHUNK START === -->
      <EmptyState {currentTheme} />
      <!-- === EMPTY STATE CHUNK END === -->
    {:else}
      <!-- === SNIPPET LIST CHUNK START === -->
      <MemoizedSnippetList
        {snippets}
        {editingSnippetId}
        {currentTheme}
        canUndo={canUndo}
        {handleDragStart}
        {handleDragOver}
        {handleDragLeave}
        {handleDrop}
        {handleDragEnd}
        {playCardHoverSound}
        on:delete={handleSnippetDelete}
        on:edit={handleSnippetEdit}
        on:save={handleSnippetSave}
        on:navigate={handleSnippetNavigation}
        on:undoCombine={handleUndoCombine}
        on:download={handleDownloadLyrics}
      />
      <!-- === SNIPPET LIST CHUNK END === -->
    {/if}
  </div>
  <!-- === CONTENT SECTION CHUNK END === -->

  <!-- === VISUAL EFFECTS CHUNK START === -->
  <!-- Confetti and notification feedback -->
  {#if showConfetti}
    <div class="confetti-container">
      <Confetti targetSelector=".compiled-card" particleCount={150} />
    </div>
  {/if}

  <!-- Enhanced notification popup -->
  <NotificationDisplay 
    show={notificationState.showNotificationPing} 
    text={notificationState.notificationText} 
    type={notificationState.notificationType} 
  />
  <!-- === VISUAL EFFECTS CHUNK END === -->
</div>
<!-- === MAIN CONTAINER CHUNK END === -->

<!-- === CSS STYLES CHUNK START === -->
<style>
  /* Base container */
  .lyrics-collection-box {
    display: flex;
    flex-direction: column;
    overflow: visible !important;
    border: 1px solid rgba(139, 92, 246, 0.2);
    border-radius: 1rem;
    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.05);
    min-height: 10rem;
    margin-bottom: 1rem;
    position: relative;
    width: 100%;
    max-width: 600px;
    will-change: transform, opacity;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }
</style>
<!-- === CSS STYLES CHUNK END === -->