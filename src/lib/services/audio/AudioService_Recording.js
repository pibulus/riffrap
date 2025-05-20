/**
 * AudioService_Recording.js
 * 
 * Recording lifecycle management for the AudioService.
 * This module handles starting, stopping, and cleaning up audio recordings.
 * 
 * Dependencies:
 * - errorHandler: For standardized error handling
 * - UIError: For structured error creation
 * - AudioStates: State machine constants
 * - createLogger: For logging
 * - eventBridge: For dispatching audio events
 * - audioState/audioActions/uiActions: For state management
 */

import { errorHandler, UIError } from '../infrastructure/errorHandler';
import { createLogger } from '../infrastructure/loggerService';
import { AudioStates } from './audioStates';
import { eventBridge } from '../infrastructure/eventBridge';
import { audioState, audioActions, uiActions } from '../infrastructure/stores';

const logger = createLogger('AudioService:Recording');

/**
 * Starts a new audio recording session
 * 
 * @param {Object} context - The AudioService context
 * @param {function} context.initializeVisualization - Function to initialize visualization
 * @returns {Promise<boolean>} True if recording started successfully
 */
export async function startRecording(context) {
  const {
    stateManager,
    requestPermissions,
    isIOSDevice,
    audioContext,
    cleanup,
    initializeVisualization,
    streamRef,
    mediaRecorderRef,
    audioChunksRef,
  } = context;

  try {
    if (stateManager.getState() !== AudioStates.IDLE) {
      logger.info('Recording already in progress, cleaning up first');
      await cleanup();
    }
    
    stateManager.setState(AudioStates.INITIALIZING);
    stateManager.setState(AudioStates.REQUESTING_PERMISSIONS);
    
    const { granted, stream, error } = await requestPermissions({
      audioContext,
      isIOSDevice
    });

    if (!granted) {
      stateManager.setState(AudioStates.PERMISSION_DENIED);
      uiActions.setPermissionError(true);
      
      // Dispatch permission denied event
      eventBridge.dispatchAppEvent('audio-permission-denied', {
        error: error?.message || 'Permission not granted'
      });
      
      throw error || new UIError('Microphone permission not granted', {
        code: 'ERR_AUDIO_PERMISSION_DENIED',
        isOperational: true // User can fix this by granting permission
      });
    }

    if (!stream) {
      throw new UIError('No audio stream available', {
        code: 'ERR_AUDIO_NO_STREAM',
        isOperational: false // This is unexpected
      });
    }

    stateManager.setState(AudioStates.READY);
    audioChunksRef.current = [];

    if (typeof MediaRecorder === 'undefined') {
      throw new UIError('MediaRecorder not supported in this browser', {
        code: 'ERR_AUDIO_MEDIARECORDER_UNSUPPORTED',
        context: { 
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
        },
        isOperational: true // User can fix by using a supported browser
      });
    }

    try {
      const mimeTypes = isIOSDevice
        ? ['audio/mp4', 'audio/aac', 'audio/webm', '']
        : ['audio/webm', 'audio/ogg', ''];

      let mediaRecorderOptions = null;
      let selectedMimeType = '';

      for (const mimeType of mimeTypes) {
        if (!mimeType || MediaRecorder.isTypeSupported(mimeType)) {
          mediaRecorderOptions = mimeType ? { mimeType } : undefined;
          selectedMimeType = mimeType || 'default';
          break;
        }
      }
      
      logger.info('Creating MediaRecorder', { 
        mimeType: selectedMimeType, 
        isIOS: isIOSDevice 
      });

      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream, mediaRecorderOptions);

      // Initialize audio analysis
      const { audioContext: updatedContext, analyser } = await initializeVisualization(stream, audioContext);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          logger.debug('Received audio chunk', { 
            size: event.data.size, 
            totalChunks: audioChunksRef.current.length 
          });
        }
      };
      
      mediaRecorderRef.current.start(1000);
      stateManager.setState(AudioStates.RECORDING);
      logger.info('Started recording audio');
      
      // Dispatch recording started event
      eventBridge.dispatchAppEvent('audio-recording-started', {
        mimeType: mediaRecorderRef.current.mimeType || 'audio/webm',
        timestamp: Date.now()
      });
      
      // Update the store with mimeType
      audioState.update(current => ({
        ...current,
        mimeType: mediaRecorderRef.current.mimeType || 'audio/webm'
      }));
      
      return true;
    } catch (mrError) {
      logger.error('Error setting up MediaRecorder', { 
        error: mrError.message 
      });
      
      // Make sure to clean up stream
      stream.getTracks().forEach((track) => track.stop());
      
      throw new UIError('Failed to create audio recorder', {
        code: 'ERR_AUDIO_MEDIARECORDER_SETUP',
        context: { originalError: mrError.message }
      });
    }
  } catch (error) {
    // If it's not already a UIError, create one
    const uiError = error instanceof UIError
      ? error
      : new UIError('Error starting recording', {
          code: 'ERR_AUDIO_RECORDING_START',
          context: { originalError: error.message }
        });
    
    // Log the error
    logger.error('Error starting recording', { 
      errorMessage: error.message,
      errorType: error.constructor.name,
      errorCode: uiError.code
    });
    
    // Update state to error
    stateManager.setState(AudioStates.ERROR, { error: uiError });
    
    // Dispatch error event
    eventBridge.dispatchAppEvent('audio-recording-error', {
      error: uiError.message,
      code: uiError.code,
      timestamp: Date.now()
    });
    
    // Handle the error through error handler
    errorHandler.handleError(uiError, {
      notify: true,
      emitEvent: true
    });
    
    // Clean up any resources
    await cleanup();
    
    // Rethrow the error
    throw uiError;
  }
}

