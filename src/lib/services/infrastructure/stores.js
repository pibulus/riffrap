import { writable, derived, get } from 'svelte/store';
import { AudioStates } from '../audio/audioStates';
import { ANIMATION } from '$lib/constants';

// Core audio state store
export const audioState = writable({
  state: AudioStates.IDLE,
  error: null,
  previousState: null,
  timestamp: Date.now(),
  mimeType: null,
  waveformData: []
});

// Recording state
export const recordingState = writable({
  isRecording: false,
  duration: 0,
  audioBlob: null,
  audioURL: null
});

// Transcription state
export const transcriptionState = writable({
  inProgress: false,
  progress: 0,
  text: '',
  error: null,
  timestamp: null,
  rerolling: false // Flag to indicate re-rolling state for UI animations
});

// UI state
export const uiState = writable({
  clipboardSuccess: false,
  lyricsCollected: false, // New state for lyrics collection
  errorMessage: '',
  showPermissionError: false,
  transcriptionCopied: false,
  screenReaderMessage: ''
});

// User options
export const userPreferences = writable({
  isPremiumUser: false,
  promptStyle: 'standard'
});

// Derived stores for easier consumption
export const isRecording = derived(
  audioState,
  $audioState => $audioState.state === AudioStates.RECORDING
);

export const isTranscribing = derived(
  transcriptionState,
  $state => $state.inProgress
);

export const transcriptionProgress = derived(
  transcriptionState,
  $state => $state.progress
);

export const transcriptionText = derived(
  transcriptionState,
  $state => $state.text
);

export const hasPermissionError = derived(
  audioState,
  $state => $state.state === AudioStates.PERMISSION_DENIED
);

export const recordingDuration = derived(
  recordingState,
  $state => $state.duration
);

export const errorMessage = derived(
  uiState,
  $state => $state.errorMessage
);

export const waveformData = derived(
  audioState,
  $state => $state.waveformData || []
);

// Action functions to update the stores
export const audioActions = {
  updateState(state, error = null) {
    audioState.update(current => ({
      ...current,
      previousState: current.state,
      state,
      error,
      timestamp: Date.now()
    }));
    
    // Update recording state when audio state changes
    if (state === AudioStates.RECORDING) {
      recordingState.update(current => ({ ...current, isRecording: true }));
      this.startRecordingTimer();
    } else if (state !== AudioStates.RECORDING) {
      recordingState.update(current => ({ ...current, isRecording: false }));
      this.stopRecordingTimer();
    }
  },
  
  setWaveformData(dataArray) {
    audioState.update(current => ({
      ...current,
      waveformData: dataArray
    }));
  },
  
  setAudioBlob(blob, mimeType) {
    recordingState.update(current => ({
      ...current,
      audioBlob: blob
    }));
    
    if (mimeType) {
      audioState.update(current => ({
        ...current,
        mimeType
      }));
    }
  },
  
  // Timer management for recording duration
  recordingTimer: null,
  startTime: null,
  
  startRecordingTimer() {
    this.stopRecordingTimer();
    this.startTime = Date.now();
    recordingState.update(current => ({ ...current, duration: 0 }));
    
    this.recordingTimer = setInterval(() => {
      const elapsed = Date.now() - this.startTime;
      // Use float for more precise duration - will appear smoother in UI
      const duration = elapsed / 1000;
      
      recordingState.update(current => ({ 
        ...current, 
        duration 
      }));
      
      // Check if we've reached the time limit (still use integer for the limit check)
      const isPremium = get(userPreferences).isPremiumUser;
      const timeLimit = isPremium 
        ? ANIMATION.RECORDING.PREMIUM_LIMIT 
        : ANIMATION.RECORDING.FREE_LIMIT;
        
      if (Math.floor(duration) >= timeLimit) {
        // Signal that recording should stop due to time limit
        this.recordingTimeLimitReached();
      }
    }, 50); // Update 20 times per second for ultra-smooth animation
  },
  
  stopRecordingTimer() {
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }
  },
  
  recordingTimeLimitReached() {
    // This function can be subscribed to for stopping recording
    audioState.update(current => ({
      ...current,
      timeLimit: true
    }));
    
    // For reliable auto-stop, we also immediately update the recording state 
    // so that subscribers can react to it
    import('./loggerService').then(({ createLogger }) => {
      const storeLogger = createLogger('Stores');
      storeLogger.warn('⏱️ Recording time limit reached, signaling automatic stop');
    });
  }
};

