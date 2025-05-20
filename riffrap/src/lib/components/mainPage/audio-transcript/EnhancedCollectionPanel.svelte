<script>
  import { onMount, onDestroy } from 'svelte';
  import { snippetStore } from '$lib/services';
  
  // Props
  export let className = '';
  export let showHeader = true;
  
  // Local state for direct collection - more reliable than store
  let collectedSnippets = [];
  
  // Subscribe to both local and store snippets
  const unsubscribe = snippetStore.subscribe(value => {
    // When the store updates, sync with our local array
    try {
      // Add any new store items to our local collection
      if (Array.isArray(value)) {
        value.forEach(storeSnippet => {
          // Only add if we don't already have this snippet
          const exists = collectedSnippets.some(local => 
            local.text === storeSnippet.text);
          
          if (!exists) {
            collectedSnippets = [
              ...collectedSnippets,
              {
                id: storeSnippet.id || Date.now().toString(),
                text: storeSnippet.text,
                timestamp: storeSnippet.timestamp || Date.now(),
                source: 'store'
              }
            ];
          }
        });
      }
    } catch (err) {
      console.error('Error syncing snippets:', err);
    }
  });
  
  // Direct collection function - bypasses store for reliability
  export function addSnippet(text) {
    if (!text || !text.trim()) {
      return false;
    }
    
    const textToCollect = text.trim();
    console.log('EnhancedCollectionPanel: Directly adding snippet:', textToCollect);
    
    // Add to our local collection
    collectedSnippets = [
      ...collectedSnippets,
      {
        id: Date.now().toString(),
        text: textToCollect,
        timestamp: Date.now(),
        source: 'direct'
      }
    ];
    
    // Also add to store for consistency, but don't rely on it
    try {
      snippetStore.addSnippet(textToCollect);
    } catch (err) {
      console.error('Failed to add to snippet store, but added to local collection:', err);
    }
    
    return true;
  }
  
  // Clear all collected snippets
  function clearAllSnippets() {
    if (confirm('Are you sure you want to clear all collected lyrics?')) {
      collectedSnippets = [];
      snippetStore.clearSnippets();
    }
  }
  
  // Remove a specific snippet
  function removeSnippet(id) {
    collectedSnippets = collectedSnippets.filter(snippet => snippet.id !== id);
  }
  
  // Copy all snippets
  function copyAllSnippets() {
    if (collectedSnippets.length === 0) {
      alert('No snippets to copy');
      return;
    }
    
    const text = collectedSnippets
      .map(snippet => snippet.text.trim())
      .join('\n');
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => {
          alert('All snippets copied to clipboard');
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          alert('Failed to copy snippets');
        });
    }
  }
  
  // Clean up on component destruction
  onDestroy(() => {
    unsubscribe();
  });
</script>

<div class="enhanced-collection-panel {className} flex flex-col border-2 border-pink-300 shadow-lg rounded-lg overflow-hidden">
  <!-- Header -->
  {#if showHeader}
    <div class="panel-header bg-gradient-to-r from-pink-100 to-purple-100 px-4 py-3 border-b border-pink-200 flex justify-between items-center">
      <h2 class="text-lg font-medium bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
        <span class="font-bold">Lyrics Collection</span>
        {#if collectedSnippets.length > 0}
          <span class="ml-2 bg-pink-100 text-pink-600 rounded-full px-2 py-0.5 text-xs">
            {collectedSnippets.length}
          </span>
        {/if}
      </h2>
      
      <div class="flex space-x-2">
        {#if collectedSnippets.length > 0}
          <button 
            on:click={copyAllSnippets}
            class="text-xs flex items-center space-x-1 px-2 py-1 bg-white rounded-full shadow-sm border border-pink-100 text-pink-600 hover:bg-pink-50 transition-colors duration-200"
            aria-label="Copy all snippets to clipboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
            </svg>
            <span>Copy All</span>
          </button>
          
          <button 
            on:click={clearAllSnippets}
            class="text-xs flex items-center space-x-1 px-2 py-1 bg-white rounded-full shadow-sm border border-pink-100 text-pink-600 hover:bg-pink-50 transition-colors duration-200"
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
  
  <!-- Collection body -->
  <div class="panel-body bg-white p-4 max-h-[350px] overflow-y-auto flex-grow">
    {#if collectedSnippets.length === 0}
      <div class="empty-state text-center py-8 px-4">
        <p class="text-sm text-gray-500 mb-2">No lyrics collected yet</p>
        <p class="text-xs text-gray-400">
          Select text in the transcript and click 'Collect' or 'Direct Collect' to add snippets here
        </p>
      </div>
    {:else}
      <ul class="space-y-3">
        {#each collectedSnippets as snippet (snippet.id)}
          <li class="snippet-item group relative p-3 bg-gradient-to-r from-pink-50/70 to-purple-50/70 rounded-lg border border-pink-100/60 transition-all duration-200 hover:shadow-sm">
            <div class="snippet-text text-sm text-gray-700 font-mono whitespace-pre-wrap break-words">
              {snippet.text}
            </div>
            
            <div class="snippet-controls absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <!-- Remove button -->
              <button 
                on:click={() => removeSnippet(snippet.id)}
                class="text-xs p-1 rounded-md text-pink-600 hover:bg-pink-100/80 transition-colors duration-200"
                aria-label="Remove snippet"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>

<style>
  .enhanced-collection-panel {
    height: 100%;
  }
  
  .snippet-item {
    cursor: default;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .snippet-item:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(249, 168, 212, 0.1);
  }
</style>