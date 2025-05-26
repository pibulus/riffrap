<!--
  === COMPONENT OVERVIEW ===
  
  SnippetItem Component
  
  This component renders a single snippet item (lyric line or stanza) in the 
  lyrics collection. It handles both display and edit modes, drag-and-drop functionality,
  and snippet-specific actions.
  
  Features:
  - Display/edit toggle for snippet content
  - Drag and drop reordering (via passed handlers)
  - Delete/undo functionality
  - Visual feedback (highlighting, hover effects)
  - Specialized styling for different snippet types (single line, paragraph, compiled)
-->

<script>
  import { createEventDispatcher } from 'svelte';
  
  // === PROPS CHUNK START ===
  /** The snippet object to render */
  export let snippet;
  
  /** The index of this snippet in the list (for alternating colors) */
  export let index;
  
  /** The currently editing snippet ID, if any */
  export let editingSnippetId;
  
  /** The current theme object for styling */
  export let currentTheme;
  
  /** Flag indicating if undo operation is available */
  export let canUndo = false;
  
  /** Handler for drag start event */
  export let handleDragStart;
  
  /** Handler for drag over event */
  export let handleDragOver;
  
  /** Handler for drag leave event */
  export let handleDragLeave;
  
  /** Handler for drop event */
  export let handleDrop;
  
  /** Handler for drag end event */
  export let handleDragEnd;
  
  /** Handler for playing hover sound */
  export let playCardHoverSound;
  // === PROPS CHUNK END ===
  
  const dispatch = createEventDispatcher();
  
  // === EVENT HANDLERS CHUNK START ===
  /**
   * Handles delete button click
   * Dispatches appropriate event based on snippet type and undo availability
   * 
   * @param {Event} e - The click event
   */
  function handleDelete(e) {
    e.stopPropagation();
    e.preventDefault();
    
    // If this is a compiled card and undo is available, use undoCombine instead
    if (snippet.isCompiled && canUndo) {
      dispatch('undoCombine');
    } else {
      dispatch('delete', snippet.id);
    }
  }
  
  /**
   * Handles clicking on a snippet to edit it
   * Dispatches edit event with snippet ID
   */
  function handleEditClick() {
    dispatch('edit', snippet.id);
  }
  
  /**
   * Handles download request for a snippet
   * Dispatches download event
   * 
   * @param {Event} e - The click event
   */
  function handleDownload(e) {
    e.stopPropagation();
    e.preventDefault();
    dispatch('download');
  }
  
  /**
   * Handles text change in edit mode
   * 
   * @param {Event} e - The input event
   */
  function handleTextChange(e) {
    snippet.text = e.target.value;
  }
  
  /**
   * Handles keyboard navigation between snippets in edit mode
   * 
   * @param {KeyboardEvent} e - The keydown event
   */
  function handleKeyDown(e) {
    // Allow multi-line entry with Enter
    if (e.key === 'Tab' && e.shiftKey) {
      // Move to previous snippet with Shift+Tab
      e.preventDefault();
      dispatch('navigate', { direction: 'prev', snippetId: snippet.id });
    } else if (e.key === 'Tab') {
      // Move to next snippet with Tab
      e.preventDefault();
      dispatch('navigate', { direction: 'next', snippetId: snippet.id });
    }
  }
  
  /**
   * Handles blur event in edit mode to save changes
   */
  function handleBlur() {
    dispatch('save', { id: snippet.id, text: snippet.text });
  }
  // === EVENT HANDLERS CHUNK END ===
</script>

<li
  class="snippet-item group relative rounded-2xl px-4 py-3 {snippet.isParagraph
    ? 'stanza-card'
    : ''} cursor-grab border border-purple-100 text-[15px] leading-snug shadow-sm transition-all duration-150 hover:shadow-md active:scale-[0.98] {
    snippet.isCompiled ? 'compiled-card' : ''}"
  style="background-color: {currentTheme.styles.cardColors ? currentTheme.styles.cardColors[index % currentTheme.styles.cardColors.length] : (index % 2 === 0 ? currentTheme.styles.cardEvenBackground : currentTheme.styles.cardOddBackground)};"
  data-id={snippet.id}
  draggable="true"
  on:mouseenter={() => playCardHoverSound()} 
  on:dragstart={(e) => handleDragStart(e, snippet.id)}
  on:dragover={(e) => handleDragOver(e, snippet.id)}
  on:dragleave={handleDragLeave}
  on:drop={(e) => handleDrop(e, snippet.id)}
  on:dragend={handleDragEnd}
