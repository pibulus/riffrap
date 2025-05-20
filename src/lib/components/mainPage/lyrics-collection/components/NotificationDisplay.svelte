<!--
  === COMPONENT OVERVIEW ===
  
  NotificationDisplay Component
  
  This component provides user feedback through a styled notification system.
  It handles different notification types (success, error, info) with appropriate styling.
  
  Features:
  - Customized appearance based on notification type
  - Smooth fade in/out transitions
  - Animated "ping" effect for enhanced visibility
  - Different icons based on notification type
-->

<script>
  import { fade } from 'svelte/transition';
  
  // === PROPS CHUNK START ===
  /** Whether the notification should be shown */
  export let show = false;
  
  /** The notification message text */
  export let text = '';
  
  /** The type of notification: 'success', 'error', or 'info' */
  export let type = 'info'; // Can be 'success', 'error', 'info'
  // === PROPS CHUNK END ===
</script>

{#if show}
  <div
    class="enhanced-notification {type} ping-animation"
    transition:fade={{ duration: 300 }}
    role="alert"
    aria-live="polite"
  >
    <div class="notification-icon" aria-hidden="true">
      {#if type === 'success'}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      {:else if type === 'error'}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      {:else}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      {/if}
    </div>
    <div class="notification-text">{text}</div>
  </div>
{/if}

<style>
  /* Notification styling */
  .enhanced-notification {
    position: fixed;
    top: 24px;
    left: 50%;
    transform: translateX(-50%) translateZ(0);
    display: flex;
    align-items: center;
    gap: 12px;
    background: white;
    border-radius: 12px;
    padding: 12px 16px;
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.08),
      0 2px 4px rgba(139, 92, 246, 0.25);
    z-index: 1000;
    max-width: 320px;
    backface-visibility: hidden;
    box-shadow: 0 4px 20px rgba(167, 139, 250, 0.25);
  }

  .enhanced-notification.success {
    border: none;
    background: linear-gradient(to right, #a78bfa, #ec4899);
    color: white;
  }

  .enhanced-notification.error {
    border-left: 4px solid #ef4444;
  }

  .enhanced-notification.info {
    border-left: 4px solid #6366f1;
  }

  .notification-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .notification-text {
    font-family: 'Quicksand', 'DM Sans', 'Inter', system-ui, sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: white;
    line-height: 1.4;
    letter-spacing: 0.01em;
  }

  .enhanced-notification.success .notification-icon {
    color: white;
  }

  .enhanced-notification.error .notification-icon {
    color: #ef4444;
  }

  .enhanced-notification.info .notification-icon {
    color: #6366f1;
  }

  /* Animation keyframes */
  @keyframes ping-animation {
    0% {
      transform: translateX(-50%) scale(0.95);
      box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.04),
        0 2px 4px rgba(139, 92, 246, 0.06);
    }
    30% {
      transform: translateX(-50%) scale(1.05);
      box-shadow:
        0 6px 16px rgba(0, 0, 0, 0.08),
        0 3px 6px rgba(139, 92, 246, 0.15);
    }
    60% {
      transform: translateX(-50%) scale(0.97);
      box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.06),
        0 2px 4px rgba(139, 92, 246, 0.1);
    }
    100% {
      transform: translateX(-50%) scale(1);
      box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.08),
        0 2px 4px rgba(139, 92, 246, 0.1);
    }
  }

  .ping-animation {
    animation: ping-animation 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  }
</style>