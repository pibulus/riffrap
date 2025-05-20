/**
 * AudioService_Platform.js
 * 
 * Platform-specific code for the AudioService.
 * This module handles the differences between platforms (iOS vs standard browsers)
 * and provides a unified API for platform detection and initialization.
 * 
 * Dependencies:
 * - errorHandler: For standardized error handling
 * - UIError: For structured error creation
 * - createLogger: For logging platform-specific issues
 */

import { errorHandler, UIError } from '../infrastructure/errorHandler';
import { createLogger } from '../infrastructure/loggerService';
import { AudioStates } from './audioStates';

const logger = createLogger('AudioService:Platform');

/**
 * Detects if the current device is running iOS
 * 
 * @returns {boolean} True if the device is running iOS
 */
export function isIOS() {
  return typeof window !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent);
}

/**
 * Initializes or resumes the AudioContext
 * Different browsers have different AudioContext implementations
 * 
 * @param {AudioContext} existingContext - An existing AudioContext if available
 * @returns {Promise<boolean>} Whether the audio context is running
 */
export async function initializeAudioContext(existingContext) {
  let audioContext = existingContext;

  if (!audioContext && typeof window !== 'undefined') {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
  }

  if (audioContext?.state === 'suspended') {
    await audioContext.resume();
  }

  return { 
    isReady: audioContext?.state === 'running',
    audioContext
  };
}

/**
 * Checks if the MediaDevices API is available in this browser
 * 
 * @returns {Promise<boolean>} Whether the MediaDevices API is available
 */
export async function checkMediaDevices() {
  if (typeof window === 'undefined') return false;
  if (!navigator?.mediaDevices?.getUserMedia) return false;
  return true;
}

/**
 * Requests microphone permissions with platform-specific handling
 * iOS has special requirements for audio permissions
 * 
 * @param {Object} options - Options for permission request
 * @param {AudioContext} options.audioContext - The audio context to use 
 * @param {boolean} options.isIOSDevice - Whether this is an iOS device
 * @returns {Promise<Object>} Result object with granted status and stream or error
 */
export async function requestPermissions(options) {
  const { audioContext, isIOSDevice } = options;
  
  try {
    if (!(await checkMediaDevices())) {
      const error = new UIError('MediaDevices API not available', {
        code: 'ERR_AUDIO_MEDIADEVICES_UNSUPPORTED',
        isOperational: true
      });
      
      logger.error('MediaDevices API not available', {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
      });
      
      throw error;
    }

    // iOS-specific permission handling
    if (isIOSDevice) {
      return await requestIOSPermissions({ audioContext });
    }

    // Standard browser permission handling
    return await requestStandardPermissions();
  } catch (error) {
    // If it's already a UIError, don't wrap it
    const uiError = error instanceof UIError 
      ? error 
      : new UIError('Error requesting audio permissions', {
          code: 'ERR_AUDIO_PERMISSION_REQUEST',
          context: { originalError: error.message }
        });
    
    logger.error('Error requesting audio permissions', { 
      errorMessage: error.message,
      errorType: error.constructor.name
    });
    
    return { granted: false, error: uiError };
  }
}

/**
 * iOS-specific permission handling
 * iOS requires special handling for audio permissions
 * 
 * @param {Object} options - Options for iOS permissions
 * @param {AudioContext} options.audioContext - The audio context to use
 * @returns {Promise<Object>} Result with granted status and stream or error
 */
async function requestIOSPermissions({ audioContext }) {
  const contextReady = audioContext?.state === 'running';
  if (!contextReady) {
    throw new UIError('Failed to initialize audio context', {
      code: 'ERR_AUDIO_CONTEXT_INIT',
      context: { platform: 'iOS' }
    });
  }

  const constraints = {
    audio: {
      echoCancellation: true,
      autoGainControl: true,
      noiseSuppression: true
    }
  };

  try {
    logger.info('Requesting iOS audio permissions with enhanced constraints');
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    if (stream && stream.active) {
      logger.info('iOS audio permissions granted with enhanced constraints');
      return { granted: true, stream };
    } else {
      stream?.getTracks().forEach((track) => track.stop());
      const error = new UIError('No active audio stream after permission', {
        code: 'ERR_AUDIO_STREAM_INACTIVE',
        context: { platform: 'iOS', constraints: 'enhanced' }
      });
      logger.warn('iOS stream inactive despite permissions', { constraints });
      return { granted: false, error };
    }
  } catch (iosSpecificError) {
    logger.warn('iOS specific constraints failed, trying fallback', { 
      errorMessage: iosSpecificError.message
    });
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (stream && stream.active) {
        logger.info('iOS audio permissions granted with fallback constraints');
        return { granted: true, stream };
      } else {
        stream?.getTracks().forEach((track) => track.stop());
        const error = new UIError('No active audio stream after fallback permission', {
          code: 'ERR_AUDIO_STREAM_INACTIVE',
          context: { platform: 'iOS', constraints: 'fallback' }
        });
        logger.warn('iOS fallback stream inactive despite permissions');
        return { granted: false, error };
      }
    } catch (iosFallbackError) {
      const error = new UIError('iOS microphone permission denied', {
        code: 'ERR_AUDIO_PERMISSION_DENIED',
        context: { 
          platform: 'iOS',
          originalError: iosFallbackError.message
        }
      });
      logger.error('iOS microphone permission denied', { errorMessage: iosFallbackError.message });
      return { granted: false, error };
    }
  }
}

/**
 * Standard browser permission handling
 * Used for non-iOS browsers
 * 
 * @returns {Promise<Object>} Result with granted status and stream or error
 */
async function requestStandardPermissions() {
  try {
    logger.info('Requesting audio permissions with quality constraints');
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      }
    });
    if (stream && stream.active) {
      logger.info('Audio permissions granted with quality constraints');
      return { granted: true, stream };
    } else {
      stream?.getTracks().forEach((track) => track.stop());
      const error = new UIError('No active audio stream after permission', {
        code: 'ERR_AUDIO_STREAM_INACTIVE',
        context: { constraints: 'quality' }
      });
      logger.warn('Stream inactive despite quality permissions');
      return { granted: false, error };
    }
  } catch (detailedConstraintError) {
    logger.warn('Detailed constraints failed, falling back to simple audio', { 
      errorMessage: detailedConstraintError.message
    });
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (stream && stream.active) {
        logger.info('Audio permissions granted with fallback constraints');
        return { granted: true, stream };
      } else {
        stream?.getTracks().forEach((track) => track.stop());
        const error = new UIError('No active audio stream after fallback permission', {
          code: 'ERR_AUDIO_STREAM_INACTIVE',
          context: { constraints: 'fallback' }
        });
        logger.warn('Fallback stream inactive despite permissions');
        return { granted: false, error };
      }
    } catch (fallbackError) {
      const error = new UIError('Microphone permission denied', {
        code: 'ERR_AUDIO_PERMISSION_DENIED',
        context: { originalError: fallbackError.message }
      });
      logger.error('Microphone permission denied', { errorMessage: fallbackError.message });
      return { granted: false, error };
    }
  }
}