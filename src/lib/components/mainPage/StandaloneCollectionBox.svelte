<script>
  import { onMount, onDestroy } from 'svelte';
  
  // Props
  export let visible = true;
  export let className = '';
  
  // Local state - completely isolated from any other component
  let collectedSnippets = [];
  let copySuccess = false;
  let copyTimeout;
  
  // Global access for direct data sharing between components
  let globalStore = { 
    snippets: [],
    lastSelectedText: '',
    addSnippet: null
  };
  
  // Public API for adding snippets
  export function addSnippet(text) {
    if (!text || !text.trim()) {
      console.error('StandaloneCollectionBox: No text provided to collect');
      return false;
    }
    
    const textToCollect = text.trim();
    console.log('StandaloneCollectionBox: Adding snippet directly:', textToCollect);
    
    // Add to our local collection
    collectedSnippets = [
      ...collectedSnippets,
      {
        id: Date.now().toString(),
        text: textToCollect,
        timestamp: new Date().toISOString()
      }
    ];
    
    console.log(`StandaloneCollectionBox: Successfully added snippet. Collection now has ${collectedSnippets.length} items`);
    return true;
  }
  
  // Function to handle removing a snippet
  function removeSnippet(id) {
    collectedSnippets = collectedSnippets.filter(snippet => snippet.id !== id);
  }
  
  // Move a snippet up in the collection
  function moveSnippetUp(id) {
    const index = collectedSnippets.findIndex(s => s.id === id);
    if (index <= 0) return; // Already at the top
    
    // Swap positions
    const updatedSnippets = [...collectedSnippets];
    [updatedSnippets[index-1], updatedSnippets[index]] = 
      [updatedSnippets[index], updatedSnippets[index-1]];
    
    collectedSnippets = updatedSnippets;
  }
  
  // Move a snippet down in the collection
  function moveSnippetDown(id) {
    const index = collectedSnippets.findIndex(s => s.id === id);
    if (index === -1 || index >= collectedSnippets.length - 1) return; // Already at the bottom
    
    // Swap positions
    const updatedSnippets = [...collectedSnippets];
    [updatedSnippets[index], updatedSnippets[index+1]] = 
      [updatedSnippets[index+1], updatedSnippets[index]];
    
    collectedSnippets = updatedSnippets;
  }
  
  // Handle copying all snippets
  function copyAllSnippets() {
    const text = collectedSnippets
      .map(snippet => snippet.text)
      .join('\n\n');
    
    if (navigator.clipboard && text) {
      navigator.clipboard.writeText(text)
        .then(() => {
          copySuccess = true;
          
          // Clear the success message after 2 seconds
          if (copyTimeout) clearTimeout(copyTimeout);
          
          copyTimeout = setTimeout(() => {
            copySuccess = false;
          }, 2000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  }
  
  // Handle clearing all snippets
  function clearAllSnippets() {
    if (confirm('Are you sure you want to clear all collected lyrics?')) {
      collectedSnippets = [];
    }
  }
  
  // Test adding a snippet directly
  function addTestSnippet() {
    addSnippet(`Test text added at ${new Date().toLocaleTimeString()}`);
  }
  
  // Check for selection changes from TranscriptDisplay via global
  function checkForSelectionChanges() {
    if (typeof window !== 'undefined' && window.transcriptSelectedText) {
      // Check if we have a new selection to add
      if (window.transcriptCollectTrigger && 
          window.transcriptSelectedText !== globalStore.lastSelectedText) {
        
        // Add the selected text
        addSnippet(window.transcriptSelectedText);
        
        // Update our local record of what we've seen
        globalStore.lastSelectedText = window.transcriptSelectedText;
        
        // Reset the trigger
        window.transcriptCollectTrigger = false;
      }
    }
  }
  
  // Check periodically for global selection changes
  let selectionCheckInterval;
  
  onMount(() => {
    // Make this component globally available
    if (typeof window !== 'undefined') {
      window.standaloneCollectionBox = this;
      
      // Set up our global addSnippet function
      window.addToStandaloneBox = (text) => {
        return addSnippet(text);
      };
      
      console.log('StandaloneCollectionBox: Available at window.standaloneCollectionBox');
      console.log('StandaloneCollectionBox: addSnippet function available at window.addToStandaloneBox()');
      
      // Set up periodic selection check
      selectionCheckInterval = setInterval(checkForSelectionChanges, 500);
    }
  });
  
  onDestroy(() => {
    if (copyTimeout) clearTimeout(copyTimeout);
    if (selectionCheckInterval) clearInterval(selectionCheckInterval);
  });
</script>

<div class="standalone-collection-box {className}" class:hidden={!visible}>
  <div class="panel-header bg-green-700 text-white px-4 py-3 flex justify-between items-center">
    <h2 class="text-lg font-bold flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" />
      </svg>
      STANDALONE Collection Box
      {#if collectedSnippets.length > 0}
        <span class="ml-2 bg-green-600 text-white rounded-full px-2 py-0.5 text-xs font-semibold">
          {collectedSnippets.length}
        </span>
      {/if}
    </h2>
    
    <div class="flex space-x-2">
      <!-- Test add button -->
      <button 
        on:click={addTestSnippet}
        class="text-xs flex items-center space-x-1 px-2 py-1 bg-green-600 rounded-md shadow-sm text-white hover:bg-green-500 transition-colors duration-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        <span>Test Add</span>
      </button>
      
      {#if collectedSnippets.length > 0}
        <button 
          on:click={copyAllSnippets}
          class="text-xs flex items-center space-x-1 px-2 py-1 bg-green-600 rounded-md shadow-sm text-white hover:bg-green-500 transition-colors duration-200"
          aria-label="Copy all snippets to clipboard"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
          </svg>
          <span>{copySuccess ? 'Copied!' : 'Copy All'}</span>
        </button>
        
        <button 
          on:click={clearAllSnippets}
          class="text-xs flex items-center space-x-1 px-2 py-1 bg-green-600 rounded-md shadow-sm text-white hover:bg-green-500 transition-colors duration-200"
          aria-label="Clear all snippets"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            <line x1="10" x2="10" y1="11" y2="17"></line>
            <line x1="14" x2="14" y1="11" y2="17"></line>
          </svg>
          <span>Clear</span>
        </button>
      {/if}
    </div>
  </div>
  
  <div class="panel-body bg-white p-4 max-h-[350px] overflow-y-auto">
    <!-- Panel body content starts here -->
    
    {#if collectedSnippets.length === 0}
      <div class="empty-state text-center py-8 px-4 bg-gray-50 rounded-lg">
        <div class="empty-state-icon mx-auto h-16 w-16 opacity-40 mb-4 text-green-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p class="text-sm text-gray-600 font-medium mb-2">No lyrics collected yet</p>
        <p class="text-xs text-gray-500">
          This box is completely standalone from the content container.<br>
          You can add text using the "Test Add" button or from the console.
        </p>
        <div class="mt-4">
          <code class="bg-gray-100 text-xs text-gray-700 px-2 py-1 rounded">window.addToStandaloneBox("your text")</code>
        </div>
      </div>
    {:else}
      <ul class="snippets-list space-y-3">
        {#each collectedSnippets as snippet, index (snippet.id)}
          <li 
            class="snippet-item group relative p-3 bg-white rounded-lg border-l-4 border border-green-200 border-l-green-500 transition-all duration-200 hover:shadow-md"
          >
            <div class="snippet-text text-sm text-gray-800 font-mono whitespace-pre-wrap break-words">
              {snippet.text}
            </div>
            
            <div class="snippet-controls absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1 bg-white/80 backdrop-blur-sm rounded-md p-0.5">
              <!-- Move up button - only show if not at top -->
              {#if index > 0}
                <button 
                  on:click={() => moveSnippetUp(snippet.id)}
                  class="text-xs p-1 rounded-md text-green-600 hover:bg-green-100 transition-colors duration-200"
                  aria-label="Move snippet up"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m18 15-6-6-6 6"></path>
                  </svg>
                </button>
              {/if}
              
              <!-- Move down button - only show if not at bottom -->
              {#if index < collectedSnippets.length - 1}
                <button 
                  on:click={() => moveSnippetDown(snippet.id)}
                  class="text-xs p-1 rounded-md text-green-600 hover:bg-green-100 transition-colors duration-200"
                  aria-label="Move snippet down"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m6 9 6 6 6-6"></path>
                  </svg>
                </button>
              {/if}
              
              <!-- Remove button -->
              <button 
                on:click={() => removeSnippet(snippet.id)}
                class="text-xs p-1 rounded-md text-green-600 hover:bg-green-100 transition-colors duration-200"
                aria-label="Remove snippet"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>
            
            <!-- Snippet index indicator -->
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-l-lg"></div>
            <div class="absolute left-3 bottom-2 text-[10px] text-green-500">{index + 1}</div>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>

<style>
  .standalone-collection-box {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 2px solid rgb(21, 128, 61);
    box-shadow: 0 4px 15px rgba(21, 128, 61, 0.15);
    height: 100%;
    border-radius: 0.5rem;
    margin-bottom: 2rem;
  }
  
  .panel-header {
    border-top-left-radius: 0.5rem - 2px;
    border-top-right-radius: 0.5rem - 2px;
  }
  
  .panel-body {
    flex-grow: 1;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(21, 128, 61, 0.5) transparent;
  }
  
  .panel-body::-webkit-scrollbar {
    width: 4px;
  }
  
  .panel-body::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .panel-body::-webkit-scrollbar-thumb {
    background-color: rgba(21, 128, 61, 0.4);
    border-radius: 20px;
  }
  
  .snippet-item {
    cursor: default;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .snippet-item:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 15px rgba(21, 128, 61, 0.1);
  }
  
  .hidden {
    display: none;
  }
</style>