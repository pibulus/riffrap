/**
 * === PROCESSING ZONE: LOGGER SERVICE CORE ===
 * 
 * LineSnap Logger Service
 * 
 * A centralized logging system for consistent debugging across the application.
 * This service is a core infrastructure component that provides a standardized
 * approach to logging, debugging, and development tooling.
 * 
 * Features:
 * - Namespace-based logging to categorize logs by component/service
 * - Log levels (debug, info, warn, error)
 * - Conditional logging based on environment and user preferences
 * - Styled console output for better readability
 * - Safe for production (no logs in production unless explicitly enabled)
 * - Runtime configuration via debug panel
 * - Storage-persistent settings
 * 
 * Architecture:
 * - Uses the factory pattern to create namespaced logger instances
 * - Maintains a centralized configuration through Svelte stores
 * - Provides both a programmatic API and UI controls via DebugPanel
 * - Persists settings in localStorage
 * 
 * Dependencies:
 * - Svelte stores for reactive state
 * - SvelteKit's browser module for SSR safety
 * - LocalStorage for persistence
 * - DOM for console output
 * 
 * Used by:
 * - All components and services for debugging
 * - DebugPanel for configuration
 * - ErrorBoundary for error reporting
 * 
 * TRAIL MARKER (Unit Cleanup): See sanitation_manifest.md for the Route's overall plan.
 */

import { writable, derived, get } from 'svelte/store';
import { STORAGE_KEYS } from '$lib/constants';
import { browser } from '$app/environment';

// === PROCESSING ZONE: CONFIGURATION AND CONSTANTS ===
/**
 * Configuration and constants for the logger system.
 * 
 * This zone contains:
 * - The central configuration store for all logger instances
 * - Constants defining log levels and their priority
 * - Visual styling information for console output
 * 
 * Purpose:
 * Provides shared configuration and styling for all logger instances
 * while ensuring consistent behavior across the application.
 * 
 * Dependencies:
 * INPUT: 
 *  - browser from SvelteKit for SSR safety
 *  - localStorage for persistence of debug settings
 *  - STORAGE_KEYS constants for localStorage keys
 * OUTPUT:
 *  - loggerConfig store used by logger instances
 *  - LOG_LEVELS and LOG_STYLES used by formatting functions
 */

/**
 * Central configuration store for all loggers
 * This is a Svelte writable store that triggers reactivity when changed
 * 
 * Structure:
 * - enabled: Master switch for all logging
 * - level: Minimum log level to display ('debug', 'info', 'warn', 'error')
 * - namespaces: Object mapping namespace names to boolean enabled state
 * 
 * Persistence:
 * - The enabled state is loaded from localStorage on initialization
 * - Changes to this store do not automatically persist to localStorage
 *   (use setDebugMode for that)
 */
export const loggerConfig = writable({
  // Initialize enabled state from localStorage, defaulting to false if not found
  // Wrapped in browser check for SSR safety
  enabled: browser && localStorage.getItem(STORAGE_KEYS.DEBUG_MODE) === 'true',
  
  // Default to 'info' level - shows info, warn, and error logs
  level: 'info', // 'debug', 'info', 'warn', 'error'
  
  // Namespaces are populated dynamically as loggers are created
  // Format: { 'audio': true, 'ui': false, 'api': true }
  namespaces: {}, 
});

/**
 * Log level priority mapping
 * Lower numbers are more verbose (debug shows everything, error shows only errors)
 * Used to filter logs based on the configured minimum level
 */
const LOG_LEVELS = {
  debug: 0,  // Most verbose - shows all logs
  info: 1,   // Shows info, warnings and errors
  warn: 2,   // Shows only warnings and errors
  error: 3   // Least verbose - shows only errors
};

/**
 * Console styling for different log types
 * Uses CSS syntax for console.log styling
 * These styles make it easier to distinguish between log types visually
 */
