<script>
  import { onMount } from 'svelte';
  import { snippetStore } from '$lib/services';
  import Ghost from '$lib/components/ghost/Ghost.svelte';
  
  // Props
  export let className = '';
  export let showHeader = true;
  
  // State
  let snippets = [];
  let dragSource = null;
  let copySuccess = false;
  let copyTimeout;
  
  // Subscribe to the snippetStore with improved reactivity
  const unsubscribe = snippetStore.subscribe(value => {
    // Make a deep copy to ensure reactivity
    snippets = JSON.parse(JSON.stringify(value || []));
  });
  
  // Handle drag start
  function handleDragStart(event, id) {
    dragSource = id;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', id);
    
    // Add styling to the dragged element
    event.target.classList.add('opacity-50');
  }
  
  // Handle drag over
  function handleDragOver(event, id) {
    event.preventDefault();
    
    // Only proceed if we have a valid drag operation
    if (!dragSource || dragSource === id) return;
    
    // Get the source and target indices
    const sourceIndex = snippets.findIndex(s => s.id === dragSource);
    const targetIndex = snippets.findIndex(s => s.id === id);
    
    // Highlight the drop target
    event.target.closest('.snippet-item').classList.add('bg-pink-50');
  }
  
  // Handle drag leave
  function handleDragLeave(event) {
    event.target.closest('.snippet-item')?.classList.remove('bg-pink-50');
  }
  
  // Handle drop
  function handleDrop(event, id) {
    event.preventDefault();
    
    // Remove the highlight from the drop target
    event.target.closest('.snippet-item')?.classList.remove('bg-pink-50');
    
    // Only proceed if we have a valid drag operation
    if (!dragSource || dragSource === id) return;
    
    // Get the source and target indices
    const sourceIndex = snippets.findIndex(s => s.id === dragSource);
    const targetIndex = snippets.findIndex(s => s.id === id);
    
    // Reorder the snippet
    snippetStore.reorderSnippet(dragSource, targetIndex);
    
    // Reset drag source
    dragSource = null;
  }
  
  // Handle drag end
  function handleDragEnd(event) {
    // Remove styling from the dragged element
    event.target.classList.remove('opacity-50');
    
    // Reset drag source
    dragSource = null;
  }
  
  // Handle removing a snippet
  function removeSnippet(id) {
    snippetStore.removeSnippet(id);
  }
  
  // Handle moving a snippet up
  function moveSnippetUp(id) {
    snippetStore.moveUp(id);
  }
  
  // Handle moving a snippet down
  function moveSnippetDown(id) {
    snippetStore.moveDown(id);
  }
  
  // Handle copying all snippets
  function copyAllSnippets() {
    const text = snippetStore.getPlainText();
    
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
      snippetStore.clearSnippets();
    }
  }
  
  // Clean up on component destruction
  onMount(() => {
    return () => {
      unsubscribe();
      if (copyTimeout) clearTimeout(copyTimeout);
    };
  });
</script>

