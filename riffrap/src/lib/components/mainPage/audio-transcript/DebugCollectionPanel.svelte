<script>
  import { onMount, onDestroy } from 'svelte';
  
  // Props
  export let currentSelectedText = '';
  export let visible = true;
  
  // Local state - direct collection without store
  let collectedSnippets = [];
  let lastCollectedText = '';
  let expanded = false;
  
  // Direct collection function
  function collectCurrentSelection() {
    if (!currentSelectedText || !currentSelectedText.trim()) {
      alert('No text currently selected');
      return;
    }
    
    const textToCollect = currentSelectedText.trim();
    console.log('DEBUG PANEL: Collecting text directly:', textToCollect);
    
    // Add to our local collection (no store)
    collectedSnippets = [
      ...collectedSnippets,
      {
        id: Date.now().toString(),
        text: textToCollect,
        timestamp: new Date().toLocaleTimeString()
      }
    ];
    
    lastCollectedText = textToCollect;
  }
  
  // Clear all collected snippets
  function clearCollectedSnippets() {
    collectedSnippets = [];
    lastCollectedText = '';
  }
  
  // Toggle expanded view
  function toggleExpanded() {
    expanded = !expanded;
  }
</script>

{#if visible}
  <div class="debug-panel fixed bottom-0 right-0 z-50 w-96 bg-white border-2 border-red-500 shadow-lg rounded-t-lg overflow-hidden transition-all duration-300 flex flex-col">
    <!-- Header with controls -->
    <div class="debug-header bg-red-100 px-3 py-2 flex justify-between items-center">
      <h3 class="text-red-800 font-bold text-sm">Debug Collection Panel</h3>
      <div class="controls flex gap-1">
        <button 
          class="text-xs bg-red-200 hover:bg-red-300 px-2 py-1 rounded text-red-800"
          on:click={toggleExpanded}
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
        <button 
          class="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-gray-800"
          on:click={clearCollectedSnippets}
        >
          Clear
        </button>
      </div>
    </div>
    
    <!-- Current selection display -->
    <div class="selection-display px-3 py-2 border-b border-gray-200">
      <div class="text-xs font-bold text-gray-700 mb-1">Current Selection:</div>
      <div class="current-selection bg-gray-50 p-2 rounded text-xs text-gray-800 whitespace-pre-wrap min-h-[2.5rem] max-h-24 overflow-y-auto font-mono">
        {currentSelectedText || '<No text selected>'}
      </div>
    </div>
    
    <!-- Direct collection button -->
    <div class="collection-controls px-3 py-2 border-b border-gray-200">
      <button 
        class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm"
        on:click={collectCurrentSelection}
      >
        Collect Current Selection
      </button>
      
      <!-- Last collected text -->
      {#if lastCollectedText}
        <div class="mt-2">
          <div class="text-xs font-bold text-gray-700 mb-1">Last Collected:</div>
          <div class="last-collected bg-blue-50 p-2 rounded text-xs text-blue-800 font-mono whitespace-pre-wrap max-h-16 overflow-y-auto">
            {lastCollectedText}
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Collected snippets list (only when expanded) -->
    {#if expanded}
      <div class="snippets-list px-3 py-2 overflow-y-auto max-h-80">
        <div class="text-xs font-bold text-gray-700 mb-1">Collected Snippets ({collectedSnippets.length}):</div>
        
        {#if collectedSnippets.length === 0}
          <div class="text-xs text-gray-500 italic">No snippets collected yet</div>
        {:else}
          <ul class="space-y-2">
            {#each collectedSnippets as snippet (snippet.id)}
              <li class="bg-gray-50 p-2 rounded text-xs text-gray-800 whitespace-pre-wrap border border-gray-200">
                <div class="text-gray-400 mb-1 text-[10px]">{snippet.timestamp}</div>
                <div class="font-mono">{snippet.text}</div>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  .debug-panel {
    max-height: 90vh;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }
</style>