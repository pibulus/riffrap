<script>
  /**
   * RecordButtonWithTimer
   * 
   * A multi-state button component that handles recording states
   * with visual feedback, timing, and accessibility features.
   */
  import { createEventDispatcher, onDestroy, tick } from 'svelte';
  import { ANIMATION, CTA_PHRASES, COPY_MESSAGES, getRandomFromArray } from '$lib/constants';
  
  // Local imports
  import { 
    animateButtonPress as animateButtonPressUtil,
    handleLyricsCollectionAnimation,
    getTimeRemaining as getTimeRemainingUtil,
    formatTime 
  } from './utils/buttonAnimations.js';
  
  // Props with default values and documentation
  /** @type {boolean} Whether recording is active */
  export let recording = false;
  
  /** @type {boolean} Whether transcription is in progress */
  export let transcribing = false;
  
  /** @type {boolean} Whether a clipboard operation was successful */
  export let clipboardSuccess = false;
  
  /** @type {boolean} Whether lyrics were collected */
  export let lyricsCollected = false;
  
  /** @type {number} Current recording duration in seconds */
  export let recordingDuration = 0;
  
  /** @type {boolean} Whether the user has premium status (affects time limits) */
  export let isPremiumUser = false;
  
  /** @type {string} Text label for the button */
  export let buttonLabel = CTA_PHRASES[0];
  
  /** @type {number} Transcription progress (0-100) */
  export let progress = 0;
  
  // Local state
  let showLyricMessage = false;
  let lyricMessageTimeout;
  let recordButtonElement;
  let timeoutReferences = [];
  
  // Event handling
  const dispatch = createEventDispatcher();
  
  // Public handlers
  /**
   * Triggers a button press animation effect
   */
  export function animateButtonPress() {
    animateButtonPressUtil(recordButtonElement);
  }
  
  /**
   * Shows lyrics collection success feedback
   */
  export function showLyricsCollected() {
    const state = { showLyricMessage, lyricMessageTimeout };
    const updatedState = handleLyricsCollectionAnimation(
      recordButtonElement, 
      state,
      {
        setShowMessage: (value) => showLyricMessage = value,
        clearExistingTimeout: clearTimeout,
        setNewTimeout: (callback, delay) => {
          const timeoutId = setTimeout(callback, delay);
          timeoutReferences.push(timeoutId);
          return timeoutId;
        }
      }
    );
    
    showLyricMessage = updatedState.showLyricMessage;
    lyricMessageTimeout = updatedState.lyricMessageTimeout;
  }
  
  /**
   * Handles keyboard interactions for a11y
   * @param {KeyboardEvent} event - Keyboard event
   */
  function handleKeyDown(event) {
    // Space or Enter key to toggle recording when focused
    if ((event.key === 'Enter' || event.key === ' ') && !transcribing) {
      event.preventDefault(); // Prevent default space/enter behavior
      dispatch('click');
    }
  }
  
  /**
   * Returns a random success message for clipboard operations
   * @returns {string} Random message from COPY_MESSAGES
   */
  function getRandomCopyMessage() {
    return getRandomFromArray(COPY_MESSAGES);
  }
  
  // Clean up any existing timeouts when component is destroyed
  onDestroy(() => {
    if (lyricMessageTimeout) {
      clearTimeout(lyricMessageTimeout);
    }
    
    // Clear all timeouts to prevent memory leaks
    timeoutReferences.forEach(clearTimeout);
  });
  
  // Reactive declarations - grouped by related functionality
  
  // Handle lyricsCollected prop changes
  $: if (lyricsCollected) {
    showLyricsCollected();
  }
  
  // Compute button classes dynamically to improve readability
  $: buttonClasses = [
    'record-button w-full rounded-full',
    clipboardSuccess ? 'border border-purple-200 bg-purple-50 text-black notification-pulse' : 'text-black',
    showLyricMessage ? 'lyrics-collected-animation' : '',
    !recording && !clipboardSuccess && !showLyricMessage ? 'pulse-animation' : '', 
    recording ? 'recording-active' : '',
    isWarning && recording ? 'recording-warning' : '',
    isDanger && recording ? 'recording-danger' : '',
    'mx-auto px-6 py-5 text-center text-xl font-bold shadow-md focus:outline focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 sm:px-8 sm:py-5 sm:text-xl md:text-2xl mb-3'
  ].filter(Boolean).join(' ');
  
  // Timer and warning state calculations
  $: timeRemaining = getTimeRemainingUtil(recordingDuration, isPremiumUser);
  $: isWarning = timeRemaining <= ANIMATION.RECORDING.WARNING_THRESHOLD;
  $: isDanger = timeRemaining <= ANIMATION.RECORDING.DANGER_THRESHOLD;
  
  // Calculate progress percentage for recording visualization
  $: progressPercentage = Math.min(
    recordingDuration / (isPremiumUser ? ANIMATION.RECORDING.PREMIUM_LIMIT : ANIMATION.RECORDING.FREE_LIMIT) * 100, 
    100
  );
  
  // Ensure dynamic classes are properly applied after DOM updates
  $: if (showLyricMessage || clipboardSuccess) {
    tick().then(() => {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        if (recordButtonElement) {
          recordButtonElement.classList.add('force-repaint');
          setTimeout(() => {
            recordButtonElement?.classList.remove('force-repaint');
          }, 0);
        }
      }, 0);
    });
  }
