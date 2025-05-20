/**
 * Sound integration functions for TalkType components
 * Provides a consistent interface to the soundService for all app components
 */

import { soundService } from '$lib/services/sound';

// Original sound functions
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

// New sound functions matching the expanded sound library
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