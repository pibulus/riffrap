<!--
  === COMPONENT OVERVIEW ===
  This is a compatibility wrapper for the new modular LyricsCollection component.
  It maintains the same filename and interface as the original PurpleStyleCollectionBox.svelte
  to ensure backward compatibility with existing code that depends on this component.
  
  All actual functionality has been refactored into the modular LyricsCollection component
  and its supporting modules in the lyrics-collection directory.
  
  REF: This is a key part of Phase 3 modularization in cleanup_checklist.md
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
    console.log('PurpleStyleCollectionBox wrapper initialized - now using modular LyricsCollection');
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