<!--
  === COMPONENT OVERVIEW ===
  This is a compatibility wrapper for the modularized Settings Modal.
  It maintains the same filename and interface as the original SettingsModal.svelte
  to ensure backward compatibility with existing code that depends on this component.
  
  The implementation has been split into:
  - SettingsModalCore.svelte - Core state and lifecycle
  - SettingsFeatureHandlers.js - Business logic 
  - SettingsModalTemplate.svelte - UI templates and styles
  
  TRAIL MARKER (Unit Cleanup): See sanitation_manifest.md for the Route's overall plan.
-->

<script>
  // We just import the core component and pass through any props
  import SettingsModalCore from './modalComponents/SettingsModalCore.svelte';
  
  // Props for compatibility with existing code
  export let closeModal = () => {};
</script>

<!-- Simply render the core component, passing through all props -->
<SettingsModalCore {closeModal} {...$$props} />

<!-- TRAIL MARKER (Unit Cleanup): This component is a wrapper for the modular implementation -->