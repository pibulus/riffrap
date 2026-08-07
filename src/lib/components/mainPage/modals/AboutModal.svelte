<script>
  import ModalShell from "$lib/components/modal/ModalShell.svelte";
  import { ModalCloseButton } from "./index.js";

  /** Parent-owned open state (see ModalShell contract). */
  export let open = false;
</script>

<ModalShell
  {open}
  labelledby="about_modal_title"
  maxWidth="32rem"
  scrollable
  showClose={false}
  on:close
  let:requestClose
>
  <div class="modal-close-dock">
    <ModalCloseButton closeModal={requestClose} label="Close about modal" />
  </div>

  <div class="modal-fade-in space-y-4">
    <div class="flex items-center gap-3 mb-1">
      <img
        src="/LyricSnapIcon.png"
        alt="RiffRap Icon"
        class="w-9 h-9 object-contain"
      />
      <h3
        id="about_modal_title"
        class="font-black text-xl text-gray-800 tracking-tight"
      >
        About RiffRap
      </h3>
    </div>

    <div
      class="bg-gradient-to-r from-pink-50/90 to-amber-50/90 p-4 rounded-lg border border-pink-200/60 shadow-sm"
    >
      <p class="text-sm leading-relaxed text-gray-700">
        Sing, hum or freestyle into the mic. RiffRap writes it down, and you
        keep the lines worth keeping.
      </p>
      <p class="text-sm leading-relaxed text-gray-600 mt-2">
        It listens while you ramble, so the good line does not vanish before
        you can get to a notes app.
      </p>
    </div>

    <div>
      <h4 class="font-bold text-sm text-gray-700 mb-2">
        What it does:
      </h4>
      <ul class="space-y-1.5 text-sm text-gray-600">
        <li class="flex items-start gap-2">
          <span class="text-pink-500 text-lg">⬩</span>
          <span
            ><span class="italic">Gibberish is fine</span> — mumble it, it still
            writes something back</span
          >
        </li>
        <li class="flex items-start gap-2">
          <span class="text-pink-500 text-lg">⬩</span>
          <span
            >Snap up the good bits with a single click to build your lyrics
            piece by piece</span
          >
        </li>
        <li class="flex items-start gap-2">
          <span class="text-pink-500 text-lg">⬩</span>
          <span>Save, shuffle, and re-roll until your lyrics are perfect</span
          >
        </li>
      </ul>
    </div>

    <div
      class="border-l-3 border-pink-300 py-1 pl-4 ml-1 my-2 italic text-gray-600"
    >
      "Transforming your wildest vocal riffs into lines that actually kinda
      slap."
    </div>

    <!-- Privacy one-liner (family standard) -->
    <p class="text-xs text-gray-500 leading-relaxed">
      Your lyric collection lives on this device — nothing's kept anywhere
      else.
    </p>

    <div class="flex items-center gap-3 pt-2">
      <a
        href="https://ko-fi.com/madebypablo"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center min-h-11 text-xs text-pink-600 hover:text-pink-800 font-medium transition-colors"
      >
        ☕ Coffee jar
      </a>
      <a
        href="https://github.com/pibulus"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center min-h-11 text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors"
      >
        GitHub
      </a>
    </div>

    <div class="flex justify-between items-end pt-2">
      <div>
        <p class="text-xs text-gray-500">
          Made by Pablo with 💜 and mezcal in Melbourne
        </p>
      </div>
      <div class="flex items-center gap-2 text-xs font-medium text-gray-600">
        Pablo
      </div>
    </div>
  </div>
</ModalShell>
