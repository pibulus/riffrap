<script>
  export let footerYear = new Date().getFullYear();
</script>

<section
  class="bg-gradient-mesh main center hero page-shell min-h-[100dvh] px-4 font-sans text-black antialiased sm:px-6 md:px-8"
>
  <main
    id="main-content"
    class="mx-auto flex w-full max-w-md flex-1 flex-col items-center pb-8 sm:max-w-lg sm:pb-10 md:max-w-2xl lg:max-w-3xl xl:max-w-[900px]"
    aria-label="Main content"
  >
    <slot />
  </main>

  <footer
    class="footer-component fixed bottom-0 left-0 right-0 z-10 box-border border-t border-pink-200/70 bg-gradient-to-r from-[#fff6e6]/90 via-[#ffead8]/90 to-[#fff1df]/90 pb-2 pt-2 text-center text-xs text-gray-600 shadow-[0_-4px_15px_rgba(249,168,212,0.22)] backdrop-blur-[8px] sm:pb-3 sm:pt-3 px-4 sm:px-6 md:px-8"
  >
    <div
      class="footer-row mx-auto flex w-full flex-row items-center justify-center gap-3 sm:justify-between"
    >
      <div
        class="copyright hidden items-center justify-center sm:flex min-w-0 shrink whitespace-nowrap"
      >
        <span class="mr-1 text-sm font-medium tracking-tight text-gray-500">
          &copy; {footerYear} RiffRap
        </span>
        <span class="mx-2 text-pink-300">&bull;</span>
        <span class="text-sm font-light text-gray-600">
          Made with
          <span
            class="mx-0.5 inline-block transform animate-pulse text-pink-500 transition-transform duration-300 hover:scale-110"
            aria-label="love">&hearts;</span
          >
          in Melbourne
        </span>
      </div>
      <div class="flex shrink-0 items-center">
        <slot name="footer-buttons" />
      </div>
    </div>
  </footer>
</section>

<style>
  :global(.bg-gradient-mesh) {
    background-color: var(--rr-bg-cream);
    background-image: radial-gradient(
      circle at center,
      var(--rr-bg-cream) 0%,
      var(--rr-bg-cream) 50%,
      #fff3df 85%,
      #ffefda 100%
    );
  }

  .page-shell {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    padding-top: clamp(2.75rem, 6vh, 5rem);
    padding-bottom: calc(5.25rem + env(safe-area-inset-bottom));
  }

  footer {
    padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
  }

  @media (max-width: 640px) {
    .page-shell {
      min-height: 100vh;
      padding-top: 6vh;
      padding-bottom: calc(5.25rem + env(safe-area-inset-bottom));
    }

    footer {
      padding-top: 0.5rem;
      padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
    }

    footer .footer-row {
      gap: 0.75rem;
    }
  }

  @media (min-width: 1024px) {
    .page-shell {
      padding-top: clamp(4rem, 10vh, 7rem);
      padding-bottom: calc(6rem + env(safe-area-inset-bottom));
    }
  }
</style>
