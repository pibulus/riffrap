<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { eventBridge } from '$lib/services/infrastructure/eventBridge';
  import { errorHandler } from '$lib/services/infrastructure/errorHandler';
  
  export let fallback = undefined; // Custom fallback content
  export let resetOnChange = false; // Whether to reset the error state when props change
  export let showFallback = true; // Whether to show the fallback UI or just silently catch errors
  
  let error = null;
  let errorInfo = null;
  const dispatch = createEventDispatcher();
  let errorListener;
  
  // Used for resetOnChange
  let prevProps = {};
  
  onMount(() => {
    // Store initial props
    if (resetOnChange) {
      prevProps = { ...$$props };
    }
    
    // Add listener for global errors
    errorListener = eventBridge.addAppEventListener('error', (event) => {
      if (event.detail.isOperational === false) {
        handleError(new Error(event.detail.message));
      }
    });
  });
  
  onDestroy(() => {
    if (errorListener) errorListener();
  });
  
  // Check if props have changed and reset error if needed
  $: if (resetOnChange && error && hasPropsChanged($$props, prevProps)) {
    error = null;
    errorInfo = null;
    prevProps = { ...$$props };
  }
  
  // Compare props to see if they've changed
  function hasPropsChanged(newProps, oldProps) {
    const newKeys = Object.keys(newProps).filter(k => k !== '$$scope');
    const oldKeys = Object.keys(oldProps).filter(k => k !== '$$scope');
    
    if (newKeys.length !== oldKeys.length) return true;
    
    return newKeys.some(key => {
      if (key === 'children') return false; // Ignore children changes
      return JSON.stringify(newProps[key]) !== JSON.stringify(oldProps[key]);
    });
  }
  
  // Handle errors from child components
  function handleError(err, info = {}) {
    error = err;
    errorInfo = info;
    
    // Log the error through our central handler
    errorHandler.handleError(err, {
      rethrow: false,
      context: { errorInfo: info, component: 'ErrorBoundary' }
    });
    
    // Dispatch event to parent
    dispatch('error', { error: err, errorInfo: info });
  }
  
  // Default fallback if none provided
  function DefaultFallback() {
    return `
      <div class="error-boundary-fallback">
        <h3>Something went wrong</h3>
        <p>The application encountered an unexpected error.</p>
        <button on:click={() => window.location.reload()}>Reload page</button>
      </div>
    `;
  }
</script>

<svelte:options accessors />
<svelte:window on:error={(e) => handleError(e.error || new Error(e.message))} />

{#if error && showFallback}
  {#if fallback}
    <svelte:component this={fallback} {error} {errorInfo} />
  {:else}
    <div class="error-boundary-fallback">
      <h3>Something went wrong</h3>
      <p>The application encountered an unexpected error.</p>
      <button on:click={() => window.location.reload()}>Reload page</button>
      <details>
        <summary>Technical details</summary>
        <p>{error.message}</p>
        {#if error.stack}
          <pre>{error.stack}</pre>
        {/if}
      </details>
    </div>
  {/if}
{:else}
  <slot />
{/if}

<style>
  .error-boundary-fallback {
    padding: 16px;
    margin: 16px 0;
    border: 2px solid #ff3e00;
    border-radius: 4px;
    background-color: #fff8f7;
    color: #333;
  }
  
  h3 {
    margin: 0 0 8px 0;
    color: #ff3e00;
  }
  
  button {
    margin-top: 16px;
    padding: 8px 12px;
    background-color: #ff3e00;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #dd3600;
  }
  
  details {
    margin-top: 16px;
    padding: 8px;
    background-color: #f8f8f8;
    border-radius: 4px;
  }
  
  summary {
    cursor: pointer;
    color: #666;
  }
  
  pre {
    overflow-x: auto;
    background-color: #f1f1f1;
    padding: 8px;
    border-radius: 4px;
    font-size: 12px;
  }
</style>