</script>

<!-- We'll keep styles inline to ensure they're applied correctly -->
<!-- The external CSS file approach would need proper bundling integration -->

{#if transcribing}
  <!-- Transcription Progress Bar -->
  <div
    class="progress-container relative h-[64px] w-[75%] max-w-[420px] overflow-hidden rounded-full bg-amber-200 shadow-md shadow-black/10 sm:h-[64px] sm:w-[85%] mx-auto"
    role="progressbar"
    aria-label="Transcription progress"
    aria-valuenow={progress}
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <div
      class="flex items-center justify-center h-full transition-all duration-300 progress-bar bg-gradient-to-r from-amber-400 to-rose-300"
      style="width: {progress}%;"
    >
      <span class="progress-text text-amber-900 font-medium text-sm">{Math.round(progress)}%</span>
    </div>
  </div>
{:else}
  <!-- Recording Button -->
  <div class="relative w-full sm:w-[85%] mx-auto max-w-[420px] flex justify-center items-center">
    <button
      bind:this={recordButtonElement}
      class={buttonClasses}
      style="{recording ? `--progress: ${progressPercentage}%` : ''}"
      on:click={() => dispatch('click')}
      on:mouseenter={() => dispatch('preload')}
      on:keydown={handleKeyDown}
      disabled={transcribing}
      aria-label={recording ? 'Stop Recording' : 'Start Recording'}
      aria-pressed={recording}
      aria-busy={transcribing}
      aria-live={recording ? 'polite' : 'off'}
      aria-atomic="true"
    >
      <!-- Main button text -->
      <span
        class="cta-text relative inline-block whitespace-nowrap transition-all duration-300 ease-out"
        style="letter-spacing: 0.02em;"
      >
        <!-- Clipboard success message -->
        <span
          class="absolute inset-0 flex transform items-center justify-center transition-all duration-300 ease-out {clipboardSuccess
            ? 'scale-100 opacity-100'
            : 'scale-95 opacity-0'}"
          style="visibility: {clipboardSuccess ? 'visible' : 'hidden'};"
          aria-hidden={!clipboardSuccess}
        >
          <span class="flex items-center justify-center gap-1">
            <svg
              class="w-4 h-4 mr-1 text-purple-500"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M12,2 C7.6,2 4,5.6 4,10 L4,17 C4,18.1 4.9,19 6,19 L8,19 L8,21 C8,21.6 8.4,22 9,22 C9.3,22 9.5,21.9 9.7,21.7 L12.4,19 L18,19 C19.1,19 20,18.1 20,17 L20,10 C20,5.6 16.4,2 12,2 Z"
                fill="currentColor"
                opacity="0.8"
              />
              <circle cx="9" cy="10" r="1.2" fill="white" />
              <circle cx="15" cy="10" r="1.2" fill="white" />
            </svg>
            {getRandomCopyMessage()}
          </span>
        </span>
        
        <!-- Lyrics collected success message -->
        <span
          class="absolute inset-0 flex transform items-center justify-center transition-all duration-300 ease-out {showLyricMessage
            ? 'scale-100 opacity-100'
            : 'scale-95 opacity-0'}"
          style="visibility: {showLyricMessage ? 'visible' : 'hidden'};"
          aria-hidden={!showLyricMessage}
        >
          <span class="flex items-center justify-center gap-1 text-pink-600 font-bold">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              class="h-5 w-5 text-pink-500" 
              viewBox="0 0 20 20" 
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Lyrics Get!
          </span>
        </span>
        
        <!-- Button label with integrated timer -->
        <span
          class="transform transition-all duration-300 ease-out {clipboardSuccess || showLyricMessage
            ? 'scale-90 opacity-0'
            : 'scale-100 opacity-100'}"
          style="visibility: {clipboardSuccess || showLyricMessage ? 'hidden' : 'visible'};"
          aria-hidden={clipboardSuccess || showLyricMessage}
        >
          <span class="button-content relative z-10">
            <!-- Main label - the button text is on top of the progress bar -->
            <span class="flex items-center justify-center relative">
              <span class="cta__label relative z-10 px-1 py-0.5 rounded-lg flex items-center gap-2 {recording ? 'text-shadow-recording' : ''}" style="font-size: clamp(1rem, 0.5vw + 0.9rem, 1.25rem); letter-spacing: .02em;">
                <!-- Microphone icon -->
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  class="h-5 w-5" 
                  viewBox="0 0 20 20" 
                  fill="currentColor" 
                  aria-hidden="true"
                  focusable="false"
                >
                  <path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd" />
                </svg>
                {buttonLabel}
                
                {#if recording}
                  <span class="recording-timer ml-1 font-medium text-sm">
                    {formatTime(recordingDuration)}
                  </span>
                {/if}
              </span>
              
              <!-- Screen reader text -->
              <span class="sr-only">
                {#if recording}
                  Recording in progress. {formatTime(recordingDuration)} of {formatTime(isPremiumUser ? ANIMATION.RECORDING.PREMIUM_LIMIT : ANIMATION.RECORDING.FREE_LIMIT)} time used.
                  {#if isWarning}
                    Warning: recording time is getting low.
                  {:else if isDanger}
                    Warning: recording time is almost up.
                  {/if}
                {/if}
              </span>
            </span>
          </span>
        </span>
      </span>
    </button>
    
    {#if recording}
      <!-- Visual time indicator for sighted users -->
      <div class="recording-time-indicator text-center text-sm mt-1 font-medium">
        <span class={isDanger ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-gray-600'}>
          {formatTime(timeRemaining)} remaining
        </span>
      </div>
    {/if}
  </div>
{/if}

<style>
  /* Base button styling */
  .record-button {
    position: relative;
    overflow: hidden;
    text-shadow: 0 1px 1px rgba(255, 255, 255, 0.5);
    transition: transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1), 
                box-shadow 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
    
    /* Basic shadow */
    box-shadow: 
      0 4px 6px -1px rgba(251, 191, 36, 0.2),
      0 2px 4px -1px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
    
    /* Consistent sizing for better mobile support */
    min-width: 280px;
    min-height: 64px;
    transform-origin: center center;
  }

  /* Sparkle effect on first load */
  .record-button::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-image: radial-gradient(circle, rgba(255, 255, 255, 0.8) 1%, transparent 5%),
                      radial-gradient(circle, rgba(255, 255, 255, 0.6) 1%, transparent 10%),
                      radial-gradient(circle, rgba(255, 255, 255, 0.4) 1%, transparent 15%);
    background-position: 85% 15%, 30% 40%, 60% 80%;
    background-size: 400% 400%, 300% 300%, 200% 200%;
    background-repeat: no-repeat;
    opacity: 0;
    animation: sparkle-entry 1.5s ease-out forwards;
    pointer-events: none;
  }

  /* Focus state */
  .record-button:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.4), 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  /* Enhanced focus ring for keyboard navigation */
  .record-button:focus-visible {
    outline: 3px solid #ffd65c;
    outline-offset: 2px;
  }

  /* Hover state */
  .record-button:hover:not(:disabled) {
    transform: translateY(-1px) scale(1.02);
    box-shadow: 
      0 6px 10px -2px rgba(251, 191, 36, 0.25),
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    cursor: pointer;
  }

  /* Non-recording hover effect with gradient position animation */
  .record-button:not(.recording-active):not(:disabled) {
    background-size: 300% 100%;
    background-image: linear-gradient(
      to right,
      rgba(251, 191, 36, 1), /* Default amber */
      rgba(245, 158, 11, 0.96), /* Default amber darker */
      rgba(251, 146, 60, 0.95), /* Hover peach */
      rgba(249, 115, 22, 0.9) /* Hover peach darker */
    );
    background-position: 0% 0%;
    transition: all 0.6s ease;
  }
  
  .record-button:not(.recording-active):hover:not(:disabled) {
    background-position: 100% 0%;
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
    box-shadow: 
      0 6px 10px -2px rgba(251, 146, 60, 0.3),
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  /* Enhanced button pulse with vibrant ring and breathing effect */
  .pulse-animation {
    position: relative;
    animation: button-pulse 2.5s ease-in-out infinite;
    transform-origin: center;
  }

  .pulse-animation::before {
    content: '';
    position: absolute;
    top: -6px;
    right: -6px;
    bottom: -6px;
    left: -6px;
    border-radius: 9999px;
    z-index: -1;
    background-color: rgba(251, 191, 36, 0.4);
    animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
  }
  
  .pulse-animation::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    opacity: 0;
    animation: inner-glow 2.5s ease-in-out infinite alternate;
  }

  /* Animation styles */
  .recording-active {
    position: relative;
    overflow: hidden;
    
    /* Bright golden glow for normal recording state */
    background-image: 
      linear-gradient(to right, 
        rgba(251, 191, 36, 1), 
        rgba(251, 191, 36, 1) var(--progress, 0%), 
        rgba(251, 191, 36, 0.5) calc(var(--progress, 0%) + 0.5%), 
        rgba(245, 158, 11, 0.4) 100%
      );
    
    background-size: 100% 100%;
    box-shadow: 
      0 4px 15px -1px rgba(251, 191, 36, 0.35), 
      inset 0 0 10px rgba(251, 191, 36, 0.2),
      0 0 20px rgba(251, 191, 36, 0.2);
    border: 1px solid rgba(251, 191, 36, 0.3);
    /* Smoother transitions for clearer state changes */
    transition: 
      background-image 0.3s ease-out, 
      box-shadow 0.3s ease-out, 
      border 0.3s ease-out,
      transform 0.2s ease;
  }

  /* Warning and danger states */
  .recording-warning {
    background-image: linear-gradient(to right, 
      rgb(251, 146, 60) var(--progress, 0%), 
      rgba(251, 146, 60, 0.5) var(--progress, 0%), 
      rgba(234, 88, 12, 0.3) 100%
    );
  }

  .recording-danger {
    background-image: linear-gradient(to right, 
      rgb(239, 68, 68) var(--progress, 0%), 
      rgba(239, 68, 68, 0.5) var(--progress, 0%), 
      rgba(220, 38, 38, 0.3) 100%
    );
  }

  /* Lyrics collection animation */
  .lyrics-collected-animation {
    animation: lyrics-get-flash 2s ease-out forwards;
    box-shadow: 0 0 15px rgba(236, 72, 153, 0.4), 0 0 30px rgba(236, 72, 153, 0.2);
    background-image: linear-gradient(
      to right,
      rgba(255, 228, 230, 0.95),
      rgba(252, 231, 243, 0.95)
    );
    border: 1px solid rgba(249, 168, 212, 0.4);
  }

  /* Notification pulse animation */
  .notification-pulse {
    animation: notification-glow 2.5s ease-in-out infinite;
    transform-origin: center;
    box-shadow: 
      0 0 15px 3px rgba(139, 92, 246, 0.2),
      0 0 5px 1px rgba(139, 92, 246, 0.1);
    background-image: linear-gradient(
      to bottom,
      rgba(250, 245, 255, 0.9),
      rgba(237, 233, 254, 0.9)
    );
    border: 1px solid rgba(167, 139, 250, 0.3);
  }

  /* Progress bar */
  .progress-container {
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .progress-bar {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    transition: width 0.3s ease;
    animation: pulse-glow 1.5s infinite ease-in-out;
  }

  /* Utility styles */
  .force-repaint {
    animation: none;
  }
  
  .progress-text {
    opacity: 0.9;
    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  
  .recording-time-indicator {
    animation: fadeIn 0.2s ease-out;
  }
  
  /* Keyframes */
  @keyframes button-pulse {
    0%, 100% {
      transform: scale(1);
      box-shadow: 0 0 10px 2px rgba(251, 191, 36, 0.4);
    }
    50% {
      transform: scale(1.015);
      box-shadow: 0 0 15px 3px rgba(251, 191, 36, 0.5);
    }
  }

  @keyframes pulse-ring {
    0% {
      opacity: 0.5;
      transform: scale(1);
    }
    50% {
      opacity: 0.2;
      transform: scale(1.03);
    }
    100% {
      opacity: 0.5;
      transform: scale(1);
    }
  }

  @keyframes notification-glow {
    0%, 100% {
      box-shadow: 
        0 0 10px 1px rgba(139, 92, 246, 0.2),
        0 0 3px 0px rgba(139, 92, 246, 0.1);
      transform: scale(1);
    }
    50% {
      box-shadow: 
        0 0 18px 4px rgba(139, 92, 246, 0.3),
        0 0 8px 2px rgba(139, 92, 246, 0.15);
      transform: scale(1.003);
    }
  }

  @keyframes pulse-glow {
    0% {
      box-shadow: inset 0 0 5px rgba(255, 190, 60, 0.5);
    }
    50% {
      box-shadow: inset 0 0 15px rgba(255, 190, 60, 0.8);
    }
    100% {
      box-shadow: inset 0 0 5px rgba(255, 190, 60, 0.5);
    }
  }

  @keyframes sparkle-entry {
    0% {
      opacity: 0;
      background-position: 85% 15%, 30% 40%, 60% 80%;
    }
    20% {
      opacity: 1;
    }
    70% {
      opacity: 0.8;
    }
    100% {
      opacity: 0;
      background-position: 90% 20%, 35% 50%, 70% 90%;
    }
  }

  @keyframes lyrics-get-flash {
    0% {
      background-image: linear-gradient(
        to right,
        rgba(255, 228, 230, 0.95),
        rgba(252, 231, 243, 0.95)
      );
      box-shadow: 0 0 15px rgba(236, 72, 153, 0.4), 0 0 30px rgba(236, 72, 153, 0.2);
      transform: scale(1);
    }
    20% {
      background-image: linear-gradient(
        to right,
        rgba(249, 168, 212, 0.95),
        rgba(244, 114, 182, 0.95)
      );
      box-shadow: 0 0 25px rgba(236, 72, 153, 0.6), 0 0 40px rgba(236, 72, 153, 0.3);
      transform: scale(1.02);
    }
    40% {
      background-image: linear-gradient(
        to right,
        rgba(255, 228, 230, 0.95),
        rgba(252, 231, 243, 0.95)
      );
      transform: scale(1);
    }
    60% {
      background-image: linear-gradient(
        to right,
        rgba(249, 168, 212, 0.95),
        rgba(244, 114, 182, 0.95)
      );
      box-shadow: 0 0 15px rgba(236, 72, 153, 0.4), 0 0 30px rgba(236, 72, 153, 0.2);
      transform: scale(1.01);
    }
    100% {
      background-image: linear-gradient(
        to right,
        rgba(251, 191, 36, 1),
        rgba(245, 158, 11, 0.96)
      );
      box-shadow: 0 4px 6px -1px rgba(251, 191, 36, 0.2),
        0 2px 4px -1px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
      transform: scale(1);
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes inner-glow {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 0.7;
    }
    100% {
      opacity: 0;
    }
  }
</style>