<script>
  import { onMount, onDestroy } from 'svelte';
  
  // Local state - completely independent
  let collectedSnippets = [];
  let isExpanded = true;
  
  // Directly collect text
  function addSnippet(text) {
    if (!text || !text.trim()) {
      console.error('FixedDebugPanel: No text provided to collect');
      return false;
    }
    
    const trimmedText = text.trim();
    console.log('FixedDebugPanel: Adding snippet:', trimmedText);
    
    // Add to our local collection
    collectedSnippets = [
      ...collectedSnippets,
      {
        id: Date.now().toString(),
        text: trimmedText,
        timestamp: new Date().toLocaleTimeString()
      }
    ];
    
    return true;
  }
  
  // Get the current selection from the document
  function getCurrentSelection() {
    if (typeof window === 'undefined' || !window.getSelection) {
      return '';
    }
    
    const selection = window.getSelection();
    return selection ? selection.toString().trim() : '';
  }
  
  // Collect current selection
  function collectCurrentSelection() {
    const selection = getCurrentSelection();
    
    if (!selection) {
      alert('No text currently selected');
      return;
    }
    
    addSnippet(selection);
  }
  
  // Monitor for selection
  let monitorInterval;
  let lastSelection = '';
  
  function startMonitoring() {
    if (typeof window === 'undefined') return;
    
    // Set up an interval to check for selection changes
    monitorInterval = setInterval(() => {
      const currentSelection = getCurrentSelection();
      
      // Check if there's a new selection
      if (currentSelection && currentSelection !== lastSelection) {
        lastSelection = currentSelection;
      }
    }, 1000);
  }
  
  // Clean up on component destruction
  onDestroy(() => {
    if (monitorInterval) {
      clearInterval(monitorInterval);
    }
  });
  
  // Make this component globally available
  onMount(() => {
    if (typeof window !== 'undefined') {
      window.fixedDebugPanel = this;
      window.addToFixedPanel = addSnippet;
      
      console.log('FixedDebugPanel mounted and exposed globally as window.fixedDebugPanel');
      console.log('Direct add function available as window.addToFixedPanel("your text")');
      
      // Start monitoring for selections
      startMonitoring();
      
      // Hook into the SelectionButton and DirectCollectionLink
      const originalAddToStandaloneBox = window.addToStandaloneBox;
      window.addToStandaloneBox = (text) => {
        // Call the original function if it exists
        if (typeof originalAddToStandaloneBox === 'function') {
          originalAddToStandaloneBox(text);
        }
        
        // Also add to our panel
        addSnippet(text);
      };
    }
  });
  
  // Toggle expanded state
  function toggleExpanded() {
    isExpanded = !isExpanded;
  }
  
  // Clear all snippets
  function clearSnippets() {
    collectedSnippets = [];
  }
  
  // Add test snippet
  function addTestSnippet() {
    addSnippet(`Test snippet added at ${new Date().toLocaleTimeString()}`);
  }
</script>

<div class="fixed top-4 left-4 z-[9999] w-80 bg-purple-800 text-white rounded-lg shadow-2xl overflow-hidden border-2 border-purple-500" style="max-height: 80vh;">
  <!-- Header -->
  <div class="bg-purple-900 px-3 py-2 flex justify-between items-center">
    <h3 class="font-bold text-sm flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
      </svg>
      FIXED Debug Collection ({collectedSnippets.length})
    </h3>
    <div class="controls flex gap-1">
      <button 
        class="text-xs bg-purple-700 hover:bg-purple-600 px-2 py-1 rounded"
        on:click={addTestSnippet}
      >
        Add Test
      </button>
      <button 
        class="text-xs bg-purple-700 hover:bg-purple-600 px-2 py-1 rounded"
        on:click={toggleExpanded}
      >
        {isExpanded ? 'Collapse' : 'Expand'}
      </button>
      <button 
        class="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
        on:click={clearSnippets}
      >
        Clear
      </button>
    </div>
  </div>
  
  <!-- Current selection tools -->
  <div class="selection-actions px-3 py-2 bg-purple-700 border-t border-b border-purple-600 flex space-x-2">
    <button 
      class="text-xs bg-green-600 hover:bg-green-500 px-2 py-1 rounded flex-grow flex items-center justify-center"
      on:click={collectCurrentSelection}
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
      </svg>
      Collect Current Selection
    </button>
  </div>
  
  {#if isExpanded}
    <!-- Selected text -->
    <div class="current-selection px-3 py-2 bg-purple-700 border-b border-purple-600">
      <div class="text-xs font-bold mb-1">Current Selected Text:</div>
      <div class="bg-purple-900 p-2 rounded text-xs text-purple-100 whitespace-pre-wrap min-h-[2rem] max-h-16 overflow-y-auto font-mono">
        {lastSelection || '<No text selected>'}
      </div>
    </div>
    
    <!-- Collected snippets -->
    <div class="snippets-list px-3 py-2 overflow-y-auto" style="max-height: 300px;">
      <div class="text-xs font-bold mb-1 text-purple-200">Collected Snippets:</div>
      
      {#if collectedSnippets.length === 0}
        <div class="text-xs text-purple-300 italic">No snippets collected yet</div>
      {:else}
        <ul class="space-y-2">
          {#each collectedSnippets as snippet (snippet.id)}
            <li class="bg-purple-900 p-2 rounded text-xs text-purple-200 whitespace-pre-wrap border border-purple-600 relative">
              <div class="text-purple-400 mb-1 text-[10px]">{snippet.timestamp}</div>
              <div class="font-mono">{snippet.text}</div>
              <button 
                class="absolute top-1 right-1 text-[10px] opacity-50 hover:opacity-100 bg-purple-700 p-0.5 rounded"
                on:click={() => collectedSnippets = collectedSnippets.filter(s => s.id !== snippet.id)}
              >×</button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
    
    <!-- Debug Instructions -->
    <div class="debug-instructions px-3 py-2 bg-purple-900 text-xs text-purple-300 border-t border-purple-600">
      <p>Debug Tools:</p>
      <ul class="list-disc ml-5 space-y-0.5 mt-1">
        <li>window.addToFixedPanel("text")</li>
        <li>Try selecting text, then click "Collect"</li>
      </ul>
    </div>
  {/if}
</div>

<style>
  /* Custom scrollbar for the snippets list */
  .snippets-list {
    scrollbar-width: thin;
    scrollbar-color: rgba(126, 34, 206, 0.5) rgba(76, 29, 149, 0.5);
  }
  
  .snippets-list::-webkit-scrollbar {
    width: 6px;
  }
  
  .snippets-list::-webkit-scrollbar-track {
    background: rgba(76, 29, 149, 0.5);
  }
  
  .snippets-list::-webkit-scrollbar-thumb {
    background-color: rgba(126, 34, 206, 0.5);
    border-radius: 3px;
  }
</style>