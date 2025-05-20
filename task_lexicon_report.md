# RiffRap (formerly LineSnap) - App Name Change Report

## Overview
This report details the application name change from "LineSnap" to "RiffRap" across the codebase. The change included updating UI components, localStorage keys, event prefixes, and documentation while ensuring backward compatibility.

## Core Files Modified

### 1. UI Components
- **AnimatedTitle.svelte**: Updated letter-by-letter animation for new name (7 letters instead of 8)
- **IntroModal.svelte**: Changed branding message and icon alt text
- **AboutModal.svelte**: Updated company name, description, and icon alt text
- **SettingsModalTemplate.svelte**: Changed multiple UI text references
- **FooterComponent.svelte**: Updated app name in footer

### 2. Settings & Storage
- **SettingsModalCore.svelte**: Implemented dual key loading system for backward compatibility
- **SettingsFeatureHandlers.js**: Added dual key storage for all settings to maintain compatibility

### 3. Events System
- **EventBridge_Constants.js**: Updated event prefix constants, transitioned `linesnap` to legacy status with `riffrap` as current

## Backward Compatibility Measures

### localStorage Key Handling
All settings now save to both old and new format keys:
```javascript
// Old format (preserved for backward compatibility)
localStorage.setItem('lineSnap-export-as-text', value);

// New format (preferred going forward)
localStorage.setItem('riffRap-export-as-text', value);
```

### Loading Function Updates
Settings loaders check both old and new keys:
```javascript
exportAsTextEnabled = localStorage.getItem('riffRap-export-as-text') === 'true' || 
                     localStorage.getItem('lineSnap-export-as-text') === 'true';
```

### Event System Transition
- Updated EventBridge constants: 
  - `LEGACY: 'linesnap'` (formerly current)
  - `CURRENT: 'riffrap'` (new preferred prefix)
- All event dispatches maintain backward compatibility

## Visual Asset Recommendations
The following icon assets should be updated in a future update:
- `/LyricSnapIcon.png` → `/RiffRapIcon.png`
- Update any favicons and theme images with the new branding

## Testing Recommendations
1. Verify the app loads correctly with the new UI name changes
2. Ensure settings save and load properly (both new users and existing users)
3. Confirm event subscriptions still function correctly with the dual-prefix approach
4. Check that localStorage content is properly transitioned for existing users

## Additional Considerations
- A redirected DNS setup might be needed if the app domain name changes to match the new branding
- Consider adding release notes to notify users of the name change
- Update any external documentation or marketing materials