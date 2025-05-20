<script>
  import { onMount, onDestroy } from 'svelte';
  
  // Props
  export let currentSelectedText = '';
  export let visible = true;
  
  // Local state - independent collection
  let collectedSnippets = [];
  let expanded = true;
  
  // When parent wants to add directly
  export function addSnippet(text) {
    if (!text || !text.trim()) {
      console.error('DebugBox: No text provided to collect');
      return false;
    }
    
    const textToCollect = text.trim();
    console.log('DebugDirectCollectionBox: Adding snippet:', textToCollect);
    
    // Add to our local collection 
    collectedSnippets = [
      ...collectedSnippets,
      {
        id: Date.now().toString(),
        text: textToCollect,
        timestamp: new Date().toISOString()
      }
    ];
    
    return true;
  }
  
  // Directly collect current selection
  function collectCurrentSelection() {
    if (!currentSelectedText || !currentSelectedText.trim()) {
      console.error('DebugBox: No text currently selected');
      return;
    }
    
    addSnippet(currentSelectedText);
  }
  
  // Direct test add function
  function addTestText() {
    addSnippet('Test snippet added at ' + new Date().toLocaleTimeString());
  }
  
  // Clear all collected snippets
  function clearCollectedSnippets() {
    collectedSnippets = [];
  }
  
  // Toggle expanded view
  function toggleExpanded() {
    expanded = !expanded;
  }
  
  // Make this component globally available for debugging
  onMount(() => {
    if (typeof window !== 'undefined') {
      window.debugDirectBox = this;
      console.log('DebugDirectCollectionBox mounted and available at window.debugDirectBox');
    }
  });
</script>

<div class="debug-direct-box border-2 border-red-500 rounded-lg overflow-hidden bg-white shadow-lg" class:hidden={!visible}>
  <!-- Header with controls -->
  <div class="debug-header bg-red-100 px-3 py-2 flex justify-between items-center">
    <h3 class="text-red-800 font-bold text-sm flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
      Debug Direct Collection Box
    </h3>
    <div class="controls flex gap-1">
      <button 
        class="text-xs bg-red-200 hover:bg-red-300 px-2 py-1 rounded text-red-800"
        on:click={addTestText}
      >
        Test Add
      </button>
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
    <div class="flex justify-between items-center mb-1">
      <div class="text-xs font-bold text-gray-700">Current Selection:</div>
      <button 
        class="text-xs bg-green-200 hover:bg-green-300 px-2 py-1 rounded text-green-800"
        on:click={collectCurrentSelection}
      >
        Collect Current
      </button>
    </div>
    <div class="current-selection bg-gray-50 p-2 rounded text-xs text-gray-800 whitespace-pre-wrap min-h-[2.5rem] max-h-24 overflow-y-auto font-mono">
      {currentSelectedText || '<No text selected>'}
    </div>
  </div>
  
  <!-- Collected snippets list -->
  {#if expanded}
    <div class="snippets-list px-3 py-2 overflow-y-auto max-h-60">
      <div class="text-xs font-bold text-gray-700 mb-1">Debug Collected Snippets ({collectedSnippets.length}):</div>
      
      {#if collectedSnippets.length === 0}
        <div class="text-xs text-gray-500 italic">No snippets collected yet</div>
      {:else}
        <ul class="space-y-2">
          {#each collectedSnippets as snippet (snippet.id)}
            <li class="bg-gray-50 p-2 rounded text-xs text-gray-800 whitespace-pre-wrap border border-gray-200">
              <div class="text-gray-400 mb-1 text-[10px]">{new Date(snippet.timestamp).toLocaleTimeString()}</div>
              <div class="font-mono">{snippet.text}</div>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
</div>

<style>
  .debug-direct-box {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }
  
  .hidden {
    display: none;
  }
</style>