const LOG_STYLES = {
  debug: 'color: #9c9c9c',                    // Light gray for debug logs
  info: 'color: #0088ff',                     // Blue for info logs
  warn: 'color: #ffbb00',                     // Amber for warnings
  error: 'color: #ff0055',                    // Red for errors
  namespace: 'color: #8855ff; font-weight: bold', // Purple for namespace
  reset: ''                                   // Reset to default style
};
// === END PROCESSING ZONE: CONFIGURATION AND CONSTANTS ===

// TRAIL MARKER (Unit Cleanup): If route is lost, consult sanitation_manifest.md.

// === PROCESSING ZONE: LOGGER FACTORY ===
/**
 * Logger factory implementation - creates namespaced logger instances.
 * 
 * This zone contains:
 * - The createLogger factory function
 * - Internal helper functions for log filtering and formatting
 * - Logger instance methods for each log level
 * 
 * Purpose:
 * The factory pattern allows components to create their own namespaced
 * logger instances while sharing the same underlying configuration.
 * 
 * Architecture:
 * - Factory function that returns a logger instance
 * - Each logger instance has methods for different log levels
 * - Automatic namespace registration in the central config
 * - Conditional logging based on namespace and level filters
 * - Consistent formatting across all loggers
 * 
 * Dependencies:
 * INPUT: 
 *  - loggerConfig from CONFIGURATION AND CONSTANTS zone
 *  - LOG_LEVELS and LOG_STYLES from CONFIGURATION AND CONSTANTS zone
 * OUTPUT:
 *  - createLogger factory function used throughout the application
 *  - Registers namespaces in the central configuration
 */

/**
 * Create a logger with a specific namespace
 * This is the main factory function used by components and services
 * 
 * @param {string} namespace - The namespace for this logger instance (typically component/service name)
 * @returns {Object} Logger instance with methods for each log level
 * 
 * Example usage:
 * ```
 * // In a component file
 * const logger = createLogger('MyComponent');
 * 
 * // Later in the code
 * logger.info('Component initialized', { props });
 * logger.error('Failed to load data', error);
 * ```
 * 
 * Side effects:
 * - Registers the namespace in loggerConfig if not already present
 */
