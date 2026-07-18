<script>
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  import AudioToText from "./audio-transcript/AudioToText.svelte";
  import AnimatedTitle from "./AnimatedTitle.svelte";
  import LyricsPanel from "./LyricsPanel.svelte";
  import { browser, dev } from "$app/environment";

  // Props passed from the parent
  export let ghostComponent = null;
  export let speechModelPreloaded = false;
  export let onPreloadRequest = null;

  // State
  let isMobile = false;

  // Event dispatcher to communicate with parent
  const dispatch = createEventDispatcher();

  // Component references
  let audioToTextComponent;
  let collectionPanelComponent;
  let setupTimeoutId;

  function handleResize() {
    isMobile = window.innerWidth < 768;
  }

  // Function to handle title animation complete
  function handleTitleAnimationComplete() {
    dispatch("titleAnimationComplete");
  }

  // Function to handle subtitle animation complete
  function handleSubtitleAnimationComplete() {
    dispatch("subtitleAnimationComplete");
  }

  // Public methods for parent to access
  export function startRecording() {
    if (audioToTextComponent) {
      audioToTextComponent.startRecording();
    }
  }

  export function stopRecording() {
    if (audioToTextComponent) {
      audioToTextComponent.stopRecording();
    }
  }

  // Event forwarding functions
  function forwardRecordingStart() {
    dispatch("recordingstart");
  }

  function forwardRecordingStop() {
    dispatch("recordingstop");
  }

  function forwardProcessingStart() {
    dispatch("processingstart");
  }

  function forwardProcessingEnd() {
    dispatch("processingend");
  }

  function forwardTranscriptionCompleted(event) {
    dispatch("transcriptionCompleted", event.detail);
  }

  // Check if device is mobile
  function checkMobileDevice() {
    if (browser) {
      handleResize();
      window.addEventListener("resize", handleResize);
    }
  }

  // Expose a direct method to add snippets - now uses direct window functions
  export function addLyricsSnippet(text) {
    if (!text || !text.trim()) {
      return false;
    }

    // Use the global function first if available (integrates with LyricsPanel)
    if (typeof window !== "undefined") {
      // Set global variables that the collection boxes are watching for
      window.transcriptSelectedText = text.trim();
      window.transcriptCollectTrigger = true;

      // Try all possible collection methods directly
      if (window.addToMainCollectionBox) {
        return window.addToMainCollectionBox(text.trim());
      }

      if (window.addToFixedPanel) {
        return window.addToFixedPanel(text.trim());
      }
    }

    return false;
  }

  // Function to add a test snippet (accessible from global scope for debugging)
  export function addTestSnippet() {
    const testText = `Test snippet added at ${new Date().toLocaleTimeString()}`;

    // Use the window.addToMainCollectionBox function directly if available
    if (typeof window !== "undefined" && window.addToMainCollectionBox) {
      return window.addToMainCollectionBox(testText);
    }

    // Fallback to the old method
    return addLyricsSnippet(testText);
  }

  onMount(() => {
    checkMobileDevice();

    setupTimeoutId = setTimeout(() => {
      // Make this component accessible globally for debugging
      if (dev && typeof window !== "undefined") {
        window.contentContainer = {
          startRecording,
          stopRecording,
          addLyricsSnippet,
          addTestSnippet,
        };
        window.addTestSnippet = addTestSnippet;
      }
    }, 500);
  });

  onDestroy(() => {
    if (setupTimeoutId) {
      clearTimeout(setupTimeoutId);
    }

    if (browser) {
      window.removeEventListener("resize", handleResize);
    }
  });
</script>

<AnimatedTitle
  titleText="Catchy Lyrics and Snap"
  subtitleText="Click, Send, Collect, and Collage"
  on:titleAnimationComplete={handleTitleAnimationComplete}
  on:subtitleAnimationComplete={handleSubtitleAnimationComplete}
/>

<!-- Content area with transcript and collection panel -->
<div class="main-content-area relative w-full">
  {#if isMobile}
    <!-- Mobile tab-based layout -->
    <div class="mobile-container w-full flex flex-col">
      <!-- Transcript component -->
      <AudioToText
        bind:this={audioToTextComponent}
        isModelPreloaded={speechModelPreloaded}
        {onPreloadRequest}
        {ghostComponent}
        parentContainer={this}
        on:transcriptionCompleted={forwardTranscriptionCompleted}
        on:recordingstart={forwardRecordingStart}
        on:recordingstop={forwardRecordingStop}
        on:processingstart={forwardProcessingStart}
        on:processingend={forwardProcessingEnd}
      />

      <!-- Collection panel below the transcript on mobile - always visible -->
      <div
        class="collection-container w-full mt-6 mb-6"
        style="height: auto; max-width: 540px; margin: 0 auto;"
      >
        <LyricsPanel bind:this={collectionPanelComponent} />
      </div>

      <!-- Removed debug box since it works better outside ContentContainer -->
    </div>
  {:else}
    <!-- Desktop layout with vertical stacking -->
    <div
      class="desktop-container w-full mx-auto flex flex-col"
      style="max-width: 700px;"
    >
      <!-- Transcript takes full width -->
      <div class="transcript-container w-full mb-6">
        <AudioToText
          bind:this={audioToTextComponent}
          isModelPreloaded={speechModelPreloaded}
          {onPreloadRequest}
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
      <div
        class="collection-container w-full mt-6 mb-6"
        style="height: auto; max-width: 600px; margin: 0 auto;"
      >
        <LyricsPanel bind:this={collectionPanelComponent} />
      </div>

      <!-- Removed debug box since it works better outside ContentContainer -->
    </div>
  {/if}
</div>

<style>
  .main-content-area {
    position: relative;
    overflow: visible;
    min-height: auto; /* Remove fixed height to prevent layout flash */
  }

  .collection-container {
    overflow: visible; /* Ensure tooltips are visible */
    position: relative; /* Provide position context */
    z-index: 5; /* Ensure the container is above other elements */
  }
</style>
