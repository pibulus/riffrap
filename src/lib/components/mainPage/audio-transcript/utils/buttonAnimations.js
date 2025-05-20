/**
 * Animation utilities for RecordButtonWithTimer component
 */

import { ANIMATION } from '$lib/constants';

/**
 * Handles animation for button press effect
 * @param {HTMLElement} element - The button element to animate
 */
export function animateButtonPress(element) {
  if (!element) return;
  
  element.classList.remove('button-press');
  void element.offsetWidth; // Force reflow
  element.classList.add('button-press');
  
  setTimeout(() => {
    if (element) {
      element.classList.remove('button-press');
    }
  }, ANIMATION.BUTTON.PRESS_DURATION);
}

/**
 * Handles animation for lyrics collection success
 * @param {HTMLElement} element - The button element to animate
 * @param {Function} setShowMessage - Function to set message visibility state
 * @param {Function} clearTimeout - Function to clear previous timeout
 * @param {Function} setTimeout - Function to set new timeout
 * @param {Object} state - Current state object
 * @param {Boolean} state.showLyricMessage - Whether to show the lyrics message
 * @param {Number|null} state.lyricMessageTimeout - Current timeout ID if any
 * @returns {Object} Updated state object
 */
export function handleLyricsCollectionAnimation(element, state, { setShowMessage, clearExistingTimeout, setNewTimeout }) {
  // Show the message
  setShowMessage(true);
  
  // Clear existing timeout if there is one
  if (state.lyricMessageTimeout) {
    clearExistingTimeout(state.lyricMessageTimeout);
  }
  
  // Auto-hide after 2 seconds
  const newTimeout = setNewTimeout(() => {
    setShowMessage(false);
  }, 2000);
  
  // Animate button for visual feedback
  if (element) {
    element.classList.add('lyrics-collected-animation');
    setTimeout(() => {
      if (element) { // Check element still exists
        element.classList.remove('lyrics-collected-animation');
      }
    }, 2000);
  }
  
  // Return updated state
  return {
    ...state,
    showLyricMessage: true,
    lyricMessageTimeout: newTimeout
  };
}

/**
 * Calculates time remaining for recording
 * @param {Number} recordingDuration - Current duration of recording in seconds
 * @param {Boolean} isPremiumUser - Whether user is premium
 * @returns {Number} Time remaining in seconds
 */
export function getTimeRemaining(recordingDuration, isPremiumUser) {
  const timeLimit = isPremiumUser 
    ? ANIMATION.RECORDING.PREMIUM_LIMIT 
    : ANIMATION.RECORDING.FREE_LIMIT;
  return timeLimit - recordingDuration;
}

/**
 * Format timer display (MM:SS)
 * @param {Number} seconds - Seconds to format
 * @returns {String} Formatted time string
 */
export function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}