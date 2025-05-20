# Riff Rap Error Handling System

## Overview

The Riff Rap Error Handling System provides a consistent, centralized approach to handling errors throughout the application. This system integrates with the existing logging and event bridge infrastructure to ensure errors are properly tracked, reported, and displayed to users when appropriate.

## Components of the System

### 1. Error Class Hierarchy

```
RiffRapError (base class)
├── ApiError
├── AuthError
├── TranscriptionError
├── UIError
└── StorageError
```

Each error type includes:
- Unique error code (e.g., `ERR_API`, `ERR_TRANSCRIPTION`)
- Context object for additional error details
- "Operational" flag to distinguish expected vs. unexpected errors

### 2. Central Error Handler Service

The `errorHandler` service in `src/lib/services/infrastructure/errorHandler.js` provides:

- Error handling with configurable behavior
- Async function wrapping with error handling
- User-friendly error message mapping
- Integration with logger and event system
- Fetch wrapper with standardized error handling

### 3. UI Components

- `ErrorBoundary.svelte`: Prevents component errors from crashing the entire application
- `ErrorNotification.svelte`: Displays user-friendly error notifications

## Integration Points

### Integration with Logger System

Errors are automatically logged using the centralized logger service, maintaining the namespace-based approach and respecting log levels.

### Integration with Event Bridge

The error handler dispatches events through the event bridge when errors occur, allowing components to react to errors in a standardized way.

## Using the Error Handling System

### 1. Handling Errors in Services

```javascript
import { errorHandler, ApiError } from '$lib/services/infrastructure/errorHandler';

try {
  // Risky operation
  await apiRequest();
} catch (error) {
  errorHandler.handleError(error, { 
    notify: true,   // Show notification to user
    rethrow: false  // Don't rethrow the error
  });
  return null; // Fallback value
}
```

### 2. Using the Async Wrapper

```javascript
const processData = errorHandler.wrapAsync(
  async (data) => {
    // Risky operation
    return transformedData;
  },
  {
    notify: true,
    fallbackValue: { success: false, data: null }
  }
);

// Later use:
const result = await processData(inputData);
```

### 3. Using Error Boundaries

```svelte
<ErrorBoundary>
  <RiskyComponent />
</ErrorBoundary>
```

### 4. Throwing Custom Errors

```javascript
if (!apiKey) {
  throw new ApiError('Missing API key', {
    code: 'ERR_API_KEY',
    context: { component: 'GeminiService' }
  });
}
```

## Benefits

1. **Consistency**: Uniform error handling patterns throughout the application
2. **Better UX**: User-friendly error messages that provide appropriate context
3. **Improved Debugging**: Detailed error context and proper error taxonomy
4. **Graceful Degradation**: Application remains functional even when parts fail
5. **Centralized Control**: Error handling policies can be adjusted application-wide

## Implementation Status

- ✅ Error handling architecture documentation
- ✅ Custom error class hierarchy
- ✅ Central error handler service
- ✅ Error boundary component
- ✅ Error notification component
- ✅ Integration with key services:
  - ✅ geminiApiService.js - Enhanced with robust error handling for API interactions
  - ✅ transcriptionService.js - Upgraded clipboard and sharing functions with proper error handling
  - ✅ audioService.js - Comprehensive error handling for audio recording and processing
  - ✅ storageUtils.js - Robust error handling for all storage operations including JSON parsing/serialization
- ✅ UI component adoption:
  - ✅ Added ErrorBoundary to main layout (routes/+layout.svelte)
  - ✅ Added ErrorNotification to main layout for app-wide notifications
  - ✅ Added component-specific ErrorBoundary to MainContainer for finer-grained control

## Next Steps

1. Extend error handling to additional services:
   - pwaService.js
   - modalService.js
   - themeService.js
2. Add error tracking analytics for production error monitoring
3. Create specialized error boundary fallbacks for specific components
4. Implement automatic retry mechanisms for transient errors
5. Add recovery strategies for common error scenarios

## References

- [Detailed Error Handling Guide](./error-handling-guide.md)
- [Logger Service Documentation](./logging-system-guide.md)
- [Event Bridge Documentation](./event-bridge-guide.md)