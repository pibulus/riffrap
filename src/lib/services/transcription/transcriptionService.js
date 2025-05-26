import { geminiService as defaultGeminiService } from '$lib/services/geminiService';
import { transcriptionState, transcriptionActions, uiActions } from '../infrastructure/stores';
import { COPY_MESSAGES, ATTRIBUTION, getRandomFromArray } from '$lib/constants';
import { get } from 'svelte/store';
import { errorHandler, TranscriptionError, UIError } from '$lib/services/infrastructure/errorHandler';
import { createLogger } from '$lib/services/infrastructure/loggerService';
import { eventBridge } from '$lib/services/infrastructure/eventBridge';

const logger = createLogger('TranscriptionService');

export const TranscriptionEvents = {
  TRANSCRIPTION_STARTED: 'transcription:started',
  TRANSCRIPTION_PROGRESS: 'transcription:progress',
  TRANSCRIPTION_COMPLETED: 'transcription:completed',
  TRANSCRIPTION_ERROR: 'transcription:error',
  TRANSCRIPTION_COPIED: 'transcription:copied',
  TRANSCRIPTION_SHARED: 'transcription:shared'
};

export class TranscriptionService {
  constructor(dependencies = {}) {
    this.geminiService = dependencies.geminiService || defaultGeminiService;
    this.browser = typeof window !== 'undefined';
    this.lastTranscriptionTimestamp = null;
  }
  
  /**
   * Transcribes an audio blob to text using the Gemini service
   * 
   * @param {Blob} audioBlob - The audio blob to transcribe
   * @returns {Promise<string>} The transcribed text
   */
  async transcribeAudio(audioBlob) {
    const startTime = Date.now();
    console.log('[TRACE] transcribeAudio called with blob:', audioBlob?.size || 'null');
    
    try {
      // Validate input
      if (!audioBlob || !(audioBlob instanceof Blob)) {
        throw new TranscriptionError('Invalid audio data provided', {
          code: 'ERR_TRANSCRIPTION_INVALID_AUDIO',
          context: { blobType: audioBlob ? typeof audioBlob : 'null' }
        });
      }
      
      // Log the received audio blob details for debugging
      logger.info('Transcribing audio blob', { 
        blobSize: audioBlob.size,
        blobType: audioBlob.type,
        timestamp: startTime
      });
      
      // Notify system that transcription is starting
      eventBridge.dispatchAppEvent('transcription-started', { timestamp: startTime });
      
      // Update UI state to reflect in-progress transcription
      transcriptionActions.startTranscribing();
      this.lastTranscriptionTimestamp = startTime;
      
      // Start progress animation for user feedback
      this.startProgressAnimation();
      
      // Process the audio through Gemini API
      console.log(`[DEBUG] Sending ${audioBlob.size} bytes to Gemini API`);
      const transcriptText = await this.geminiService.transcribeAudio(audioBlob);
      console.log('[DEBUG] Transcription result:', transcriptText?.substring(0, 50));
      
      // Complete progress animation with smooth transition
      this.completeProgressAnimation();
      
      // Validate transcription result
      if (!transcriptText) {
        logger.warn('Empty transcription result received');
        throw new TranscriptionError('Transcription returned empty result', {
          code: 'ERR_TRANSCRIPTION_EMPTY_RESULT'
        });
      }
      
      // Calculate performance metrics
      const processingTime = Date.now() - startTime;
      const wordsPerMinute = transcriptText.split(/\s+/).length / (processingTime / 60000);
      
      // Log success with detailed metrics for performance tracking
      logger.info('Transcription successful', { 
        textLength: transcriptText.length,
        processingTime,
        wordsPerMinute: wordsPerMinute.toFixed(2)
      });
      
      // Notify system that transcription is complete
      eventBridge.dispatchAppEvent('transcription-completed', {
        timestamp: Date.now(),
        duration: processingTime,
        textLength: transcriptText.length
      });
      
      return transcriptText;
      
    } catch (error) {
      // Create a TranscriptionError if it's not already one
      const transcriptionError = error instanceof TranscriptionError 
        ? error 
        : new TranscriptionError(
            error.message || 'Unknown transcription error',
            {
              code: 'ERR_TRANSCRIPTION_FAILED',
              context: { 
                originalError: error.message,
                originalErrorType: error.constructor.name,
                audioSize: audioBlob?.size,
                audioType: audioBlob?.type
              }
            }
          );
      
      // Handle the error with our error handler
      errorHandler.handleError(transcriptionError, {
        notify: true, // Show notification to user
        emitEvent: true // Emit error event through eventBridge
      });
      
      // Update state to show error
      transcriptionActions.setTranscriptionError(transcriptionError.message);
      
      // Dispatch error event
      eventBridge.dispatchAppEvent('transcription-error', {
        timestamp: Date.now(),
        error: transcriptionError.message,
        code: transcriptionError.code
      });
      
      throw transcriptionError;
    }
  }
  
