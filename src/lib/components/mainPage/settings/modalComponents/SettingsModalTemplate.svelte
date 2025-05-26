<script>
  // === PROCESSING ZONE: TEMPLATE PROPS ===
  // Theme/vibe selection
  export let selectedVibe;
  export let gradientOptions;
  
  // Feature toggles
  export let autoRecordValue;
  export let promptStyles;
  export let selectedPromptStyle;
  export let exportAsTextEnabled;
  export let soundsEnabled;
  export let apiKey;
  
  // Event handlers from core
  export let handleModalClose;
  export let handleModalOpen;
  export let handleChangeVibe;
  export let handleChangePromptStyle;
  export let handleToggleAutoRecord;
  export let handleToggleExportAsText;
  export let handleToggleSounds;
  export let handleSaveApiKey;
  // === END PROCESSING ZONE: TEMPLATE PROPS ===
</script>

<!-- === PROCESSING ZONE: MODAL STRUCTURE === -->
<dialog
  id="settings_modal"
  class="modal fixed z-50"
  style="overflow: hidden !important; z-index: 999;"
  aria-labelledby="settings_modal_title"
  aria-modal="true"
>
  <div
    class="animate-modal-enter modal-box relative max-h-[80vh] w-[95%] max-w-md overflow-y-auto rounded-2xl border border-pink-200 bg-gradient-to-br from-[#fffaef] to-[#fff6e6] shadow-xl md:max-w-lg"
  >
    <form method="dialog">
      <slot name="close-button"></slot>
    </form>

    <div class="animate-fadeUp space-y-4">
      <!-- Modal Header -->
      <div class="flex items-center gap-3 mb-1">
        <img src="/LyricSnapIcon.png" alt="RiffRap Icon" class="w-9 h-9 object-contain" />
        <h3 id="settings_modal_title" class="text-xl font-black tracking-tight text-gray-800">
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
            <span class="text-sm font-medium text-gray-700">Auto-Record on Start</span>
            <p class="mt-0.5 text-xs text-gray-500">
              Start recording immediately when you open RiffRap
            </p>
          </div>
          <label class="flex cursor-pointer items-center">
            <span class="sr-only"
              >Auto-Record Toggle {autoRecordValue ? 'Enabled' : 'Disabled'}</span
            >
            <div class="relative">
              <input
                type="checkbox"
                class="sr-only"
                checked={autoRecordValue}
                on:change={handleToggleAutoRecord}
              />
              <div
                class={`h-5 w-10 rounded-full ${autoRecordValue ? 'bg-pink-400' : 'bg-gray-200'} transition-all duration-200`}
              ></div>
              <div
                class={`absolute left-0.5 top-0.5 h-4 w-4 transform rounded-full bg-white transition-all duration-200 ${autoRecordValue ? 'translate-x-5' : ''}`}
              ></div>
            </div>
          </label>
        </div>
        
        <!-- Gemini API Key Setting -->
        <div
          class="mb-2 rounded-xl border border-purple-200 bg-purple-50/50 p-3 shadow-sm transition-all duration-200 hover:border-purple-300"
        >
          <div>
            <span class="text-sm font-medium text-gray-700">Gemini API Key</span>
            <p class="mt-0.5 text-xs text-gray-500 mb-2">
              Required for transcription. <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" class="text-purple-600 underline">Get a free API key here</a>
            </p>
            
            <div class="flex items-center gap-2">
              <input 
                type="password"
                bind:value={apiKey}
                placeholder="Enter your Gemini API key"
                class="w-full rounded-lg border border-gray-300 p-1.5 text-sm shadow-sm focus:border-purple-300 focus:outline-none focus:ring-1 focus:ring-purple-300"
              />
              <button
                on:click={handleSaveApiKey}
                class="flex-shrink-0 rounded-lg bg-purple-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                Save
              </button>
            </div>
            {#if apiKey}
              <p class="mt-1 text-xs text-green-600">
                ✓ API key saved
              </p>
            {:else}
              <p class="mt-1 text-xs text-amber-600">
                ⚠️ No API key set - transcription will not work
              </p>
            {/if}
          </div>
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
              <span class="ml-1 text-amber-500 text-[10px] font-medium border border-amber-200 rounded-full px-1.5 bg-amber-50">BETA</span>
            </p>
          </div>
          <label class="flex cursor-pointer items-center">
            <span class="sr-only">Sound Effects {soundsEnabled ? 'Enabled' : 'Disabled'}</span>
            <div class="relative">
              <input
                type="checkbox"
                class="sr-only"
                checked={soundsEnabled}
                on:change={handleToggleSounds}
              />
              <div
                class={`h-5 w-10 rounded-full ${soundsEnabled ? 'bg-blue-400' : 'bg-gray-200'} transition-all duration-200`}
              ></div>
              <div
                class={`absolute left-0.5 top-0.5 h-4 w-4 transform rounded-full bg-white transition-all duration-200 ${soundsEnabled ? 'translate-x-5' : ''}`}
              ></div>
            </div>
          </label>
        </div>
      </div>

      <!-- Card Gradient Selection -->
      <div class="space-y-2">
        <h4 class="text-sm font-bold text-gray-700">Lyrics Card Style</h4>

        <div class="flex flex-row justify-between w-full pb-1">
          {#each gradientOptions as gradient, index}
            <button
              on:click={() => handleChangeVibe(gradient.id)}
              class="gradient-option flex-shrink-0 relative flex flex-col items-center rounded-xl border border-pink-100 bg-[#fffdf5] p-2 shadow-sm transition-all duration-300 hover:border-pink-200 hover:shadow-md {selectedVibe === gradient.id
                ? 'selected-vibe border-pink-300 ring-2 ring-pink-200 ring-opacity-60'
                : ''}"
              data-gradient-id={gradient.id}
            >
              <div class="preview-container mb-2 w-16 h-10 rounded-lg overflow-hidden">
                <div class="w-full h-full bg-gradient-to-r {gradient.gradient}"></div>
              </div>

              <span class="text-xs font-medium text-gray-700">{gradient.name}</span>

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

      <!-- Premium Features Section -->
      <div
        class="space-y-2 rounded-lg border border-pink-100/60 bg-gradient-to-r from-pink-50/50 to-amber-50/50 p-3 shadow-sm"
      >
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-bold text-gray-700">
            Premium Features <span class="text-xs font-normal text-pink-500">(Beta Preview)</span>
          </h4>
          <span
            class="badge badge-sm gap-1 border-amber-200 bg-amber-100 font-medium text-amber-700"
          >
            <span class="text-[10px]">✧</span> Premium
          </span>
        </div>

        <div class="space-y-2 pt-1">
          <!-- Toggle items -->
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-gray-600">Extended Recording Time (2 min)</span>
            <input type="checkbox" disabled class="toggle toggle-primary toggle-xs bg-gray-200" />
          </div>

          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-gray-600">Song Slots (Unlock 3+ slots)</span>
            <input type="checkbox" disabled class="toggle toggle-primary toggle-xs bg-gray-200" />
          </div>

          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-gray-600">Download Your Audio</span>
            <input type="checkbox" disabled class="toggle toggle-primary toggle-xs bg-gray-200" />
          </div>

          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-gray-600">Export as Markdown</span>
            <input type="checkbox" disabled class="toggle toggle-primary toggle-xs bg-gray-200" />
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-gray-600">Share Online</span>
            <input type="checkbox" disabled class="toggle toggle-primary toggle-xs bg-gray-200" />
          </div>
        </div>

        <div class="flex justify-end">
          <span class="text-xs italic text-gray-500">Coming soon to RiffRap!</span>
        </div>
      </div>

      <div class="border-t border-pink-100 pt-2 text-center">
        <p class="text-xs text-gray-500">RiffRap • Made with 💜 by Dennis & Pablo</p>
      </div>
    </div>
  </div>

  <div
    class="modal-backdrop bg-black/40"
    on:click|self|preventDefault|stopPropagation={() => {
      const modal = document.getElementById('settings_modal');
      if (modal) {
        modal.close();
        setTimeout(handleModalClose, 50);
      }
    }}
    on:keydown={(e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('settings_modal');
        if (modal) {
          modal.close();
          setTimeout(handleModalClose, 50);
        }
      }
    }}
    role="button"
    tabindex="0"
    aria-label="Close modal backdrop"
  ></div>
