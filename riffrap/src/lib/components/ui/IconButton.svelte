<script>
	import { onMount, createEventDispatcher } from 'svelte';

	// Props
	export let icon = ''; // Icon name or SVG content
	export let tooltip = ''; // Tooltip text
	export let onClick = () => {}; // Click handler
	export let disabled = false; // Disabled state
	export let size = 'w-9 h-9'; // Button size class
	export let iconSize = 'w-5 h-5'; // Icon size class
	export let className = ''; // Additional class names
	export let colorIndex = -1; // Index for color gradient (0-4, -1 for default)

	const dispatch = createEventDispatcher();
	let showClickFeedback = false;
	let clickFeedbackTimeout;

	// Handle click events
	function handleClick(event) {
		if (!disabled) {
			// Show click feedback
			showClickFeedback = true;
			if (clickFeedbackTimeout) clearTimeout(clickFeedbackTimeout);
			clickFeedbackTimeout = setTimeout(() => {
				showClickFeedback = false;
			}, 500);
			
			onClick(event);
			dispatch('click', event);
		}
	}

	onMount(() => {
		return () => {
			if (clickFeedbackTimeout) clearTimeout(clickFeedbackTimeout);
		};
	});

	// Default SVG icons
	const iconMap = {
		plus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>`,
		copy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>`,
		edit: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>`,
		download: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>`,
		trash: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>`
	};
</script>

<div class="group relative">
	<button
		class="{size} flex items-center justify-center rounded-full border border-neutral-200 bg-white transition-all duration-200 active:scale-95 {disabled
			? 'cursor-not-allowed opacity-40 hover:opacity-60'
			: 'hover:shadow-md'} {className} {showClickFeedback ? 'click-feedback' : ''} {colorIndex >= 0 ? `button-color-${colorIndex}` : ''}"
		on:click={handleClick}
		aria-label={tooltip}
		{disabled}
	>
		{#if icon in iconMap}
			<div class="{iconSize} text-neutral-600 icon-container">
				{@html iconMap[icon]}
			</div>
		{:else}
			<div class="{iconSize} text-neutral-600 icon-container">
				{@html icon}
			</div>
		{/if}

		<!-- Click feedback overlay -->
		{#if showClickFeedback}
			<div class="absolute inset-0 rounded-full feedback-circle"></div>
		{/if}
	</button>

	{#if tooltip}
		<div
			class="pointer-events-none absolute bottom-full left-1/2 z-[100] mb-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
		>
			{tooltip}
		</div>
	{/if}
</div>

<style>
	button {
		position: relative;
		overflow: hidden;
	}
	
	button:hover {
		transform: translateY(-1px);
	}

	button:active {
		transform: scale(0.95);
	}

	button:disabled:hover {
		transform: none;
	}
	
	/* Different hover colors based on index */
	:global(.button-color-0:hover) {
		border-color: rgba(239, 68, 68, 0.5) !important;
		box-shadow: 0 0 10px rgba(239, 68, 68, 0.25) !important;
	}
	
	:global(.button-color-0:hover .icon-container) {
		color: rgb(239, 68, 68) !important;
	}
	
	:global(.button-color-1:hover) {
		border-color: rgba(249, 115, 22, 0.5) !important;
		box-shadow: 0 0 10px rgba(249, 115, 22, 0.25) !important;
	}
	
	:global(.button-color-1:hover .icon-container) {
		color: rgb(249, 115, 22) !important;
	}
	
	:global(.button-color-2:hover) {
		border-color: rgba(124, 58, 237, 0.5) !important;
		box-shadow: 0 0 10px rgba(124, 58, 237, 0.25) !important;
	}
	
	:global(.button-color-2:hover .icon-container) {
		color: rgb(124, 58, 237) !important;
	}
	
	:global(.button-color-3:hover) {
		border-color: rgba(16, 185, 129, 0.5) !important;
		box-shadow: 0 0 10px rgba(16, 185, 129, 0.25) !important;
	}
	
	:global(.button-color-3:hover .icon-container) {
		color: rgb(16, 185, 129) !important;
	}
	
	:global(.button-color-4:hover) {
		border-color: rgba(59, 130, 246, 0.5) !important;
		box-shadow: 0 0 10px rgba(59, 130, 246, 0.25) !important;
	}
	
	:global(.button-color-4:hover .icon-container) {
		color: rgb(59, 130, 246) !important;
	}
	
	/* Click feedback animation */
	.feedback-circle {
		background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%);
		animation: pulse 0.5s ease-out;
	}
	
	@keyframes pulse {
		0% {
			transform: scale(0.5);
			opacity: 0.8;
		}
		100% {
			transform: scale(2);
			opacity: 0;
		}
	}
	
	:global(.click-feedback) {
		border-color: rgba(139, 92, 246, 0.5) !important;
	}
	
	/* Success animation for copy button */
	:global(.copy-success) {
		border-color: rgba(16, 185, 129, 0.5) !important;
		background-color: rgba(16, 185, 129, 0.05) !important;
	}
	
	:global(.copy-success .icon-container) {
		color: rgb(16, 185, 129) !important;
	}
	
	/* Success animation for compile button */
	:global(.compile-success) {
		border-color: rgba(124, 58, 237, 0.5) !important;
		background-color: rgba(124, 58, 237, 0.05) !important;
	}
	
	:global(.compile-success .icon-container) {
		color: rgb(124, 58, 237) !important;
	}
</style>
