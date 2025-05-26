<script>
  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  import { AppSuffix } from '$lib/components/ui';

  const dispatch = createEventDispatcher();
  
  // Component props
  export let titleText = 'Riff Rap';
  export let subtitleText = "Freestyle-ready lyric scrapbook.\nRiff the bars — we fill the gaps.\nGibberish in, killer lines out.";
  export let title = titleText;
  export const subtitle = subtitleText;
  
  // AppSuffix configuration
  export let showAppSuffix = true;
  export const suffixColor = "inherit"; // Inherit color from parent title
  export const suffixSize = "40%"; // Smaller suffix (40% of parent size)
  
  onMount(() => {
    // Set up animation sequence timing (for title/subtitle)
    setTimeout(() => {
      dispatch('titleAnimationComplete');
    }, 1200); // After staggered animation
    
    setTimeout(() => {
      dispatch('subtitleAnimationComplete');
    }, 2000); // After subtitle slide-in
  });
</script>

<div class="relative title-container mx-auto max-w-2xl px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 flex flex-col items-center justify-center text-center space-y-1 sm:space-y-2 md:space-y-3 lg:space-y-2">
  <h1
    class="mb-0 text-5xl font-black tracking-tight text-center cursor-default select-none staggered-text sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl leading-[1.05]"
    style="font-weight: 900; letter-spacing: -0.02em; font-feature-settings: 'kern' 1; font-kerning: normal; font-variation-settings: 'wght' 900, 'opsz' 32;"
    aria-label={title}
  >
    <!-- Use aria-hidden for spans if H1 has aria-label -->
    <span class="riffrap-main-word">
      <!-- Riff - tighter letter spacing for 'Ri' pair per client request -->
      <span class="stagger-letter mr-[-0.01em]" aria-hidden="true">R</span><span class="stagger-letter ml-[-0.01em] mr-[-0.02em]" aria-hidden="true">i</span><span class="stagger-letter mr-[-0.02em]" aria-hidden="true">f</span><span class="stagger-letter mr-[-0.04em]" aria-hidden="true">f</span>
      <!-- Tighter gap between words -->
      <!-- Rap - ultra-compressed letter spacing -->
      <span class="stagger-letter ml-[-0.12em] mr-[-0.04em]" aria-hidden="true">R</span
      ><span class="stagger-letter mr-[-0.03em]" aria-hidden="true">a</span><span class="stagger-letter" aria-hidden="true">p</span>
    </span>
    
    {#if showAppSuffix}
      <span class="app-suffix-container stagger-letter" style="animation-delay: 0.45s; position: relative;">
        <span class="suffix-wrapper">
          <AppSuffix 
            color="inherit"
            size="35%"
            offsetX="-0.3em" 
            offsetY="2px"
            position="bottom-right"
            customClass="title-suffix text-sm align-super relative -top-[6px] ml-1"
          />
        </span>
      </span>
    {/if}
  </h1>
</div>

<div class="subtitle-container mx-auto max-w-md px-4 mt-0 mb-1 text-center cursor-default select-none">
  <div class="tagline-wrapper max-w-2xl mx-auto">
    <p
      class="first-line slide-in-subtitle slide-delay-1 text-base sm:text-lg md:text-xl lg:text-xl mb-1"
      style="letter-spacing: 0.01em; line-height: 1.3;"
    >
      Gibberish in. Killer lines out.
    </p>
    <p
      class="hero-line slide-in-subtitle slide-delay-2 text-xl font-semibold text-black sm:text-xl md:text-2xl lg:text-2xl mt-1 mb-1 px-1 md:px-0"
      style="letter-spacing: -0.01em; line-height: 1.25; font-variation-settings: 'wght' 650; white-space: nowrap;"
    >
      <span class="text-black">You riff the bars</span> — <span class="text-purple-500">we fill the gaps.</span>
    </p>
    <p
      class="third-line slide-in-subtitle slide-delay-3 text-sm italic text-black opacity-70 sm:text-base md:text-base lg:text-lg mt-1"
      style="letter-spacing: 0.01em; line-height: 1.3; font-weight: 400;"
    >
      A freestyle-ready lyric scrapbook.
    </p>
  </div>
</div>

<style>
  /* Staggered text animation for title - more reliable approach */
  .staggered-text {
    opacity: 1;
    font-feature-settings: "kern" 1;
    font-kerning: normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .stagger-letter {
    display: inline-block;
    opacity: 0;
    transform: translateY(15px);
    animation: staggerFadeIn 0.6s cubic-bezier(0.19, 1, 0.22, 1) forwards;
    will-change: transform, opacity;
    backface-visibility: hidden;
    transform: translateZ(0);
  }

  /* Apply different delays to each letter - adjusted for the spacer element */
  .stagger-letter:nth-child(1) { animation-delay: 0.05s; } /* R */
  .stagger-letter:nth-child(2) { animation-delay: 0.1s; }  /* i */
  .stagger-letter:nth-child(3) { animation-delay: 0.15s; } /* f */
  .stagger-letter:nth-child(4) { animation-delay: 0.2s; }  /* f */
  /* letter-spacer doesn't need animation delay as it's not a stagger-letter */
  .stagger-letter:nth-child(5) { animation-delay: 0.3s; }  /* R */
  .stagger-letter:nth-child(6) { animation-delay: 0.35s; } /* a */
  .stagger-letter:nth-child(7) { animation-delay: 0.4s; }  /* p */

  @keyframes staggerFadeIn {
    0% {
      opacity: 0;
      transform: translateY(15px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Slide-in animation for tagline with clean, simple treatment */
  .slide-in-subtitle {
    opacity: 0;
    transform: translateY(10px);
    animation: slideIn 0.8s cubic-bezier(0.19, 1, 0.22, 1) forwards;
    animation-delay: 0.6s;
    will-change: transform, opacity;
    backface-visibility: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-feature-settings: "kern" 1;
    font-kerning: normal;
    max-inline-size: none;
    text-wrap: balance;
    margin-left: auto;
    margin-right: auto;
    font-family: 'Inter', system-ui, sans-serif;
    line-height: 1.25;
  }
  
  /* Focus attention on the central line with subtle text enhancement */
  .hero-line {
    text-shadow: 0 0 1px rgba(0, 0, 0, 0.15);
  }
  
  .slide-delay-1 {
    animation-delay: 0.6s;
  }
  
  .slide-delay-2 {
    animation-delay: 0.8s;
  }
  
  .slide-delay-3 {
    animation-delay: 1.0s;
  }

  @keyframes slideIn {
    0% {
      opacity: 0;
      transform: translateY(10px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Main container for title to help with centering */
  .title-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }
  
  /* Container to visually center the main "RiffRap" word */
  .riffrap-main-word {
    display: inline-block;
    position: relative;
  }
  
  /* App suffix container styling */
  .app-suffix-container {
    display: inline-block;
    width: 0;
    height: 0;
    overflow: visible;
  }
  
  /* Suffix wrapper for precise positioning */
  .suffix-wrapper {
    position: absolute;
    display: inline-block;
    bottom: 3px; /* Adjusted to raise the suffix slightly per client request */
    right: -0.15em; /* Moved more to the right to avoid sitting on the 'p' stem */
    z-index: 1;
  }
  
  /* Simple styles for the suffix in title context */
  :global(.title-suffix) {
    letter-spacing: -0.01em;
    font-variation-settings: inherit;
  }
  
  /* Media queries for mobile optimization */
  @media (max-width: 640px) {
    h1.staggered-text {
      font-size: 3.5rem;
      line-height: 1.05;
      margin-bottom: 0;
    }
    
    /* Adjust suffix for tablet screens */
    .suffix-wrapper {
      transform: scale(0.98);
    }
    
    /* Simple tagline styling for mobile */
    .slide-in-subtitle {
      max-inline-size: 28ch !important;
      font-size: 1rem;
      line-height: 1.3;
      text-wrap: balance;
      margin-bottom: 0.5rem;
    }
    
    /* Fix hero line wrapping on small screens */
    .hero-line {
      font-size: 1.25rem;
      line-height: 1.3;
      white-space: nowrap;
      padding: 0 0.5rem;
    }
    
    /* Container padding on mobile */
    .title-container {
      padding-top: 1.5rem;
      padding-bottom: 1rem;
    }
    
    /* Subtitle container spacing on mobile */
    .subtitle-container {
      margin-top: 0.25rem;
      margin-bottom: 0;
    }
  }
  
  /* Small mobile adjustments */
  @media (max-width: 480px) {
    /* Further adjust suffix for small screens */
    .suffix-wrapper {
      transform: scale(0.95);
      right: -0.25em; /* Adjusted for mobile to stay consistent with desktop positioning */
    }
  }
  
</style>