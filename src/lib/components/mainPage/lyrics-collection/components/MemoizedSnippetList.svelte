<!--
  === COMPONENT OVERVIEW ===
  
  MemoizedSnippetList Component
  
  This component provides memoized rendering of the snippet list to improve performance
  with large lists. It only re-renders individual snippets when their specific data changes,
  rather than re-rendering the entire list for every state change.
  
  Features:
  - Optimized rendering using Svelte's keyed #each blocks
  - Memoization based on snippet ID, content, and edit state
  - Event forwarding from SnippetItem components
-->

<script>
  import { SnippetItem } from './index.js';
  
  // === PROPS CHUNK START ===
  /** Array of snippets to render */
  export let snippets = [];
  
  /** Currently editing snippet ID */
  export let editingSnippetId = null;
  
  /** Current theme for styling */
  export let currentTheme;
  
  /** Flag indicating if undo operation is available */
  export let canUndo = false;
  
  /** Drag and drop handler functions */
  export let handleDragStart;
  export let handleDragOver;
  export let handleDragLeave;
  export let handleDrop;
  export let handleDragEnd;
  
  /** Sound effect function */
  export let playCardHoverSound;
  // === PROPS CHUNK END ===
  
  // Import createEventDispatcher to forward events
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  
  // === EVENT HANDLERS CHUNK START ===
  /**
   * Forward all SnippetItem events to parent component
   * 
   * @param {CustomEvent} event - The event from the SnippetItem
   */
  function forwardEvent(event) {
    // Forward the event with its original type and detail
    dispatch(event.type, event.detail);
  }
  // === EVENT HANDLERS CHUNK END ===
</script>

<ul class="snippets-list alternating-cards" style="margin-top: 1rem;" aria-label="Lyrics snippets list">
  {#each snippets as snippet, index (snippet.id)}
    <SnippetItem
      {snippet}
      {index}
      {editingSnippetId}
      {currentTheme}
      {canUndo}
      {handleDragStart}
      {handleDragOver}
      {handleDragLeave}
      {handleDrop}
      {handleDragEnd}
      {playCardHoverSound}
      on:delete={forwardEvent}
      on:edit={forwardEvent}
      on:save={forwardEvent}
      on:navigate={forwardEvent}
      on:undoCombine={forwardEvent}
      on:download={forwardEvent}
    />
  {/each}
</ul>

<style>
  /* Any list-specific styles would go here */
  /* Individual snippet styling is handled by the SnippetItem component */
</style>