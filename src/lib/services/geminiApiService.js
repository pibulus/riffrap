import { errorHandler, ApiError } from '$lib/services/infrastructure/errorHandler';
import { createLogger } from '$lib/services/infrastructure/loggerService';

const logger = createLogger('GeminiApiService');
const API_TIMEOUT = 30000;

function preloadModel() {
  return Promise.resolve();
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
    try {
      const [prompt, audioPart] = promptData;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      try {
        const response = await fetch('/api/gemini', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt,
            audioData: audioPart?.inlineData?.data,
            mimeType: audioPart?.inlineData?.mimeType
          }),
          signal: controller.signal
        });

        const data = await response.json();
        if (!response.ok) {
          throw new ApiError(data.error || 'Failed to generate content with Gemini', {
            code: 'ERR_API_GENERATION'
          });
        }

        return {
          text: () => data.text
        };
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new ApiError('Transcription timed out. Check your connection and try again.', {
          code: 'ERR_API_TIMEOUT'
        });
      }

      throw new ApiError('Failed to generate content with Gemini', {
        code: 'ERR_API_GENERATION',
        context: { 
          originalError: error.message
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
      initialized: true,
      initializing: false
    };
  }
};
