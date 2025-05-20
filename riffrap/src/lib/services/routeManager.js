/**
 * RouteManager Service
 * 
 * Centralized service for managing route-related functionality in LineSnap.
 * Handles page transitions, dynamic route params, and navigation state.
 */

import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { get, writable } from 'svelte/store';
import { eventBridge } from './infrastructure/eventBridge';
import { createLogger } from './infrastructure/loggerService';

// Create logger for this service
const logger = createLogger('RouteManager');

// Store to track navigation state
export const navState = writable({
  previousRoute: null,
  currentRoute: '/',
  transitionInProgress: false
});

/**
 * Navigate to a different route with animation support
 * @param {string} path - The path to navigate to
 * @param {Object} options - Navigation options
 * @param {boolean} options.replaceState - Whether to replace current history entry 
 * @param {boolean} options.animated - Whether to animate the transition
 */
export function navigateTo(path, options = { replaceState: false, animated: true }) {
  if (!browser) return;
  
  logger.info(`Navigating to: ${path}`);
  
  // Update the navigation state
  const current = get(navState);
  navState.set({
    previousRoute: current.currentRoute,
    currentRoute: path,
    transitionInProgress: options.animated
  });
  
  // If animation is enabled, dispatch an event for transition handlers
  if (options.animated) {
    eventBridge.dispatchAppEvent('navigationstarted', { to: path, from: current.currentRoute });
    
    // Reset the transition flag after navigation completes
    setTimeout(() => {
      navState.update(state => ({ ...state, transitionInProgress: false }));
      eventBridge.dispatchAppEvent('navigationcompleted', { path });
    }, 350); // Match with transition duration in CSS
  }
  
  // Perform the actual navigation
  goto(path, { replaceState: options.replaceState });
}

/**
 * Get URL parameters from the current page
 * @returns {Object} The URL parameters as an object
 */
export function getUrlParams() {
  if (!browser) return {};
  
  const currentPage = get(page);
  return currentPage?.params || {};
}

/**
 * Get query parameters from the current URL
 * @returns {URLSearchParams} The query parameters
 */
export function getQueryParams() {
  if (!browser) return new URLSearchParams();
  
  const currentPage = get(page);
  return new URLSearchParams(currentPage?.url?.search || '');
}

// Export the route manager service
export const routeManager = {
  navigateTo,
  getUrlParams,
  getQueryParams,
  navState
};

export default routeManager;