export function createLogger(namespace) {
  // Normalize namespace for consistent tracking and display
  let normalizedNamespace = namespace.toLowerCase().trim(); 
  
  // Initialize this namespace in the config if not present
  // This ensures the namespace appears in the debug panel
  loggerConfig.update(config => {
    if (config.namespaces[normalizedNamespace] === undefined) {
      config.namespaces[normalizedNamespace] = true; // Enable by default
    }
    return config;
  });

  /**
   * Check if this namespace is currently enabled
   * A namespace is enabled if:
   * 1. Global logging is enabled AND
   * 2. This specific namespace is not explicitly disabled
   * 
   * @returns {boolean} Whether this namespace is enabled
   */
  const isNamespaceEnabled = () => {
    const config = get(loggerConfig);
    return config.enabled && config.namespaces[normalizedNamespace] !== false;
  };

  /**
   * Determine if a specific log level should be shown
   * Based on both namespace status and configured minimum log level
   * 
   * @param {string} level - The log level ('debug', 'info', 'warn', 'error')
   * @returns {boolean} Whether this log level should be displayed
   */
  const shouldLog = (level) => {
    // First check if namespace is enabled at all
    if (!isNamespaceEnabled()) return false;
    
    // Then check if log level meets threshold
    const config = get(loggerConfig);
    return LOG_LEVELS[level] >= LOG_LEVELS[config.level];
  };

  /**
   * Format the log message with timestamp, level, namespace and styling
   * Creates a consistently formatted log with visual styling
   * 
   * @param {string} level - The log level
   * @param {string} message - The log message
   * @param {Array} args - Additional args to log
   * @returns {Array|[]} - Formatted args for console or empty array if should not log
   */
  const formatLog = (level, message, ...args) => {
    // Early return if logging is disabled for this namespace/level
    if (!shouldLog(level)) return [];
    
    // Format timestamp as HH:MM:SS
    const timestamp = new Date().toISOString().substr(11, 8);
    
    // Format prefix with console styling
    const prefix = `%c${timestamp} [${level.toUpperCase()}] %c${namespace}:%c`;
    
    // Return formatted arguments for console
    // We use array spread to maintain proper argument passing to console methods
    return [
      prefix,  // The formatted prefix string
      LOG_STYLES[level],  // CSS style for log level
      LOG_STYLES.namespace,  // CSS style for namespace
      LOG_STYLES.reset,  // Reset style for the main message
      message,  // The actual log message
      ...args  // Any additional arguments (objects, arrays, etc.)
    ];
  };

  // Return the logger object with methods for each log level
  // Each method follows the same pattern but uses the appropriate console method
  return {
    /**
     * Log a debug message
     * For detailed information useful during development
     * Only shown when log level is set to 'debug'
     */
    debug(message, ...args) {
      const logArgs = formatLog('debug', message, ...args);
      if (logArgs.length > 0) console.debug(...logArgs);
    },
    
    /**
     * Log an info message
     * For general information about normal operation
     * Shown when log level is 'debug' or 'info'
     */
    info(message, ...args) {
      const logArgs = formatLog('info', message, ...args);
      if (logArgs.length > 0) console.info(...logArgs);
    },
    
    /**
     * Log a warning message
     * For concerning but non-critical issues
     * Shown when log level is 'debug', 'info', or 'warn'
     */
    warn(message, ...args) {
      const logArgs = formatLog('warn', message, ...args);
      if (logArgs.length > 0) console.warn(...logArgs);
    },
    
    /**
     * Log an error message
     * For critical errors that affect functionality
     * Always shown regardless of log level (as long as namespace is enabled)
     */
    error(message, ...args) {
      const logArgs = formatLog('error', message, ...args);
      if (logArgs.length > 0) console.error(...logArgs);
    },
    
    // Advanced logging methods
    
    /**
     * Create a collapsible group in the console
     * Useful for organizing related logs
     */
    group(label) {
      if (isNamespaceEnabled()) console.group(`[${namespace}] ${label}`);
    },
    
    /**
     * End a console group
     * Must be called after group() to close the group
     */
    groupEnd() {
      if (isNamespaceEnabled()) console.groupEnd();
    },
    
    /**
     * Log tabular data in a formatted table
     * Useful for displaying arrays and objects
     */
    table(data) {
      if (isNamespaceEnabled()) console.table(data);
    }
  };
}
// === END PROCESSING ZONE: LOGGER FACTORY ===

// TRAIL MARKER (Unit Cleanup): This factory creates logger instances with namespace isolation.

// === PROCESSING ZONE: CONFIGURATION MANAGEMENT ===
/**
 * Runtime configuration management for the logger system.
 * 
 * This zone contains:
 * - Functions to modify logger configuration
 * - Persistence logic for saving configuration to localStorage
 * 
 * Purpose:
 * Provides a clean API for runtime configuration changes
 * while handling persistence and reactivity automatically.
 * 
 * Architecture:
 * - Public functions for changing configuration
 * - Updates to the central loggerConfig store trigger reactivity
 * - Persistence to localStorage for settings that should survive page reloads
 * 
 * Dependencies:
 * INPUT: 
 *  - loggerConfig from CONFIGURATION AND CONSTANTS zone
 *  - LOG_LEVELS from CONFIGURATION AND CONSTANTS zone
 *  - browser from SvelteKit for SSR safety
 *  - localStorage for persistence
 * OUTPUT:
 *  - Public configuration functions used by debug UI
 *  - Updates to loggerConfig that affect all loggers
 */

/**
 * Toggle debug mode on/off and persist the setting
 * This is the main switch for the entire logging system
 * 
 * @param {boolean} enabled - Whether to enable debug mode
 * 
 * Side effects:
 * - Updates loggerConfig.enabled, affecting all loggers immediately
 * - Saves the setting to localStorage for persistence across page loads
 * 
 * Used by:
 * - DebugPanel UI toggle
 * - consoleHelper.enableAll/disableAll
 */
