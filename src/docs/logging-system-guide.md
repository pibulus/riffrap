# Riff Rap Logging System Guide

## Overview

Riff Rap uses a centralized, consistent logging system across the application. This system provides namespaced logging with different log levels and conditional output based on the environment and user preferences.

## Key Features

- **Namespaced Logging**: Categorize logs by component/service
- **Log Levels**: debug, info, warn, error
- **Production Safe**: No logs in production unless explicitly enabled
- **Styled Console Output**: Color-coded by log level for better readability
- **Svelte Store Integration**: Reactive configuration

## How to Use

### Basic Usage

Import the `createLogger` function and create a logger with a specific namespace:

```javascript
import { createLogger } from '$lib/services/infrastructure/loggerService';

// Create a logger for your component/service
const logger = createLogger('MyComponent');

// Use the logger methods
logger.debug('Detailed debug information');
logger.info('General information');
logger.warn('Warning message');
logger.error('Error message', errorObject);

// Advanced logging
logger.group('Group title');
logger.table(data);
logger.groupEnd();
```

### Replacing console.log

Instead of using `console.log`, use the appropriate logger method:

```javascript
// ❌ Don't do this
console.log('Component mounted');

// ✅ Do this
import { createLogger } from '$lib/services/infrastructure/loggerService';
const logger = createLogger('MyComponent');
logger.info('Component mounted');
```

### Default Logger

For quick logging without creating a new logger instance:

```javascript
import { logger } from '$lib/services/infrastructure/loggerService';

logger.info('Application message');
```

## Configuration

### Debug Mode

You can enable or disable all logging, or configure specific namespaces:

```javascript
import { setDebugMode, configureNamespace } from '$lib/services/infrastructure/loggerService';

// Enable or disable all logging
setDebugMode(true);

// Configure specific namespaces
configureNamespace('API', true);
configureNamespace('Animation', false);
```

### Log Levels

Set the minimum log level to display:

```javascript
import { setLogLevel } from '$lib/services/infrastructure/loggerService';

// Only show warnings and errors
setLogLevel('warn');
```

### Checking Debug Mode in Components

You can reactively check if debug mode is enabled:

```svelte
<script>
  import { isDebugMode } from '$lib/services/infrastructure/loggerService';
</script>

{#if $isDebugMode}
  <div class="debug-panel">
    <!-- Debug UI -->
  </div>
{/if}
```

## Browser Console Helpers

Useful utilities for runtime debugging:

```javascript
import { consoleHelper } from '$lib/services/infrastructure/loggerService';

// Show current configuration
consoleHelper.showConfig();

// List all namespaces and their status
consoleHelper.listNamespaces();

// Enable all namespaces
consoleHelper.enableAll();

// Disable all logging
consoleHelper.disableAll();
```

## Best Practices

1. **Create Specific Namespaces**: Use descriptive namespaces for each component or service
2. **Use Appropriate Log Levels**:
   - `debug`: Detailed information for debugging
   - `info`: General information about application flow
   - `warn`: Warnings that don't prevent the application from working
   - `error`: Errors that prevent features from working correctly
3. **Include Context**: Log objects and context information when possible
4. **Use in Component Lifecycle**: Log component mounting and destruction
5. **Group Related Logs**: Use `group` and `groupEnd` for complex operations

## Implementation Details

The logging system is implemented in `src/lib/services/infrastructure/loggerService.js` and integrates with LineSnap's existing debug configuration in localStorage.

The system:
- Checks `STORAGE_KEYS.DEBUG_MODE` in localStorage
- Uses environment detection to disable logging in production
- Maintains a consistent format for all logs
- Integrates with the Svelte reactive system