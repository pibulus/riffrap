# Sound System

This document provides an overview of the sound system in the application. The sound system is designed to provide a cohesive and delightful user experience through subtle audio feedback.

## Overview

The sound system uses a centralized service to manage and play sound effects across the application. All sounds are MP3 files stored in the `/static/sounds/` directory and are played with configurable delays and volumes to enhance user interaction.

## Sound Files

All sound files are located in `/static/sounds/` and have the following purposes:

| Sound File | Purpose |
|------------|---------|
| KidsCheer.mp3 | Positive feedback when compiling/completing a task |
| computer-ready.mp3 | Notification that a process is complete |
| download.mp3 | Confirmation of a successful download or save |
| echo-button.mp3 | General button/edit action sound |
| error-banjo.mp3 | Error notification with a musical tone |
| grab-pop.mp3 | Feedback when grabbing or selecting an item |
| paste-drop.mp3 | Feedback when dropping or placing an item |
| pop-off.mp3 | Toggling a setting or option off |
| pop-on.mp3 | Toggling a setting or option on |
| pop-up-warm.mp3 | Modal or popup appearance |
| scroll-haptic.mp3 | Subtle feedback for scrolling or hovering |
| sweet-error.mp3 | Alternative error notification |
| thinking-ambient.mp3 | Indication that processing is happening |
| undo.mp3 | Confirmation of an undo action |

## Usage

### Basic Usage

The sound system is exposed through the `soundService` which can be imported and used in any component:

```javascript
import { soundService } from '$lib/services/sound';

// Play a specific sound
soundService.playCompileSound();

// Toggle sound on/off
soundService.setSoundEnabled(false);
```

### Interface Components

For components that need multiple sound effects, use the sound-integration.js that acts as a facade for the sound service:

```javascript
import { 
  playGrabSound, 
  playEditSound,
  playCompileSound 
} from './sound-integration.js';

// In event handlers
function handleGrab() {
  playGrabSound();
  // Other logic...
}
```

### Advanced Usage with Custom Configuration

Sounds can be played with custom volume and delay using the generic `playSound` method:

```javascript
import { soundService } from '$lib/services/sound';

// Play a sound with custom parameters
soundService.playSound('popup', { 
  volume: 0.2,  // 20% volume
  delay: 0.3    // 0.3 second delay
});
```

## Configuration

The sound system uses these default configurations:

- **Default Volume**: 15% (0.15)
- **Default Delay**: None (0 seconds) - except for the KidsCheer compile sound which has a 0.6s delay
- **Base Path**: `/sounds/`

The configuration can be customized for specific sounds as shown in the Advanced Usage section.

## Best Practices

1. **Appropriate Sound Selection**:
   - Use `playCompileSound()` for major accomplishments
   - Use `playErrorSound()` for error notifications
   - Use `playPopupSound()` when showing modals

2. **Delay Guidelines**:
   - By default, all sounds play immediately with no delay
   - The compile sound (KidsCheer.mp3) has a 0.6 second delay to build anticipation

3. **Volume Guidelines**:
   - Background/subtle: 0.05-0.1 (5-10%)
   - Standard feedback: 0.1-0.2 (10-20%)
   - Important notifications: 0.15-0.25 (15-25%)

4. **When to Use Sounds**:
   - Use sounds for primary user actions
   - Avoid sounds for continuous actions (like typing)
   - Group related actions to use the same sound for consistency

## Customization

To add new sounds:

1. Add the MP3 file to `/static/sounds/`
2. Update the `soundFiles` object in `soundService.js` with a new mapping
3. Add a convenience function if the sound will be used frequently

Example to add a new "success" sound:
```javascript
// In soundService.js
const soundFiles = {
  // existing sounds...
  success: 'success-chime'
};

function playSuccessSound() {
  return playSound('success');
}

export const soundService = {
  // existing exports...
  playSuccessSound
};
```

## Accessibility

- Sounds are automatically disabled if the user has disabled sounds in their settings
- The sound system respects user preferences stored in localStorage
- All sounds are optional and should not be required for core functionality