<script>
	import IconButton from '$lib/components/ui/IconButton.svelte';
	import { snippetStore } from '$lib/services';
	import { createEventDispatcher } from 'svelte';

	// Props
	export let className = '';
	export let hasSnippets = false;

	// Create event dispatcher
	const dispatch = createEventDispatcher();

	// Event handlers
	function grabLyrics() {
		// Emit event to parent component
		dispatch('grab-lyrics');
	}

	function copyLyrics() {
		const text = snippetStore.getPlainText();

		if (navigator.clipboard && text) {
			navigator.clipboard
				.writeText(text)
				.then(() => {
					// Optional: Display a temporary success notification
				})
				.catch((err) => {
					console.error('Failed to copy: ', err);
				});
		}
	}

	function combineLyrics() {
		// Emit event to parent component
		dispatch('combine-lyrics');
	}

	function downloadLyrics() {
		const text = snippetStore.getPlainText();

		if (text) {
			// Create a Blob with the text content
			const blob = new Blob([text], { type: 'text/plain' });
			const url = URL.createObjectURL(blob);

			// Create a download link and trigger click
			const a = document.createElement('a');
			a.href = url;
			a.download = 'lyrics.txt';
			document.body.appendChild(a);
			a.click();

			// Clean up
			setTimeout(() => {
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			}, 100);
		}
	}

	function clearLyrics() {
		if (confirm('Are you sure you want to clear all collected lyrics?')) {
			snippetStore.clearSnippets();
		}
	}
</script>

<!-- Lyrics Header Layout -->
<div
	class="flex items-center justify-between rounded-t-xl border-b border-neutral-200 bg-white/70 px-4 py-2 backdrop-blur-sm {className}"
>
	<!-- Left: Title -->
	<h2 class="text-lg font-semibold text-neutral-800">Lyrics Collection</h2>

	<!-- Right: Actions -->
	<div class="flex items-center space-x-2">
		<IconButton icon="plus" tooltip="✨ Snap a new lyric line" onClick={grabLyrics} />
		<IconButton icon="copy" tooltip="📋 Copy lyrics" onClick={copyLyrics} disabled={!hasSnippets} />
		<IconButton
			icon="edit"
			tooltip="🪄 Compile selected into one block"
			onClick={combineLyrics}
			disabled={!hasSnippets}
		/>
		<IconButton
			icon="download"
			tooltip="⬇️ Download lyrics"
			onClick={downloadLyrics}
			disabled={!hasSnippets}
		/>
		<IconButton icon="trash" tooltip="🗑️ Clear all" onClick={clearLyrics} disabled={!hasSnippets} />
	</div>
</div>

<style>
	/* Add subtle animation for empty state */
	button:disabled {
		transform: none;
		transition:
			transform 0.3s ease,
			opacity 0.3s ease;
	}

	button:disabled:hover {
		transform: translateY(-2px);
		opacity: 0.6;
	}
</style>
