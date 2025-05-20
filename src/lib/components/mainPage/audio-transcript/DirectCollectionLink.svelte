<script>
  // Simple component that directly communicates with ContentContainer
  import { createEventDispatcher } from 'svelte';
  
  // Props
  export let left = 0;
  export let top = 0;
  export let visible = false;
  export let selectedText = '';
  
  // Event dispatcher
  const dispatch = createEventDispatcher();
  
  // Handle direct collection
  function handleDirectCollect() {
    if (!selectedText || !selectedText.trim()) {
      dispatch('error', { message: 'No text selected' });
      return;
    }
    
    const textToCollect = selectedText.trim();
    console.log('DirectCollectionLink: Direct collect button clicked, selectedText:', textToCollect);
    
    // PURPLE BOX DIRECT INTEGRATION - This approach is working
    if (typeof window !== 'undefined') {
      // Set global variables for collection
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
    dispatch('directcollect', { text: textToCollect });
  }
</script>

<div 
  class="direct-collection-button absolute z-[900] transition-all duration-200"
  style="left: {left}px; top: {top + 5}px;"
  class:opacity-0={!visible}
  class:pointer-events-none={!visible}
>
  <button
    class="collect-btn rounded-full bg-green-100 px-3 py-1.5 text-xs font-medium text-green-800 shadow-md transition-all duration-200 hover:bg-green-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2 active:scale-95 flex items-center gap-1"
    on:click={handleDirectCollect}
    aria-label="Directly collect selected text"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
    </svg>
    Direct Collect
  </button>
</div>

<style>
  .direct-collection-button {
    transform: translate(0, 0);
    display: flex;
    margin-left: 100px; /* Position to the right of normal collect button */
  }
  
  .collect-btn {
    white-space: nowrap;
  }
</style>