<div class="collection-panel {className}">
  {#if showHeader}
    <div class="panel-header relative overflow-hidden bg-gradient-to-b from-purple-100 to-purple-200 px-4 py-3 sm:px-6 flex justify-between items-center hover:bg-purple-100 transition-colors cursor-default">
      <!-- Soft decorative background for lyric-like feel -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute top-0 left-0 right-0 h-8 opacity-15">
          <div class="w-full h-full bg-[radial-gradient(circle_at_10%_25%,rgba(168,85,247,0.4)_0%,transparent_50%)]"></div>
        </div>
      </div>
      <!-- Subtle decorative element -->
      <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-300/10 via-purple-300/30 to-purple-300/10"></div>
      
      <h2 class="relative text-lg font-semibold flex items-center text-purple-700 border-b-2 border-purple-300/30">
        <span>Lyrics Collection</span>
        <!-- Badge showing count -->
        {#if snippets.length > 0}
          <span class="ml-2 text-xs font-medium bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">{snippets.length}</span>
        {/if}
      </h2>
      
      <div class="flex space-x-2 relative z-10">
        {#if snippets.length > 0}
          <div class="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl border border-purple-100/60 p-1.5 shadow-sm">
            <button 
              on:click={copyAllSnippets}
              class="text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-purple-600 bg-white/50 border border-purple-200 hover:bg-purple-50/80 hover:scale-105 hover:shadow-sm transition-all duration-200"
              aria-label="Copy all snippets to clipboard"
              title="Copy all lyrics to clipboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-purple-500">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>📋 Copy All</span>
            </button>
            
            <button 
              on:click={clearAllSnippets}
              class="text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-purple-600 bg-white/50 border border-purple-200 hover:bg-purple-50/80 hover:scale-105 hover:shadow-sm transition-all duration-200"
              aria-label="Clear all snippets"
              title="Clear all lyrics from collection"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-purple-500">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>🗑 Clear All</span>
            </button>
          </div>
        {/if}
      </div>
    </div>
  {/if}
  
  <div class="panel-body bg-white p-4 max-h-[350px] overflow-y-auto shadow-inner">
    <!-- Panel body content starts here -->
    
    {#if snippets.length === 0}
      <div class="empty-state text-center py-8 px-4">
        <div class="empty-state-icon mx-auto h-16 w-16 opacity-40 mb-4">
          <Ghost size="100%" clickable={false} seed={99} />
        </div>
        <p class="text-sm text-gray-500 mb-2">No lyrics collected yet</p>
        <p class="text-xs text-gray-400">
          Select text in the transcript and click 'Collect' to add snippets here
        </p>
      </div>
    {:else}
      <ul class="snippets-list space-y-3">
        {#each snippets.sort((a, b) => a.order - b.order) as snippet (snippet.id)}
          <li 
            class="snippet-item group relative p-4 bg-neutral-50 rounded-xl border border-purple-100/80 transition-all duration-200 shadow-sm animate-fadeIn hover:scale-[102%] hover:shadow-md hover:shadow-purple-100/50 hover:border-purple-200"
            style="animation-delay: {index * 100}ms"
            draggable="true"
            on:dragstart={e => handleDragStart(e, snippet.id)}
            on:dragover={e => handleDragOver(e, snippet.id)}
            on:dragleave={handleDragLeave}
            on:drop={e => handleDrop(e, snippet.id)}
            on:dragend={handleDragEnd}
          >
            <div class="snippet-text text-lg text-gray-800 font-mono whitespace-pre-wrap break-words leading-relaxed py-1">
              {snippet.text}
            </div>
            
            <div class="snippet-controls absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm p-1.5 border border-purple-100/40">
              <!-- Move up button -->
              <button 
                on:click={() => moveSnippetUp(snippet.id)}
                class="text-xs p-1.5 rounded-lg text-purple-500 hover:bg-purple-50/80 hover:scale-105 transition-all duration-200"
                aria-label="Move snippet up"
                disabled={snippet.order === 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m18 15-6-6-6 6"></path>
                </svg>
              </button>
              
              <!-- Move down button -->
              <button 
                on:click={() => moveSnippetDown(snippet.id)}
                class="text-xs p-1.5 rounded-lg text-purple-500 hover:bg-purple-50/80 hover:scale-105 transition-all duration-200"
                aria-label="Move snippet down"
                disabled={snippet.order === snippets.length - 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              </button>
              
              <!-- Remove button -->
              <button 
                on:click={() => removeSnippet(snippet.id)}
                class="text-xs p-1.5 rounded-lg text-purple-500 hover:bg-purple-50/80 hover:scale-105 transition-all duration-200"
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
  .collection-panel {
    display: flex;
    flex-direction: column;
    overflow: visible; /* Changed from 'hidden' to allow tooltips to escape */
    border: 1px solid rgba(168, 85, 247, 0.2);
    box-shadow: 0 2px 8px rgba(168, 85, 247, 0.05);
    height: 100%;
    border-radius: 1rem;
    position: relative; /* Added to establish positioning context */
  }
  
  .panel-header {
    border-bottom: 1px solid rgba(168, 85, 247, 0.2);
    border-top-left-radius: 1rem;
    border-top-right-radius: 1rem;
    z-index: 10;
    position: relative;
  }
  
  /* Tooltip styles removed - using explicit buttons with icons instead */
  
  .panel-body {
    flex-grow: 1;
    overflow-y: auto;
    overflow-x: visible; /* Allow tooltips to extend beyond the container */
    scrollbar-width: thin;
    scrollbar-color: rgba(249, 168, 212, 0.5) transparent;
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
    background-color: rgba(168, 85, 247, 0.3);
    border-radius: 20px;
  }
  
  .snippet-item {
    cursor: grab;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  /* This is replaced by the inline Tailwind classes */
  
  .snippet-item:active {
    cursor: grabbing;
  }
  
  button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
</style>