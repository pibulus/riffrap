/**
 * EventBridge_Dispatch.js
 * 
 * Event dispatching functions for the application.
 * 
 * This module provides a unified way to emit events to the application, ensuring
 * proper formatting, normalization, and backward compatibility.
 * 
 * Flow:
 * 1. Components call these functions when state changes
 * 2. Events are normalized and formatted
 * 3. Both current and legacy events are dispatched (where applicable)
 * 4. Other components can listen for these events
 */

import { EVENT_PREFIXES, normalizeSettingName, buildEventTypeName } from './EventBridge_Constants';

/**
 * Dispatch a setting change event with both current and legacy formats for compatibility
 * This is the primary method for notifying the application about setting changes
 * 
 * @param {string} settingName - The name of the setting being changed
 *                             Examples: 'theme', 'promptStyle', 'autoRecord'
 * @param {any} value - The new value of the setting
 *                    Examples: 'purple', true, 'standard'
 * @param {boolean} legacyOnly - Whether to only dispatch the legacy event (rarely needed)
 * 
 * Side effects:
 * - Dispatches 'linesnap-setting-changed' CustomEvent
 * - Dispatches 'talktype-setting-changed' CustomEvent (for legacy components)
 * 
 * Used by:
 * - SettingsModal.svelte: For theme changes, sound toggles, etc.
 * - TranscriptionStyleSelector.svelte: For promptStyle changes
 */
export function dispatchSettingChanged(settingName, value, legacyOnly = false) {
  if (typeof window === 'undefined') return;
  
  // Create event detail with normalized setting name
  const detail = {
    setting: normalizeSettingName(settingName),
    value: value
  };
  
  // Always dispatch the current LineSnap event unless specifically requested not to
  if (!legacyOnly) {
    const currentEventType = buildEventTypeName('setting-changed');
    window.dispatchEvent(new CustomEvent(currentEventType, { detail }));
  }
  
  // Also dispatch legacy event format for backward compatibility (will be deprecated)
  const legacyEventType = buildEventTypeName('setting-changed', true);
  window.dispatchEvent(new CustomEvent(legacyEventType, { detail }));
}

/**
 * Dispatch a general application event (not related to settings)
 * Used for lifecycle events, component readiness, and other app-wide notifications
 * 
 * @param {string} eventName - The name of the event without prefix
 *                           Examples: 'componentready', 'transcriptioncomplete'
 * @param {any} detail - The event detail object with relevant data
 * 
 * Side effects:
 * - Dispatches 'linesnap-[eventName]' CustomEvent
 * 
 * Used by:
 * - LyricsCollection.svelte: 'lyricscollectionboxready' event
 * - AudioToText.svelte: 'transcriptioncomplete' event
 */
export function dispatchAppEvent(eventName, detail = {}) {
  if (typeof window === 'undefined') return;
  
  // Use standardized naming convention for all app events
  const eventType = `${EVENT_PREFIXES.CURRENT}-${eventName}`;
  window.dispatchEvent(new CustomEvent(eventType, { detail }));
}