export const transcriptionActions = {
  startTranscribing() {
    transcriptionState.update(current => ({
      ...current,
      inProgress: true,
      progress: 0,
      error: null,
      timestamp: Date.now()
    }));
  },
  
  updateProgress(progress) {
    transcriptionState.update(current => ({
      ...current,
      progress: Math.min(progress, 100)
    }));
  },
  
  completeTranscription(text) {
    const currentTime = Date.now();
    
    // Add a small delay to ensure UI updates properly
    setTimeout(() => {
      transcriptionState.update(current => ({
        ...current,
        inProgress: false,
        progress: 100,
        text,
        timestamp: currentTime
      }));
      
      // Log to help with debugging
      import('./loggerService').then(({ createLogger }) => {
        const storeLogger = createLogger('Stores');
        storeLogger.info('completeTranscription called with text length:', text?.length || 0);
      });
    }, 50);
  },
  
  setTranscriptionError(error) {
    transcriptionState.update(current => ({
      ...current,
      inProgress: false,
      error
    }));
    
    uiState.update(current => ({
      ...current,
      errorMessage: `Transcription error: ${error || 'Unknown error'}`
    }));
  }
};

export const uiActions = {
  setErrorMessage(message) {
    uiState.update(current => ({
      ...current,
      errorMessage: message
    }));
  },
  
  clearErrorMessage() {
    uiState.update(current => ({
      ...current,
      errorMessage: ''
    }));
  },
  
  setPermissionError(show) {
    uiState.update(current => ({
      ...current,
      showPermissionError: show
    }));
  },
  
  showClipboardSuccess(duration = ANIMATION.COPY.SUCCESS_TIMER) {
    uiState.update(current => ({ 
      ...current, 
      clipboardSuccess: true,
      transcriptionCopied: true
    }));
    
    setTimeout(() => {
      uiState.update(current => ({ 
        ...current, 
        clipboardSuccess: false 
      }));
    }, duration);
  },
  
  showLyricsCollected(duration = ANIMATION.COPY.SUCCESS_TIMER) {
    uiState.update(current => ({ 
      ...current, 
      lyricsCollected: true 
    }));
    
    setTimeout(() => {
      uiState.update(current => ({ 
        ...current, 
        lyricsCollected: false 
      }));
    }, duration);
  },
  
  setScreenReaderMessage(message) {
    uiState.update(current => ({
      ...current,
      screenReaderMessage: message
    }));
  }
};

// Reset function for when component unmounts
export function resetStores() {
  audioState.set({
    state: AudioStates.IDLE,
    error: null,
    previousState: null,
    timestamp: Date.now(),
    mimeType: null,
    waveformData: []
  });
  
  recordingState.set({
    isRecording: false,
    duration: 0,
    audioBlob: null,
    audioURL: null
  });
  
  transcriptionState.set({
    inProgress: false,
    progress: 0,
    text: '',
    error: null,
    timestamp: null
  });
  
  uiState.set({
    clipboardSuccess: false,
    lyricsCollected: false,
    errorMessage: '',
    showPermissionError: false,
    transcriptionCopied: false,
    screenReaderMessage: ''
  });
  
  audioActions.stopRecordingTimer();
}

// New event store for transcription completion
export const transcriptionCompletedEvent = (() => {
  const { subscribe, set } = writable(null); // Event store, emits text on completion then null
  let _previousInProgress = get(transcriptionState).inProgress; // Initialize with current state
  
  // Maintain a flag to track if an event is pending to be fired
  let _pendingEvent = false;
  
  transcriptionState.subscribe(currentState => {
    // First check: was transcribing and now finished
    const justCompleted = _previousInProgress === true && currentState.inProgress === false;
    
    // Second check: has valid text content
    const hasValidContent = currentState.text && currentState.text.trim() !== '';
    
    if (justCompleted && hasValidContent) {
      // Use our logger instead of console.log
      import('./loggerService').then(({ createLogger }) => {
        const storeLogger = createLogger('Stores');
        storeLogger.info('transcriptionCompletedEvent: Detected completion with text -', currentState.text);
      });
      
      // Set flag that an event is pending
      _pendingEvent = true;
      
      // Fire immediately, no delay
      set(currentState.text); // Emit the text value
      
      // Reset to null to make it a true "event" store for the next completion
      // but do it as a microtask to ensure current subscribers process the text value first
      Promise.resolve().then(() => {
        set(null);
        _pendingEvent = false;
      });
    }
    
    // Update previous state for next check
    _previousInProgress = currentState.inProgress;
  });

  // Extend the store with a method to manually trigger the event
  const forceEmit = (text) => {
    if (!text || _pendingEvent) return false; // Prevent duplicate events
    
    import('./loggerService').then(({ createLogger }) => {
      const storeLogger = createLogger('Stores');
      storeLogger.info('transcriptionCompletedEvent: Force emitting with text -', text);
    });
    
    _pendingEvent = true;
    set(text); // Emit the text value
    
    // Reset to null as a microtask
    Promise.resolve().then(() => {
      set(null);
      _pendingEvent = false;
    });
    
    return true;
  };

  return { subscribe, forceEmit };
})();
