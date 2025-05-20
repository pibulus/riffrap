/**
 * Sound Service for LineSnap
 * Provides centralized sound effect functions for the application
 */

import { eventBridge } from '$lib/services/infrastructure/eventBridge';
import { createLogger } from '$lib/services/infrastructure/loggerService';

// Create a logger for this service
const logger = createLogger('SoundService');

// Check if we're in a browser environment with audio support
const hasAudioSupport = typeof window !== 'undefined' && window.HTMLAudioElement;

// Store single settings flag - default to true for development
let soundsEnabled = true;

// Default configuration for all sounds
const defaultConfig = {
  volume: 0.15,  // Default volume for all sounds (15%)
  delay: 0,      // No delay by default
  basePath: '/sounds/' // Base path to sound files (lowercase)
};

// Sound file mappings - filename without extension
const soundFiles = {
  grab: 'grab-pop',
  edit: 'echo-button',
  delete: 'sweet-error',
  dragStart: 'pop-on',
  drop: 'paste-drop',
  copy: 'download',
  hover: 'scroll-haptic',
  compile: 'KidsCheer',
  cardHover: 'scroll-haptic',
  popOn: 'pop-on',
  popOff: 'pop-off',
  error: 'error-banjo',
  processing: 'thinking-ambient',
  ready: 'computer-ready',
  undo: 'undo',
  popup: 'pop-up-warm'
};

// Initialize sound settings from localStorage
function initSoundSettings() {
  logger.info('Sound service initializing');
  
  // Keep sounds enabled by default for now, but still check localStorage
  if (typeof localStorage !== 'undefined') {
    // Only disable if explicitly set to false
    const storedValue = localStorage.getItem('lineSnap-sounds-enabled');
    if (storedValue === 'false') {
      soundsEnabled = false;
    }
  }
  
  // Use the eventBridge to listen for setting changes
  // This handles both 'linesnap-setting-changed' and 'talktype-setting-changed' events
  const removeListener = eventBridge.addSettingChangeListener('sounds', (value) => {
    soundsEnabled = value;
    logger.info('Sound settings changed:', soundsEnabled);
  });
  
  // Make soundsEnabled available globally for debugging
  if (typeof window !== 'undefined') {
    window.soundsEnabled = soundsEnabled;
    logger.info('Sound effects enabled:', soundsEnabled);
  }
}

/**
 * Generic function to play any sound file with configurable parameters
 * @param {string} soundName - The name of the sound from the soundFiles object
 * @param {Object} options - Optional configuration options
 * @param {number} options.volume - Volume from 0 to 1 (overrides default)
 * @param {number} options.delay - Delay in seconds before playing (overrides default)
 * @returns {Promise<void>} - Resolves when sound finishes playing or rejects on error
 */
function playSound(soundName, options = {}) {
  // Skip if sounds are disabled or audio not supported
  if (!soundsEnabled || !hasAudioSupport) {
    return Promise.resolve();
  }
  
  // If sound name isn't in our mapping, log an error
  if (!soundFiles[soundName]) {
    logger.warn(`Sound "${soundName}" not found in sound library`);
    return Promise.reject(new Error(`Sound "${soundName}" not found`));
  }
  
  // Merge default config with provided options
  const config = {
    volume: options.volume ?? defaultConfig.volume,
    delay: options.delay ?? defaultConfig.delay
  };
  
  // Build file path
  const filePath = `${defaultConfig.basePath}${soundFiles[soundName]}.mp3`;
  
  return new Promise((resolve, reject) => {
    try {
      // Create audio element
      const audio = new Audio(filePath);
      audio.volume = config.volume;
      
      // Setup event listeners
      audio.addEventListener('ended', () => {
        resolve();
      });
      
      audio.addEventListener('error', (error) => {
        logger.warn(`Error playing sound "${soundName}":`, error);
        reject(error);
      });
      
      // Play with delay
      setTimeout(() => {
        audio.play().catch(error => {
          logger.warn(`Error playing sound "${soundName}":`, error);
          reject(error);
        });
      }, config.delay * 1000);
    } catch (error) {
      logger.warn('Audio playback error:', error);
      reject(error);
    }
  });
}

// Named sound effect functions for specific interactions
function playGrabSound() {
  return playSound('grab');
}

function playEditSound() {
  return playSound('edit');
}

function playDeleteSound() {
  return playSound('delete');
}

function playDragStartSound() {
  return playSound('dragStart');
}

function playDropSound() {
  return playSound('drop');
}

function playCopySound() {
  return playSound('copy');
}

function playHoverSound() {
  return playSound('hover', { volume: 0.1 }); // Quieter for hover
}

function playCompileSound() {
  return playSound('compile', { delay: 0.6 }); // Kids cheering with 0.6s delay - KEEP THIS DELAY
}

function playCardHoverSound() {
  return playSound('cardHover', { volume: 0.05 }); // Very quiet for card hover
}

function playPopOnSound() {
  return playSound('popOn');
}

function playPopOffSound() {
  return playSound('popOff');
}

function playErrorSound() {
  return playSound('error');
}

function playProcessingSound() {
  return playSound('processing');
}

function playReadySound() {
  return playSound('ready');
}

function playUndoSound() {
  return playSound('undo');
}

function playPopupSound() {
  return playSound('popup');
}

// Check if sounds are enabled
function isSoundEnabled() {
  return soundsEnabled;
}

// Set sound enabled state
function setSoundEnabled(enabled) {
  soundsEnabled = enabled;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('lineSnap-sounds-enabled', enabled.toString());
    
    // Dispatch setting change event using the eventBridge
    // This will dispatch both 'linesnap-setting-changed' and 'talktype-setting-changed' events
    eventBridge.dispatchSettingChanged('sounds', enabled);
  }
}

// Export the sound service functions
export const soundService = {
  init: initSoundSettings,
  isSoundEnabled,
  setSoundEnabled,
  
  // Generic sound player
  playSound,
  
  // Specific sound functions
  playGrabSound,
  playEditSound,
  playDeleteSound,
  playDragStartSound,
  playDropSound,
  playCopySound,
  playHoverSound,
  playCompileSound,
  playCardHoverSound,
  playPopOnSound,
  playPopOffSound,
  playErrorSound,
  playProcessingSound,
  playReadySound,
  playUndoSound,
  playPopupSound
};