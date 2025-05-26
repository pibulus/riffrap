<script>
	import { onMount } from 'svelte';
	
	// Page data is now loaded from +page.js using runes syntax
	let { data } = $props();
	const metadata = $derived(data.metadata);
	
	// Lazy load the GhostTestContainer for smaller bundle size
	let GhostTestContainer = $state(null);
	let loading = $state(true);
	
	onMount(async () => {
		try {
			const module = await import('$lib/components/ghostTest/GhostTestContainer.svelte');
			GhostTestContainer = module.default;
		} catch (error) {
			console.error('Failed to load GhostTestContainer:', error);
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<!-- CSS resources specific to the ghost test page -->
	<link rel="stylesheet" href="/ghost-data/ghost-themes.css" />
	<link rel="stylesheet" href="/ghost-data/ghost-animations.css" />
</svelte:head>

{#if loading}
	<div class="flex items-center justify-center min-h-screen">
		<div class="text-center">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
			<p class="text-gray-600">Loading Ghost Test Components...</p>
		</div>
	</div>
{:else if GhostTestContainer}
	<GhostTestContainer />
{:else}
	<div class="flex items-center justify-center min-h-screen">
		<p class="text-red-600">Failed to load Ghost Test Components</p>
	</div>
{/if}
