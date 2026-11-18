<script>
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";
  import { AppSuffix } from "$lib/components/ui";

  const dispatch = createEventDispatcher();

  // Component props
  export let titleText = "RiffRap";
  export let subtitleText =
    "Gibberish in. Killer lines out.\nA freestyle-ready lyric scrapbook";
  export let title = titleText;
  export const subtitle = subtitleText;

  // AppSuffix configuration
  export let showAppSuffix = true;
  export const suffixColor = "inherit"; // Inherit color from parent title
  export const suffixSize = "35%"; // TalkType family standard (35% of parent size)

  onMount(() => {
    // Set up animation sequence timing (for title/subtitle)
    setTimeout(() => {
      dispatch("titleAnimationComplete");
    }, 1200); // After staggered animation

    setTimeout(() => {
      dispatch("subtitleAnimationComplete");
    }, 2000); // After subtitle slide-in
  });
</script>

<div
  class="relative title-container mx-auto max-w-2xl flex flex-col items-center justify-center text-center"
>
  <h1
    class="mb-1 text-[clamp(3rem,9vmin_+_1.1rem,8rem)] font-black tracking-normal text-center cursor-default select-none staggered-text"
    style="font-weight: 900; letter-spacing: 0; font-feature-settings: 'kern' 1; font-kerning: normal; font-variation-settings: 'wght' 900, 'opsz' 32;"
    aria-label={title}
  >
    <!-- Use aria-hidden for spans if H1 has aria-label -->
    <span class="riffrap-main-word">
      <!-- Riff - tighter letter spacing for 'Ri' pair per client request -->
      <span class="stagger-letter mr-[-0.01em]" aria-hidden="true">R</span><span
        class="stagger-letter ml-[-0.01em] mr-[-0.02em]"
        aria-hidden="true">i</span
      ><span class="stagger-letter mr-[-0.02em]" aria-hidden="true">f</span
      ><span class="stagger-letter mr-[-0.04em]" aria-hidden="true">f</span>
      <!-- Tighter gap between words -->
      <!-- Rap - ultra-compressed letter spacing -->
      <span class="stagger-letter ml-[-0.12em] mr-[-0.04em]" aria-hidden="true"
        >R</span
      ><span class="stagger-letter mr-[-0.03em]" aria-hidden="true">a</span
      ><span class="stagger-letter" aria-hidden="true">p</span>
    </span>

    {#if showAppSuffix}
      <span
        class="app-suffix-container stagger-letter"
        style="animation-delay: 0.45s; position: relative;"
      >
        <span class="suffix-wrapper">
          <AppSuffix
            color="inherit"
            size="35%"
            offsetX="-0.6em"
            offsetY="0px"
            position="bottom-right"
            customClass="title-suffix"
          />
        </span>
      </span>
    {/if}
  </h1>
</div>

<p
  class="slide-in-subtitle mx-auto mb-6 mt-3 max-w-prose cursor-default select-none text-center text-sm font-medium leading-relaxed tracking-normal text-gray-600 sm:mb-7 sm:mt-6 sm:text-lg sm:font-normal sm:text-gray-700/85 md:text-xl lg:text-2xl"
>
  {subtitleText}
</p>

<style>
  /* Staggered text animation for title - more reliable approach */
  .staggered-text {
    opacity: 1;
    line-height: 1.1;
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
  .stagger-letter:nth-child(1) {
    animation-delay: 0.05s;
  } /* R */
  .stagger-letter:nth-child(2) {
    animation-delay: 0.1s;
  } /* i */
  .stagger-letter:nth-child(3) {
    animation-delay: 0.15s;
  } /* f */
  .stagger-letter:nth-child(4) {
    animation-delay: 0.2s;
  } /* f */
  /* letter-spacer doesn't need animation delay as it's not a stagger-letter */
  .stagger-letter:nth-child(5) {
    animation-delay: 0.3s;
  } /* R */
  .stagger-letter:nth-child(6) {
    animation-delay: 0.35s;
  } /* a */
  .stagger-letter:nth-child(7) {
    animation-delay: 0.4s;
  } /* p */

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
    max-inline-size: 52ch;
    text-wrap: balance;
    white-space: pre-line;
    margin-left: auto;
    margin-right: auto;
    font-family: "Inter", system-ui, sans-serif;
    line-height: 1.4;
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
    letter-spacing: 0;
    font-variation-settings: inherit;
  }

  @media (max-width: 640px) {
    h1.staggered-text {
      font-size: 3rem;
      line-height: 1.1;
    }

    /* Adjust suffix for tablet screens */
    .suffix-wrapper {
      transform: scale(0.98);
    }

    /* Simple tagline styling for mobile */
    .slide-in-subtitle {
      max-inline-size: 28ch;
      font-size: 1rem;
      line-height: 1.6;
      text-wrap: balance;
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
