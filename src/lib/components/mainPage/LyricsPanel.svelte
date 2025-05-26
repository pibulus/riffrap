<!--
  === LYRICS PANEL COMPONENT ===
  
  A clean, focused wrapper around the modular LyricsCollection component.
  Provides a unified interface for collecting, organizing, and managing lyric snippets
  transcribed from audio recordings.
  
  All core functionality is implemented in the LyricsCollection component and its
  supporting modules in the lyrics-collection directory.
-->

<script>
  // === IMPORTS CHUNK START ===
  import { onMount } from 'svelte';
  import LyricsCollection from './lyrics-collection/LyricsCollection.svelte';
  import { lyricsStore } from './lyrics-collection/stores/lyricsStore';
  // === IMPORTS CHUNK END ===

  // === PROPS CHUNK START ===
  // Create a reference to the LyricsCollection component
  let lyricsCollectionComponent;
  
  // Create a property for collecting snippets that can be accessed by parent components
  export let collectedSnippets = [];

  // Subscribe to the lyricsStore to keep collectedSnippets updated
  lyricsStore.subscribe(state => {
    if (state && state.snippets) {
      collectedSnippets = state.snippets;
    }
  });
  // === PROPS CHUNK END ===

  // === LIFECYCLE CHUNK START ===
  // Ensure compatibility with window methods
  onMount(() => {
    // The LyricsCollection component will handle all global methods
    // Just log initialization for debugging
    console.log('LyricsPanel initialized - using modular LyricsCollection');
  });
  // === LIFECYCLE CHUNK END ===
</script>

<!--
  === COMPONENT TEMPLATE CHUNK START ===
  Simply render the LyricsCollection component, passing through all props
  provided to this component. This maintains the same interface for parent components.
-->
<LyricsCollection bind:this={lyricsCollectionComponent} {...$$props} />
<!-- === COMPONENT TEMPLATE CHUNK END === -->