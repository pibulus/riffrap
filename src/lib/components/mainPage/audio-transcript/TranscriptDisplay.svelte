<script>
  /**
   * === COMPONENT OVERVIEW ===
   * 
   * TranscriptDisplay Component
   *
   * This is a large, complex component that displays transcribed text from audio recordings.
   * It handles both display and interaction with the transcript, including:
   * - Text selection and manipulation
   * - Copy/share functionality
   * - Snippet collection for lyrics
   * - Visual feedback for user actions
   * - Accessibility features
   * 
   * IMPORTANT: This component has been modularized into multiple files:
   * - TranscriptDisplay.svelte - Main component with UI and event handlers (this file)
   * - TranscriptDisplay_Core.js - Core state, config, imports, and stores
   * - TranscriptDisplay_Selection.js - Text selection and highlighting functionality
   * - TranscriptDisplay_Notification.js - Notification and feedback system
   */
  
  // Import stores from module
  import { 
    // State and props as stores
    transcriptStore,
    showCopyTooltipStore,
    responsiveFontSizeStore,
    parentContainerStore,
    editableTranscriptStore,
    copyButtonRefStore,
    transcriptBoxRefStore,
    notificationStore,
    notificationTimeoutStore,
    tooltipHoverCountStore,
    hasUsedCopyButtonStore,
    isScrollableStore,
    showRerollTooltipStore,
    isRerollingStore,
    selectionActiveStore,
    selectionLeftStore,
    selectionTopStore,
    selectedTextStore,
    currentSelectionStore,
    dispatchStore,
    
    // Core functions
    getEditedTranscript, handleTooltipMouseEnter, checkScrollable,
    isWebShareSupported, handleRerollTooltipMouseEnter, handleReroll,
    setupLifecycleHooks
  } from './TranscriptDisplay_Core.js';
  
  // Create local props from store values
  export let transcript;
  export let showCopyTooltip;
  export let parentContainer;
  
  // DOM references that need binding
  let editableTranscript;
  let copyButtonRef;
  let transcriptBoxRef;
  
  // Derived values from stores
  let notification;
  let selectionActive;
  let selectionLeft;
  let selectionTop;
  let selectedText;
  let isScrollable;
  
  // Create event dispatcher - this must be done inside the component
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  
  // Debug log for monitoring transcript updates
  $: if (transcript) console.log('[DEBUG] TranscriptDisplay has transcript:', transcript.substring(0, 30));
  
  // Set the dispatch in the store for other modules to use
  dispatchStore.set(dispatch);
  
  // Subscribe to stores for local use - FIXED: Removed the transcript subscription that was causing feedback loop
  // The transcriptStore is now updated directly from TranscriptDisplay_Core.js
  showCopyTooltipStore.subscribe(value => (showCopyTooltip = value));
  parentContainerStore.subscribe(value => (parentContainer = value));
  notificationStore.subscribe(value => (notification = value));
  selectionActiveStore.subscribe(value => (selectionActive = value));
  selectionLeftStore.subscribe(value => (selectionLeft = value));
  selectionTopStore.subscribe(value => (selectionTop = value));
  selectedTextStore.subscribe(value => (selectedText = value));
  isScrollableStore.subscribe(value => (isScrollable = value));
  
  // Set the store values when props change - FIXED: Removed bidirectional binding for transcript
  // We now only allow one-way updates from global transcriptionText to local transcriptStore
  $: showCopyTooltipStore.set(showCopyTooltip);
  $: parentContainerStore.set(parentContainer);
  
  // Sync DOM refs with stores when they update
  $: if (editableTranscript) editableTranscriptStore.set(editableTranscript);
  $: if (copyButtonRef) copyButtonRefStore.set(copyButtonRef);
  $: if (transcriptBoxRef) transcriptBoxRefStore.set(transcriptBoxRef);
  
  import {
    handleTextSelection,
    hideSelectionButton
  } from './TranscriptDisplay_Selection.js';
  
  import {
    showNotification,
    handleCollectSnippet,
    handleCollectionError,
    handleDirectCollection,
    handleClickOutside,
    handleKeyboardShortcut
  } from './TranscriptDisplay_Notification.js';
  
  // Import Svelte components and transitions
  import SelectionButton from './SelectionButton.svelte';
  import { fade, fly } from 'svelte/transition';
  import { onDestroy, onMount } from 'svelte';
  
  // Handler for notification events from modules
  function handleNotification(event) {
    if (event && event.detail) {
      showNotification(event.detail);
    }
  }
  
  // Initialize lifecycle hooks
  const cleanup = setupLifecycleHooks({
    handleTextSelection,
    handleClickOutside, 
    handleKeyboardShortcut,
    handleCollectSnippet,
    handleDirectCollection
  });
  
  // Ensure cleanup on destroy
  onDestroy(() => {
    if (typeof cleanup === 'function') {
      cleanup();
    }
    // Clean up the dispatcher in the store
    dispatchStore.set(null);
  });
