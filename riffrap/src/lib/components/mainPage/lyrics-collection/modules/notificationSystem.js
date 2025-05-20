/**
 * Notification system for lyrics collection component
 * 
 * This module handles displaying toast notifications and visual feedback
 * for user actions.
 */

/**
 * Creates a notification system
 * 
 * @returns {Object} Notification system functions and state
 */
export function createNotificationSystem() {
  // State for notifications
  let notificationText = '';
  let showNotificationPing = false;
  let notificationType = 'info'; // 'info', 'success', 'error'
  let timeoutRef = null;

  /**
   * Show a notification message
   * 
   * @param {string} message - The notification message to display
   * @param {string} type - The notification type ('info', 'success', 'error')
   */
  function showNotification(message, type = 'info') {
    // Log for debugging when in development mode
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log(`Notification (${type}):`, message);
    }
    
    // Clear any existing timeout
    if (timeoutRef) {
      clearTimeout(timeoutRef);
    }
    
    // Set notification values
    notificationText = message;
    notificationType = type;
    showNotificationPing = true;

    // Display for 2.5 seconds
    timeoutRef = setTimeout(() => {
      showNotificationPing = false;
      timeoutRef = null;
    }, 2500);
  }

  /**
   * Get the current notification state
   * 
   * @returns {Object} The current notification state
   */
  function getNotificationState() {
    return {
      notificationText,
      showNotificationPing,
      notificationType
    };
  }

  /**
   * Clean up any active timeouts
   */
  function cleanup() {
    if (timeoutRef) {
      clearTimeout(timeoutRef);
      timeoutRef = null;
    }
  }

  return {
    showNotification,
    getNotificationState,
    cleanup
  };
}