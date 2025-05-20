/**
 * SettingsFeatureHandlers.js
 * 
 * This module contains all the feature-specific handler functions for the settings modal.
 * It was extracted from SettingsModal.svelte as part of the code sanitation process
 * to separate business logic from UI rendering and component lifecycle management.
 * 
 * === PROCESSING ZONES ===
 * - THEME MANAGEMENT: Functions for handling theme/vibe changes
 * - SETTINGS HANDLERS: Toggle and update functions for application settings
 * 
 * TRAIL MARKER (Unit Cleanup): See sanitation_manifest.md for the Route's overall plan.
 */

import { eventBridge } from '$lib/services/infrastructure/eventBridge';
import { promptStyle, autoRecord } from '$lib/index.js';
import { soundService } from '$lib/services/sound';
import { geminiService } from '$lib/services/geminiService';
import { createLogger } from '$lib/services/infrastructure/loggerService';

// Create a logger for this module
const logger = createLogger('SettingsHandlers');

// === PROCESSING ZONE: THEME MANAGEMENT ===
/**
 * Handle vibe change in the simplest way possible
 * @param {string} vibeId - The ID of the theme/vibe to apply
 * @param {boolean} soundsEnabled - Whether sounds are enabled
 */
export function changeVibe(vibeId, soundsEnabled) {
  // Play sound effect for vibe change
  if (soundsEnabled) {
    soundService.playSound('edit', { delay: 0.2 });
  }
  
  // Store theme selection in localStorage (both old and new keys for backward compatibility)
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('riffRap-lyrics-theme', vibeId);
    localStorage.setItem('lineSnap-lyrics-theme', vibeId); // Maintain backward compatibility
  }
  
  // Simplest approach: Add a data attribute to the document body
  // This will trigger CSS style changes for all elements
  if (typeof document !== 'undefined') {
    document.body.setAttribute('data-lyric-theme', vibeId);
    
    // Also add direct style to all snippet items
    const snippetItems = document.querySelectorAll('.snippet-item');
    snippetItems.forEach((item, index) => {
      // Apply the appropriate theme color based on index
      item.style.backgroundColor = index % 2 === 0 ? 
        getThemeColor(vibeId, 'even') : 
        getThemeColor(vibeId, 'odd');
    });
    
    // Also update the empty state if present
    const emptyState = document.querySelector('.empty-state');
    if (emptyState) {
      emptyState.style.background = `linear-gradient(to bottom right, ${getThemeColor(vibeId, 'even')}, ${getThemeColor(vibeId, 'odd')}70)`;
    }
  }
  
  // Dispatch the standard event for components to react using eventBridge
  // This will dispatch both 'riffrap-setting-changed' (new) and 'linesnap-setting-changed' (legacy) events
  eventBridge.dispatchSettingChanged('theme', vibeId);
}

/**
 * Helper function to get theme colors directly
 * @param {string} themeId - The theme ID
 * @param {string} type - The element type (even/odd)
 * @returns {string} - The color value
 */
export function getThemeColor(themeId, type) {
  const themeColors = {
    purple: {
      even: '#F3E8FF',
      odd: '#FEEBC8'
    },
    sunset: {
      even: '#FEEBC8',
      odd: '#FED7D7'
    },
    ocean: {
      even: '#E6FFFA',
      odd: '#BEE3F8'
    },
    forest: {
      even: '#C6F6D5',
      odd: '#E6FFFA'
    }
  };
  
  // Default to purple theme if theme ID not found
  if (!themeColors[themeId]) {
    themeId = 'purple';
  }
  
  return themeColors[themeId][type];
}
// === END PROCESSING ZONE: THEME MANAGEMENT ===

// === PROCESSING ZONE: SETTINGS HANDLERS ===
/**
 * Handle prompt style change
 * @param {string} style - The prompt style to set
 */
export function changePromptStyle(style) {
  geminiService.setPromptStyle(style);

  // Update the store (this will also save to localStorage)
  promptStyle.set(style);

  // Dispatch a custom event using eventBridge
  // This will dispatch both 'riffrap-setting-changed' (new) and 'linesnap-setting-changed' (legacy) events
  eventBridge.dispatchSettingChanged('promptStyle', style);
}

/**
 * Handle auto-record toggle
 * @param {boolean} currentValue - Current state of autoRecord
 * @param {boolean} soundsEnabled - Whether sounds are enabled
 * @returns {boolean} - New state after toggle
 */
