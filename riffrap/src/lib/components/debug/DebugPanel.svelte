<!--
  === COMPONENT OVERVIEW ===
  This is a compatibility wrapper for the modularized Debug Panel.
  It maintains the same filename and interface as the original DebugPanel.svelte
  to ensure backward compatibility with existing code that depends on this component.
  
  The implementation has been split into:
  - DebugPanelCore.svelte - Core state and lifecycle
  - DebugPanelHandlers.js - Business logic 
  - DebugPanelUI.svelte - UI templates and styles
  
  TRAIL MARKER (Unit Cleanup): See sanitation_manifest.md for the Route's overall plan.
-->

<script>
  // We just import the core component and pass through any props
  import DebugPanelCore from './components/DebugPanelCore.svelte';
  
  // Pass through all props from the original component
  export let name = "Debug"; 
  export let position = "top-right";
  export let icon = "🔍";
  export let showButton = true;
  export let logs = [];
  export let onActivate = () => {};
  export let onDeactivate = () => {};
</script>

<!-- Simply render the core component, passing through all props -->
<DebugPanelCore
  {name}
  {position}
  {icon}
  {showButton}
  {logs}
  {onActivate}
  {onDeactivate}
>
  <slot></slot>
</DebugPanelCore>

<!-- TRAIL MARKER (Unit Cleanup): This component is a wrapper for the modular implementation -->