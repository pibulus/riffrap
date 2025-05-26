<script>
  import Ghost from '$lib/components/ghost/Ghost.svelte';
  import { theme } from '$lib/index.js';
  import { ModalCloseButton } from './index.js';
  export let closeModal;
</script>

<dialog id="about_modal" class="modal modal-bottom sm:modal-middle overflow-hidden fixed z-50" style="overflow-y: hidden!important;" aria-labelledby="about_modal_title" aria-modal="true">
  <div class="modal-box bg-gradient-to-br from-[#fffaef] to-[#fff6e6] shadow-xl border border-pink-200 rounded-2xl overflow-y-auto max-h-[80vh]">
    <form method="dialog">
      <ModalCloseButton {closeModal} label="Close about modal" modalId="about_modal" />
    </form>

    <div class="animate-fadeUp space-y-4">
      <div class="flex items-center gap-3 mb-1">
        <img src="/LyricSnapIcon.png" alt="RiffRap Icon" class="w-9 h-9 object-contain" />
        <h3 id="about_modal_title" class="font-black text-xl text-gray-800 tracking-tight">About RiffRap</h3>
      </div>

      <div class="bg-gradient-to-r from-pink-50/90 to-amber-50/90 p-4 rounded-lg border border-pink-200/60 shadow-sm">
        <p class="text-sm leading-relaxed text-gray-700">
          RiffRap is where freestyle meets cut & paste! Just sing, hum, or freestyle
          into your mic, and watch as we magically turn your ramblings into actual rhymes you can snag and use.
          <span class="text-pink-600 font-medium">No friction</span>, <span class="text-amber-600 font-medium">just flow</span> -
          <span class="text-pink-600 font-medium">create</span> your next hit song with ease!
        </p>
      </div>

      <div>
        <h4 class="font-bold text-sm text-gray-700 mb-2">Why you'll love it:</h4>
        <ul class="space-y-1.5 text-sm text-gray-600">
          <li class="flex items-start gap-2">
            <span class="text-pink-500 text-lg">⬩</span>
            <span><span class="italic">Totally gibberish-friendly</span> — sing your heart out, we'll make it work</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-pink-500 text-lg">⬩</span>
            <span>Snap up the good bits with a single click to build your lyrics piece by piece</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-pink-500 text-lg">⬩</span>
            <span>Save, shuffle, and re-roll until your lyrics are perfect</span>
          </li>
        </ul>
      </div>

      <div class="border-l-3 border-pink-300 py-1 pl-4 ml-1 my-2 italic text-gray-600">
        "Transforming your wildest vocal riffs into lines that actually kinda slap."
      </div>

      <div class="flex justify-end items-end pt-2">
        <div>
          <p class="text-xs text-gray-500">Made with 💜 and mezcal in Melbourne, Australia</p>
        </div>
      </div>
    </div>
  </div>
  <div 
    class="modal-backdrop bg-black/40" 
    on:click={closeModal}
    on:keydown={(e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    }}
    role="button"
    tabindex="0"
    aria-label="Close modal backdrop"
  ></div>
</dialog>

<style>
  .animate-fadeUp {
    animation: fadeUp 0.5s ease-out forwards;
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
</style>