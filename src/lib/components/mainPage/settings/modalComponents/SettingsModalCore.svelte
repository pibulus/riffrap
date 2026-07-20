<script>
  // === PROCESSING ZONE: IMPORTS AND DEPENDENCIES ===
  import { onMount } from 'svelte';
  import { theme, autoRecord, promptStyle } from '$lib/index.js';
  import { geminiService } from '$lib/services/geminiService';

  // Import the template and handlers
  import SettingsModalTemplate from './SettingsModalTemplate.svelte';
  import * as handlers from './SettingsFeatureHandlers.js';
  // === END PROCESSING ZONE: IMPORTS AND DEPENDENCIES ===
  
  // TRAIL MARKER (Unit Cleanup): See sanitation_manifest.md for the Route's overall plan.

  // === PROCESSING ZONE: COMPONENT STATE AND PROPS ===
  // Props for the modal
  export let closeModal = () => {};
  /** Parent-owned open state, threaded down to the shared ModalShell. */
  export let open = false;

  // Theme/vibe selection
  let selectedVibe;
  let autoRecordValue = false;

  // Prompt style selection
  let promptStyles = [];
  let selectedPromptStyle = 'standard';
  
  // Feature toggles
  let exportAsTextEnabled = false;
  let soundsEnabled = false;
  // === END PROCESSING ZONE: COMPONENT STATE AND PROPS ===
  
  // === PROCESSING ZONE: STORE SUBSCRIPTIONS ===
  // Subscribe to theme store
  const unsubscribeTheme = theme.subscribe((value) => {
    selectedVibe = value;
  });

  // Subscribe to autoRecord store
  const unsubscribeAutoRecord = autoRecord.subscribe((value) => {
    autoRecordValue = value === 'true';
  });

  // Subscribe to promptStyle store
  const unsubscribePromptStyle = promptStyle.subscribe((value) => {
    selectedPromptStyle = value;
  });
  // === END PROCESSING ZONE: STORE SUBSCRIPTIONS ===
  
  // TRAIL MARKER (Unit Cleanup): Store subscriptions are cleaned up in onDestroy callback
  
  // === PROCESSING ZONE: INITIALIZATION AND SETTINGS DATA ===
  // Load saved settings
  function loadSavedSettings() {
    if (typeof localStorage !== 'undefined') {
      // Load export as text setting (supporting both old and new keys for backward compatibility)
      exportAsTextEnabled = localStorage.getItem('riffRap-export-as-text') === 'true' || 
                           localStorage.getItem('lineSnap-export-as-text') === 'true';
      
      // Load sounds setting - default to true unless explicitly set to false
      // Support both old and new keys for backward compatibility
      soundsEnabled = localStorage.getItem('riffRap-sounds-enabled') !== 'false' && 
                     localStorage.getItem('lineSnap-sounds-enabled') !== 'false';
      
    }
  }

  // Card gradient options (with original appearance but functioning IDs)
  const gradientOptions = [
    {
      id: 'purple',
      name: 'Purple Haze',
      gradient: 'from-purple-400/80 to-pink-300/80'
    },
    {
      id: 'sunset',
      name: 'Sunset Vibes',
      gradient: 'from-amber-400/80 to-rose-300/80'
    },
    {
      id: 'ocean',
      name: 'Ocean Breeze',
      gradient: 'from-cyan-400/80 to-blue-300/80'
    },
    {
      id: 'forest',
      name: 'Forest Chill',
      gradient: 'from-emerald-400/80 to-green-300/80'
    }
  ];
  // === END PROCESSING ZONE: INITIALIZATION AND SETTINGS DATA ===
  
  // TRAIL MARKER (Unit Cleanup): These gradient options are used in the UI rendering section

  // === PROCESSING ZONE: LIFECYCLE METHODS ===
  // Set up event listeners for the modal on component mount
  onMount(() => {
    // Get available prompt styles from the service
    promptStyles = geminiService.getAvailableStyles();

    // Get currently selected prompt style
    selectedPromptStyle = geminiService.getPromptStyle();
    
    // Load saved settings
    loadSavedSettings();

    // Clean up subscriptions on component destroy
    return () => {
      unsubscribeTheme();
      unsubscribeAutoRecord();
      unsubscribePromptStyle();
    };
  });
  // === END PROCESSING ZONE: LIFECYCLE METHODS ===
  
  // TRAIL MARKER (Unit Cleanup): The onMount function handles initialization and cleanup

  // === PROCESSING ZONE: MODAL HANDLING ===
  // Handle modal closure — the shared ModalShell owns scroll-lock and the
  // close animation; this just tells the parent to flip `open` false.
  function handleModalClose() {
    closeModal();
  }
  // === END PROCESSING ZONE: MODAL HANDLING ===

  // Create wrapper functions that pass state to handlers
  function handleChangeVibe(vibeId) {
    selectedVibe = vibeId;
    handlers.changeVibe(vibeId, soundsEnabled);
  }

  function handleChangePromptStyle(style) {
    selectedPromptStyle = style;
    handlers.changePromptStyle(style);
  }

  function handleToggleAutoRecord() {
    autoRecordValue = handlers.toggleAutoRecord(autoRecordValue, soundsEnabled);
  }

  function handleToggleExportAsText() {
    exportAsTextEnabled = handlers.toggleExportAsText(exportAsTextEnabled, soundsEnabled);
  }

  function handleToggleSounds() {
    soundsEnabled = handlers.toggleSounds(soundsEnabled);
  }

</script>

<!-- Render the template component with all required props -->
<SettingsModalTemplate
  {open}
  {selectedVibe}
  {autoRecordValue}
  {promptStyles}
  {selectedPromptStyle}
  {exportAsTextEnabled}
  {soundsEnabled}
  {gradientOptions}
  {handleModalClose}
  {handleChangeVibe}
  {handleChangePromptStyle}
  {handleToggleAutoRecord}
  {handleToggleExportAsText}
  {handleToggleSounds}
/>