</dialog>
<!-- === END PROCESSING ZONE: MODAL STRUCTURE === -->

<!-- === PROCESSING ZONE: COMPONENT STYLES === -->
<style>
  /* Improve close button */
  .close-btn {
    -webkit-tap-highlight-color: transparent;
    outline: none;
    cursor: pointer;
    user-select: none;
    z-index: 1000;
  }

  .close-btn:hover {
    transform: scale(1.1);
  }

  .close-btn:active {
    transform: scale(0.95);
  }

  .animate-fadeUp {
    animation: fadeUp 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards;
  }

  @keyframes fadeUp {
    0% {
      opacity: 0;
      transform: translateY(8px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

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

  /* Modal centering and animation styles */
  :global(dialog.modal) {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    overflow: hidden !important;
    max-height: 100vh !important;
    max-width: 100vw !important;
    padding: 0 !important;
    margin: 0 !important;
    background: transparent !important;
    border: none !important;
    inset: 0 !important;
  }

  /* Ensure modal box is centered and properly styled */
  :global(.modal-box) {
    position: relative !important;
    margin: 1.5rem auto !important;
    transform: none !important;
    transition:
      transform 0.3s ease-out,
      opacity 0.3s ease-out !important;
  }

  /* Modal entrance animation */
  .animate-modal-enter {
    animation: modalEnter 0.4s cubic-bezier(0.19, 1, 0.22, 1) forwards;
    will-change: transform, opacity;
  }

  @keyframes modalEnter {
    0% {
      opacity: 0;
      transform: scale(0.95) translateY(10px);
    }
    60% {
      opacity: 1;
      transform: scale(1.02) translateY(-5px);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  /* Fix modal backdrop with animation */
  :global(.modal-backdrop) {
    animation: backdropFadeIn 0.3s ease forwards !important;
    background-color: rgba(0, 0, 0, 0.4) !important;
    bottom: 0 !important;
    left: 0 !important;
    position: fixed !important;
    right: 0 !important;
    top: 0 !important;
    z-index: -1 !important;
  }

  @keyframes backdropFadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
<!-- === END PROCESSING ZONE: COMPONENT STYLES === -->

<!-- TRAIL MARKER (Unit Cleanup): This component handles the UI rendering for the settings modal -->