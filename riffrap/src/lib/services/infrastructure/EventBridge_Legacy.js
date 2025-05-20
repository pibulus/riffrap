/**
 * EventBridge_Legacy.js
 * 
 * Legacy compatibility adapters for the event bridge system.
 * 
 * This module provides:
 * - Compatibility functions for legacy TalkType event formats
 * - Migration utilities for transitioning from old to new event formats
 * - Temporary bridges for maintaining compatibility with older code
 * 
 * Purpose:
 * Ensures that the application can transition smoothly from TalkType to LineSnap
 * event formats without breaking existing functionality.
 * 
 * Note:
 * This module is intended to be temporary and should be phased out as 
 * legacy components are updated to use the new event format directly.
 */

import { EVENT_PREFIXES, normalizeSettingName } from './EventBridge_Constants';
import { dispatchSettingChanged, dispatchAppEvent } from './EventBridge_Dispatch';

/**
 * Legacy method to dispatch TalkType setting events without LineSnap equivalent
 * This should only be used for components that haven't been migrated yet
 * 
 * @param {string} settingName - The name of the setting being changed
 * @param {any} value - The new value of the setting
 */
export function dispatchLegacySettingChanged(settingName, value) {
  dispatchSettingChanged(settingName, value, true);
}

/**
 * Convert a legacy TalkType event name to a LineSnap event name
 * Useful for migrating event binding code from old to new format
 * 
 * @param {string} legacyEventName - TalkType event name (e.g., 'talktype-theme-changed')
 * @returns {string} Equivalent LineSnap event name (e.g., 'linesnap-theme-changed')
 */
export function convertLegacyEventName(legacyEventName) {
  // Check if it starts with the legacy prefix
  if (legacyEventName.startsWith(`${EVENT_PREFIXES.LEGACY}-`)) {
    // Replace the prefix with the current one
    return legacyEventName.replace(
      `${EVENT_PREFIXES.LEGACY}-`, 
      `${EVENT_PREFIXES.CURRENT}-`
    );
  }
  
  // If it doesn't start with the legacy prefix, return as is
  return legacyEventName;
}

/**
 * Add a listener for legacy TalkType events only
 * This should only be used for components that rely exclusively on legacy events
 * 
 * @param {string} settingName - The setting name to listen for (e.g., 'theme')
 * @param {function} handler - Callback function that receives (value, event)
 * @returns {function} - Cleanup function that removes the event listener
 */
export function addLegacySettingChangeListener(settingName, handler) {
  if (typeof window === 'undefined') return () => {};
  
  const normalizedName = normalizeSettingName(settingName);
  
  const eventHandler = (event) => {
    if (event?.detail?.setting && normalizeSettingName(event.detail.setting) === normalizedName) {
      handler(event.detail.value, event);
    }
  };
  
  // Only add listener for legacy event
  const legacyEventType = `${EVENT_PREFIXES.LEGACY}-setting-changed`;
  window.addEventListener(legacyEventType, eventHandler);
  
  // Return cleanup function
  return () => {
    window.removeEventListener(legacyEventType, eventHandler);
  };
}