</script>

<!-- === GLAM ZONE START: UI TEMPLATE === -->
<!-- --- SPLIT SECTION START: UI TEMPLATE --- -->
<!-- 
  UI Template
  
  This zone defines the component's UI structure:
  - Overall component layout
  - Transcript text display
  - Interactive elements (buttons, tooltips)
  - Animation transitions
  - Selection highlighting
  
  OMG REF (App Glam-Up): Could be split into smaller, focused sub-components
-->
<div
  class="transcript-wrapper w-full relative"
  on:animationend={() => {
    // No page scrolling needed anymore with fixed layout
    checkScrollable();
  }}
>
  <!-- Wrapper for positioning toast properly -->
  
  <div class="wrapper-container flex w-full justify-center overflow-visible">
    <div
      class="transcript-box-container relative overflow-visible"
      style="width: 700px; margin: 0 auto;"
    >
      <!-- Toast Notification for Lyrics Collection positioned relative to this container -->
      {#if notification}
        <div 
          class="lyrics-collected-toast {notification.type}" 
          transition:fly={{y: 30, duration: 200}}
        >
          <div class="toast-icon">
            {#if notification.type === 'success'}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="toast-check-icon"><path d="M20 6L9 17l-5-5"/></svg>
            {/if}
          </div>
          <div class="toast-message">Line collected!</div>
        </div>
      {/if}
      
      <!-- Re-roll button positioned outside and to the top-right of transcript box -->
      <div class="absolute -top-6 right-0 z-20">
          <button
            class="reroll-btn rounded-full px-4 py-3 hover:scale-105 transform transition-all duration-300 bg-gradient-to-br from-pink-400 to-rose-400 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 active:scale-95 flex items-center gap-2"
            on:click|preventDefault={handleReroll}
            aria-label="Re-roll lyrics"
            title="Generate new interpretation from the same audio"
            class:reroll-spinning={$isRerollingStore}
          >
            <!-- Enhanced dice icon with spinning animation when rerolling -->
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="dice-icon" class:spin-animation={$isRerollingStore}>
              <rect width="12" height="12" x="2" y="10" rx="2" ry="2"></rect>
              <path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"></path>
              <path d="M6 18h.01"></path>
              <path d="M10 14h.01"></path>
              <path d="M15 6h.01"></path>
              <path d="M18 9h.01"></path>
            </svg>
            <!-- Dynamic text based on rerolling state -->
            <span class="text-white font-medium">{$isRerollingStore ? 'Rolling...' : 'Reroll'}</span>
          </button>
        </div>
      
      <!-- Redesigned transcript box with proper structure -->
      <div
        class="transcript-box animate-shadow-appear relative mb-4 box-border 
               rounded-[2rem] border border-purple-100/70 bg-white/95
               shadow-sm contain-layout"
        style="width: 600px; margin: 0 auto; min-height: 300px; height: auto;"
      >
        
        <!-- Content Area - scrollable with increased height and smooth transitions -->
        <div 
          class="transcript-content-area w-full max-h-[600px] overflow-y-auto overflow-x-hidden px-8 pt-6 pb-8 relative z-5"
          style="min-height: 240px;"
          bind:this={transcriptBoxRef}
        >
          <div
            class="transcript-text text-base text-left custom-transcript-text animate-text-appear font-mono mb-3 lyric-display font-medium max-w-full break-words"
            contenteditable="true"
            role="textbox"
            aria-label="Transcript editor"
            aria-multiline="true"
            tabindex="0"
            aria-describedby="transcript-instructions"
            bind:this={editableTranscript}
            style="min-height: 100px; transition: min-height 0.5s ease-in-out;"
            on:focus={() => {
              dispatch('focus', {
                message: 'You can edit this transcript. Use keyboard to make changes.'
              });
            }}
          >
            {#each transcript.split('\n') as line}
              <div class="lyric-line" style="width:100%;">{line || ' '}</div>
            {/each}
          </div>
          
          <!-- Hidden instructions for screen readers -->
          <div id="transcript-instructions" class="sr-only">
            Editable transcript. You can modify the text if needed.
          </div>
          
          <!-- Selection button - hidden but functionality still used -->
          {#if selectionActive}
            <SelectionButton 
              left={selectionLeft}
              top={selectionTop}
              visible={false}
              selectedText={selectedText}
              on:collect={handleCollectSnippet}
              on:collection-error={handleCollectionError}
              on:notification={handleNotification}
            />
          {/if}
          
          <!-- Remove the bottom controls area with the re-roll button -->
        </div>
        
        <!-- Footer area with scroll indicator only -->
        <div class="transcript-footer-area relative w-full">
          <!-- Scroll indicator - only visible when scrollable -->
          {#if isScrollable}
            <div
              class="scroll-indicator-bottom pointer-events-none absolute top-[-32px] left-0 right-0 z-10"
            ></div>
          {/if}
        </div>
      </div>
    </div>
  </div>

</div>

<!-- === GLAM ZONE END: UI TEMPLATE === -->
<!-- --- SPLIT SECTION END: UI TEMPLATE --- -->
<!-- === GLAM ZONE START: STYLES === -->
<!-- --- SPLIT SECTION START: STYLES --- -->
<!-- 
  Styles
  
  This zone defines the component's visual presentation:
  - Container layout
  - Box structure
  - Selection visualization
  - Animations
  - Responsive behavior
  - Accessibility styles
  
  OMG REF (App Glam-Up): Styles could be modularized into theme-based components 
  and many could be converted to utility classes
-->
<style>
  /* Container layout */
  .transcript-wrapper {
    contain: layout;
    margin-top: 24px; /* Reduced space between button and transcript */
    min-width: 300px; /* Minimum width for the entire transcript component */
    width: 100%; /* Take up available space */
  }
  
  /* Box structure */
  .transcript-box {
    display: flex;
    flex-direction: column;
    overflow: hidden; /* Contain all scrolling internally */
    transition: background-color 0.6s cubic-bezier(0.22, 1, 0.36, 1), 
                border-color 0.6s cubic-bezier(0.22, 1, 0.36, 1),
                box-shadow 0.6s cubic-bezier(0.22, 1, 0.36, 1),
                transform 0.3s ease-out,
                height 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); /* Bloopy animation curve for height */
    animation: subtle-breathe 10s infinite ease-in-out alternate;
    position: relative; /* For the pseudo-element highlight */
    min-height: 150px; /* Minimum height to prevent collapse */
    min-width: 300px; /* Minimum width to maintain consistent appearance */
    width: 100%; /* Take up available space */
    will-change: height, transform; /* Hardware acceleration hint */
  }
  
  /* Extremely subtle mouseover highlight effect */
  .transcript-box::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 2rem;
    background: radial-gradient(circle at 50% 50%, rgba(249, 168, 212, 0.04), transparent 70%);
    opacity: 0;
    transition: opacity 0.6s ease-in-out;
    pointer-events: none; /* Allow clicks to pass through */
    z-index: 1;
  }
  
  .transcript-box:hover::before {
    opacity: 1;
  }
  
  /* Subtle sparkle effect for transcript box */
  .transcript-box::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-image: 
      radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.8) 0.1%, transparent 0.5%),
      radial-gradient(circle at 70% 40%, rgba(255, 255, 255, 0.8) 0.1%, transparent 0.5%),
      radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.8) 0.1%, transparent 0.5%),
      radial-gradient(circle at 90% 90%, rgba(255, 255, 255, 0.8) 0.1%, transparent 0.5%);
    border-radius: 2rem;
    opacity: 0;
    pointer-events: none;
    z-index: 2;
  }
  
  .transcript-box:hover::after {
    animation: sparkle-travel 3s ease-out;
  }
  
  @keyframes sparkle-travel {
    0% {
      opacity: 0;
      background-position: 20% 30%, 70% 40%, 30% 70%, 90% 90%;
    }
    30% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      background-position: 25% 35%, 75% 45%, 35% 75%, 95% 95%;
    }
  }
  
  /* Subtle breathing animation - 80/20 rule applied for subtlety */
  @keyframes subtle-breathe {
    0% {
      box-shadow: 0 4px 16px rgba(168, 85, 247, 0.1);
      border-color: rgba(168, 85, 247, 0.15);
    }
    50% {
      box-shadow: 0 4px 18px rgba(168, 85, 247, 0.12);
      border-color: rgba(168, 85, 247, 0.18);
    }
    100% {
      box-shadow: 0 4px 20px rgba(168, 85, 247, 0.14);
      border-color: rgba(168, 85, 247, 0.2);
    }
  }
  
  /* Elegant hover effect - extremely subtle */
  .transcript-box:hover {
    box-shadow: 0 4px 20px rgba(168, 85, 247, 0.16);
    border-color: rgba(168, 85, 247, 0.25);
    transform: translateY(-0.5px);
  }
  
  /* Enhanced transcript text styling - dynamic sizing based on content */
  .custom-transcript-text {
    text-align: left;
    font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    transition: background-color 0.4s ease, 
                text-shadow 0.3s ease, 
                min-height 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); /* Bloopy animation for height changes */
    caret-color: rgba(236, 72, 153, 1); /* Darker, more visible cursor color */
    /* Remove explicit font-size to allow Tailwind classes to work */
    /* Base text size now handled by responsiveFontSize classes */
    white-space: pre-wrap; /* Allow text to wrap but preserve line breaks */
    word-break: break-word; /* Break long words if needed */
    overflow-x: hidden; /* Prevent horizontal overflow */
    max-width: 100%; /* Ensure text doesn't overflow container */
    z-index: 0; /* Prevent unwanted stacking issues */
    isolation: isolate; /* Create stacking context to prevent interference */
    contain: content; /* Contain layout changes */
    line-height: 1.6; /* Fixed line height for consistency */
    will-change: min-height; /* Hardware acceleration hint */
  }
  
  /* Lyric display container styling */
  .lyric-display {
    display: flex;
    flex-direction: column;
    gap: 0; /* Remove gap to prevent layout shift */
    white-space: pre-wrap;
    word-break: break-word;
    overflow-x: hidden;
    max-width: 100%;
    contain: content; /* Contain layout changes */
    transition: height 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), 
                min-height 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); /* Bloopy animation for lyrics container */
    will-change: height; /* Hardware acceleration hint */
  }
  
  /* Individual lyric line styling */
  .lyric-line {
    line-height: 1.6;
    min-height: 1.6em; /* Use min-height instead of fixed height */
    padding: 0.3rem 0.5rem; /* Increased padding for better readability */
    transition: background-color 0.2s ease;
    border-radius: 0;
    font-weight: 500; /* Medium weight text for balanced readability */
    box-sizing: border-box; /* Ensure padding is included in element size */
    overflow-x: hidden; /* Prevent horizontal overflow */
    white-space: pre-wrap; /* Allow text to wrap but preserve line breaks */
    word-break: break-word; /* Break long words if needed */
    display: block; /* Ensure each line is its own block */
    max-width: 100%; /* Ensure text doesn't overflow container */
    width: 100%; /* Full width to prevent jitter */
    border-bottom: 1px solid rgba(197, 163, 255, 0.08); /* Subtle separator */
  }
  
  /* Empty line spacing */
  .lyric-line:empty::after {
    content: " ";
    display: inline-block;
    height: 1em;
  }
  
  /* Line hover effect - lighter purple to indicate hover state */
  .lyric-line:hover {
    background-color: rgba(197, 163, 255, 0.25); /* Even lighter purple for hover */
    cursor: pointer; /* Show pointer cursor on hover to indicate clickable */
    width: 100%; /* Full width to match selection */
    transition: background-color 0.2s ease;
    transform: none; /* Prevent transforms on hover */
  }
  
  /* Line focus/selection effect - solid chunk highlight */
  .lyric-line:focus, .lyric-line.selected, .lyric-line-grabbed {
    background-color: #C5A3FF; /* Solid purple highlight color */
    color: #111827;
    outline: none;
    border-radius: 0; /* Remove border radius */
    width: 100%; /* Full-width highlight */
    box-shadow: 0 0 0 2px #C5A3FF; /* Extra highlight to ensure full width */
  }
  
  /* Clear, simple selection effect to avoid conflicts */
  .lyric-line-grabbed {
    animation: simpleGrabHighlight 0.6s ease-in-out; /* Basic animation with standard easing */
    border-left: 5px solid #a37cff; /* Solid border on the left for extra visibility */
    padding-left: calc(0.5rem - 5px); /* Maintain the same total padding */
    box-shadow: 0 0 5px rgba(197, 163, 255, 0.2); /* Very subtle shadow */
    transform: none; /* Prevent transform which could cause jitter */
  }
  
  /* Simple background color flash animation */
  @keyframes simpleGrabHighlight {
    0% { background-color: #C5A3FF; }
    40% { background-color: #e7deff; } /* Brighter for better feedback */
    100% { background-color: #C5A3FF; }
  }
  
  /* Animation for selected line when lyrics are collected */
  .lyric-pulse-collected {
    animation: lyric-collected-pulse 1.5s ease-out forwards;
    border-left: 3px solid #ec4899;
    box-shadow: 0 0 10px rgba(236, 72, 153, 0.3);
    transform: none; /* Prevent transform which could cause jitter */
    width: 100%; /* Ensure full width */
  }
  
/* Animation to make the height transition more smooth and bloopy */
@keyframes height-bloopy {
  0% { transform: scaleY(0.95); }
  50% { transform: scaleY(1.02); }
  100% { transform: scaleY(1); }
}
  
  @keyframes lyric-collected-pulse {
    0% {
      background-color: rgba(249, 168, 212, 0.6);
      box-shadow: 0 0 15px rgba(236, 72, 153, 0.4);
    }
    30% {
      background-color: rgba(249, 168, 212, 0.3);
      box-shadow: 0 0 12px rgba(236, 72, 153, 0.3);
    }
    60% {
      background-color: rgba(249, 168, 212, 0.4);
      box-shadow: 0 0 8px rgba(236, 72, 153, 0.2);
    }
    100% {
      background-color: rgba(197, 163, 255, 0.3);
      border-left: 0;
      box-shadow: none;
    }
  }
  
  /* Smooth, flowing notification animation with satisfying motion */
  @keyframes flowingNotification {
    0% { opacity: 0; transform: translateY(8px) scale(0.8); }
    30% { opacity: 1; transform: translateY(-2px) scale(1.05); } /* Gentle rise */
    45% { transform: translateY(1px) scale(0.98); } /* Slight settling */
    60% { transform: translateY(0) scale(1); } /* Final position */
    80% { opacity: 1; transform: translateY(0) scale(1); } /* Hold longer */
    100% { opacity: 0; transform: translateY(-5px); } /* Fade away gently */
  }
  
  
  
  /* Consistent solid purple style for selected text */
  ::selection {
    background-color: #C5A3FF; /* Solid purple highlight color */
    color: #111827;
    text-shadow: none; /* Remove any text shadow during selection */
  }
  
  /* Optimize spacing based on font size for better readability */
  .text-xs, .text-sm {
    letter-spacing: 0.01em; /* Slightly open tracking for smaller text */
  }
  
  .text-base, .text-lg {
    letter-spacing: 0; /* Normal tracking for medium text */
  }
  
  .text-xl, .text-2xl, .text-3xl, .text-4xl {
    line-height: 1.5; /* Slightly tighter for larger text */
    letter-spacing: -0.01em; /* Slightly tighter tracking for large text */
  }
  
  /* Base transition timing for box with gentle easing curve */
  .transcript-box {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), 
                background-color 0.28s cubic-bezier(0.22, 1, 0.36, 1), 
                border-color 0.28s cubic-bezier(0.22, 1, 0.36, 1), 
                box-shadow 0.38s cubic-bezier(0.22, 1, 0.36, 1),
                height 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), /* Ensure height transitions are smooth */
                min-height 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); /* Same for min-height */
  }
  
  /* Clean highlight when clicked/editing - single consistent background */
  .transcript-box:focus-within {
    background-color: rgba(245, 243, 255, 0.9);
    border-color: rgba(168, 85, 247, 0.25);
    box-shadow: 0 4px 16px rgba(168, 85, 247, 0.2), 0 0 2px rgba(168, 85, 247, 0.1) inset;
    transform: translateY(-1px);
  }
  
  /* Refined text shadow effect when editing - with subtle depth */
  .transcript-box:focus-within .custom-transcript-text {
    text-shadow: 0 0.5px 0 rgba(168, 85, 247, 0.15), 0 1px 1.5px rgba(0, 0, 0, 0.03);
    letter-spacing: 0.01em; /* Very slightly open up letter spacing for editability */
  }
  
  /* Fun, salmon-colored Re-roll button styling */
  .reroll-btn {
    position: relative;
    background-color: #fb7185; /* rose-400 fallback - light salmon pink */
    color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    will-change: transform;
    overflow: hidden;
    font-size: 0.9rem; /* Slightly larger text */
    font-weight: 600;
  }

  /* Hover effect matching Save button */
  .reroll-btn:hover {
    background-color: #f43f5e; /* rose-500 fallback - darker salmon */
    box-shadow: 0 4px 8px rgba(244, 63, 94, 0.25);
    transform: scale(1.03);
  }
  
  /* Satisfying click effect */
  .reroll-btn:active {
    transform: scale(0.97);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  
  /* Fun dice animation on hover and spinning animation when rerolling */
  .dice-icon {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    transform-origin: center;
  }
  
  .reroll-btn:hover .dice-icon:not(.spin-animation) {
    animation: diceBounceWiggle 1s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
  }
  
  /* Spin animation for when rerolling is in progress */
  .spin-animation {
    animation: spinDice 1.2s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite;
  }
  
  @keyframes spinDice {
    0% { transform: rotate(0deg); }
    50% { transform: rotate(180deg) scale(1.1); }
    100% { transform: rotate(360deg); }
  }
  
  /* Enhanced wiggle animation on hover */
  @keyframes diceBounceWiggle {
    0%, 100% { transform: rotate(0deg) scale(1); }
    10% { transform: rotate(-10deg) scale(1.1); }
    20% { transform: rotate(10deg) scale(1.2); }
    30% { transform: rotate(-8deg) scale(1.1); }
    40% { transform: rotate(8deg) scale(1.05); }
    50% { transform: rotate(-5deg) scale(1.1); }
    60% { transform: rotate(5deg) scale(1.05); }
    70% { transform: rotate(-2deg) scale(1); }
    80% { transform: rotate(2deg) scale(1.05); }
    90% { transform: rotate(0deg) scale(1); }
  }
  
  /* Visual changes for the button when rerolling */
  .reroll-spinning {
    background: linear-gradient(to right, #f43f5e, #ec4899, #f43f5e) !important;
    background-size: 200% 100% !important;
    animation: gradient-shift 2s ease infinite !important;
    box-shadow: 0 6px 16px rgba(236, 72, 153, 0.3) !important;
  }
  
  @keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  /* Add subtle shimmer on hover */
  .reroll-btn::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -60%;
    width: 20%;
    height: 200%;
    background: rgba(255, 255, 255, 0.4);
    transform: rotate(30deg);
    transition: left 0.7s ease;
    pointer-events: none;
    opacity: 0;
    border-radius: inherit;
  }
  
  .reroll-btn:hover::before {
    left: 130%;
    opacity: 1;
    transition: left 0.7s ease, opacity 0.1s ease;
  }
  
  /* Add satisfying 3D depth effect on hover */
  .reroll-btn {
    position: relative;
    overflow: hidden;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), 
                box-shadow 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
                background 0.3s ease;
    will-change: transform, box-shadow;
  }
  
  .reroll-btn:hover {
    box-shadow: 0 6px 16px rgba(244, 63, 94, 0.25), 0 0 0 2px rgba(244, 63, 94, 0.1);
    transform: translateY(-2px) scale(1.05);
    filter: brightness(108%);
  }
  
  .reroll-btn:active {
    transform: translateY(1px) scale(0.95);
    box-shadow: 0 2px 8px rgba(244, 63, 94, 0.2);
    filter: brightness(95%);
  }
  
  /* Subtle pulse animation when first entering edit mode */
  @keyframes edit-pulse {
    0% { background-color: rgba(245, 243, 255, 0.9); }
    30% { background-color: rgba(168, 85, 247, 0.15); }
    100% { background-color: rgba(245, 243, 255, 0.9); }
  }
  
  .transcript-box:focus-within {
    animation: edit-pulse 0.6s cubic-bezier(0.4, 0, 0.2, 1) 1;
  }
  
  
  /* Remove outline focus from the text itself for cleaner look */
  .custom-transcript-text:focus {
    outline: none;
  }
  
  /* Style the share button area with matching elegance */
  .transcript-button-area {
    transition: background 0.28s cubic-bezier(0.22, 1, 0.36, 1), 
                backdrop-filter 0.32s cubic-bezier(0.22, 1, 0.36, 1), 
                transform 0.34s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  .transcript-box:focus-within .transcript-button-area {
    background-color: rgba(253, 242, 248, 0.9);
    backdrop-filter: blur(5px);
    transform: translateY(-0.5px);
  }
  

  /* Content area scrolling - more refined */
  .transcript-content-area {
    scrollbar-width: thin;
    scrollbar-color: rgba(168, 85, 247, 0.3) transparent;
    overscroll-behavior: contain; /* More controlled overscroll */
    -webkit-overflow-scrolling: touch; /* Smoother scrolling on iOS */
    scroll-behavior: smooth; /* Smoother scrolling */
    transition: background-color 0.3s ease-out; /* Limit transitions to prevent layout shifts */
    contain: paint; /* Contain paint operations */
  }
  
    /* Simple hand pointer cursor */
  .custom-transcript-text {
    cursor: pointer;
    contain: content; /* Contain layout changes */
    contain-intrinsic-size: 100%; /* Set intrinsic size */
  }
  
  /* Refined selection styling - only for non-lyric-line selections */
  .transcript-box ::selection {
    background-color: #C5A3FF; /* Solid purple highlight color */
    color: #111827;
  }
  
  /* Prevent double highlighting when line is selected */
  .lyric-line.selected ::selection,
  .lyric-line-grabbed ::selection {
    background-color: transparent; /* Hide the native text selection styling */
    color: inherit; /* Use the parent element's text color */
    -webkit-user-select: none; /* Disable text selection in Safari */
    user-select: none; /* Disable text selection in modern browsers */
  }
  
  
  
  /* Custom scrollbar styles for WebKit browsers */
  .transcript-content-area::-webkit-scrollbar {
    width: 6px;
  }
  
  .transcript-content-area::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .transcript-content-area::-webkit-scrollbar-thumb {
    background-color: rgba(168, 85, 247, 0.3);
    border-radius: 20px;
    border: 2px solid transparent;
  }
  
  /* Elegant scroll indicator for content overflow */
  .scroll-indicator-bottom {
    height: 40px; /* Taller gradient for more presence */
    background: linear-gradient(to top, 
                rgba(255, 255, 255, 0.98) 0%, 
                rgba(253, 242, 248, 0.9) 15%,
                rgba(253, 242, 248, 0.5) 40%,
                rgba(253, 242, 248, 0.1) 75%,
                rgba(255, 255, 255, 0) 100%);
    box-shadow: 0 -6px 12px -6px rgba(249, 168, 212, 0.15);
    border-bottom-left-radius: 2rem;
    border-bottom-right-radius: 2rem;
    pointer-events: none; /* Ensures text behind it is selectable */
    opacity: 0.95; /* Slight transparency */
  }
  
  /* Mobile optimization */
  @media (max-width: 600px) {
    .transcript-content-area {
      max-height: 450px; /* Increased height on mobile but still smaller than desktop */
      padding: 1.5rem;
      scrollbar-width: none; /* Hide scrollbar on Firefox */
    }
    
    .transcript-content-area::-webkit-scrollbar {
      display: none; /* Hide scrollbar on Webkit browsers */
    }
    
    .transcript-wrapper {
      margin-top: 24px; /* Smaller gap on mobile */
    }
    
    /* Slightly taller scroll indicator on mobile */
    .scroll-indicator-bottom {
      height: 48px;
    }
  }
  
  /* Footer area with gradient and button */
  .transcript-footer-area {
    flex-shrink: 0; /* Prevent footer from shrinking */
    position: relative; /* For positioning the gradient */
    z-index: 5; /* Ensure it's above the content but below the gradient */
    margin-top: -4px; /* Reduce gap between transcript and share button */
  }
  
  /* Button area styling - integrated with content */
  .transcript-button-area {
    flex-shrink: 0; /* Prevent button area from shrinking */
    background: transparent; /* Make it blend with content */
    margin-top: 8px; /* Small space after gradient */
    backdrop-filter: blur(4px); /* Subtle blur effect for elegance */
  }
  
  /* Ensure Share button stays centered */
  :global(.share-btn-text) {
    display: inline-block;
    text-align: center;
  }
  
  /* Animation classes */
  .animate-shadow-appear {
    box-shadow: 0 8px 30px rgba(249, 168, 212, 0.25);
    animation: shadowAppear 0.5s ease-out forwards;
  }
  
  .animate-text-appear {
    animation: textAppear 0.4s ease-out forwards;
  }
  
  @keyframes shadowAppear {
    from {
      box-shadow: 0 0 0 rgba(249, 168, 212, 0);
    }
    to {
      box-shadow: 0 8px 30px rgba(249, 168, 212, 0.25);
    }
  }
  
  @keyframes textAppear {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Notification animations */
  .animate-bounce-in {
    animation: bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }
  
  @keyframes bounceIn {
    0% {
      opacity: 0;
      transform: translate(-50%, 20px) scale(0.8);
    }
    50% {
      opacity: 1;
      transform: translate(-50%, -5px) scale(1.05);
    }
    70% {
      transform: translate(-50%, 2px) scale(0.95);
    }
    100% {
      transform: translate(-50%, 0) scale(1);
    }
  }
  
  /* Notification pill styling */
  .notification-pill {
    animation: notificationAppear 0.4s cubic-bezier(0.19, 1, 0.22, 1) forwards;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: all 0.2s ease;
  }
  
  .notification-pill:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  }
  
  @keyframes notificationAppear {
    0% { 
      opacity: 0;
      transform: translateX(-20px) scale(0.9);
    }
    60% { 
      opacity: 1;
      transform: translateX(5px) scale(1.03);
    }
    100% { 
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }
  /* Toast Notification Styling */
  .lyrics-collected-toast {
    position: fixed;
    top: 110px;
    left: 50%;
    transform: translateX(-50%);
    background-color: white;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    padding: 10px 14px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 1000;
    font-weight: 600;
    color: #333;
    border: 1px solid rgba(0, 0, 0, 0.08);
  }

  .lyrics-collected-toast.success {
    background: linear-gradient(to right, rgba(196, 181, 253, 0.98), rgba(196, 181, 253, 0.95));
    border-left: 4px solid #9F7AEA;
    box-shadow: 0 4px 16px rgba(167, 139, 250, 0.4);
  }

  .lyrics-collected-toast.error {
    background: linear-gradient(to right, rgba(254, 226, 226, 0.9), rgba(254, 226, 226, 0.7));
    border-left: 4px solid #F87171;
  }

  .lyrics-collected-toast.info {
    background: linear-gradient(to right, rgba(219, 234, 254, 0.9), rgba(219, 234, 254, 0.7));
    border-left: 4px solid #60A5FA;
  }

  .toast-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .toast-check-icon {
    color: #9F7AEA;
    stroke-width: 3;
    width: 18px;
    height: 18px;
  }

  .toast-error-icon {
    color: #F87171;
  }

  .toast-info-icon {
    color: #60A5FA;
  }

  .toast-message {
    font-size: 0.95rem;
    line-height: 1.2;
  }
</style>
<!-- === GLAM ZONE END: STYLES === -->
<!-- --- SPLIT SECTION END: STYLES --- -->