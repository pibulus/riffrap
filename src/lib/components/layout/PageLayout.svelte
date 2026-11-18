<script>
  import FooterCharm from "$lib/components/FooterCharm.svelte";

  export let footerYear = new Date().getFullYear();
</script>

<section
  class="bg-gradient-mesh main center hero page-shell min-h-[100dvh] px-4 py-6 pb-16 pt-[clamp(4rem,12vh,8rem)] font-sans text-black antialiased sm:px-6 md:px-10 md:pt-[clamp(3rem,10vh,9rem)] lg:pb-16"
>
  <main
    id="main-content"
    class="relative z-[1] mx-auto flex w-full min-w-0 max-w-md flex-col items-center pb-24 sm:max-w-lg md:max-w-2xl"
    aria-label="Main content"
  >
    <slot />
  </main>

  <footer
    class="footer-component rr-app-footer fixed bottom-0 left-0 right-0 z-10 box-border border-t px-4 pb-2 pt-3 text-center text-xs sm:px-6 sm:pb-4 sm:pt-5 md:px-8"
  >
    <div
      class="footer-row mx-auto flex w-full flex-row items-center justify-between gap-2 sm:gap-3"
    >
      <div
        class="copyright relative z-0 flex min-w-0 shrink items-center whitespace-nowrap"
        title="© {footerYear} RiffRap — made by pablo. in Melbourne"
      >
        <span class="footer-copy shrink-0 text-sm font-medium tracking-normal">
          &copy; {footerYear} RiffRap
        </span>
        <span class="footer-dot mx-2 shrink-0">&bull;</span>
        <span class="footer-sig flex min-w-0 items-center text-sm font-light">
          <a
            class="footer-name shrink-0 font-bold lowercase tracking-tight text-[#1e1714] no-underline transition-colors hover:text-[#ff5ca8]"
            href="https://madebypablo.app"
            target="_blank"
            rel="noopener noreferrer"
            >made by pablo<span class="font-black text-[#ff5ca8]">.</span></a
          >
          <FooterCharm charms={["❤️", "🎤", "🎵"]} />
          <span class="footer-place shrink-0">in Melbourne</span>
        </span>
      </div>
      <div class="relative z-10 flex shrink-0 items-center">
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
    min-height: 100dvh;
    padding-bottom: calc(5.25rem + env(safe-area-inset-bottom));
  }

  footer {
    padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
  }

  .rr-app-footer {
    overflow: visible;
    color: var(--footer-text-color, #463f3a);
    border-color: var(--footer-border-color, #1e1714);
    border-top: 2px solid var(--footer-border-color, #1e1714);
    background: var(--footer-bg, rgba(255, 255, 255, 0.62));
    box-shadow: 0 -4px 16px rgba(30, 23, 20, 0.06);
    -webkit-backdrop-filter: blur(14px) saturate(1.5);
    backdrop-filter: blur(14px) saturate(1.5);
  }

  /* No backdrop-filter support: go nearly opaque. The translucency only
     earns its keep when a blur is actually frosting what's behind it. */
  @supports not (backdrop-filter: blur(1px)) {
    .rr-app-footer {
      background: rgba(255, 246, 230, 0.97);
    }
  }

  .footer-dot {
    color: var(--footer-dot-color, #ec4899);
  }

  .copyright,
  .footer-sig {
    overflow: visible;
  }

  @media (min-width: 640px) and (max-width: 899px) {
    .copyright .footer-copy {
      display: none;
    }
  }

  @media (min-width: 640px) and (max-width: 767px) {
    .copyright .footer-dot {
      margin-left: 0.375rem;
      margin-right: 0.375rem;
    }
  }

  @media (max-width: 639px) {
    .copyright .footer-copy,
    .copyright .footer-dot {
      display: none;
    }

    .copyright .footer-name,
    .copyright .footer-place {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: 0;
      padding: 0;
      overflow: hidden;
      white-space: nowrap;
      clip-path: inset(50%);
    }

    .copyright {
      font-size: 0.78rem;
    }

    .copyright .footer-sig {
      font-size: 1.35rem;
    }

    .copyright :global(.footer-charm) {
      padding: 0.3rem 0.45rem;
    }
  }

  @media (max-width: 640px) {
    .page-shell {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      min-height: 100dvh;
      padding-top: max(
        env(safe-area-inset-top),
        clamp(4rem, 10svh, 5.5rem)
      ) !important;
      padding-bottom: max(
        6rem,
        calc(env(safe-area-inset-bottom) + 5.5rem)
      ) !important;
    }

    footer {
      padding-top: 0.5rem;
      padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
    }

    footer .footer-row {
      gap: 0.75rem;
    }
  }

  @media (min-width: 1024px) {
    .page-shell {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      padding-top: clamp(3rem, 10vh, 9rem) !important;
      padding-bottom: 10vh !important;
    }
  }
</style>
