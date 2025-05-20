/**
 * Sound integration functions for lyrics collection component
 * This is a local copy of the main sound-integration.js file
 * to fix import path issues.
 */

import { soundService } from '$lib/services/sound';

// Sound functions needed by the lyrics collection component
export function playGrabSound() {
  return soundService.playGrabSound();
}

export function playEditSound() {
  return soundService.playEditSound();
}

export function playDeleteSound() {
  return soundService.playDeleteSound();
}

export function playDragStartSound() {
  return soundService.playDragStartSound();
}

export function playDropSound() {
  return soundService.playDropSound();
}

export function playCopySound() {
  return soundService.playCopySound();
}

export function playHoverSound() {
  return soundService.playHoverSound();
}

export function playCompileSound() {
  return soundService.playCompileSound();
}

export function playCardHoverSound() {
  return soundService.playCardHoverSound();
}

// Additional sound functions that might be needed
export function playPopOnSound() {
  return soundService.playPopOnSound();
}

export function playPopOffSound() {
  return soundService.playPopOffSound();
}

export function playErrorSound() {
  return soundService.playErrorSound();
}

export function playProcessingSound() {
  return soundService.playProcessingSound();
}

export function playReadySound() {
  return soundService.playReadySound();
}

export function playUndoSound() {
  return soundService.playUndoSound();
}

export function playPopupSound() {
  return soundService.playPopupSound();
}

// Generic sound player with custom options
export function playSound(soundName, options) {
  return soundService.playSound(soundName, options);
}

// Sound state management
export function isSoundEnabled() {
  return soundService.isSoundEnabled();
}

export function setSoundEnabled(enabled) {
  return soundService.setSoundEnabled(enabled);
}

// Export the full service for advanced usage
export { soundService };