  startProgressAnimation() {
    let progress = 0;
    const animate = () => {
      if (!get(transcriptionState).inProgress) return;
      
      progress = Math.min(95, progress + 1);
      
      // Update store with current progress
      transcriptionActions.updateProgress(progress);
      
      if (progress < 95) {
        setTimeout(animate, 50);
      }
    };
    
    // Start animation loop
    animate();
  }
  
  completeProgressAnimation() {
    let progress = 95;
    
    const complete = () => {
      progress = Math.min(100, progress + (100 - progress) * 0.2);
      
      // Update store with current progress
      transcriptionActions.updateProgress(progress);
      
      if (progress < 99.5) {
        requestAnimationFrame(complete);
      } else {
        transcriptionActions.updateProgress(100);
      }
    };
    
    // Start completion animation
    requestAnimationFrame(complete);
  }
  
  copyToClipboard = errorHandler.wrapAsync(
    async (text) => {
      if (!text) {
        text = get(transcriptionState).text;
      }
      
      if (!text || text.trim() === '') {
        throw new UIError('No text available to copy', {
          code: 'ERR_UI_EMPTY_CLIPBOARD',
          isOperational: true // This is an expected/operational error
        });
      }
      
      // Add attribution
      const textWithAttribution = `${text}\n\n${ATTRIBUTION.SIMPLE_TAG}`;
      
      try {
        // Try the modern clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(textWithAttribution);
          uiActions.showClipboardSuccess();
          uiActions.setScreenReaderMessage('Transcript copied to clipboard');
          
          // Dispatch success event
          eventBridge.dispatchAppEvent('transcription-copied', {
            timestamp: Date.now(),
            textLength: text.length
          });
          
          return true;
        }
        
        // Fallback: Use document.execCommand (legacy method)
        const textArea = document.createElement('textarea');
        textArea.value = textWithAttribution;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (success) {
          uiActions.showClipboardSuccess();
          uiActions.setScreenReaderMessage('Transcript copied to clipboard');
          
          // Dispatch success event
          eventBridge.dispatchAppEvent('transcription-copied', {
            timestamp: Date.now(),
            textLength: text.length,
            method: 'legacy'
          });
          
          return true;
        } else {
          throw new UIError('Unable to copy. Please try clicking in the window first.', {
            code: 'ERR_UI_CLIPBOARD_FAILED',
            context: { method: 'execCommand' }
          });
        }
      } catch (error) {
        // If it's already a UIError, rethrow it
        if (error instanceof UIError) {
          throw error;
        }
        
        // Otherwise, create a new UIError with the original error context
        throw new UIError(`Copy failed: ${error.message || 'Unknown error'}`, {
          code: 'ERR_UI_CLIPBOARD_ERROR',
          context: { 
            originalError: error.message,
            originalErrorType: error.constructor.name
          }
        });
      }
    },
    {
      notify: true,
      rethrow: false,
      fallbackValue: false,
      context: { operation: 'copyToClipboard' }
    }
  )
  
  shareTranscript = errorHandler.wrapAsync(
    async (text) => {
      if (!text) {
        text = get(transcriptionState).text;
      }
      
      if (!text || text.trim() === '') {
        throw new UIError('No text available to share', {
          code: 'ERR_UI_EMPTY_SHARE',
          isOperational: true
        });
      }
      
      // Check if Web Share API is available
      if (!navigator.share) {
        logger.info('Web Share API not supported, falling back to clipboard');
        return this.copyToClipboard(text);
      }
      
      try {
        // Add attribution
        const textWithAttribution = `${text}${ATTRIBUTION.SHARE_POSTFIX}`;
        
        // Share using Web Share API
        await navigator.share({
          title: 'Riff Rap Transcription',
          text: textWithAttribution
        });
        
        uiActions.showClipboardSuccess();
        uiActions.setScreenReaderMessage('Transcript shared successfully');
        
        // Dispatch success event
        eventBridge.dispatchAppEvent('transcription-shared', {
          timestamp: Date.now(),
          textLength: text.length
        });
        
        return true;
        
      } catch (error) {
        // Don't treat user cancellation as an error
        if (error.name === 'AbortError') {
          logger.info('User cancelled share operation');
          return false;
        }
        
        // Try fallback to clipboard if sharing fails with other errors
        logger.warn('Share operation failed, falling back to clipboard', {
          errorName: error.name,
          errorMessage: error.message
        });
        
        return this.copyToClipboard(text);
      }
    },
    {
      notify: true,
      rethrow: false,
      fallbackValue: false,
      context: { operation: 'shareTranscript' }
    }
  )
  
  isTranscribing() {
    return get(transcriptionState).inProgress;
  }
  
  getCurrentTranscript() {
    return get(transcriptionState).text;
  }
  
  clearTranscript() {
    transcriptionActions.completeTranscription('');
  }
  
  getRandomCopyMessage() {
    return getRandomFromArray(COPY_MESSAGES);
  }
  
  isShareSupported() {
    return this.browser && typeof navigator !== 'undefined' && 
           navigator.share && typeof navigator.share === 'function';
  }
}

export const transcriptionService = new TranscriptionService();