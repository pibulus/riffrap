<script>
  import { onMount, onDestroy } from 'svelte';
  import Ghost from '$lib/components/ghost/Ghost.svelte';
  
  // Props
  export let className = '';
  export let showHeader = true;
  
  // Local state - direct collection without store
  export let collectedSnippets = [];
  let copySuccess = false;
  let copyTimeout;
  
  // Direct collection function exposed to parent
  export function addSnippet(text) {
    if (!text || !text.trim()) {
      console.error('No text provided to collect');
      return false;
    }
    
    const textToCollect = text.trim();
    console.log('SimpleCollectionPanel: Adding snippet directly:', textToCollect);
    
    // Add to our local collection (no store)
    collectedSnippets = [
      ...collectedSnippets,
      {
        id: Date.now().toString(),
        text: textToCollect,
        timestamp: new Date().toISOString()
      }
    ];
    
    console.log(`Successfully added snippet. Collection now has ${collectedSnippets.length} items`);
    
    // Debug helper: Make collection panel and this panel available globally for debugging
    if (typeof window !== 'undefined') {
      window.debugCollectionPanel = this;
      window.debugCollectedSnippets = collectedSnippets;
    }
    
    return true;
  }
  
  // Debug function to add text directly from console
  export function debugAddText(text) {
    return addSnippet(text);
  }
  
  // Handle removing a snippet
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
  
  // Log a startup message to confirm we're using the new component
  onMount(() => {
    console.log('BRAND NEW SimpleCollectionPanel component mounted with blue theme');
  });
  
  // Reactive statement to track snippet changes
  $: if (collectedSnippets.length >= 0) {
    console.log('SimpleCollectionPanel: Snippets updated, now have:', collectedSnippets.length);
  }
  
  // Clean up on component destruction
  onDestroy(() => {
    if (copyTimeout) clearTimeout(copyTimeout);
  });
</script>

<div class="simple-collection-panel {className}">
  {#if showHeader}
    <div class="panel-header bg-gradient-to-r from-green-100 to-blue-100 px-4 py-3 flex justify-between items-center">
      <!-- Visual indicator that this is a different panel -->
      <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-400"></div>
      
      <h2 class="text-lg font-bold text-blue-700 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
        </svg>
        NEW Lyrics Collection
        {#if collectedSnippets.length > 0}
          <span class="ml-2 bg-blue-100 text-blue-600 rounded-full px-2 py-0.5 text-xs font-semibold">
            {collectedSnippets.length}
          </span>
        {/if}
      </h2>
      
      <div class="flex space-x-2">
        {#if collectedSnippets.length > 0}
          <button 
            on:click={copyAllSnippets}
            class="text-xs flex items-center space-x-1 px-2 py-1 bg-blue-50 rounded-md shadow-sm border border-blue-200 text-blue-600 hover:bg-blue-100 transition-colors duration-200"
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
            class="text-xs flex items-center space-x-1 px-2 py-1 bg-blue-50 rounded-md shadow-sm border border-blue-200 text-blue-600 hover:bg-blue-100 transition-colors duration-200"
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
  {/if}
  
  <div class="panel-body bg-gray-50 p-4 max-h-[350px] overflow-y-auto shadow-inner">
    <!-- Debug info banner -->
    <div class="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-2 rounded-md mb-3 flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      New direct collection panel: {collectedSnippets.length} snippets
    </div>
    
    <!-- Panel body content starts here -->
    {#if collectedSnippets.length === 0}
      <div class="empty-state text-center py-6 px-4 bg-white rounded-lg border border-blue-100">
        <div class="empty-state-icon mx-auto h-16 w-16 opacity-40 mb-4 text-blue-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p class="text-sm text-gray-600 font-medium mb-2">No lyrics collected yet</p>
        <p class="text-xs text-gray-500">
          Select text in the transcript and click 'Collect' or 'Direct Collect' to add snippets here
        </p>
      </div>
    {:else}
      <ul class="snippets-list space-y-3">
        {#each collectedSnippets as snippet, index (snippet.id)}
          <li 
            class="snippet-item group relative p-3 bg-white rounded-lg border-l-4 border border-blue-200 border-l-blue-400 transition-all duration-200 hover:shadow-md"
          >
            <div class="snippet-text text-sm text-gray-800 font-mono whitespace-pre-wrap break-words">
              {snippet.text}
            </div>
            
            <div class="snippet-controls absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1 bg-white/80 backdrop-blur-sm rounded-md p-0.5">
              <!-- Move up button - only show if not at top -->
              {#if index > 0}
                <button 
                  on:click={() => moveSnippetUp(snippet.id)}
                  class="text-xs p-1 rounded-md text-blue-600 hover:bg-blue-100 transition-colors duration-200"
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
                  class="text-xs p-1 rounded-md text-blue-600 hover:bg-blue-100 transition-colors duration-200"
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
                class="text-xs p-1 rounded-md text-blue-600 hover:bg-blue-100 transition-colors duration-200"
                aria-label="Remove snippet"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>
            
            <!-- Snippet index indicator -->
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-l-lg"></div>
            <div class="absolute left-3 bottom-2 text-[10px] text-blue-400">{index + 1}</div>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>

<style>
  .simple-collection-panel {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid rgba(37, 99, 235, 0.2);
    box-shadow: 0 4px 15px rgba(37, 99, 235, 0.08);
    height: 100%;
    border-radius: 1rem;
    position: relative;
  }
  
  .panel-header {
    border-bottom: 1px solid rgba(37, 99, 235, 0.2);
    border-top-left-radius: 1rem;
    border-top-right-radius: 1rem;
    position: relative;
    z-index: 10;
  }
  
  .panel-body {
    flex-grow: 1;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(37, 99, 235, 0.5) transparent;
    border-bottom-left-radius: 1rem;
    border-bottom-right-radius: 1rem;
  }
  
  .panel-body::-webkit-scrollbar {
    width: 4px;
  }
  
  .panel-body::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .panel-body::-webkit-scrollbar-thumb {
    background-color: rgba(37, 99, 235, 0.4);
    border-radius: 20px;
  }
  
  .snippet-item {
    cursor: default;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .snippet-item:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 15px rgba(37, 99, 235, 0.1);
  }
  
  button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
</style>