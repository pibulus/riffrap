<script>
  // === PROCESSING ZONE: IMPORTS AND DEPENDENCIES ===
  import { onMount } from 'svelte';
  import { theme, autoRecord, showSettingsModal, promptStyle } from '$lib/index.js';
  import { geminiService } from '$lib/services/geminiService';
  import { soundService } from '$lib/services/sound';
  import { createLogger } from '$lib/services/infrastructure/loggerService';
  import { ModalCloseButton } from '../../modals/index.js';
  
  // Import the template and handlers
  import SettingsModalTemplate from './SettingsModalTemplate.svelte';
  import * as handlers from './SettingsFeatureHandlers.js';
  // === END PROCESSING ZONE: IMPORTS AND DEPENDENCIES ===
  
  // TRAIL MARKER (Unit Cleanup): See sanitation_manifest.md for the Route's overall plan.

  // === PROCESSING ZONE: COMPONENT STATE AND PROPS ===
  // Create a logger for this component
  const logger = createLogger('SettingsModal');

  // Props for the modal
  export let closeModal = () => {};

  // Theme/vibe selection
  let selectedVibe;
  let scrollPosition = 0;
  let autoRecordValue = false;

  // Prompt style selection
  let promptStyles = [];
  let selectedPromptStyle = 'standard';
  
  // Feature toggles
  let exportAsTextEnabled = false;
  let soundsEnabled = false;
  let apiKey = '';
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
      
      // Load API key if saved (supporting both old and new keys)
      apiKey = localStorage.getItem('riffRap-gemini-api-key') || 
              localStorage.getItem('lineSnap-gemini-api-key') || '';
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

    // Set up event listeners for the modal
    const modal = document.getElementById('settings_modal');
    if (modal) {
      // Listen for custom beforeshow event
      modal.addEventListener('beforeshow', () => {
        // Just update the selected value, don't apply theme
        // The main app already has the theme applied
        // This fixes the double flash issue
      });

      // Also listen for the standard dialog open event
      modal.addEventListener('open', () => {
        // No need to apply theme here - we just want settings to reflect current state

        // Update prompt style selection in case it was changed elsewhere
        selectedPromptStyle = geminiService.getPromptStyle();
      });
    }

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
  // Handle modal opening - called when the modal is opened
  function handleModalOpen() {
    if (typeof window === 'undefined') return;

    // Get current scroll position
    scrollPosition = window.scrollY;
    const width = document.body.clientWidth;

    // Lock the body in place exactly where it was
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = `${width}px`;
    document.body.style.overflow = 'hidden';
  }

  // Handle modal closure - called when the modal is closed
  function handleModalClose() {
    // Restore body styles
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';

    // Restore scroll position
    window.scrollTo(0, scrollPosition);

    // Call the passed closeModal function
    closeModal();
  }
  // === END PROCESSING ZONE: MODAL HANDLING ===
  
  // TRAIL MARKER (Unit Cleanup): These functions handle opening and closing the modal with body scroll locking

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

  function handleSaveApiKey() {
    handlers.saveApiKey(apiKey, soundsEnabled);
  }
</script>

<!-- Render the template component with all required props -->
<SettingsModalTemplate
  {selectedVibe}
  {autoRecordValue}
  {promptStyles}
  {selectedPromptStyle}
  {exportAsTextEnabled}
  {soundsEnabled}
  {gradientOptions}
  {handleModalClose}
  {handleModalOpen}
  {handleChangeVibe}
  {handleChangePromptStyle}
  {handleToggleAutoRecord}
  {handleToggleExportAsText}
  {handleToggleSounds}
  {handleSaveApiKey}
  bind:apiKey
>
  <svelte:fragment slot="close-button">
    <ModalCloseButton 
      closeModal={handleModalClose} 
      label="Close settings" 
      position="right-2 top-2"
      modalId="settings_modal"
    />
  </svelte:fragment>
</SettingsModalTemplate>