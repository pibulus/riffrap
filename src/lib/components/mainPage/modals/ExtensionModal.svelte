<script>
  import Ghost from "$lib/components/ghost/Ghost.svelte";
  import { theme } from "$lib/index.js";
  import ModalShell from "$lib/components/modal/ModalShell.svelte";
  import { ModalCloseButton } from "./index.js";

  /** Parent-owned open state (see ModalShell contract). */
  export let open = false;
</script>

<ModalShell
  {open}
  labelledby="extension_modal_title"
  maxWidth="32rem"
  scrollable
  showClose={false}
  on:close
  let:requestClose
>
  <div class="modal-close-dock">
    <ModalCloseButton closeModal={requestClose} label="Close extension modal" />
  </div>

  <div class="modal-fade-in space-y-4">
    <div class="flex items-center gap-3 mb-1">
      <div
        class="w-9 h-9 bg-gradient-to-br from-white to-pink-50 rounded-full flex items-center justify-center shadow-sm border border-pink-200/60"
      >
        <Ghost
          width="28px"
          height="28px"
          externalTheme={theme}
          clickable={false}
          seed={98765}
        />
      </div>
      <h3
        id="extension_modal_title"
        class="font-black text-xl text-gray-800 tracking-tight"
      >
        Chrome Extension
      </h3>
    </div>

    <div
      class="bg-gradient-to-r from-pink-50/90 to-amber-50/90 p-4 rounded-lg border border-pink-200/60 shadow-sm"
    >
      <p class="text-sm leading-relaxed text-gray-700">
        Use RiffRap everywhere on the web! The Chrome extension lets you
        transcribe directly into any text field. Perfect for emails, social
        media, messaging apps, or anywhere else you need to type.
      </p>
    </div>

    <div
      class="rounded-xl border border-pink-200/60 bg-gradient-to-br from-white to-pink-50/50 p-4 shadow-sm"
    >
      <h4 class="font-bold text-sm text-gray-800 mb-2">
        Installation in 5 easy steps:
      </h4>
      <ol
        class="mt-2 list-decimal space-y-2 pl-5 text-left text-sm text-gray-700"
      >
        <li class="pb-1">
          Download the extension files <button
            type="button"
            class="text-pink-600 transition-colors hover:text-pink-700 hover:underline font-medium bg-transparent border-0 p-0 cursor-pointer"
            on:click={() => {
              // TODO: Add actual download functionality
              console.log("Extension download requested");
            }}>here</button
          >
        </li>
        <li class="pb-1">Unzip the files to a folder on your computer</li>
        <li class="pb-1">
          Open Chrome and go to <code
            class="rounded-md bg-pink-100 px-1.5 py-0.5 font-mono text-pink-700"
            >chrome://extensions</code
          >
        </li>
        <li class="pb-1">Enable "Developer mode" in the top-right corner</li>
        <li>Click "Load unpacked" and select the extension folder</li>
      </ol>
    </div>

    <div class="pt-1 flex justify-end">
      <span class="text-xs text-gray-600 italic font-medium"
        >Voice-to-text anywhere, anytime</span
      >
    </div>
  </div>
</ModalShell>

<style>
  /* Ensure ghost container is properly styled and background is hidden */
  :global(.ghost-container) {
    background: transparent !important;
  }
</style>
