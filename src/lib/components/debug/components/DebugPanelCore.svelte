<script>
  // === PROCESSING ZONE: IMPORTS AND DEPENDENCIES ===
  import { onMount, onDestroy } from 'svelte';
  import { isDebugMode, createLogger } from '$lib/services/infrastructure/loggerService';
  import * as handlers from './DebugPanelHandlers.js';
  import DebugPanelUI from './DebugPanelUI.svelte';
  
  // Create a component-specific logger
  const logger = createLogger('DebugPanelCore');
  // === END PROCESSING ZONE: IMPORTS AND DEPENDENCIES ===
  
  // TRAIL MARKER (Unit Cleanup): See sanitation_manifest.md for the Route's overall plan.
  
  // === PROCESSING ZONE: COMPONENT PROPS ===
  // Props - use isDebugMode store to determine visibility
  export let name = "Debug"; // Name to display on button and panel
  export let position = "top-right"; // top-right, top-left, bottom-right, bottom-left
  export let icon = "🔍"; // Emoji or character to use as icon
  export let showButton = true; // Whether to show the debug button
  export let logs = []; // Array of log messages to display in panel

  // Optional callbacks that can be provided
  export let onActivate = () => {}; // Called when debug is activated
  export let onDeactivate = () => {}; // Called when debug is deactivated
  // === END PROCESSING ZONE: COMPONENT PROPS ===
  
  // === PROCESSING ZONE: COMPONENT STATE ===
  // Debug panel activation state
  let debugActive = false;       // Controls if debug functionality is active
  let panelExpanded = false;     // Controls panel expansion state (collapsed/expanded)
  let hoveredNamespace = null;   // Tracks currently hovered namespace for UI feedback
  let allNamespaces = [];        // Stores the list of all available logging namespaces
  
  // Position styles mapping for different corner placements
  // These are applied directly to the debug button
  const positionStyles = {
    "top-right": "top: 10px; right: 10px;",
    "top-left": "top: 10px; left: 10px;",
    "bottom-right": "bottom: 10px; right: 10px;",
    "bottom-left": "bottom: 10px; left: 10px;"
  };
  // === END PROCESSING ZONE: COMPONENT STATE ===
  
  // Get position style - reactive declaration that computes the button style
  $: buttonStyle = positionStyles[position] || positionStyles["top-right"];
  
  // === PROCESSING ZONE: EVENT HANDLER WRAPPERS ===
  // These functions call the pure handlers with the current state and update local state
  
  /**
   * Toggle debug mode wrapper
   * Updates local state based on handler response
   */
  function handleToggleDebug() {
    const updates = handlers.toggleDebug(
      { debugActive, name, panelExpanded }, 
      onActivate, 
      onDeactivate
    );
    
    debugActive = updates.debugActive;
    panelExpanded = updates.panelExpanded;
  }
  
  /**
   * Toggle panel expansion wrapper
   * Updates local state based on handler response
   */
  function handleTogglePanel() {
    const updates = handlers.togglePanel({ debugActive, panelExpanded });
    
    if (updates.panelExpanded !== undefined) {
      panelExpanded = updates.panelExpanded;
      
      if (panelExpanded) {
        // Refresh namespaces data when panel is expanded
        handleRefreshNamespaces();
      }
    }
  }
  
  /**
   * Refresh namespaces wrapper
   * Updates local state with retrieved namespaces
   */
  function handleRefreshNamespaces() {
    handlers.refreshNamespaces().then(namespaces => {
      allNamespaces = namespaces;
    });
  }
  
  /**
   * Toggle namespace wrapper
   * Updates local state with updated namespaces
   */
  function handleToggleNamespace(namespace) {
    handlers.toggleNamespace(namespace, allNamespaces).then(namespaces => {
      allNamespaces = namespaces;
    });
  }
  
  /**
   * Show console config wrapper
   * Simply passes through to handler
   */
  function handleShowConsoleConfig() {
    handlers.showConsoleConfig();
  }
  
  /**
   * Enable all namespaces wrapper
   * Updates local state with updated namespaces
   */
  function handleEnableAllNamespaces() {
    handlers.enableAllNamespaces().then(namespaces => {
      allNamespaces = namespaces;
    });
  }
  
  /**
   * Disable all namespaces wrapper
   * Updates local state with updated namespaces
   */
  function handleDisableAllNamespaces() {
    handlers.disableAllNamespaces().then(namespaces => {
      allNamespaces = namespaces;
    });
  }
  
  /**
   * Update hovered namespace state
   */
  function handleNamespaceHover(namespace) {
    hoveredNamespace = namespace;
  }
  
  /**
   * Clear hovered namespace state
   */
  function handleNamespaceLeave() {
    hoveredNamespace = null;
  }
  // === END PROCESSING ZONE: EVENT HANDLER WRAPPERS ===
  
  // === PROCESSING ZONE: LIFECYCLE HOOKS ===
  // Initialize component when mounted
  onMount(() => {
    logger.debug(`${name} debug panel mounted`);
    // Load initial namespace data
    handleRefreshNamespaces();
  });
  
  // Clean up resources when component is destroyed
  onDestroy(() => {
    logger.debug(`${name} debug panel destroyed`);
    // Call the deactivation callback if debug was active
    if (debugActive) {
      onDeactivate();
    }
  });
  // === END PROCESSING ZONE: LIFECYCLE HOOKS ===
</script>

<DebugPanelUI
  {isDebugMode}
  {name}
  {icon}
  {showButton}
  {debugActive}
  {panelExpanded}
  {buttonStyle}
  {logs}
  {allNamespaces}
  {hoveredNamespace}
  handleToggleDebug={handleToggleDebug}
  handleTogglePanel={handleTogglePanel}
  handleShowConsoleConfig={handleShowConsoleConfig}
  handleEnableAllNamespaces={handleEnableAllNamespaces}
  handleDisableAllNamespaces={handleDisableAllNamespaces}
  handleToggleNamespace={handleToggleNamespace}
  handleNamespaceHover={handleNamespaceHover}
  handleNamespaceLeave={handleNamespaceLeave}
>
  <!-- Forward any slotted content -->
  <slot></slot>
</DebugPanelUI>

<!-- TRAIL MARKER (Unit Cleanup): This component manages state and coordinates handlers for the debug panel -->