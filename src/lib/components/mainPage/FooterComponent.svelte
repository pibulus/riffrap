<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  function showAbout() {
    dispatch("showAbout");
  }

  function showSettings() {
    dispatch("showSettings");
  }

  // Share (family standard): native share sheet, clipboard fallback with a
  // brief inline "Copied!" so the fallback isn't silent.
  let shareLabel = "Share";
  async function shareApp() {
    const url =
      typeof window !== "undefined" ? window.location.href : "https://riffrap.app";
    const data = {
      title: "RiffRap",
      text: "Gibberish in. Killer lines out. A freestyle-ready lyric scrapbook.",
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        shareLabel = "Copied!";
        setTimeout(() => (shareLabel = "Share"), 1600);
      }
    } catch {
      // user dismissed the sheet — no drama
    }
  }
</script>

<nav
  class="flex items-center space-x-1 sm:space-x-2"
  aria-label="RiffRap footer"
>
  <button
    type="button"
    class="btn btn-ghost btn-sm !h-[44px] !min-h-[44px] min-w-11 px-2 py-2 text-xs text-gray-600 shadow-none transition-all hover:bg-pink-50/60 hover:text-pink-500 focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-2 sm:px-3 sm:text-base"
    on:click={showAbout}
    aria-label="About RiffRap"
  >
    About
  </button>
  <button
    type="button"
    class="btn btn-ghost btn-sm !h-[44px] !min-h-[44px] min-w-11 px-2 py-2 text-xs text-gray-600 shadow-none transition-all hover:bg-pink-50/60 hover:text-pink-500 focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-2 sm:px-3 sm:text-base"
    on:click={showSettings}
    aria-label="Open settings"
  >
    Options
  </button>
  <button
    type="button"
    class="btn btn-ghost btn-sm !h-[44px] !min-h-[44px] min-w-11 px-2 py-2 text-xs text-gray-600 shadow-none transition-all hover:bg-pink-50/60 hover:text-pink-500 focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-2 sm:px-3 sm:text-base"
    on:click={shareApp}
    aria-label="Share RiffRap"
  >
    {shareLabel}
  </button>
</nav>