/**
 * Stops the current audio recording session
 * 
 * @param {Object} context - The AudioService context
 * @returns {Promise<Blob|null>} The recorded audio blob or null if failed
 */
export async function stopRecording(context) {
  const {
    stateManager,
    mediaRecorderRef,
    streamRef,
    audioChunksRef,
  } = context;

  return new Promise((resolve) => {
    // Update recording state to STOPPING
    audioActions.updateState(AudioStates.STOPPING);
    logger.info('Stopping recording');
    
    // Check recorder state - attempt to stop even if internal state doesn't match
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      logger.warn('No active MediaRecorder to stop', {
        hasRecorder: !!mediaRecorderRef.current,
        state: mediaRecorderRef.current?.state || 'null'
      });
      stateManager.setState(AudioStates.IDLE);
      resolve(null); // No active recording to stop
      return;
    }

    // The mimeType should be determined before onstop is set up.
    const mimeType = mediaRecorderRef.current.mimeType || 'audio/webm';
    logger.info('Preparing to stop recording', { mimeType });
    
    mediaRecorderRef.current.onstop = () => {
      try {
        // Create the Blob from audioChunksRef.current, which now contains all chunks
        // including the final one from the last dataavailable event.
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        logger.info('Recording stopped successfully', { 
          blobSize: audioBlob.size, 
          mimeType, 
          chunks: audioChunksRef.current.length 
        });
        
        // Update store with audio blob
        audioActions.setAudioBlob(audioBlob, mimeType);
        
        // Dispatch recording stopped event
        eventBridge.dispatchAppEvent('audio-recording-stopped', {
          mimeType,
          size: audioBlob.size,
          chunks: audioChunksRef.current.length,
          timestamp: Date.now()
        });
        
        // Immediately stop all tracks to ensure browser recording indicator is removed
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => {
            track.stop();
          });
          // Clear the stream reference
          streamRef.current = null;
        }
        
        audioChunksRef.current = [];
        mediaRecorderRef.current = null;
        
        // Ensure state is properly reset
        stateManager.setState(AudioStates.IDLE);
        
        resolve(audioBlob);
      } catch (blobError) {
        // Handle any errors creating the blob
        const uiError = new UIError('Error creating audio blob', {
          code: 'ERR_AUDIO_BLOB_CREATION',
          context: { originalError: blobError.message, mimeType }
        });
        
        logger.error('Error creating audio blob', { 
          error: blobError.message,
          mimeType,
          chunks: audioChunksRef.current.length
        });
        
        errorHandler.handleError(uiError, {
          notify: true,
          emitEvent: true
        });
        
        // Clean up resources
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => {
            track.stop();
          });
          streamRef.current = null;
        }
        
        audioChunksRef.current = [];
        mediaRecorderRef.current = null;
        stateManager.setState(AudioStates.IDLE);
        
        resolve(null);
      }
    };

    try {
      mediaRecorderRef.current.stop();
    } catch (error) {
      const uiError = new UIError('Error stopping recording', {
        code: 'ERR_AUDIO_RECORDING_STOP',
        context: { originalError: error.message }
      });
      
      logger.warn('Error stopping MediaRecorder', { 
        error: error.message,
        state: mediaRecorderRef.current.state
      });
      
      errorHandler.handleError(uiError, {
        notify: true,
        emitEvent: true
      });
      
      // Ensure tracks are stopped even if MediaRecorder stop fails
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        streamRef.current = null;
      }
      
      // Force state reset on error
      stateManager.setState(AudioStates.IDLE);
      resolve(null);
    }
  });
}

/**
 * Cleans up audio resources including stream, context, and recorder
 * 
 * @param {Object} context - The AudioService context
 * @returns {Promise<void>} Promise that resolves when cleanup is complete
 */
export async function cleanup(context) {
  const {
    stateManager,
    isIOSDevice,
    animationFrameIdRef,
    streamRef,
    mediaRecorderRef,
    audioChunksRef,
    analyserRef,
    audioContextRef,
    cleanupPromiseRef,
  } = context;

  if (animationFrameIdRef.current) {
    cancelAnimationFrame(animationFrameIdRef.current);
    animationFrameIdRef.current = null;
  }
  
  if (cleanupPromiseRef.current) {
    return cleanupPromiseRef.current;
  }

  const currentState = stateManager.getState();
  const allowedCleanupStates = [
    AudioStates.RECORDING,
    AudioStates.STOPPING,
    AudioStates.ERROR,
    AudioStates.PAUSED
  ];

  if (!allowedCleanupStates.includes(currentState) && currentState !== AudioStates.IDLE) {
    return Promise.resolve();
  }

  if (currentState === AudioStates.IDLE && 
      !mediaRecorderRef.current && 
      !streamRef.current && 
      !audioContextRef.current) {
    return Promise.resolve();
  }

  stateManager.setState(AudioStates.CLEANING);
  cleanupPromiseRef.current = doCleanup(context).finally(() => {
    cleanupPromiseRef.current = null;
  });

  return cleanupPromiseRef.current;
}

/**
 * Internal cleanup implementation
 * 
 * @param {Object} context - The AudioService context
 * @returns {Promise<void>} Promise that resolves when cleanup is complete
 */
async function doCleanup(context) {
  const {
    stateManager,
    isIOSDevice,
    mediaRecorderRef,
    streamRef,
    audioChunksRef,
    analyserRef,
    audioContextRef,
  } = context;

  try {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve();
        }, 1000);

        mediaRecorderRef.current.onstop = () => {
          clearTimeout(timeout);
          resolve();
        };

        try {
          mediaRecorderRef.current.stop();
        } catch (stopError) {
          console.warn('Error stopping MediaRecorder:', stopError.message);
          resolve();
        }
      });
    }

    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      await Promise.all(
        tracks.map((track) => {
          return new Promise((resolve) => {
            track.onended = resolve;
            track.stop();
            setTimeout(resolve, 500);
          });
        })
      );
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      if (analyserRef.current) {
        try {
          analyserRef.current.disconnect();
        } catch (analyserError) {
          console.warn('Error disconnecting analyser:', analyserError.message);
        }
        analyserRef.current = null;
      }

      if (isIOSDevice) {
        try {
          await audioContextRef.current.suspend();
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (suspendError) {
          console.warn('Error suspending iOS audio context:', suspendError.message);
        }
      }

      try {
        await audioContextRef.current.close();
      } catch (closeError) {
        console.warn('Error closing audio context:', closeError.message);
      }
      audioContextRef.current = null;
    }

    mediaRecorderRef.current = null;
    audioChunksRef.current = [];

    if (isIOSDevice) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  } finally {
    stateManager.setState(AudioStates.IDLE);
  }
}