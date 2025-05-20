/**
 * eventBridge.js
 * 
 * Main event bridge service file that provides a standardized way to handle events
 * in the application while maintaining consistent naming conventions.
 * 
 * Features:
 * - Unified event dispatching system across all LineSnap features
 * - Standardized event listening with built-in cleanup functions
 * - Automatic normalization of event names
 * - Legacy support for TalkType events
 * 
 * The event bridge has been modularized into the following components:
 * - EventBridge_Constants.js: Constants and utility functions
 * - EventBridge_Dispatch.js: Event dispatching functions
 * - EventBridge_Listeners.js: Event listening functions
 * - EventBridge_Legacy.js: Legacy compatibility adapters
 * 
 * This modularization improves maintainability, testability, and separation of concerns.
 */

// Import constants and utility functions
import { EVENT_PREFIXES } from './EventBridge_Constants';

// Import event dispatching functions
import { 
  dispatchSettingChanged,
  dispatchAppEvent
} from './EventBridge_Dispatch';

// Import event listening functions
import {
  addSettingChangeListener,
  addAppEventListener
} from './EventBridge_Listeners';

// Import legacy compatibility adapters (optional)
import {
  dispatchLegacySettingChanged,
  convertLegacyEventName,
  addLegacySettingChangeListener
} from './EventBridge_Legacy';

/**
 * Main eventBridge API object
 * This is the primary export that components and services interact with
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
export const eventBridge = {
  // Setting change events (both LineSnap and TalkType)
  dispatchSettingChanged,
  addSettingChangeListener,
  
  // General application events (LineSnap only)
  dispatchAppEvent,
  addAppEventListener,
  
  // Legacy compatibility (for temporary use during migration)
  legacy: {
    dispatchLegacySettingChanged,
    convertLegacyEventName,
    addLegacySettingChangeListener
  },
  
  // Constants exported for direct use if needed
  // (Most components should not need to use these directly)
  EVENT_PREFIXES
};