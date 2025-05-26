<script>
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { browser } from '$app/environment';
	// Import Ghost from '$lib/components/ghost/Ghost.svelte';
	import { theme as appTheme } from '$lib/index.js';

	// Props passed from the parent
	export let isRecording = false;
	export let isProcessing = false;

	// Event dispatcher to communicate with parent
	const dispatch = createEventDispatcher();

	// Component references
	let ghostComponent;

	// Debug helper
	function debug(message) {
		// Uncomment the line below during development for verbose logging
		// console.log(`[GhostContainer] ${message}`);
	}

	// Function to handle toggle recording action
	function handleToggleRecording() {
		debug('Toggle recording triggered by Ghost component');
		dispatch('toggleRecording');
	}

	// Public method to trigger ghost click for parent
	export function triggerGhostClick() {
		debug('Triggering ghost click');
		handleToggleRecording();
	}

	// Removed start/stopWobbleAnimation functions - wobble is internal to Ghost component

	// Ghost animation methods forwarded to component
	export function pulse() {
		if (ghostComponent) {
			ghostComponent.pulse();
		}
	}

	export function startThinking() {
		if (ghostComponent) {
			ghostComponent.startThinking();
		}
	}

	export function stopThinking() {
		if (ghostComponent) {
			ghostComponent.stopThinking();
		}
	}

	// Removed forceWobble forwarding function

	export function reactToTranscript(textLength) {
		if (ghostComponent) {
			ghostComponent.reactToTranscript(textLength);
		}
	}
</script>

<!-- RiffRap Icon -->
<div
	class="riffrap-icon-wrapper mb-2 sm:mb-2 md:mb-2 h-44 w-44 sm:h-48 sm:w-48 md:h-56 md:w-56 lg:h-64 lg:w-64"
>
	<button 
		class="riffrap-icon-button w-full h-full bg-transparent border-0 p-0 cursor-pointer transition-all duration-300 hover:scale-105 hover:drop-shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 rounded-lg"
		class:recording={isRecording}
		class:processing={isProcessing}
		on:click={handleToggleRecording}
		aria-label={isRecording ? "Stop recording" : "Start recording"}
		title={isRecording ? "Stop recording" : "Start recording"}
	>
		<img 
			src="/LyricSnapIcon.png"
			alt=""
			class="riffrap-icon w-full h-full pointer-events-none"
			aria-hidden="true"
		/>
	</button>
</div>

<style>
	/* RiffRap icon wrapper styling */
	.riffrap-icon-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
		margin-left: auto;
		margin-right: auto;
		animation: subtleBounce 4s ease-in-out infinite;
	}
	
	@keyframes subtleBounce {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-3px); }
	}

	/* Recording icon effect - enhanced contrast for accessibility */
	.riffrap-icon-button.recording .riffrap-icon {
		filter: drop-shadow(0 0 18px rgba(236, 72, 153, 0.85));
		/* Removed outline, keeping just the glow effect */
		animation: recording-pulse 1.5s infinite alternate ease-in-out;
	}
	
	@keyframes recording-pulse {
		from {
			filter: drop-shadow(0 0 12px rgba(236, 72, 153, 0.7));
			transform: scale(1);
		}
		to {
			filter: drop-shadow(0 0 24px rgba(236, 72, 153, 0.9));
			transform: scale(1.05);
		}
	}
	
	/* Processing state styling */
	.riffrap-icon-button.processing .riffrap-icon {
		animation: pulse 1.5s infinite alternate;
	}
	
	@keyframes pulse {
		from {
			filter: drop-shadow(0 0 5px rgba(249, 168, 212, 0.6));
		}
		to {
			filter: drop-shadow(0 0 15px rgba(249, 168, 212, 0.8));
		}
	}
	
	/* Removed breathing animation to fix hover effects */
</style>