>
  <!-- Wrapper container for content with relative positioning -->
  <div class="relative flex w-full items-center">
    {#if editingSnippetId === snippet.id}
      <!-- Edit mode: perfectly matching the display text dimensions -->
      <div class="edit-mode-container relative w-full" style="min-height: inherit;">
        <!-- Hidden clone of the display text to maintain exact same dimensions -->
        <div
          class="snippet-text invisible flex-1 whitespace-pre-wrap break-words py-1.5 text-gray-900 {snippet.isParagraph
            ? 'paragraph-snippet'
            : 'single-line-lyric'}"
          style="font-family: 'Recursive', 'Quicksand', 'DM Sans', sans-serif !important; font-variation-settings: 'CASL' 0.7, 'MONO' 0.2; min-height: {snippet.isParagraph
            ? '5rem'
            : '2rem'}; letter-spacing: 0.01em; line-height: 1.75;"
        >
          {snippet.text || 'Enter your lyrics here'}
        </div>

        <!-- Textarea positioned absolutely over the hidden text -->
        <textarea
          class="snippet-text-edit w-full flex-1 resize-none whitespace-pre-wrap break-words border-0 bg-transparent text-left text-[18px] font-medium leading-[1.75] text-gray-900 focus:outline-none focus:ring-0 {snippet.isParagraph
            ? 'paragraph-snippet'
            : 'single-line-lyric'}"
          style="font-family: 'Recursive', 'Quicksand', 'DM Sans', sans-serif !important; font-variation-settings: 'CASL' 0.7, 'MONO' 0.2; letter-spacing: 0.01em; position: absolute; inset: 0; margin: 0; padding: 0.375rem 0; min-height: {snippet.isParagraph
            ? '5rem'
            : '2rem'}; line-height: 1.75;"
          value={snippet.text}
          on:input={handleTextChange}
          on:keydown={handleKeyDown}
          on:blur={handleBlur}
          placeholder="Enter your lyrics here"
          aria-label="Edit lyrics text"
        ></textarea>
      </div>
    {:else}
      <!-- Display mode: click to edit -->
      <div
        class="snippet-text flex-1 whitespace-pre-line break-words py-1.5 font-mono text-neutral-800 hover:cursor-pointer {snippet.isParagraph
          ? 'paragraph-snippet'
          : 'single-line-lyric'} relative {editingSnippetId &&
        editingSnippetId !== snippet.id
          ? 'unselected-card'
          : ''}"
        style="min-height: {snippet.isParagraph
          ? '5rem'
          : '2rem'}; line-height: 1.5; padding: 0.375rem 0;"
        on:click={handleEditClick}
        on:keydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleEditClick();
          }
        }}
        title="Click to edit"
        role="button"
        tabindex="0"
        aria-label="Lyrics text. Press Enter or Space to edit."
      >
        {snippet.text}

        <!-- Music note for paragraph/stanza snippets -->
        {#if snippet.isParagraph && !snippet.isCompiled}
          <span
            class="music-note absolute bottom-1 right-2 text-xs text-purple-300 opacity-40"
            aria-hidden="true"
            >♪</span
          >
        {/if}

        <!-- Download button appears on compiled cards -->
        {#if canUndo && snippet.isCompiled}
          <button
            on:click|stopPropagation|preventDefault={handleDownload}
            class="absolute right-2 top-2 z-20 flex transform-gpu items-center gap-1.5 rounded-full border border-purple-200 bg-white/95 px-3 py-1.5 text-xs font-medium text-purple-500 opacity-90 shadow-sm transition-all duration-300 hover:scale-105 hover:border-purple-300 hover:bg-purple-50 hover:opacity-100 hover:shadow-md"
            title="Download lyrics"
            aria-label="Download lyrics"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-3.5 w-3.5 transition-transform duration-300 hover:rotate-[-45deg]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span class="group relative">
              Download
              <span
                class="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden="true"
              ></span>
            </span>
          </button>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Delete button in the top-right corner (for non-compiled cards) or top-left for compiled cards -->
  <button
    on:click={handleDelete}
    class="delete-button absolute {snippet.isCompiled
      ? 'left-2 top-2'
      : 'right-2 top-2'} flex h-7 w-7 items-center justify-center rounded-full border border-purple-200 bg-white opacity-0 transition-colors duration-150 active:scale-95 group-hover:opacity-100"
    aria-label="{snippet.isCompiled && canUndo ? 'Undo combination' : 'Delete lyric'}"
    title="{snippet.isCompiled && canUndo ? 'Undo combination' : 'Delete lyric'}"
  >
    <!-- Show undo arrow for compiled cards, X icon for others -->
    {#if snippet.isCompiled && canUndo}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8b5cf6"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M3 7v6h6"></path>
        <path d="M3 13c0-4.97 4.03-9 9-9a9 9 0 0 1 6.71 15"></path>
      </svg>
    {:else}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8b5cf6"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    {/if}
  </button>
</li>

<style>
  /* Snippet item styles */
  .snippet-item {
    transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
    letter-spacing: normal;
    background: white;
    box-shadow:
      0 3px 10px rgba(0, 0, 0, 0.03),
      0 1px 5px rgba(0, 0, 0, 0.02);
    will-change: transform, box-shadow, background-color;
    transform-origin: center;
    margin-bottom: 1rem !important;
    transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-font-smoothing: antialiased;
    border-radius: 16px;
    border: 1px solid rgba(167, 139, 250, 0.15);
  }

  .snippet-item:active {
    box-shadow: 0 2px 5px rgba(180, 120, 255, 0.05);
  }

  .snippet-item:hover {
    box-shadow: 0 3px 8px rgba(180, 120, 255, 0.08);
    transform: translateY(0) scale(1);
  }

  /* Delete button */
  .delete-button:hover {
    background-color: #f3f0ff;
  }

  .delete-button:active {
    transform: scale(0.95);
    background-color: #ede9fe;
  }

  /* Compiled card styling */
  .compiled-card {
    background-color: rgba(245, 243, 255, 0.95) !important;
    border: none !important;
    border-radius: 18px !important;
    box-shadow:
      0 8px 25px rgba(139, 92, 246, 0.2),
      0 3px 10px rgba(236, 72, 153, 0.1) !important;
    transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    position: relative;
    transform: translateZ(0);
    will-change: transform, box-shadow;
    box-shadow:
      inset 0 1px 8px rgba(139, 92, 246, 0.08),
      0 8px 25px rgba(139, 92, 246, 0.2),
      0 3px 10px rgba(236, 72, 153, 0.1) !important;
  }

  .highlight-compiled {
    box-shadow:
      0 10px 30px rgba(139, 92, 246, 0.35),
      0 3px 12px rgba(236, 72, 153, 0.2) !important;
    transform: translateY(-2px) scale(1.02) !important;
    transition: all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
  }
</style>