export function setDebugMode(enabled) {
  if (browser) {
    // Persist to localStorage first
    localStorage.setItem(STORAGE_KEYS.DEBUG_MODE, enabled ? 'true' : 'false');
    
    // Then update the store to trigger reactivity
    loggerConfig.update(config => ({ ...config, enabled }));
  }
}

/**
 * Set the minimum log level to display
 * Controls which types of logs are shown (debug, info, warn, error)
 * 
 * @param {string} level - Log level: 'debug', 'info', 'warn', or 'error'
 * 
 * Side effects:
 * - Updates loggerConfig.level, affecting log filtering for all loggers
 * - Does not persist to localStorage (resets on page reload)
 * 
 * Used by:
 * - Debug panel log level selector
 */
export function setLogLevel(level) {
  // Validate the level before updating
  if (LOG_LEVELS[level] !== undefined) {
    loggerConfig.update(config => ({ ...config, level }));
  }
}

/**
 * Enable or disable a specific namespace
 * Controls which components/services can log messages
 * 
 * @param {string} namespace - The namespace to configure (e.g., 'audio', 'api')
 * @param {boolean} enabled - Whether to enable the namespace
 * 
 * Side effects:
 * - Updates loggerConfig.namespaces, affecting which loggers can output
 * - Does not persist to localStorage (resets on page reload)
 * 
 * Used by:
 * - Debug panel namespace toggles
 * - consoleHelper.configureNamespace
 */
export function configureNamespace(namespace, enabled) {
  // Normalize the namespace for consistent matching
  const normalizedNamespace = namespace.toLowerCase().trim();
  
  // Update the store with the new namespace setting
  loggerConfig.update(config => ({
    ...config,
    namespaces: {
      ...config.namespaces,
      [normalizedNamespace]: enabled
    }
  }));
}
// === END PROCESSING ZONE: CONFIGURATION MANAGEMENT ===

// TRAIL MARKER (Unit Cleanup): These functions control logger behavior at runtime.

// === PROCESSING ZONE: SINGLETON INSTANCES ===
/**
 * Singleton logger instances available for direct import.
 * 
 * This zone contains:
 * - Default shared logger instance for the app
 * 
 * Purpose:
 * Provides a convenient way to access a logger without creating
 * a new instance when a component-specific logger isn't needed.
 * 
 * Dependencies:
 * INPUT: createLogger from LOGGER FACTORY zone
 * OUTPUT: logger instance available for direct import
 */

/**
 * Default application-level logger
 * Use this for general logging not tied to a specific component
 * 
 * @type {Object} - Logger instance with standard methods
 * 
 * Example usage:
 * ```
 * import { logger } from '$lib/services/infrastructure/loggerService';
 * 
 * logger.info('Application initialized');
 * ```
 */
export const logger = createLogger('App');
// === END PROCESSING ZONE: SINGLETON INSTANCES ===

// === PROCESSING ZONE: CONSOLE HELPER UTILITIES ===
/**
 * Console helper utilities for debug panel and direct manipulation.
 * 
 * This zone contains:
 * - Browser console utilities for controlling the logger system
 * - Helper methods for the DebugPanel component
 * 
 * Purpose:
 * Provides utilities for interactive debugging and inspection
 * of the logger system, both programmatically and via DebugPanel.
 * 
 * Architecture:
 * - Browser console commands for debugging and inspection
 * - Helper methods for the DebugPanel to access logger configuration
 * - Convenience methods for common configuration operations
 * 
 * Dependencies:
 * INPUT: 
 *  - loggerConfig from CONFIGURATION AND CONSTANTS zone
 *  - setDebugMode and configureNamespace from CONFIGURATION MANAGEMENT zone
 * OUTPUT:
 *  - consoleHelper object with debugging utilities
 *  - Used by DebugPanel.svelte component
 */

