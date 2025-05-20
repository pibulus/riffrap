# Riff Rap Error Handling Guide

This document outlines the standardized approach to error handling in Riff Rap. Consistent error handling improves code quality, debugging efficiency, and user experience.

## Core Principles

1. **Consistency**: Use the same error handling patterns across the codebase
2. **Transparency**: Errors should be visible and logged appropriately
3. **User Experience**: Error messages should be user-friendly when displayed in the UI
4. **Context Preservation**: Error objects should maintain their context and stack traces
5. **Graceful Degradation**: Application should remain functional even when parts fail

## Error Types

Riff Rap uses a hierarchy of custom error classes to provide context and consistency:

```javascript
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
```

## Error Handling Service

LineSnap uses a centralized error handling service integrated with the logging system:

```javascript
import { createLogger } from './loggerService';
import { eventBridge } from './eventBridge';

const logger = createLogger('ErrorHandler');

class ErrorHandlerService {
  constructor() {
    this.defaultOptions = {
      logError: true,
      emitEvent: true,
      rethrow: false,
      notify: false,
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
    // Mapping of error codes to user-friendly messages
    const messageMap = {
      'ERR_API_KEY': 'The API key is missing or invalid. Please check your settings.',
      'ERR_TRANSCRIPTION': 'There was a problem processing your audio. Please try again.',
      'ERR_NETWORK': 'Network connection issues detected. Please check your internet connection.',
      'ERR_STORAGE': 'There was a problem saving your data. Please try again.',
      'ERR_AUTH': 'Authentication error. Please log in again.',
      // Add more error codes and messages as needed
    };
    
    if (error instanceof RiffRapError && messageMap[error.code]) {
      return messageMap[error.code];
    }
    
    // Default user-friendly message for unknown errors
    return 'Something went wrong. Please try again or refresh the page.';
  }
}

export const errorHandler = new ErrorHandlerService();
```

## Usage Examples

### 1. Service Methods

```javascript
import { errorHandler, TranscriptionError } from '$lib/services/infrastructure/errorHandling';

export class ExampleService {
  async fetchData() {
    try {
      const response = await fetch('/api/data');
      
      if (!response.ok) {
        throw new ApiError('Failed to fetch data', {
          statusCode: response.status,
          endpoint: '/api/data',
          context: { responseStatus: response.statusText }
        });
      }
      
      return await response.json();
    } catch (error) {
      // Handle the error but don't rethrow (return null instead)
      errorHandler.handleError(error, { 
        notify: true, 
        rethrow: false 
      });
      
      return null;
    }
  }
  
  // Alternative approach using the wrapper
  processAudio = errorHandler.wrapAsync(
    async (audioBlob) => {
      if (!audioBlob) {
        throw new TranscriptionError('No audio data provided', {
          code: 'ERR_TRANSCRIPTION_NO_DATA'
        });
      }
      
      // Process the audio...
      return transcriptionResult;
    },
    {
      notify: true,
      fallbackValue: { text: '', status: 'error' }
    }
  );
}
```

### 2. Component Error Handling

```svelte
<script>
  import { onMount, onDestroy } from 'svelte';
  import { errorHandler, UIError } from '$lib/services/infrastructure/errorHandling';
  import { eventBridge } from '$lib/services/infrastructure/eventBridge';
  
  let errorMessage = '';
  let removeErrorListener;
  
  onMount(() => {
    // Listen for error events
    removeErrorListener = eventBridge.addAppEventListener('error', (event) => {
      // Only show operational errors in the UI
      if (event.detail.isOperational) {
        errorMessage = event.detail.message;
      }
    });
  });
  
  onDestroy(() => {
    if (removeErrorListener) removeErrorListener();
  });
  
  function handleUserAction() {
    try {
      // User action that might fail
      performAction();
    } catch (error) {
      errorHandler.handleError(
        new UIError('Failed to perform action', {
          context: { component: 'UserActionComponent' }
        }),
        { notify: true }
      );
    }
  }
</script>

{#if errorMessage}
  <div class="error-banner" role="alert">
    {errorMessage}
    <button on:click={() => errorMessage = ''}>Dismiss</button>
  </div>
{/if}
```

### 3. API Error Handling

```javascript
import { ApiError, errorHandler } from '$lib/services/infrastructure/errorHandling';

export async function fetchWithErrorHandling(url, options = {}) {
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
      throw errorHandler.handleError(error, { rethrow: true });
    } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      // Network error
      throw errorHandler.handleError(
        new ApiError('Network error. Please check your connection.', {
          code: 'ERR_NETWORK',
          endpoint: url
        }),
        { rethrow: true }
      );
    } else {
      // Unexpected error
      throw errorHandler.handleError(
        new ApiError('Unexpected error during API call', {
          code: 'ERR_API_UNEXPECTED',
          endpoint: url,
          context: { originalError: error.message }
        }),
        { rethrow: true }
      );
    }
  }
}
```

## Error Handling Best Practices

1. **Be Specific**: Use the most specific error type for the situation
2. **Include Context**: Add relevant data to the error context object
3. **Handle Async Errors**: Always handle promise rejections and async errors
4. **Log Appropriately**:
   - Use error.warn for expected but unusual conditions
   - Use error.error for unexpected failures
5. **Don't Swallow Errors**: Always log or rethrow errors
6. **User-Friendly Messages**: Display helpful, non-technical error messages to users
7. **Consider Recovery**: Where possible, include recovery options in error notifications

## Error Boundaries

For Svelte components, consider implementing error boundaries to prevent entire UI crashes:

```svelte
<!-- ErrorBoundary.svelte -->
<script>
  import { onError } from 'svelte';
  import { errorHandler } from '$lib/services/infrastructure/errorHandling';
  
  let error = null;
  
  onError(e => {
    error = e;
    errorHandler.handleError(e, { notify: true });
  });
</script>

{#if error}
  <div class="error-fallback">
    <h3>Something went wrong</h3>
    <p>The application encountered an unexpected error.</p>
    <button on:click={() => window.location.reload()}>Reload page</button>
  </div>
{:else}
  <slot />
{/if}
```

Usage:

```svelte
<ErrorBoundary>
  <ComponentThatMightError />
</ErrorBoundary>
```

## Implementation Plan

1. Create the error classes and error handling service
2. Update the logger service to integrate with error handling
3. Update key services to use the new error handling approach
4. Add UI components for error notification
5. Document usage and best practices for developers

## Integration with Event Bridge

The error handling system integrates with the existing event bridge to propagate errors to the UI:

```javascript
// Error events for UI notification
eventBridge.dispatchAppEvent('error', {
  message: 'Failed to transcribe audio',
  code: 'ERR_TRANSCRIPTION',
  timestamp: new Date().toISOString()
});

// Adding an error event listener
const removeListener = eventBridge.addAppEventListener('error', (event) => {
  console.log('Error occurred:', event.detail);
});
```

## Integration with Logger Service

The error handling service uses the existing logger service for consistent logging:

```javascript
// In error handling service
const logger = createLogger('ErrorHandler');

// Log detailed error information
logger.error(`${error.name}: ${error.message}`, { 
  code: error.code, 
  context: error.context,
  stack: error.stack
});
```

## Conclusion

By implementing this standardized error handling approach, LineSnap will have:

1. **Improved Debugging**: Consistent error objects with meaningful context
2. **Better User Experience**: Friendly error messages and graceful degradation
3. **Enhanced Maintainability**: Centralized error handling policies
4. **Operational Awareness**: Proper logging and monitoring of application errors

All developers should follow these guidelines when adding new features or updating existing code to ensure a consistent approach to error handling throughout the application.