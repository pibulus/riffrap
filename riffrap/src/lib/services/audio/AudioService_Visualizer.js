/**
 * AudioService_Visualizer.js
 * 
 * Audio visualization functionality for the AudioService.
 * This module handles audio analysis and waveform generation for visualization.
 * 
 * Dependencies:
 * - createLogger: For logging
 * - audioActions: For updating waveform data in stores
 * - AudioStates: For checking recording state
 */

import { createLogger } from '../infrastructure/loggerService';
import { audioActions } from '../infrastructure/stores';
import { AudioStates } from './audioStates';

const logger = createLogger('AudioService:Visualizer');

/**
 * Initializes audio visualization components
 * Creates and connects an analyzer to the audio stream
 * 
 * @param {MediaStream} stream - The audio stream to analyze
 * @param {AudioContext} existingContext - An existing audio context if available
 * @returns {Promise<Object>} The initialized audioContext and analyser
 */
export async function initializeVisualization(stream, existingContext) {
  let audioContext = existingContext;

  if (!audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
    logger.info('Created new AudioContext for visualization');
  }
  
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  source.connect(analyser);
  
  logger.info('Audio visualization initialized');
  
  return { audioContext, analyser };
}

/**
 * Starts monitoring the audio waveform
 * Continuously samples the audio data and updates the store
 * 
 * @param {Object} context - The AudioService context
 * @returns {void}
 */
export function startWaveformMonitoring(context) {
  const { analyserRef, stateManager, animationFrameIdRef } = context;
  
  if (!analyserRef.current) {
    logger.warn('Cannot start waveform monitoring: no analyser available');
    return;
  }
  
  const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
  
  const updateWaveform = () => {
    if (stateManager.getState() !== AudioStates.RECORDING) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
      return;
    }
    
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Update store instead of emitting event
    audioActions.setWaveformData(Array.from(dataArray));
    
    animationFrameIdRef.current = requestAnimationFrame(updateWaveform);
  };
  
  animationFrameIdRef.current = requestAnimationFrame(updateWaveform);
  logger.info('Started waveform monitoring');
}

/**
 * Stops the waveform monitoring
 * Cancels the animation frame to stop updates
 * 
 * @param {Object} context - The AudioService context
 * @returns {void}
 */
export function stopWaveformMonitoring(context) {
  const { animationFrameIdRef } = context;
  
  if (animationFrameIdRef.current) {
    cancelAnimationFrame(animationFrameIdRef.current);
    animationFrameIdRef.current = null;
    logger.info('Stopped waveform monitoring');
  }
}