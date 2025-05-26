<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import AudioToText from './audio-transcript/AudioToText.svelte';
  import AnimatedTitle from './AnimatedTitle.svelte';
  import LyricsPanel from './LyricsPanel.svelte';
  import { browser } from '$app/environment';

  // Props passed from the parent
  export let ghostComponent = null;
  export let speechModelPreloaded = false;
  export let onPreloadRequest = null;

  // State
  let isMobile = false;
  let snippets = [];
  let activeTab = 'transcript'; // 'transcript' or 'collection'

  // Event dispatcher to communicate with parent
  const dispatch = createEventDispatcher();

  // Animation state variables
  let titleAnimationComplete = false;
  let subtitleAnimationComplete = false;

  // Component references
  let audioToTextComponent;
  let collectionPanelComponent;
  let debugBoxComponent;
  let selectedText = '';  // For debug box

  // Debug helper
  function debug(message) {
    // Uncomment the line below during development for verbose logging
    // console.log(`[ContentContainer] ${message}`);
  }

  // Function to handle title animation complete
  function handleTitleAnimationComplete() {
    debug('Title animation complete');
    titleAnimationComplete = true;
    dispatch('titleAnimationComplete');
  }

  // Function to handle subtitle animation complete
  function handleSubtitleAnimationComplete() {
    debug('Subtitle animation complete');
    subtitleAnimationComplete = true;
    dispatch('subtitleAnimationComplete');
  }

  // Public methods for parent to access
  export function startRecording() {
    if (audioToTextComponent) {
      debug('Starting recording from parent');
      audioToTextComponent.startRecording();
    }
  }

  export function stopRecording() {
    if (audioToTextComponent) {
      debug('Stopping recording from parent');
      audioToTextComponent.stopRecording();
    }
  }

  // Event forwarding functions
  function forwardRecordingStart() {
    dispatch('recordingstart');
  }

  function forwardRecordingStop() {
    dispatch('recordingstop');
  }

  function forwardProcessingStart() {
    dispatch('processingstart');
  }

  function forwardProcessingEnd() {
    dispatch('processingend');
  }

  function forwardTranscriptionCompleted(event) {
    dispatch('transcriptionCompleted', event.detail);
  }
  
  // Check if device is mobile
  function checkMobileDevice() {
    if (browser) {
      isMobile = window.innerWidth < 768;
      window.addEventListener('resize', () => {
        isMobile = window.innerWidth < 768;
      });
    }
  }
  
  // Local state management - no store subscription needed
  function updateSnippets() {
    if (collectionPanelComponent) {
      // Just using length for UI updates, not actual content
      snippets = collectionPanelComponent.collectedSnippets || [];
      console.log('ContentContainer updated snippets count:', snippets.length);
    }
  }
  
  // Update snippets whenever the panel reference is available
  $: if (collectionPanelComponent) {
    updateSnippets();
  }
  
  // Expose a direct method to add snippets - now uses direct window functions
  export function addLyricsSnippet(text) {
    if (!text || !text.trim()) {
      return false;
    }
    
    // Update selected text for debug box
    selectedText = text.trim();
    
    console.log(`ContentContainer.addLyricsSnippet called with text: "${text.trim().substring(0, 20)}..."`);
    
    // Use the global function first if available (integrates with LyricsPanel)
    if (typeof window !== 'undefined') {
      // Set global variables that the collection boxes are watching for
      window.transcriptSelectedText = text.trim();
      window.transcriptCollectTrigger = true;
      
      // Try all possible collection methods directly
      if (window.addToMainCollectionBox) {
        console.log('Using window.addToMainCollectionBox from ContentContainer');
        return window.addToMainCollectionBox(text.trim());
      }
      
      if (window.addToFixedPanel) {
        console.log('Using window.addToFixedPanel from ContentContainer');
        return window.addToFixedPanel(text.trim());
      }
    }
    
    console.error('No collection method found');
    return false;
  }
  
  // Function to add a test snippet (accessible from global scope for debugging)
  export function addTestSnippet() {
    const testText = `Test snippet added at ${new Date().toLocaleTimeString()}`;
    console.log('Adding test snippet:', testText);
    
    // Use the window.addToMainCollectionBox function directly if available
    if (typeof window !== 'undefined' && window.addToMainCollectionBox) {
      console.log('Using window.addToMainCollectionBox directly');
      return window.addToMainCollectionBox(testText);
    }
    
    // Fallback to the old method
    return addLyricsSnippet(testText);
  }
  
  onMount(() => {
    checkMobileDevice();
    
    // Add a delayed check to ensure collection panel is properly bound
    setTimeout(() => {
      if (!collectionPanelComponent) {
        console.log('Collection panel component not properly bound after mount, but using window-based method instead');
      } else {
        console.log('Collection panel component successfully bound');
      }
      
      // Make this component accessible globally for debugging
      if (typeof window !== 'undefined') {
        window.contentContainer = this;
        window.addTestSnippet = () => {
          return this.addTestSnippet();
        };
        console.log('ContentContainer test functions available at window.addTestSnippet()');
      }
    }, 500);
  });
  
  onDestroy(() => {
    if (browser) {
      window.removeEventListener('resize', () => {
        isMobile = window.innerWidth < 768;
      });
    }
  });
  
  // Computed property to determine if collection should be shown
  $: showCollection = snippets.length > 0;
  // Force the panel to be visible when snippets length changes from 0 to more
  $: if (snippets.length > 0) {
    console.log('We have snippets, collection should show:', snippets);
  }
  
  // Switch between transcript and collection on mobile
  function setActiveTab(tab) {
    activeTab = tab;
  }
