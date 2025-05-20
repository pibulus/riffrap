<script>
  import { createEventDispatcher } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import { elasticOut } from 'svelte/easing';
  
  const dispatch = createEventDispatcher();
  let heartHovered = false;
  let buttonHovered = false;
  
  function showAbout() {
    dispatch('showAbout');
  }
  
  function showSettings() {
    dispatch('showSettings');
  }
  
  function showExtension() {
    dispatch('showExtension');
  }
  
  function handleHeartHover() {
    heartHovered = true;
    setTimeout(() => {
      heartHovered = false;
    }, 1200);
  }
  
  function handleButtonHover(hovering) {
    buttonHovered = hovering;
  }
</script>

<div class="footer-container w-full h-auto min-h-[60px] sm:min-h-[60px] bg-gradient-to-r from-purple-50/20 via-pink-50/25 to-amber-50/30 backdrop-blur-[4px] relative mt-0 border-none bottom-0">
  <!-- Peachy-purple sunrise glow -->
  <div class="orange-glow absolute top-0 left-0 right-0 h-16 opacity-70"></div>
  
  <!-- Left edge gradient -->
  <div class="absolute left-0 top-0 bottom-0 w-[15vw] bg-gradient-to-r from-pink-100/30 to-transparent opacity-40"></div>
  
  <!-- Right edge gradient -->
  <div class="absolute right-0 top-0 bottom-0 w-[15vw] bg-gradient-to-l from-amber-100/30 to-transparent opacity-40"></div>
  
  <div class="footer-content-wrapper flex flex-row items-center justify-between w-full h-full max-w-[1200px] mx-auto px-3 sm:px-6 md:px-8 py-2 sm:py-2">
    <!-- Logo and attribution section with improved alignment and size - available on both mobile and desktop -->
    <div class="flex text-xs sm:text-sm md:text-base text-neutral-500 items-center creator-section h-full ml-0 sm:ml-6">
      <span>RiffRap</span> <span class="hidden sm:inline-block">—</span> Made with 
      <!-- Interactive heart -->
      <span 
        class="mx-1 heart-icon transition-all duration-300 inline-flex text-purple-400"
        class:pulse={heartHovered}
        on:mouseenter={handleHeartHover}
        on:focus={handleHeartHover}
        tabindex="0"
        role="img"
        aria-label="Purple heart"
      >
        💜
      </span> 
      by 
      <span 
        class="font-medium text-neutral-700 creators ml-1 relative"
      >
        Dennis & Pablo
      </span>
    </div>
    
    <!-- Footer buttons - centered on mobile, right-aligned on desktop -->
    <div class="flex items-center justify-end h-full py-2 space-x-6 mx-auto sm:space-x-6 sm:mx-0 sm:mr-6">
      <!-- Settings button -->
      <button
        class="settings-btn text-sm font-medium text-neutral-800 bg-orange-300/90 border border-orange-200/30 transition-all duration-300 rounded-xl px-4 py-1.5 hover:bg-orange-300 hover:shadow-md overflow-hidden"
        on:click={showSettings}
        aria-label="Settings"
      >
        <span class="btn-text relative z-10 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
          </svg>
          Settings
        </span>
      </button>
      
      <!-- About button with purple styling -->
      <button
        class="about-btn text-sm font-medium text-neutral-800 bg-purple-500/80 border border-purple-400/30 transition-all duration-300 rounded-xl px-4 py-1.5 hover:bg-purple-500 hover:shadow-md overflow-hidden"
        on:click={showAbout}
        on:mouseenter={() => handleButtonHover(true)}
        on:mouseleave={() => handleButtonHover(false)}
        aria-label="About RiffRap"
      >
        <span class="btn-text relative z-10">About</span>
        
        {#if buttonHovered}
        <div 
          class="btn-glow absolute inset-0 rounded-xl"
          transition:scale={{duration: 350, easing: elasticOut, start: 0.95}}
        ></div>
        {/if}
      </button>
    </div>
  </div>
</div>

<style>
  .footer-container {
    position: relative;
    overflow: hidden;
    background-color: rgba(255, 246, 230, 0.5);
    background-image: linear-gradient(to bottom, 
      rgba(254, 242, 242, 0.4) 0%, 
      rgba(253, 244, 255, 0.5) 40%,
      rgba(255, 246, 230, 0.7) 100%
    );
    box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.05);
    padding: 0;
    margin: 0;
    border: none;
    min-height: 70px;
  }
  
  /* Peachy-purple sunrise glow effect */
  .orange-glow {
    background: radial-gradient(
      ellipse at center top, 
      rgba(251, 113, 133, 0.8) 0%, 
      rgba(244, 114, 182, 0.6) 15%, 
      rgba(251, 146, 60, 0.5) 30%, 
      rgba(251, 191, 36, 0.4) 50%, 
      transparent 80%
    );
    pointer-events: none;
    z-index: 1;
    transform: translateY(-8px); /* Pull up to eliminate any gap */
    height: 24px; /* Increased size for more coverage */
    width: 150vw; /* Much wider than viewport */
    left: -25vw; /* Position it so it extends beyond both sides */
    margin-left: auto;
    margin-right: auto;
    top: 3px; /* Adjusted to work better with the increased top padding */
  }
  
  /* Button styling */
  .about-btn, .settings-btn {
    position: relative;
    font-weight: 500;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .about-btn {
    box-shadow: 0 1px 2px rgba(139, 92, 246, 0.15);
  }
  
  .settings-btn {
    box-shadow: 0 1px 2px rgba(253, 186, 116, 0.15);
  }
  
  .about-btn:hover, .settings-btn:hover {
    transform: translateY(-1px);
    filter: brightness(1.05) saturate(1.1);
  }
  
  .about-btn:hover {
    box-shadow: 0 3px 8px rgba(139, 92, 246, 0.25);
  }
  
  .settings-btn:hover {
    box-shadow: 0 3px 8px rgba(253, 186, 116, 0.25);
  }
  
  .about-btn::after, .settings-btn::after {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    transform: rotate(30deg);
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  }
  
  .about-btn:hover::after, .settings-btn:hover::after {
    animation: shineEffect 1s ease-in-out;
  }
  
  @keyframes shineEffect {
    0% {
      opacity: 0;
      transform: scale(0.5) rotate(30deg) translateX(-100%);
    }
    20% {
      opacity: 0.3;
    }
    100% {
      opacity: 0;
      transform: scale(0.5) rotate(30deg) translateX(100%);
    }
  }
  
  .about-btn:active, .settings-btn:active {
    transform: translateY(0) scale(0.98);
  }
  
  /* Button glow animation */
  .btn-glow {
    background: radial-gradient(circle at center, rgba(232, 121, 249, 0.35) 0%, transparent 70%);
    z-index: 0;
    box-shadow: 0 0 12px 2px rgba(168, 85, 247, 0.2);
  }
  
  /* Creator section styling */
  .creator-section {
    position: relative;
    transition: all 0.3s ease;
    z-index: 2;
  }
  
  /* Heart animation */
  .heart-icon {
    display: inline-block;
    cursor: pointer;
    transform-origin: center;
  }
  
  .heart-icon.pulse {
    animation: heartPulse 1.2s cubic-bezier(0.17, 0.67, 0.83, 0.67);
  }
  
  @keyframes heartPulse {
    0%, 100% { transform: scale(1); }
    15% { transform: scale(1.3); }
    30% { transform: scale(0.95); }
    45% { transform: scale(1.2); }
    60% { transform: scale(1); }
  }
  
  /* Creator names styling */
  .creators {
    cursor: pointer;
    position: relative;
    transition: all 0.25s ease;
    text-decoration: none;
    padding-bottom: 1px;
    border-bottom: 1px solid transparent;
  }
  
  .creators:hover, .creators:focus {
    border-bottom: 1px solid rgba(113, 113, 122, 0.4);
  }
  
  /* Mobile adjustments */
  @media (max-width: 640px) {    
    .footer-content-wrapper {
      padding-top: 0.25rem;
      padding-bottom: 2.5rem; /* Even MORE padding at bottom */
      flex-direction: column;
      gap: 1rem;
    }
    
    /* Position buttons lower in the footer and make them cuter */
    .settings-btn, .about-btn {
      position: relative;
      top: 15px; /* Move buttons DOWN more */
      min-width: 110px; /* Wider buttons */
      border-radius: 18px !important; /* Rounder corners */
      padding: 8px 16px !important; /* Bigger padding */
      font-size: 16px !important; /* Bigger text */
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important; /* Subtle shadow */
    }
    
    /* Make icons/content larger on mobile */
    .settings-btn svg {
      width: 18px !important;
      height: 18px !important;
      margin-right: 6px !important;
    }
    
    /* More space at bottom of container */
    .footer-container {
      min-height: 95px; /* Taller footer for bigger buttons */
    }
    
    /* Hide creator section on mobile */
    .creator-section {
      display: none;
    }
  }
  
  /* Desktop adjustments */
  @media (min-width: 641px) {
    .settings-btn, .about-btn {
      font-size: 0.875rem;
      padding: 0.35rem 1rem;
      border-radius: 0.75rem;
    }
    
    .footer-container {
      min-height: 60px;
    }
    
    /* Match the desktop screenshot */
    .creator-section {
      font-size: 0.75rem;
      color: #666;
    }
    
    .heart-icon {
      font-size: 0.875rem;
    }
    
    /* Make buttons match screenshot spacing */
    .settings-btn {
      margin-right: 0.5rem;
    }
  }
</style>

