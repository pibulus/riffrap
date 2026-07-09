<!--
  === COMPONENT OVERVIEW ===
  
  HeaderActions Component
  
  This component handles all the action buttons in the lyrics collection header.
  It conditionally renders buttons based on application state and manages visual feedback.
  
  Features:
  - Grab lyrics button
  - Copy button with success state
  - Compile button with success state
  - Download button
  - Clear all button
  - Proper sound effects and visual feedback
-->

<script>
  import { IconButton } from '$lib/components/ui';
  import { 
    playHoverSound,
    playCopySound
  } from '../../sound-integration.js';
  
  // === PROPS CHUNK START ===
  /** Flag indicating if there are any snippets in the collection */
  export let hasSnippets = false;
  
  /** Flag indicating if transcript has selectable content */
  export let hasTranscriptContent = false;
  
  /** Currently editing snippet ID, if any */
  export let editingSnippetId = null;
  
  /** Flag indicating if a copy operation was successful */
  export let copySuccess = false;
  
  /** Flag indicating if a compile operation was successful */
  export let compileSuccess = false;
  // === PROPS CHUNK END ===
  
  // === EVENT HANDLERS CHUNK START ===
  // Create event dispatchers for all header actions
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  
  /** Handler for grabbing lyrics from transcript */
  function handleGrabLyrics() {
    dispatch('grabLyrics');
  }
  
  /** Handler for copying all snippets */
  function handleCopySnippets() {
    dispatch('copySnippets');
  }
  
  /** Handler for combining snippets */
  function handleCombineSnippets() {
    dispatch('combineSnippets');
  }
  
  /** Handler for downloading lyrics */
  function handleDownloadLyrics() {
    playCopySound();
    dispatch('downloadLyrics');
  }
  
  /** Handler for clearing all snippets */
  function handleClearAll() {
    dispatch('clearAll');
  }
  // === EVENT HANDLERS CHUNK END ===
</script>

<div class="flex items-center space-x-2">
  <!-- Grab Lyrics button -->
  <!-- Raw SVG strings render as literal text in IconButton's else branch —
       use the registered 'music' icon name instead. -->
  <IconButton
    icon="music"
    tooltip="💕 Grab Lyrics"
    colorIndex={0}
    onClick={handleGrabLyrics}
    aria-label="Grab lyrics from transcript"
  />
  
  {#if hasTranscriptContent && !editingSnippetId}
    <IconButton
      icon="plus"
      colorIndex={0}
      tooltip="🔴 Snap a new lyric line"
      onClick={handleGrabLyrics}
      aria-label="Snap a new lyric line"
    />
  {/if}

  {#if hasSnippets}
    <IconButton
      icon="copy"
      colorIndex={1}
      tooltip="🟠 Copy lyrics"
      onClick={handleCopySnippets}
      className={copySuccess ? 'copy-success' : ''}
      aria-label="Copy all lyrics to clipboard"
    />

    <IconButton
      icon="edit"
      colorIndex={2}
      tooltip="🟣 Compile selected into one block"
      onClick={handleCombineSnippets}
      onMouseEnter={() => playHoverSound()}
      className={compileSuccess ? 'compile-success' : ''}
      aria-label="Compile all lyrics into one block"
    />

    <IconButton 
      icon="download" 
      colorIndex={3} 
      tooltip="🟢 Download lyrics" 
      onClick={handleDownloadLyrics}
      onMouseEnter={() => playHoverSound()}
      aria-label="Download lyrics as text file"
    />

    <IconButton 
      icon="trash" 
      colorIndex={4} 
      tooltip="🔵 Clear" 
      onClick={handleClearAll}
      onMouseEnter={() => playHoverSound()}
      aria-label="Clear all lyrics"
    />
  {/if}
</div>

<style>
  /* Button feedback styling will be handled by IconButton component */
  /* Any additional styles specific to the header actions would go here */
</style>