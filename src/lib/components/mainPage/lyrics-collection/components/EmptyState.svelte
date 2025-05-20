<!--
  === COMPONENT OVERVIEW ===
  
  EmptyState Component
  
  This component displays a friendly message when no lyrics have been collected yet.
  It provides visual guidance to help users understand how to start using the lyrics collection.
  
  Features:
  - Themed background gradient based on current theme
  - Illustrative icon
  - Instructional text
-->

<script>
  // === PROPS CHUNK START ===
  /** Current theme object for styling */
  export let currentTheme;
  // === PROPS CHUNK END ===
</script>

<div
  class="empty-state animate-fadeIn text-center"
  style="background: linear-gradient(to bottom right, {currentTheme.styles.cardEvenBackground || '#F3E8FF'}, {currentTheme.styles.cardOddBackground || '#FEEBC8'}70);"
  role="status"
  aria-label="Lyrics collection is empty"
>
  <div
    class="empty-state-icon mx-auto mb-4 h-16 w-16 opacity-60"
    style="color: {currentTheme.styles.accentColor}"
    aria-hidden="true"
  >
    <!-- Music note icon -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-full w-full"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M9 18V5l12-2v13"></path>
      <circle cx="6" cy="18" r="3"></circle>
      <circle cx="18" cy="16" r="3"></circle>
    </svg>
  </div>
  <p class="mb-2 text-base font-bold text-gray-700">Your saved lines will show up here.</p>
  <p class="text-sm text-gray-600">Select text from recordings to add to your collection.</p>
</div>

<style>
  .empty-state {
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    line-height: 1.5;
    padding: 2rem 1.5rem;
    border-radius: 1rem;
  }
  
  .empty-state:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.6s ease-out forwards;
  }
  
  
  /* Responsive adjustments */
  @media (max-width: 640px) {
    .empty-state {
      padding: 1.5rem 1rem;
    }
    
    .empty-state-icon {
      height: 3rem;
      width: 3rem;
      margin-bottom: 0.75rem;
    }
  }
</style>