export function toggleAutoRecord(currentValue, soundsEnabled) {
  const newValue = !currentValue;
  autoRecord.set(newValue.toString());
  
  // Play appropriate toggle sound
  if (soundsEnabled) {
    if (newValue) {
      soundService.playPopOnSound();
    } else {
      soundService.playPopOffSound();
    }
  }

  // Dispatch a custom event using eventBridge
  // This will dispatch both 'riffrap-setting-changed' (new) and 'linesnap-setting-changed' (legacy) events
  eventBridge.dispatchSettingChanged('autoRecord', newValue);
  
  return newValue;
}

/**
 * Handle export as text toggle
 * @param {boolean} currentValue - Current state of export as text
 * @param {boolean} soundsEnabled - Whether sounds are enabled
 * @returns {boolean} - New state after toggle
 */
export function toggleExportAsText(currentValue, soundsEnabled) {
  const newValue = !currentValue;
  
  // Play appropriate toggle sound
  if (soundsEnabled) {
    if (newValue) {
      soundService.playPopOnSound();
    } else {
      soundService.playPopOffSound();
    }
  }
  
  // Save to localStorage (both old and new keys for backward compatibility)
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('riffRap-export-as-text', newValue.toString());
    localStorage.setItem('lineSnap-export-as-text', newValue.toString()); // Maintain backward compatibility
  }
  
  // Dispatch event using eventBridge
  // This will dispatch both 'riffrap-setting-changed' (new) and 'linesnap-setting-changed' (legacy) events
  eventBridge.dispatchSettingChanged('exportAsText', newValue);
  
  return newValue;
}

/**
 * Handle sounds toggle
 * @param {boolean} currentValue - Current state of sounds enabled
 * @returns {boolean} - New state after toggle
 */
export function toggleSounds(currentValue) {
  const newValue = !currentValue;
  
  // Save to localStorage (both old and new keys for backward compatibility)
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('riffRap-sounds-enabled', newValue.toString());
    localStorage.setItem('lineSnap-sounds-enabled', newValue.toString()); // Maintain backward compatibility
  }
  
  // Update sound service
  soundService.setSoundEnabled(newValue);
  
  // Update global flag for direct checks
  if (typeof window !== 'undefined') {
    window.soundsEnabled = newValue;
  }
  
  // Play a sound if sounds are enabled
  if (newValue) {
    soundService.playPopOnSound();
  }
  
  // Dispatch event using eventBridge
  // This will dispatch both 'riffrap-setting-changed' (new) and 'linesnap-setting-changed' (legacy) events
  eventBridge.dispatchSettingChanged('sounds', newValue);
  
  return newValue;
}

/**
 * Handle API key saving
 * @param {string} apiKey - The API key to save
 * @param {boolean} soundsEnabled - Whether sounds are enabled
 */
export function saveApiKey(apiKey, soundsEnabled) {
  if (typeof localStorage !== 'undefined' && apiKey) {
    try {
      // Save API key to localStorage (both old and new keys for backward compatibility)
      localStorage.setItem('riffRap-gemini-api-key', apiKey);
      localStorage.setItem('lineSnap-gemini-api-key', apiKey); // Maintain backward compatibility
      
      // Set environment variable
      if (typeof window !== 'undefined') {
        window.VITE_GEMINI_API_KEY = apiKey;
      }
      
      // Update the API service with the new key
      geminiService.updateApiKey(apiKey).then(() => {
        logger.info('API key updated and model preloaded successfully');
      }).catch(error => {
        logger.error('Error updating API key:', error);
      });
      
      // Play a sound for feedback if sounds are enabled
      if (soundsEnabled) {
        soundService.playReadySound();
      }
      
      // Dispatch event using eventBridge
      // This will dispatch both 'riffrap-setting-changed' (new) and 'linesnap-setting-changed' (legacy) events
      eventBridge.dispatchSettingChanged('geminiApiKey', apiKey);
    } catch (error) {
      logger.error('Error saving API key:', error);
      
      // Play error sound if sounds are enabled
      if (soundsEnabled) {
        soundService.playErrorSound();
      }
    }
  }
}
// === END PROCESSING ZONE: SETTINGS HANDLERS ===

// TRAIL MARKER (Unit Cleanup): This module contains all feature-specific handlers from SettingsModal.svelte