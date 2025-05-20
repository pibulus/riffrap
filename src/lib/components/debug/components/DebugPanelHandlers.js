/**
 * DebugPanelHandlers.js
 * 
 * This module contains all the handler functions for the debug panel.
 * It was extracted from DebugPanel.svelte as part of the code sanitation process
 * to separate business logic from UI rendering and component lifecycle management.
 * 
 * === PROCESSING ZONES ===
 * - DEBUG STATE HANDLERS: Functions for toggling debug mode and panel state
 * - NAMESPACE MANAGEMENT: Functions for managing logger namespaces
 * - CONSOLE UTILITIES: Helpers for console output and configuration
 * 
 * TRAIL MARKER (Unit Cleanup): See sanitation_manifest.md for the Route's overall plan.
 */

import { createLogger, consoleHelper } from '$lib/services/infrastructure/loggerService';

// Create a logger for this module
const logger = createLogger('DebugPanelHandlers');

// === PROCESSING ZONE: DEBUG STATE HANDLERS ===
/**
 * Toggle debug mode activation state
 * Controls whether the debug features are active
 * 
 * @param {Object} state - Current state object
 * @param {Function} onActivate - Optional callback when debug is activated
 * @param {Function} onDeactivate - Optional callback when debug is deactivated
 * @returns {Object} Updated state
 */
export function toggleDebug(state, onActivate = () => {}, onDeactivate = () => {}) {
  const { debugActive, name } = state;
  const newDebugActive = !debugActive;
  
  if (newDebugActive) {
    logger.info(`Debug mode activated for ${name}`);
    onActivate(); // Call the user-provided callback
  } else {
    logger.info(`Debug mode deactivated for ${name}`);
    onDeactivate(); // Call the user-provided callback
  }
  
  return {
    debugActive: newDebugActive,
    // Auto-collapse panel when deactivating for better UX
    panelExpanded: newDebugActive ? state.panelExpanded : false
  };
}

/**
 * Toggle panel expansion state
 * Controls whether the panel is collapsed or expanded
 * 
 * @param {Object} state - Current state object
 * @returns {Object} Updated state with new panel expansion state
 */
export function togglePanel(state) {
  // Only allow toggling when debug is active
  if (!state.debugActive) return state;
  
  const newPanelExpanded = !state.panelExpanded;
  
  return {
    panelExpanded: newPanelExpanded
  };
}
// === END PROCESSING ZONE: DEBUG STATE HANDLERS ===

// === PROCESSING ZONE: NAMESPACE MANAGEMENT ===
/**
 * Refresh the list of available namespaces
 * Retrieves current namespace data from loggerService
 * 
 * @returns {Promise<Array>} Promise resolving to array of namespace objects
 */
export function refreshNamespaces() {
  // Show namespaces in console for reference
  consoleHelper.listNamespaces();
  
  // Return a promise that will resolve with the namespaces
  return new Promise((resolve) => {
    // Use setTimeout to avoid blocking the UI
    setTimeout(() => {
      try {
        // Get configuration via the private API
        const storeValue = consoleHelper._getStoreValue();
        
        if (storeValue && storeValue.namespaces) {
          // Convert object to array format for UI rendering
          // Sort alphabetically for consistent display
          const namespaces = Object.entries(storeValue.namespaces)
            .map(([namespace, enabled]) => ({ namespace, enabled }))
            .sort((a, b) => a.namespace.localeCompare(b.namespace));
          
          logger.debug('Retrieved namespaces:', namespaces.length);
          resolve(namespaces);
        } else {
          logger.warn('Could not retrieve namespaces from store');
          resolve([]);
        }
      } catch (err) {
        logger.error('Error retrieving namespaces:', err);
        resolve([]);
      }
    }, 0);
  });
}

/**
 * Toggle a specific namespace's enabled state
 * Inverts the current enabled state of the namespace
 * 
 * @param {string} namespace - The namespace to toggle
 * @param {Array} allNamespaces - Current namespaces array
 * @returns {Promise<Array>} Promise resolving to updated namespaces array
 */
export function toggleNamespace(namespace, allNamespaces) {
  if (!namespace) return Promise.resolve(allNamespaces);
  
  // Find the current status and invert it
  const isEnabled = !allNamespaces.find(n => n.namespace === namespace)?.enabled;
  
  // Update the configuration
  consoleHelper.configureNamespace(namespace, isEnabled);
  logger.info(`${namespace} namespace ${isEnabled ? 'enabled' : 'disabled'}`);
  
  // Refresh the list to show updated state
  return refreshNamespaces();
}
// === END PROCESSING ZONE: NAMESPACE MANAGEMENT ===

// === PROCESSING ZONE: CONSOLE UTILITIES ===
/**
 * Show logger configuration in the console
 * Calls the consoleHelper to display configuration
 */
export function showConsoleConfig() {
  consoleHelper.showConfig();
}

/**
 * Enable all logging namespaces
 * Useful for troubleshooting when you need all logs
 * 
 * @returns {Promise<Array>} Promise resolving to updated namespaces array
 */
export function enableAllNamespaces() {
  consoleHelper.enableAll();
  return refreshNamespaces();
}

/**
 * Disable all logging
 * Useful for reducing noise by turning off all logging
 * 
 * @returns {Promise<Array>} Promise resolving to updated namespaces array
 */
export function disableAllNamespaces() {
  consoleHelper.disableAll();
  return refreshNamespaces();
}
// === END PROCESSING ZONE: CONSOLE UTILITIES ===

// TRAIL MARKER (Unit Cleanup): This module contains all handler functions from DebugPanel.svelte