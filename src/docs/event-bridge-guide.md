# Event Bridge Guide

## Overview

The application includes a standardized event system called EventBridge that handles both current and legacy events. This system provides a clean API for dispatching and listening to events while maintaining backward compatibility.

## Key Features

- **Unified Event Dispatching**: Dispatch events in both current and legacy formats with a single call
- **Standardized Event Listening**: Listen for both current and legacy events with a single handler
- **Automatic Event Normalization**: Automatically normalize event names for consistent handling
- **Clean API**: Simple, consistent API for all application events

## How to Use

### Setting Change Events

#### Dispatching Setting Changes

To dispatch a setting change event (which sends both current and legacy format events):

```javascript
import { eventBridge } from '$lib/services/infrastructure/eventBridge';

// Dispatch a setting change
eventBridge.dispatchSettingChanged('theme', 'mint');

// For settings specific to the current app version (optional)
eventBridge.dispatchSettingChanged('newSetting', value, false);

// For legacy settings that should only use legacy format (rare)
eventBridge.dispatchSettingChanged('legacySetting', value, true);
```

#### Listening for Setting Changes

To listen for setting changes (catches both current and legacy events):

```javascript
import { eventBridge } from '$lib/services/infrastructure/eventBridge';

// Add a listener for a specific setting
const removeListener = eventBridge.addSettingChangeListener('theme', (value, event) => {
  console.log('Theme changed to:', value);
  
  // You can also access the original event if needed
  console.log('Original event:', event);
});

// Later, when you need to remove the listener
removeListener();
```

### General Application Events

For application-specific events (non-setting events):

#### Dispatching App Events

```javascript
import { eventBridge } from '$lib/services/infrastructure/eventBridge';

// Dispatch an application event
eventBridge.dispatchAppEvent('record-started', { duration: 60 });
```

#### Listening for App Events

```javascript
import { eventBridge } from '$lib/services/infrastructure/eventBridge';

// Add a listener for an application event
const removeListener = eventBridge.addAppEventListener('record-started', (event) => {
  console.log('Recording started:', event.detail.duration);
});

// Later, when you need to remove the listener
removeListener();
```

## Migration Guide

### For Event Dispatchers

Before:
```javascript
window.dispatchEvent(
  new CustomEvent('talktype-setting-changed', {
    detail: { setting: 'theme', value: 'mint' }
  })
);
```

After:
```javascript
eventBridge.dispatchSettingChanged('theme', 'mint');
```

### For Event Listeners

Before:
```javascript
window.addEventListener('talktype-setting-changed', (e) => {
  if (e.detail && e.detail.setting === 'theme') {
    handleThemeChange(e.detail.value);
  }
});
```

After:
```javascript
const removeListener = eventBridge.addSettingChangeListener('theme', (value) => {
  handleThemeChange(value);
});
```

## Advanced Features

### Event Normalization

The EventBridge automatically normalizes setting names to ensure consistent handling:

```javascript
// These all dispatch the same event
eventBridge.dispatchSettingChanged('theme', 'mint');
eventBridge.dispatchSettingChanged('Theme', 'mint');
eventBridge.dispatchSettingChanged('THEME', 'mint');
```

### Event Constants

For direct use of event prefixes (rare):

```javascript
import { eventBridge } from '$lib/services/infrastructure/eventBridge';

const { EVENT_PREFIXES } = eventBridge;
console.log(EVENT_PREFIXES.CURRENT); // Current app prefix
console.log(EVENT_PREFIXES.LEGACY);  // Legacy app prefix
```

## Implementation Details

The EventBridge is implemented in `src/lib/services/infrastructure/eventBridge.js` and provides a clean interface for all application events.

The system:
- Dispatches events in both formats for backward compatibility
- Normalizes event names to prevent case sensitivity issues
- Handles cleanup of event listeners automatically
- Integrates with the Svelte reactive system