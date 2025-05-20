<script>
	import GhostTestContainer from '$lib/components/ghostTest/GhostTestContainer.svelte';
	
	// Page data is now loaded from +page.js using runes syntax
	let { data } = $props();
	const metadata = $derived(data.metadata);
</script>

<svelte:head>
	<!-- CSS resources specific to the ghost test page -->
	<link rel="stylesheet" href="/ghost-data/ghost-themes.css" />
	<link rel="stylesheet" href="/ghost-data/ghost-animations.css" />
</svelte:head>

<GhostTestContainer />