</script>


<AnimatedTitle 
  titleText="Catchy Lyrics and Snap"
  subtitleText="Click, Send, Collect, and Collage"
  on:titleAnimationComplete={handleTitleAnimationComplete}
  on:subtitleAnimationComplete={handleSubtitleAnimationComplete}
/>

<!-- Content area with transcript and collection panel -->
<div class="main-content-area relative w-full overflow-visible">
  {#if isMobile}
    <!-- Mobile tab-based layout -->
    <div class="mobile-container w-full flex flex-col">
      <!-- Transcript component -->
      <AudioToText
        bind:this={audioToTextComponent}
        isModelPreloaded={speechModelPreloaded}
        onPreloadRequest={onPreloadRequest}
        {ghostComponent}
        parentContainer={this}
        on:transcriptionCompleted={forwardTranscriptionCompleted}
        on:recordingstart={forwardRecordingStart}
        on:recordingstop={forwardRecordingStop}
        on:processingstart={forwardProcessingStart}
        on:processingend={forwardProcessingEnd}
      />
      
      <!-- Collection panel below the transcript on mobile - always visible -->
      <div class="collection-container w-full animate-fadeIn mt-10 mb-6" style="min-height: 180px; height: auto; max-width: 540px; margin: 0 auto; opacity: 0; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);">
        <LyricsPanel bind:this={collectionPanelComponent} />
      </div>
      
      <!-- Removed debug box since it works better outside ContentContainer -->
    </div>
  {:else}
    <!-- Desktop layout with vertical stacking -->
    <div class="desktop-container w-full max-w-xl sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto flex flex-col">
      <!-- Transcript takes full width -->
      <div class="transcript-container w-full mb-6">
        <AudioToText
          bind:this={audioToTextComponent}
          isModelPreloaded={speechModelPreloaded}
          onPreloadRequest={onPreloadRequest}
          {ghostComponent}
          parentContainer={this}
          on:transcriptionCompleted={forwardTranscriptionCompleted}
          on:recordingstart={forwardRecordingStart}
          on:recordingstop={forwardRecordingStop}
          on:processingstart={forwardProcessingStart}
          on:processingend={forwardProcessingEnd}
        />
      </div>
      
      <!-- Collection panel below the transcript - always visible -->
      <div class="collection-container w-full slide-in-bottom animate-fadeIn mt-10 mb-6" style="min-height: 180px; height: auto; max-width: 680px; margin: 0 auto; opacity: 0; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);">
        <LyricsPanel bind:this={collectionPanelComponent} />
      </div>
      
      <!-- Removed debug box since it works better outside ContentContainer -->
    </div>
  {/if}
</div>

<style>
  .main-content-area {
    position: relative;
    overflow: hidden;
    min-height: 560px; /* Increased minimum height to match the bigger styling */
  }
  
  .collection-container {
    opacity: 0;
    animation: fadeInRight 0.6s ease-out forwards;
    animation-delay: 0.5s; /* Increased delay to reduce jumpiness during initial load */
    overflow: visible; /* Ensure tooltips are visible */
    position: relative; /* Provide position context */
    z-index: 5; /* Ensure the container is above other elements */
  }
  
  @keyframes fadeInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  /* Tab buttons styling */
  .tab-buttons button {
    border-radius: 8px 8px 0 0;
  }
  
  /* Animation for slide-in from bottom */
  .slide-in-bottom {
    animation: slideInBottom 0.4s ease-out forwards;
  }
  
  @keyframes slideInBottom {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Mobile styles */
  @media (max-width: 767px) {
    .mobile-panels {
      min-height: 500px;
    }
  }
</style>