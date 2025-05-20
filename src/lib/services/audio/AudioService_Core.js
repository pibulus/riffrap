/**
 * AudioService_Core.js
 * 
 * Core definitions and state management for the AudioService.
 * This module contains the essential imports, constants, and state management
 * functionality used by the AudioService.
 * 
 * Dependencies:
 * - AudioStates: State machine constants
 * - Infrastructure stores: For sharing state across components
 * - EventBridge: For dispatching audio events
 * - LoggerService: For logging
 * - ErrorHandler: For standardized error handling
 */

import { AudioStateManager, AudioStates } from './audioStates';
import { audioState, audioActions, uiActions } from '../infrastructure/stores';
import { get } from 'svelte/store';
import { errorHandler, UIError } from '../infrastructure/errorHandler';
import { createLogger } from '../infrastructure/loggerService';
import { eventBridge } from '../infrastructure/eventBridge';

// Create logger for this module
const logger = createLogger('AudioService');

// Audio event types used for application-wide communication
export const AudioEvents = {
  RECORDING_STARTED: 'audio:recordingStarted',
  RECORDING_STOPPED: 'audio:recordingStopped',
  RECORDING_ERROR: 'audio:recordingError',
  STATE_CHANGED: 'audio:stateChanged',
  WAVEFORM_DATA: 'audio:waveformData'
};

/**
 * Creates a new instance of the AudioService state manager
 * This handles state transitions with proper notification
 * 
 * @returns {AudioStateManager} Configured state manager with listeners
 */
export function createStateManager() {
  const stateManager = new AudioStateManager();
    
  stateManager.addListener(({ oldState, newState, error }) => {
    logger.info(`Audio state changed: ${oldState} -> ${newState}`);
    
    // Update the store instead of emitting event
    audioActions.updateState(newState, error);
    
    // Also dispatch event through event bridge for other components
    eventBridge.dispatchAppEvent('audio-state-changed', {
      oldState,
      newState,
      error: error ? error.message : null
    });
    
    // If there's an error, handle it
    if (error) {
      errorHandler.handleError(
        new UIError(`Audio error: ${error.message}`, {
          code: 'ERR_AUDIO_STATE',
          context: { 
            oldState, 
            newState,
            originalError: error.message
          }
        }),
        {
          notify: true,
          rethrow: false
        }
      );
    }
  });

  return stateManager;
}

// Export AudioStates directly for convenience
export { AudioStates };