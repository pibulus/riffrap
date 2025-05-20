<script>
  // === PROCESSING ZONE: UI PROPS ===
  // Svelte store
  export let isDebugMode;
  
  // Component props
  export let name;
  export let icon;
  export let showButton;
  export let buttonStyle;
  export let logs = [];
  
  // Component state
  export let debugActive;
  export let panelExpanded;
  export let allNamespaces = [];
  export let hoveredNamespace;
  
  // Event handlers
  export let handleToggleDebug;
  export let handleTogglePanel;
  export let handleShowConsoleConfig;
  export let handleEnableAllNamespaces;
  export let handleDisableAllNamespaces;
  export let handleToggleNamespace;
  export let handleNamespaceHover;
  export let handleNamespaceLeave;
  // === END PROCESSING ZONE: UI PROPS ===
</script>

<!-- === PROCESSING ZONE: UI TEMPLATE === -->
<!-- 
  This zone contains the UI markup for the debug panel component.
  
  Structure:
  - Conditional rendering based on isDebugMode
  - Debug button for toggling activation
  - Panel overlay for expanded view
  - Control actions for logger configuration
  - Namespace listing with toggle functionality
  - Debug logs display
  - Slot for custom debug content
-->

<!-- Only show if debug mode is enabled globally -->
{#if $isDebugMode}
  <!-- Debug Button - Fixed position toggle button -->
  {#if showButton}
    <button
      class="debug-button {debugActive ? 'active' : ''}"
      style={buttonStyle}
      on:click={handleToggleDebug}
      aria-label="Toggle {name} debug mode"
    >
      <span class="debug-icon">{icon}</span>
      <span class="debug-label">{name}</span>
    </button>
  {/if}
  
  <!-- Debug Panel - Expandable overlay with debug controls -->
  {#if debugActive}
    <div class="debug-panel-overlay" class:expanded={panelExpanded}>
      <!-- Panel Header - Always visible when active -->
      <div class="debug-panel-header" on:click={handleTogglePanel}>
        <div class="panel-title">
          <span class="debug-icon">{icon}</span>
          <span>{name} Debug Panel</span>
        </div>
        <button class="panel-toggle">
          {panelExpanded ? '▼' : '▲'}
        </button>
      </div>
      
      <!-- Panel Content - Only visible when expanded -->
      {#if panelExpanded}
        <div class="debug-panel-content">
          <!-- Control Actions - Global logging controls -->
          <div class="debug-actions">
            <button on:click={handleShowConsoleConfig} class="debug-action-button">
              Show Config
            </button>
            <button on:click={handleEnableAllNamespaces} class="debug-action-button">
              Enable All
            </button>
            <button on:click={handleDisableAllNamespaces} class="debug-action-button">
              Disable All
            </button>
          </div>
          
          <!-- Namespaces Section - Toggle individual loggers -->
          <div class="debug-section">
            <h3>Logger Namespaces</h3>
            <div class="namespaces-list">
              {#each allNamespaces as { namespace, enabled }}
                <div 
                  class="namespace-item" 
                  class:enabled={enabled}
                  on:click={() => handleToggleNamespace(namespace)}
                  on:mouseenter={() => handleNamespaceHover(namespace)}
                  on:mouseleave={handleNamespaceLeave}
                >
                  <span class="namespace-status">{enabled ? '✓' : '×'}</span>
                  <span class="namespace-name">{namespace}</span>
                </div>
              {/each}
            </div>
          </div>
          
          <!-- Debug Logs Section - Show passed-in logs if any -->
          {#if logs.length > 0}
            <div class="debug-section">
              <h3>Debug Logs</h3>
              <div class="debug-logs">
                {#each logs as log, i}
                  <div class="log-item" class:odd={i % 2 === 1}>
                    <span class="log-type">[{log.type || 'info'}]</span>
                    <span class="log-message">{log.message}</span>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
          
          <!-- Slot for custom debug content from parent components -->
          <slot></slot>
        </div>
      {/if}
    </div>
  {/if}
{/if}
<!-- === END PROCESSING ZONE: UI TEMPLATE === -->

<!-- === PROCESSING ZONE: COMPONENT STYLES === -->
<style>
  /**
   * Component-specific styling for the debug panel.
   * 
   * This zone contains:
   * - Button styling for the debug toggle
   * - Panel styling for the debug overlay
   * - Styling for UI controls and interactions
   * - Visual feedback for enabled/disabled states
   */
  
  /* === Debug Button Styles === */
  .debug-button {
    /* Positioning */
    position: fixed;
    z-index: 10000;
    
    /* Appearance */
    padding: 8px 12px;
    background: rgba(25, 25, 25, 0.8);
    color: white;
    font-weight: bold;
    border-radius: 6px;
    border: 1px solid rgba(100, 100, 100, 0.3);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    
    /* Typography */
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    
    /* Layout */
    display: flex;
    align-items: center;
    gap: 6px;
    
    /* Interaction */
    cursor: pointer;
    outline: none;
    transition: all 0.2s ease;
  }
  
  /* Hover effect with slight lift */
  .debug-button:hover {
    background: rgba(50, 50, 50, 0.9);
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  }
  
  /* Active state styling */
  .debug-button.active {
    background: rgba(0, 128, 96, 0.8);
    border-color: rgba(0, 180, 120, 0.3);
  }
  
  .debug-button.active:hover {
    background: rgba(0, 150, 100, 0.9);
  }
  
  .debug-icon {
    font-size: 16px;
  }
  
  /* === Debug Panel Styles === */
  .debug-panel-overlay {
    /* Positioning */
    position: fixed;
    bottom: 10px;
    right: 10px;
    z-index: 9999;
    
    /* Size */
    width: 360px;
    max-height: calc(100vh - 150px);
    
    /* Appearance */
    background: rgba(30, 30, 30, 0.9);
    color: #eee;
    border-radius: 8px;
    box-shadow: 0 3px 15px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(100, 100, 100, 0.2);
    backdrop-filter: blur(4px);
    
    /* Typography */
    font-family: system-ui, -apple-system, monospace;
    font-size: 13px;
    
    /* Layout */
    display: flex;
    flex-direction: column;
    overflow: hidden;
    
    /* Animation */
    transition: all 0.3s ease;
  }
  
  /* Expanded state - panel is fully visible */
  .debug-panel-overlay.expanded {
    height: auto;
  }
  
  /* Header bar - always visible when panel is active */
  .debug-panel-header {
    padding: 10px;
    background: rgba(50, 50, 50, 0.8);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(100, 100, 100, 0.3);
    
    /* Interaction */
    cursor: pointer;
    user-select: none;
    font-weight: bold;
  }
  
  .panel-title {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .panel-toggle {
    background: none;
    border: none;
    color: #ccc;
    cursor: pointer;
    font-size: 12px;
  }
  
  /* Content container - scrollable area */
  .debug-panel-content {
    padding: 10px;
    overflow-y: auto;
    max-height: calc(100vh - 200px);
  }
  
  /* === Debug Actions === */
  .debug-actions {
    display: flex;
    gap: 8px;
    margin-bottom: 10px;
  }
  
  .debug-action-button {
    background: rgba(70, 70, 70, 0.6);
    border: 1px solid rgba(100, 100, 100, 0.3);
    color: #eee;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .debug-action-button:hover {
    background: rgba(90, 90, 90, 0.8);
  }
  
  /* === Debug Sections === */
  .debug-section {
    margin-bottom: 15px;
  }
  
  .debug-section h3 {
    font-size: 13px;
    font-weight: bold;
    margin-bottom: 8px;
    border-bottom: 1px solid rgba(100, 100, 100, 0.3);
    padding-bottom: 4px;
    color: #ccc;
  }
  
  /* === Namespaces List === */
  .namespaces-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 5px;
  }
  
  .namespace-item {
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    background: rgba(40, 40, 40, 0.6);
    display: flex;
    align-items: center;
    gap: 5px;
    transition: all 0.15s ease;
  }
  
  .namespace-item:hover {
    background: rgba(50, 50, 50, 0.8);
  }
  
  /* Enabled state styling */
  .namespace-item.enabled {
    background: rgba(0, 80, 60, 0.3);
    border-left: 3px solid rgba(0, 220, 160, 0.6);
  }
  
  .namespace-item.enabled:hover {
    background: rgba(0, 100, 70, 0.4);
  }
  
  .namespace-status {
    color: #666;
    font-weight: bold;
  }
  
  .namespace-item.enabled .namespace-status {
    color: #00cc88;
  }
  
  /* === Debug Logs === */
  .debug-logs {
    max-height: 200px;
    overflow-y: auto;
    font-family: monospace;
    font-size: 12px;
    border: 1px solid rgba(100, 100, 100, 0.2);
    border-radius: 4px;
  }
  
  .log-item {
    padding: 3px 6px;
    border-bottom: 1px solid rgba(100, 100, 100, 0.1);
    display: flex;
    gap: 6px;
  }
  
  .log-item.odd {
    background: rgba(40, 40, 40, 0.4);
  }
  
  .log-type {
    color: #888;
    font-weight: bold;
  }

  .log-message {
    word-break: break-word;
  }
</style>
<!-- === END PROCESSING ZONE: COMPONENT STYLES === -->

<!-- TRAIL MARKER (Unit Cleanup): This component provides the UI for the debug panel -->