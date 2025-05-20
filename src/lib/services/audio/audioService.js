/**
 * audioService.js
 * 
 * Main audio service file that coordinates all audio functionality.
 * This file integrates the modular components into a unified API.
 * 
 * The audio service has been modularized into the following components:
 * - AudioService_Core.js: Core definitions and state management
 * - AudioService_Platform.js: Platform-specific code
 * - AudioService_Recording.js: Recording lifecycle methods
 * - AudioService_Visualizer.js: Audio visualization and analysis
 * 
 * This modularization improves maintainability, testability, and separation of concerns.
 */

// Import core components and state management
import { AudioStates, AudioEvents, createStateManager } from './AudioService_Core';

// Import platform detection and handling
import { 
  isIOS as detectIOS,
  initializeAudioContext, 
  checkMediaDevices,
  requestPermissions 
} from './AudioService_Platform';

// Import recording lifecycle management
import { 
  startRecording as startRecordingImpl,
  stopRecording as stopRecordingImpl,
  cleanup as cleanupImpl
} from './AudioService_Recording';

// Import visualization processing
import { 
  initializeVisualization,
  startWaveformMonitoring,
  stopWaveformMonitoring
} from './AudioService_Visualizer';

/**
 * AudioService class
 * Provides a unified API for audio recording and processing
 */
export class AudioService {
  constructor() {
    // Set up reference objects for module communication
    this.streamRef = { current: null };
    this.mediaRecorderRef = { current: null };
    this.audioChunksRef = { current: [] };
    this.audioContextRef = { current: null };
    this.analyserRef = { current: null };
    this.animationFrameIdRef = { current: null };
    this.cleanupPromiseRef = { current: null };
    
    // Set up state management
    this.stateManager = createStateManager();
    
    // Detect platform
    this.isIOSDevice = detectIOS();
  }
  
  /**
   * Starts audio recording
   * @returns {Promise<boolean>} True if recording started successfully
   */
  async startRecording() {
    const context = {
      stateManager: this.stateManager,
      requestPermissions,
      isIOSDevice: this.isIOSDevice,
      audioContext: this.audioContextRef.current,
      cleanup: this.cleanup.bind(this),
      initializeVisualization: async (stream, audioContext) => {
        const { audioContext: updatedContext, analyser } = await initializeVisualization(stream, audioContext);
        this.audioContextRef.current = updatedContext;
        this.analyserRef.current = analyser;
        
        // Start waveform monitoring
        startWaveformMonitoring({
          analyserRef: this.analyserRef,
          stateManager: this.stateManager,
          animationFrameIdRef: this.animationFrameIdRef
        });
        
        return { audioContext: updatedContext, analyser };
      },
      streamRef: this.streamRef,
      mediaRecorderRef: this.mediaRecorderRef,
      audioChunksRef: this.audioChunksRef,
    };
    
    return startRecordingImpl(context);
  }
  
  /**
   * Stops the current recording
   * @returns {Promise<Blob|null>} The recorded audio blob or null if failed
   */
  async stopRecording() {
    const context = {
      stateManager: this.stateManager,
      mediaRecorderRef: this.mediaRecorderRef,
      streamRef: this.streamRef,
      audioChunksRef: this.audioChunksRef,
    };
    
    return stopRecordingImpl(context);
  }
  
  /**
   * Cleans up all audio resources
   * @returns {Promise<void>}
   */
  async cleanup() {
    const context = {
      stateManager: this.stateManager,
      isIOSDevice: this.isIOSDevice,
      animationFrameIdRef: this.animationFrameIdRef,
      streamRef: this.streamRef,
      mediaRecorderRef: this.mediaRecorderRef,
      audioChunksRef: this.audioChunksRef,
      analyserRef: this.analyserRef,
      audioContextRef: this.audioContextRef,
      cleanupPromiseRef: this.cleanupPromiseRef,
    };
    
    return cleanupImpl(context);
  }
  
  /**
   * Gets the current recording state
   * @returns {string} The current state
   */
  getRecordingState() {
    return this.stateManager.getState();
  }
  
  /**
   * Checks if recording is in progress
   * @returns {boolean} True if currently recording
   */
  isRecording() {
    return this.stateManager.getState() === AudioStates.RECORDING;
  }
}

// Export the singleton instance
export const audioService = new AudioService();

// Re-export AudioStates and AudioEvents for consumers
export { AudioStates, AudioEvents };