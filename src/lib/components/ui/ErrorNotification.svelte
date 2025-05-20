<script>
  import { onMount, onDestroy } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import { eventBridge } from '$lib/services/infrastructure/eventBridge';
  
  export let duration = 5000; // How long to show the notification in ms
  export let position = 'top-right'; // Position of the notification
  
  let notifications = [];
  let notificationListener;
  
  onMount(() => {
    // Listen for global notification events
    notificationListener = eventBridge.addAppEventListener('show-notification', (event) => {
      if (event.detail) {
        addNotification(event.detail);
      }
    });
  });
  
  onDestroy(() => {
    if (notificationListener) notificationListener();
  });
  
  // Add a new notification
  function addNotification(notification) {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    const notificationWithDefaults = {
      id,
      type: 'info', // info, success, warning, error
      message: '',
      duration: duration,
      dismissable: true,
      ...notification
    };
    
    // Add the notification to the array
    notifications = [...notifications, notificationWithDefaults];
    
    // Set timeout to remove it
    if (notificationWithDefaults.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notificationWithDefaults.duration);
    }
  }
  
  // Remove a notification by ID
  function removeNotification(id) {
    notifications = notifications.filter(n => n.id !== id);
  }
  
  // Get class based on notification type
  function getTypeClass(type) {
    switch (type) {
      case 'error':
        return 'notification-error';
      case 'warning':
        return 'notification-warning';
      case 'success':
        return 'notification-success';
      case 'info':
      default:
        return 'notification-info';
    }
  }
  
  // Get icon based on notification type
  function getTypeIcon(type) {
    switch (type) {
      case 'error':
        return '⚠️';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      case 'info':
      default:
        return 'ℹ️';
    }
  }
</script>

{#if notifications.length > 0}
  <div class="notification-container notification-{position}">
    {#each notifications as notification (notification.id)}
      <div 
        class="notification {getTypeClass(notification.type)}"
        in:fly={{ y: position.includes('top') ? -20 : 20, duration: 300 }}
        out:fade={{ duration: 200 }}
      >
        <div class="notification-icon">
          {getTypeIcon(notification.type)}
        </div>
        <div class="notification-content">
          <div class="notification-message">{notification.message}</div>
        </div>
        {#if notification.dismissable}
          <button 
            class="notification-close" 
            on:click={() => removeNotification(notification.id)}
            aria-label="Close notification"
          >
            ×
          </button>
        {/if}
      </div>
    {/each}
  </div>
{/if}

<style>
  .notification-container {
    position: fixed;
    z-index: 1000;
    max-width: 100%;
    width: 350px;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .notification-top-right {
    top: 20px;
    right: 20px;
  }
  
  .notification-top-left {
    top: 20px;
    left: 20px;
  }
  
  .notification-bottom-right {
    bottom: 20px;
    right: 20px;
  }
  
  .notification-bottom-left {
    bottom: 20px;
    left: 20px;
  }
  
  .notification {
    display: flex;
    align-items: flex-start;
    padding: 12px 16px;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    pointer-events: auto;
    margin-bottom: 8px;
    animation: slideIn 0.3s ease-out;
    max-width: 350px;
  }
  
  .notification-icon {
    flex-shrink: 0;
    margin-right: 12px;
    font-size: 16px;
  }
  
  .notification-content {
    flex: 1;
    font-size: 14px;
  }
  
  .notification-message {
    margin: 0;
    word-break: break-word;
  }
  
  .notification-close {
    background: none;
    border: none;
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
    padding: 0 8px;
    margin-left: 12px;
    opacity: 0.6;
    transition: opacity 0.2s;
  }
  
  .notification-close:hover {
    opacity: 1;
  }
  
  .notification-error {
    background-color: #fdf2f2;
    border-left: 4px solid #f56565;
    color: #c53030;
  }
  
  .notification-warning {
    background-color: #fef6e0;
    border-left: 4px solid #ed8936;
    color: #c05621;
  }
  
  .notification-success {
    background-color: #f0fff4;
    border-left: 4px solid #48bb78;
    color: #2f855a;
  }
  
  .notification-info {
    background-color: #ebf8ff;
    border-left: 4px solid #4299e1;
    color: #2b6cb0;
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(30px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
</style>