<script>
  import ModalShell from "$lib/components/modal/ModalShell.svelte";
  import { ModalCloseButton } from "../../modals/index.js";

  // === PROCESSING ZONE: TEMPLATE PROPS ===
  // Parent-owned open state (see ModalShell contract)
  export let open = false;

  // Theme/vibe selection
  export let selectedVibe;
  export let gradientOptions;

  // Feature toggles
  export let autoRecordValue;
  export const promptStyles = null;
  export const selectedPromptStyle = null;
  export const exportAsTextEnabled = false;
  export let soundsEnabled;

  // Event handlers from core
  export let handleModalClose;
  export let handleChangeVibe;
  export const handleChangePromptStyle = () => {};
  export let handleToggleAutoRecord;
  export const handleToggleExportAsText = () => {};
  export let handleToggleSounds;
  // === END PROCESSING ZONE: TEMPLATE PROPS ===
</script>

<!-- === PROCESSING ZONE: MODAL STRUCTURE === -->
<ModalShell
  {open}
  labelledby="settings_modal_title"
  maxWidth="32rem"
  scrollable
  showClose={false}
  on:close={handleModalClose}
  let:requestClose
>
  <div class="modal-close-dock">
    <ModalCloseButton
      closeModal={requestClose}
      label="Close settings"
      position="right-2 top-2"
    />
  </div>

  <div class="modal-fade-in space-y-4">
    <!-- Modal Header -->
    <div class="flex items-center gap-3 mb-1">
      <img
        src="/LyricSnapIcon.png"
        alt="RiffRap Icon"
        class="w-9 h-9 object-contain"
      />
      <h3
        id="settings_modal_title"
        class="text-xl font-black tracking-tight text-gray-800"
      >
        Settings
      </h3>
    </div>

    <!-- Basic Settings Section -->
    <div class="mb-2 space-y-2">
      <h4 class="text-sm font-bold text-gray-700">Basic Settings</h4>

      <div
        class="mb-2 flex items-center justify-between rounded-xl border border-pink-100 bg-[#fffdf5] p-2 shadow-sm transition-all duration-200 hover:border-pink-200"
      >
        <div>
          <span class="text-sm font-medium text-gray-700"
            >Auto-Record on Start</span
          >
          <p class="mt-0.5 text-xs text-gray-500">
            Start recording immediately when you open RiffRap
          </p>
        </div>
        <label class="flex cursor-pointer items-center">
          <span class="sr-only"
            >Auto-Record Toggle {autoRecordValue
              ? "Enabled"
              : "Disabled"}</span
          >
          <div class="relative">
            <input
              type="checkbox"
              class="sr-only"
              checked={autoRecordValue}
              on:change={handleToggleAutoRecord}
            />
            <div
              class={`h-5 w-10 rounded-full ${autoRecordValue ? "bg-pink-400" : "bg-gray-200"} transition-all duration-200`}
            ></div>
            <div
              class={`absolute left-0.5 top-0.5 h-4 w-4 transform rounded-full bg-white transition-all duration-200 ${autoRecordValue ? "translate-x-5" : ""}`}
            ></div>
          </div>
        </label>
      </div>

      <!-- Export as Text Toggle removed as it's available on main page -->

      <!-- Sounds Toggle -->
      <div
        class="mb-2 flex items-center justify-between rounded-xl border border-pink-100 bg-[#fffdf5] p-2 shadow-sm transition-all duration-200 hover:border-pink-200"
      >
        <div>
          <span class="text-sm font-medium text-gray-700">Sound Effects</span>
          <p class="mt-0.5 text-xs text-gray-500 flex items-center">
            Enable audio feedback for actions
            <span
              class="ml-1 text-amber-500 text-[10px] font-medium border border-amber-200 rounded-full px-1.5 bg-amber-50"
              >BETA</span
            >
          </p>
        </div>
        <label class="flex cursor-pointer items-center">
          <span class="sr-only"
            >Sound Effects {soundsEnabled ? "Enabled" : "Disabled"}</span
          >
          <div class="relative">
            <input
              type="checkbox"
              class="sr-only"
              checked={soundsEnabled}
              on:change={handleToggleSounds}
            />
            <div
              class={`h-5 w-10 rounded-full ${soundsEnabled ? "bg-blue-400" : "bg-gray-200"} transition-all duration-200`}
            ></div>
            <div
              class={`absolute left-0.5 top-0.5 h-4 w-4 transform rounded-full bg-white transition-all duration-200 ${soundsEnabled ? "translate-x-5" : ""}`}
            ></div>
          </div>
        </label>
      </div>
    </div>

    <!-- Card Gradient Selection -->
    <div class="space-y-2">
      <h4 class="text-sm font-bold text-gray-700">Lyrics Card Style</h4>

      <div class="flex flex-row justify-between w-full pb-1">
        {#each gradientOptions as gradient}
          <button
            on:click={() => handleChangeVibe(gradient.id)}
            class="gradient-option flex-shrink-0 relative flex flex-col items-center rounded-xl border border-pink-100 bg-[#fffdf5] p-2 shadow-sm transition-all duration-300 hover:border-pink-200 hover:shadow-md {selectedVibe ===
            gradient.id
              ? 'selected-vibe border-pink-300 ring-2 ring-pink-200 ring-opacity-60'
              : ''}"
            data-gradient-id={gradient.id}
          >
            <div
              class="preview-container mb-2 w-16 h-10 rounded-lg overflow-hidden"
            >
              <div
                class="w-full h-full bg-gradient-to-r {gradient.gradient}"
              ></div>
            </div>

            <span class="text-xs font-medium text-gray-700"
              >{gradient.name}</span
            >

            {#if selectedVibe === gradient.id}
              <div
                class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-400 text-xs text-white shadow-sm"
              >
                ✓
              </div>
            {/if}
          </button>
        {/each}
      </div>
    </div>

    <div class="border-t border-pink-100 pt-2 text-center">
      <p class="text-xs text-gray-500">RiffRap • Made with 💜</p>
    </div>
  </div>
</ModalShell>
<!-- === END PROCESSING ZONE: MODAL STRUCTURE === -->

<!-- TRAIL MARKER (Unit Cleanup): This component handles the UI rendering for the settings modal -->

<!-- === PROCESSING ZONE: COMPONENT STYLES === -->
<style>
  .selected-vibe {
    box-shadow:
      0 0 0 2px rgba(249, 168, 212, 0.4),
      0 4px 8px rgba(249, 168, 212, 0.2);
  }

  .gradient-option {
    transition: all 0.2s ease-in-out;
  }

  .gradient-option:hover {
    transform: translateY(-1px);
  }

  .gradient-option:active {
    transform: translateY(0px);
  }

  /* Modal centering, backdrop, and open/close motion all live in the shared
     ModalShell (src/lib/components/modal/) — nothing modal-structural belongs
     in here. */
</style>
