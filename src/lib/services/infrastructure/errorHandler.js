/**
 * Riff Rap Error Handler Service
 * 
 * A centralized error handling system that integrates with the logger and event bridge
 * to provide consistent error handling across the application.
 * 
 * Features:
 * - Custom error classes with context and error codes
 * - Integration with logging system
 * - Event dispatching for UI notifications
 * - Error wrapping utilities for async functions
 * - User-friendly error messages
 */

import { createLogger } from './loggerService';
import { eventBridge } from './eventBridge';

const logger = createLogger('ErrorHandler');

// Base application error class
export class RiffRapError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = options.code || 'ERR_UNKNOWN';
    this.context = options.context || {};
    this.isOperational = options.isOperational !== false; // Default to true
  }
}

// API-related errors
export class ApiError extends RiffRapError {
  constructor(message, options = {}) {
    super(message, { code: options.code || 'ERR_API', ...options });
    this.statusCode = options.statusCode;
    this.endpoint = options.endpoint;
  }
}

// Authentication errors
export class AuthError extends RiffRapError {
  constructor(message, options = {}) {
    super(message, { code: options.code || 'ERR_AUTH', ...options });
  }
}

// Service-specific errors
export class TranscriptionError extends RiffRapError {
  constructor(message, options = {}) {
    super(message, { code: options.code || 'ERR_TRANSCRIPTION', ...options });
  }
}

// UI/UX errors
export class UIError extends RiffRapError {
  constructor(message, options = {}) {
    super(message, { code: options.code || 'ERR_UI', ...options });
  }
}

// Storage/data errors
export class StorageError extends RiffRapError {
  constructor(message, options = {}) {
    super(message, { code: options.code || 'ERR_STORAGE', ...options });
  }
}

/**
 * The main error handling service
 */
class ErrorHandlerService {
  constructor() {
    this.defaultOptions = {
      logError: true,
      emitEvent: true,
      rethrow: false,
      notify: false,
    };
    
    // Map of error codes to user-friendly messages
    this.friendlyMessages = {
      'ERR_API_KEY': 'The API key is missing or invalid. Please check your settings.',
      'ERR_TRANSCRIPTION': 'There was a problem processing your audio. Please try again.',
      'ERR_NETWORK': 'Network connection issues detected. Please check your internet connection.',
      'ERR_STORAGE': 'There was a problem saving your data. Please try again.',
      'ERR_AUTH': 'Authentication error. Please log in again.',
      'ERR_API': 'There was a problem communicating with the service. Please try again later.',
      'ERR_UI': 'The application encountered an unexpected error. Please try again.',
      'ERR_UNKNOWN': 'Something went wrong. Please try again or refresh the page.'
    };
  }
  
  /**
   * Handle an error with the specified options
   * @param {Error} error - The error to handle
   * @param {Object} options - Error handling options
   * @returns {Error} - The original error (for chaining)
   */
  handleError(error, options = {}) {
    const config = { ...this.defaultOptions, ...options };
    const isRiffRapError = error instanceof RiffRapError;
    
    // Log the error if requested
    if (config.logError) {
      if (isRiffRapError) {
        logger.error(`${error.name}: ${error.message}`, { 
          code: error.code, 
          context: error.context
        });
      } else {
        logger.error(`Unhandled Error: ${error.message}`, error);
      }
    }
    
    // Emit event for UI notification
    if (config.emitEvent) {
      eventBridge.dispatchAppEvent('error', {
        message: error.message,
        code: isRiffRapError ? error.code : 'ERR_UNKNOWN',
        timestamp: new Date().toISOString(),
        isOperational: isRiffRapError ? error.isOperational : true
      });
    }
    
    // Show user notification
    if (config.notify) {
      this.notifyUser(error);
    }
    
    // Rethrow if requested
    if (config.rethrow) {
      throw error;
    }
    
    return error;
  }
  
  /**
   * Wrap a function with error handling
   * @param {Function} fn - Function to wrap
   * @param {Object} options - Error handling options
   * @returns {Function} - Wrapped function
   */
  wrapAsync(fn, options = {}) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handleError(error, options);
        
        // If not rethrowing, return the fallback value if provided
        if (!options.rethrow && options.fallbackValue !== undefined) {
          return options.fallbackValue;
        }
        
        throw error;
      }
    };
  }
  
  /**
   * Display a user-friendly notification
   * @param {Error} error - The error to notify about
   */
  notifyUser(error) {
    // Lookup error code to friendlier message if available
    const friendlyMessage = this.getFriendlyMessage(error);
    
    // Dispatch event for UI components to show notification
    eventBridge.dispatchAppEvent('show-notification', {
      type: 'error',
      message: friendlyMessage,
      duration: 5000,
      dismissable: true
    });
  }
  
  /**
   * Get user-friendly error message
   * @param {Error} error - The error to create a message for
   * @returns {string} - User-friendly message
   */
  getFriendlyMessage(error) {
    if (error instanceof RiffRapError && this.friendlyMessages[error.code]) {
      return this.friendlyMessages[error.code];
    }
    
    // Default user-friendly message for unknown errors
    return this.friendlyMessages.ERR_UNKNOWN;
  }
  
  /**
   * Add a new friendly message mapping
   * @param {string} code - Error code
   * @param {string} message - User-friendly message
   */
  addFriendlyMessage(code, message) {
    this.friendlyMessages[code] = message;
  }
  
  /**
   * Create a fetch wrapper with standardized error handling
   * @returns {Function} - Fetch function with error handling
   */
  createFetchWithErrorHandling() {
    return async (url, options = {}) => {
      try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
          // Create an appropriate error based on status code
          if (response.status === 401 || response.status === 403) {
            throw new AuthError('Authentication failed', {
              statusCode: response.status,
              endpoint: url
            });
          } else if (response.status === 404) {
            throw new ApiError('Resource not found', {
              code: 'ERR_API_NOT_FOUND',
              statusCode: response.status,
              endpoint: url
            });
          } else {
            throw new ApiError(`API error: ${response.statusText}`, {
              statusCode: response.status,
              endpoint: url
            });
          }
        }
        
        return await response.json();
      } catch (error) {
        if (error instanceof ApiError || error instanceof AuthError) {
          // We've already classified this error
          throw this.handleError(error, { rethrow: true });
        } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          // Network error
          throw this.handleError(
            new ApiError('Network error. Please check your connection.', {
              code: 'ERR_NETWORK',
              endpoint: url
            }),
            { rethrow: true }
          );
        } else {
          // Unexpected error
          throw this.handleError(
            new ApiError('Unexpected error during API call', {
              code: 'ERR_API_UNEXPECTED',
              endpoint: url,
              context: { originalError: error.message }
            }),
            { rethrow: true }
          );
        }
      }
    };
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandlerService();