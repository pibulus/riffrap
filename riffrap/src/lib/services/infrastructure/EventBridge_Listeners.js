/**
 * EventBridge_Listeners.js
 * 
 * Event listening functions for the application.
 * 
 * This module provides:
 * - Functions to add event listeners for setting changes
 * - Functions to add event listeners for general application events
 * - Automatic cleanup functions to prevent memory leaks
 * 
 * Purpose:
 * Provides a unified way to listen for application events with proper
 * cleanup, normalization, and handling of both current and legacy events.
 * 
 * Flow:
 * 1. Components register event listeners during initialization
 * 2. Listener wrapper validates and normalizes events
 * 3. Component handlers are called only for matching events
 * 4. Components use returned cleanup function during destruction
 * 
 * Example usage:
 * ```
 * // In a component's onMount:
 * const removeListener = eventBridge.addSettingChangeListener('theme', (value) => {
 *   // Handle theme change
 * });
 * 
 * // In onDestroy:
 * removeListener();
 * ```
 */

import { EVENT_PREFIXES, normalizeSettingName, buildEventTypeName } from './EventBridge_Constants';

/**
 * Add an event listener that handles both LineSnap and TalkType events for settings
 * This function listens for both legacy and current events for maximum compatibility
 * 
 * @param {string} settingName - The setting name to listen for (e.g., 'theme', 'autoRecord')
 * @param {function} handler - Callback function that receives (value, event)
 * @returns {function} - Cleanup function that removes both event listeners
 * 
 * The handler function receives:
 * @callback handlerCallback
 * @param {any} value - The new value of the setting
 * @param {CustomEvent} event - The original event object
 * 
 * Dependencies:
 * - Listens for events dispatched by dispatchSettingChanged()
 * 
 * Used by:
 * - LyricsCollection.svelte: For theme changes
 * - MainContainer.svelte: For various settings
 */
export function addSettingChangeListener(settingName, handler) {
  if (typeof window === 'undefined') return () => {};
  
  // Normalize the setting name for consistent matching
  const normalizedName = normalizeSettingName(settingName);
  
  // Create a wrapper function that checks if the event is for this setting
  // This acts as a filter so the handler only runs for relevant events
  const eventHandler = (event) => {
    // Only call handler if setting name matches
    if (event?.detail?.setting && normalizeSettingName(event.detail.setting) === normalizedName) {
      handler(event.detail.value, event);
    }
  };
  
  // Add listeners for both current and legacy events
  // This ensures the component will receive events regardless of source
  const currentEventType = buildEventTypeName('setting-changed');
  const legacyEventType = buildEventTypeName('setting-changed', true);
  
  window.addEventListener(currentEventType, eventHandler);
  window.addEventListener(legacyEventType, eventHandler);
  
  // Return a function that removes both listeners
  // Components MUST call this function during cleanup to prevent memory leaks
  return () => {
    window.removeEventListener(currentEventType, eventHandler);
    window.removeEventListener(legacyEventType, eventHandler);
  };
}

/**
 * Add a listener for general application events (not settings-related)
 * Only listens for LineSnap events (no legacy compatibility needed)
 * 
 * @param {string} eventName - The name of the event to listen for (without prefix)
 *                           Examples: 'componentready', 'transcriptioncomplete'
 * @param {function} handler - Event handler function that receives the event object
 * @returns {function} - Cleanup function that removes the event listener
 * 
 * The handler function receives:
 * @callback handlerCallback
 * @param {CustomEvent} event - The event object with detail property
 * 
 * Dependencies:
 * - Listens for events dispatched by dispatchAppEvent()
 * 
 * Used by:
 * - MainContainer.svelte: For component readiness events
 * - AudioToText.svelte: For transcription lifecycle events
 */
export function addAppEventListener(eventName, handler) {
  if (typeof window === 'undefined') return () => {};
  
  // Format the full event type with prefix
  const eventType = `${EVENT_PREFIXES.CURRENT}-${eventName}`;
  
  // Add the event listener
  window.addEventListener(eventType, handler);
  
  // Return cleanup function
  // Components MUST call this function during cleanup to prevent memory leaks
  return () => {
    window.removeEventListener(eventType, handler);
  };
}