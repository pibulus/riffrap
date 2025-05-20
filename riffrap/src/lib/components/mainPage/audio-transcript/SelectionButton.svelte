<script>
  import { createEventDispatcher } from 'svelte';
  
  // Props
  export let left = 0;
  export let top = 0;
  export let visible = false;
  export let selectedText = '';
  
  // Event dispatcher
  const dispatch = createEventDispatcher();
  
  // Handle collect button click - avoids store for reliability
  function handleCollect() {
    // Log for debugging
    console.log('Collect button clicked, selectedText:', selectedText);
    
    if (!selectedText || !selectedText.trim()) {
      console.error("No text selected to collect");
      dispatch('collection-error', { message: 'No text selected' });
      return;
    }
    
    const textToCollect = selectedText.trim();
    console.log('Text to collect:', textToCollect);
    
    // PURPLE BOX DIRECT INTEGRATION
    if (typeof window !== 'undefined') {
      window.transcriptSelectedText = textToCollect;
      window.transcriptCollectTrigger = true;
      
      // Try all possible collection functions
      if (window.addToMainCollectionBox) {
        console.log('Directly adding to main collection box');
        window.addToMainCollectionBox(textToCollect);
      }
      
      if (window.addToFixedPanel) {
        console.log('Directly adding to fixed debug panel');
        window.addToFixedPanel(textToCollect);
      }
      
      // Also try the standalone box
      if (window.addToStandaloneBox) {
        console.log('Directly adding to standalone box');
        window.addToStandaloneBox(textToCollect);
      }
    }
    
    // For backward compatibility, still dispatch the event
    dispatch('collect', { 
      text: textToCollect,
      success: true
    });
  }
</script>

<div 
  class="selection-button-container absolute z-[900] transition-all duration-200"
  style="left: {left}px; top: {top + 5}px;"
  class:opacity-0={!visible}
  class:pointer-events-none={!visible}
>
  <button
    class="collect-btn rounded-full bg-gradient-to-br from-pink-400 to-pink-500 border border-pink-300 px-4 py-2 text-sm sm:text-base font-medium text-white shadow-lg transition-all duration-150 ease-out hover:brightness-110 hover:scale-105 hover:shadow-pink-300/30 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 active:scale-95 flex items-center gap-2 pl-3"
    on:click={handleCollect}
    aria-label="Collect selected text"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
    </svg>
    Grab Lyrics
  </button>
</div>

<style>
  .selection-button-container {
    transform: translate(0, 0);
  }
  
  .collect-btn {
    white-space: nowrap;
  }
  
  /* Pulse animation for empty collection */
  @keyframes button-pulse {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.4);
    }
    50% {
      box-shadow: 0 0 0 10px rgba(236, 72, 153, 0);
    }
  }
  
  :global(.empty-collection .collect-btn) {
    animation: button-pulse 3s infinite;
  }
</style>