/**
 * Browser console utility for debugging the logger system
 * Provides interactive methods for inspecting and controlling logging
 * 
 * @type {Object} - Object with utility methods
 * 
 * Console usage examples:
 * ```
 * // In browser console:
 * import('/lib/services/infrastructure/loggerService.js')
 *   .then(m => window.logger = m.consoleHelper);
 * 
 * // Then use:
 * logger.showConfig();
 * logger.enableAll();
 * ```
 */
export const consoleHelper = {
  /**
   * Display the current logger configuration in the console
   * Shows enabled state, log level, and namespace settings
   */
  showConfig() {
    console.log('📋 Logger Configuration:', get(loggerConfig));
  },
  
  /**
   * List all registered logger namespaces and their enabled state
   * Displays as a formatted table in the console
   */
  listNamespaces() {
    const config = get(loggerConfig);
    console.log('🏷️ Active Logger Namespaces:');
    console.table(Object.entries(config.namespaces)
      .map(([namespace, enabled]) => ({ namespace, enabled })));
  },
  
  /**
   * Enable all logging namespaces and turn on debug mode
   * Useful for debugging issues that span multiple components
   */
  enableAll() {
    loggerConfig.update(config => {
      const updatedNamespaces = {};
      Object.keys(config.namespaces).forEach(ns => {
        updatedNamespaces[ns] = true;
      });
      return {
        ...config,
        enabled: true,
        namespaces: updatedNamespaces
      };
    });
    console.log('✅ All logging namespaces enabled');
  },
  
  /**
   * Disable all logging by turning off debug mode
   * Quick way to silence all logs without changing namespace settings
   */
  disableAll() {
    setDebugMode(false);
    console.log('❌ Debug mode disabled');
  },
  
  /**
   * Internal method to get the current store value
   * Used by the DebugPanel component to access configuration
   * @private
   * @returns {Object} Current logger configuration
   */
  _getStoreValue() {
    return get(loggerConfig);
  },
  
  /**
   * Configure a specific namespace's enabled state
   * Proxy method that calls the main configureNamespace function
   * 
   * @param {string} namespace - The namespace to configure
   * @param {boolean} enabled - Whether to enable or disable the namespace
   */
  configureNamespace(namespace, enabled) {
    configureNamespace(namespace, enabled);
  },
  
  /**
   * Get the current logger configuration object
   * @returns {Object} Current logger configuration
   */
  getConfig() {
    return get(loggerConfig);
  }
};
// === END PROCESSING ZONE: CONSOLE HELPER UTILITIES ===

// TRAIL MARKER (Unit Cleanup): Console helper provides debug panel interface.

// === PROCESSING ZONE: REACTIVE STORES ===
/**
 * Reactive stores derived from logger configuration.
 * 
 * This zone contains:
 * - Derived stores for components to reactively access logger state
 * 
 * Purpose:
 * Provides reactive access to logger configuration for UI components
 * that need to respond to logger state changes.
 * 
 * Architecture:
 * - Uses Svelte's derived stores to create reactive values
 * - Subscribes to the main loggerConfig store for updates
 * - Updates UI components automatically when configuration changes
 * 
 * Dependencies:
 * INPUT: loggerConfig from CONFIGURATION AND CONSTANTS zone
 * OUTPUT: Reactive stores for UI components
 */

/**
 * Reactive store that tracks if debug mode is enabled
 * Used by components to conditionally show debug UI elements
 * 
 * @type {import('svelte/store').Readable<boolean>}
 * 
 * Example usage in a Svelte component:
 * ```svelte
 * <script>
 *   import { isDebugMode } from '$lib/services/infrastructure/loggerService';
 * </script>
 * 
 * {#if $isDebugMode}
 *   <div class="debug-panel">Debug content here</div>
 * {/if}
 * ```
 */
export const isDebugMode = derived(
  loggerConfig,
  $config => $config.enabled
);
// === END PROCESSING ZONE: REACTIVE STORES ===