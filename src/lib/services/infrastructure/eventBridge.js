/**
 * eventBridge.js
 *
 * Standardized event handling for the application: a thin pub/sub wrapper
 * around window CustomEvents with consistent naming and built-in cleanup.
 *
 * Usage:
 * ```
 * import { eventBridge } from '$lib/services/infrastructure/eventBridge';
 *
 * // To dispatch an event:
 * eventBridge.dispatchSettingChanged('theme', 'purple');
 *
 * // To listen for an event:
 * const cleanup = eventBridge.addSettingChangeListener('theme', (value) => {
 *   console.log(`Theme changed to: ${value}`);
 * });
 *
 * // To clean up:
 * cleanup();
 * ```
 */

/**
 * Constants for event name prefixes
 * These define the namespace for all custom events in the application
 */
export const EVENT_PREFIXES = {
  CURRENT: "riffrap",
};

/**
 * Normalize a setting name to be consistent across the application
 * This prevents issues with case sensitivity and special characters
 *
 * Examples:
 * normalizeSettingName("Theme") => "theme"
 * normalizeSettingName("theme-color") => "themecolor"
 * normalizeSettingName("AUTO_RECORD") => "autorecord"
 *
 * @param {string} settingName - The setting name to normalize
 * @returns {string} - The normalized setting name
 */
export function normalizeSettingName(settingName) {
  return settingName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

/**
 * Builds the full event type name with the RiffRap prefix
 *
 * @param {string} eventType - The type of event (e.g., 'setting-changed')
 * @returns {string} The full event type name
 */
export function buildEventTypeName(eventType) {
  return `${EVENT_PREFIXES.CURRENT}-${eventType}`;
}

/**
 * Dispatch a setting change event
 *
 * @param {string} settingName - The name of the setting being changed
 * @param {any} value - The new value of the setting
 */
export function dispatchSettingChanged(settingName, value) {
  if (typeof window === "undefined") return;

  const detail = {
    setting: normalizeSettingName(settingName),
    value: value,
  };

  window.dispatchEvent(
    new CustomEvent(buildEventTypeName("setting-changed"), { detail }),
  );
}

/**
 * Dispatch a general application event (not related to settings)
 * Used for lifecycle events, component readiness, and other app-wide notifications
 *
 * @param {string} eventName - The name of the event without prefix
 *                           Examples: 'componentready', 'transcriptioncomplete'
 * @param {any} detail - The event detail object with relevant data
 */
export function dispatchAppEvent(eventName, detail = {}) {
  if (typeof window === "undefined") return;

  const eventType = `${EVENT_PREFIXES.CURRENT}-${eventName}`;
  window.dispatchEvent(new CustomEvent(eventType, { detail }));
}

/**
 * Add a listener for setting change events
 *
 * @param {string} settingName - The setting name to listen for (e.g., 'theme', 'autoRecord')
 * @param {function} handler - Callback function that receives (value, event)
 * @returns {function} - Cleanup function that removes the event listener
 */
export function addSettingChangeListener(settingName, handler) {
  if (typeof window === "undefined") return () => {};

  const normalizedName = normalizeSettingName(settingName);

  // Wrapper that filters events so the handler only runs for this setting
  const eventHandler = (event) => {
    if (
      event?.detail?.setting &&
      normalizeSettingName(event.detail.setting) === normalizedName
    ) {
      handler(event.detail.value, event);
    }
  };

  const eventType = buildEventTypeName("setting-changed");
  window.addEventListener(eventType, eventHandler);

  // Components MUST call this function during cleanup to prevent memory leaks
  return () => {
    window.removeEventListener(eventType, eventHandler);
  };
}

/**
 * Add a listener for general application events (not settings-related)
 *
 * @param {string} eventName - The name of the event to listen for (without prefix)
 *                           Examples: 'componentready', 'transcriptioncomplete'
 * @param {function} handler - Event handler function that receives the event object
 * @returns {function} - Cleanup function that removes the event listener
 */
export function addAppEventListener(eventName, handler) {
  if (typeof window === "undefined") return () => {};

  const eventType = `${EVENT_PREFIXES.CURRENT}-${eventName}`;
  window.addEventListener(eventType, handler);

  // Components MUST call this function during cleanup to prevent memory leaks
  return () => {
    window.removeEventListener(eventType, handler);
  };
}

/**
 * Main eventBridge API object
 * This is the primary export that components and services interact with
 */
export const eventBridge = {
  // Setting change events
  dispatchSettingChanged,
  addSettingChangeListener,

  // General application events
  dispatchAppEvent,
  addAppEventListener,

  // Constants exported for direct use if needed
  // (Most components should not need to use these directly)
  EVENT_PREFIXES,
};
