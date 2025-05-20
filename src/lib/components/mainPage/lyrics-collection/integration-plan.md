# Integration Plan for LyricsCollection Component

## Overview

This document outlines the plan for integrating the newly modularized `LyricsCollection` component into the application, replacing the original monolithic `PurpleStyleCollectionBox` component.

## Current Status

We have completed modularization of the original component into the following modules:

1. **Core State Management**
   - `lyricsStore.js` - Central state store
   - `storageManager.js` - LocalStorage persistence

2. **Theme Handling**
   - `themeManager.js` - Theme definitions and switching

3. **User Interaction**
   - `dragDropManager.js` - Drag and drop functionality
   - `transcriptMonitor.js` - Selection monitoring

4. **Exports and Display**
   - `exportManager.js` - Clipboard operations and downloading
   - `notificationSystem.js` - Toast notifications
   - `compilationManager.js` - Combining multiple snippets

5. **Utilities**
   - `textUtils.js` - Text formatting helpers

6. **Main Component**
   - `LyricsCollection.svelte` - New modular main component

## Integration Steps

### 1. Create Compatibility Wrapper

Create a wrapper component that internally uses LyricsCollection but maintains the original component's API:

```svelte
<!-- PurpleStyleCollectionBox.svelte -->
<script>
  import LyricsCollection from './lyrics-collection/LyricsCollection.svelte';
  // Import any additional dependencies needed

  // Forward any props/methods that might be accessed from parent components
  export let someProp;

  // Ensure all window methods are exposed for backward compatibility
  onMount(() => {
    // Any additional setup needed
  });
</script>

<LyricsCollection {...$$props} />
```

### 2. Test Compatibility

Before deploying to production:
- Run the app in development mode
- Test all lyric collection functionality
- Verify that all sounds, animations, and UI effects still work
- Confirm backward compatibility with other components

### 3. CSS Migration

The new component imports CSS from the original with:
```svelte
@import url('../PurpleStyleCollectionBox.svelte?inline');
```

This should be replaced with properly scoped CSS in the new component.

### 4. Direct References Update

Find and update any direct references to the original component:

```javascript
// Find components that might be importing or referencing PurpleStyleCollectionBox
const componentsToCheck = [
  'MainContainer.svelte',
  'GhostContainer.svelte',
  'AudioToText.svelte',
  'TranscriptDisplay.svelte'
];
```

### 5. Full Integration

Once testing confirms everything works correctly:
1. Rename wrapper component to original name
2. Remove original component
3. Update imports throughout the codebase

### 6. Final Testing

1. Run full application tests
2. Verify no regressions in functionality
3. Confirm all global API methods work correctly

## Rollback Plan

If issues arise after integration:
1. Revert changes to use the original component
2. Take note of any compatibility issues encountered
3. Fix issues in the new implementation before trying again

## Success Criteria

The integration is considered successful when:
1. All functionality of the original component works correctly
2. No regressions in UI or behavior
3. All global API methods are properly exposed
4. Code is more maintainable with clear separation of concerns