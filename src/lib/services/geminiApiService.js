import { GoogleGenerativeAI } from '@google/generative-ai';
import { errorHandler, ApiError } from '$lib/services/infrastructure/errorHandler';
import { createLogger } from '$lib/services/infrastructure/loggerService';

const logger = createLogger('GeminiApiService');

// Try to get API key from multiple sources
let genAIKEY = import.meta.env.VITE_GEMINI_API_KEY;

// If not available in environment, try localStorage (client-side only)
if (!genAIKEY && typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  genAIKEY = localStorage.getItem('riffRap-gemini-api-key');
  // Check old key for backward compatibility
  if (!genAIKEY) {
    genAIKEY = localStorage.getItem('riffrap-gemini-api-key');
  }
  
  // Also check if it's set on window (for runtime updates)
  if (!genAIKEY && window.VITE_GEMINI_API_KEY) {
    genAIKEY = window.VITE_GEMINI_API_KEY;
  }
}

if (!genAIKEY) {
  const error = new ApiError('Gemini API key not found. Please set it in the settings.', {
    code: 'ERR_API_KEY',
    context: { component: 'GeminiApiService' }
  });
  
  errorHandler.handleError(error, {
    notify: true, // Show notification to user
    rethrow: false // Don't rethrow, we'll handle initialization more gracefully
  });
  
  // Play error sound if browser environment and sound is enabled
  if (typeof window !== 'undefined' && window.soundsEnabled) {
    try {
      // Check if sound service is available and initialized
      if (window.soundService && window.soundService.playErrorSound) {
        window.soundService.playErrorSound();
      }
    } catch (e) {
      // Ignore errors from sound system
      logger.warn('Could not play error sound', e);
    }
  }
}

// Initialize with whatever API key we have (may be null/undefined if not set)
const genAI = new GoogleGenerativeAI(genAIKEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

// Track model initialization state
let modelInitialized = false;
let initializationPromise = null;

// Function to preload/initialize the model for faster response
function preloadModel() {
  // Only initialize once
  if (modelInitialized || initializationPromise) {
    return initializationPromise;
  }
  
  logger.info('Preloading speech model for faster response');
  
  // We create a very small "ping" query to initialize the model
  // This warms up the Gemini API connection and loads necessary client-side resources
  initializationPromise = model.generateContent('hello')
    .then(response => {
      logger.info('Speech model preloaded successfully');
      modelInitialized = true;
      return response;
    })
    .catch(error => {
      const apiError = new ApiError('Error preloading speech model', {
        code: 'ERR_API_PRELOAD',
        context: { originalError: error.message },
        isOperational: true // This is an expected potential error
      });
      
      errorHandler.handleError(apiError, {
        notify: false, // No need to notify user about preload failures
        rethrow: false // We'll handle this gracefully
      });
      
      // Reset the initialization state so we can try again
      initializationPromise = null;
      throw apiError;
    });
    
  return initializationPromise;
}

function blobToGenerativePart(blob) {
  return new Promise((resolve, reject) => {
    if (!blob || !(blob instanceof Blob)) {
      reject(new ApiError('Invalid blob provided', {
        code: 'ERR_API_INVALID_BLOB',
        context: { blobType: blob ? typeof blob : 'null' }
      }));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onloadend = () => {
      try {
        const base64data = reader.result.split(',')[1];
        resolve({
          inlineData: {
            data: base64data,
            mimeType: blob.type
          }
        });
      } catch (error) {
        reject(new ApiError('Error processing blob', {
          code: 'ERR_API_BLOB_PROCESSING',
          context: { originalError: error.message }
        }));
      }
    };
    
    reader.onerror = () => {
      reject(new ApiError('Error reading file', {
        code: 'ERR_API_FILE_READ',
        context: { fileType: blob.type, fileSize: blob.size }
      }));
    };
    
    reader.readAsDataURL(blob);
  });
}

const generateContent = errorHandler.wrapAsync(
  async (promptData) => {
    if (!genAIKEY) {
      throw new ApiError('API key is required for content generation', { 
        code: 'ERR_API_KEY_REQUIRED' 
      });
    }
    
    try {
      const result = await model.generateContent(promptData);
      return result.response;
    } catch (error) {
      throw new ApiError('Failed to generate content with Gemini', {
        code: 'ERR_API_GENERATION',
        context: { 
          originalError: error.message,
          modelName: 'gemini-2.0-flash-exp'
        }
      });
    }
  },
  {
    notify: true,
    rethrow: true // We want to rethrow so calling code can handle it appropriately
  }
);

export const geminiApiService = {
  preloadModel,
  blobToGenerativePart,
  generateContent,
  
  // Method to get model status
  getModelStatus() {
    return {
      initialized: modelInitialized,
      initializing: !!initializationPromise && !modelInitialized,
      hasApiKey: !!genAIKEY
    };
  },
  
  // Method to update API key at runtime
  updateApiKey(newApiKey) {
    if (!newApiKey || typeof newApiKey !== 'string' || newApiKey.trim() === '') {
      return Promise.reject(
        errorHandler.handleError(
          new ApiError('Invalid API key provided', { 
            code: 'ERR_API_KEY_INVALID',
            context: { keyType: typeof newApiKey }
          }),
          { notify: true, rethrow: true }
        )
      );
    }
    
    try {
      genAIKEY = newApiKey;
      
      // Reinitialize the API client with the new key
      const newGenAI = new GoogleGenerativeAI(genAIKEY);
      const newModel = newGenAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      
      // Update the references
      Object.assign(genAI, newGenAI);
      Object.assign(model, newModel);
      
      // Reset initialization state
      modelInitialized = false;
      initializationPromise = null;
      
      logger.info('API key updated successfully, preloading model with new key');
      
      // Preload the model with the new key
      return preloadModel();
    } catch (error) {
      return Promise.reject(
        errorHandler.handleError(
          new ApiError('Failed to initialize API client with new key', {
            code: 'ERR_API_INIT',
            context: { originalError: error.message }
          }),
          { notify: true, rethrow: true }
        )
      );
    }
  }
};
