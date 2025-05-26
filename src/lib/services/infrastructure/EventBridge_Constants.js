/**
 * EventBridge_Constants.js
 * 
 * Constants and utility functions for the event bridge system.
 * 
 * This module provides:
 * - Event name prefix constants for both current and legacy systems
 * - Utility functions for event name normalization
 * 
 * Purpose:
 * These utilities ensure consistent event naming and processing across
 * the application, providing a consistent interface for all RiffRap components.
 */

/**
 * Constants for event name prefixes
 * These define the namespace for all custom events in the application
 */
export const EVENT_PREFIXES = {
  CURRENT: 'riffrap'
};

/**
 * Normalize a setting name to be consistent across the application
 * This prevents issues with case sensitivity and special characters
 * 
 * @param {string} settingName - The setting name to normalize (e.g. "Theme", "theme-color", etc.)
 * @returns {string} - The normalized setting name (e.g. "theme", "themecolor")
 * 
 * Examples:
 * normalizeSettingName("Theme") => "theme"
 * normalizeSettingName("theme-color") => "themecolor"
 * normalizeSettingName("AUTO_RECORD") => "autorecord"
 */
export function normalizeSettingName(settingName) {
  // Convert to lowercase, remove any special characters, and trim
  return settingName.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
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