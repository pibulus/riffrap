<script>
	import '../app.css';
	import { soundService } from '$lib/services/sound';
	import { onMount } from 'svelte';
	import { ErrorBoundary, ErrorNotification } from '$lib/components/ui';
	
	// Get data from the loader function and props
	let { children, data } = $props();
	
	// Extract metadata from data loaded in +layout.js using $derived (runes syntax)
	const metadata = $derived(data.metadata);
	const title = $derived(metadata?.title ?? 'RiffRap | Turn Your Voice Into Song Lyrics');
	const description = $derived(
		metadata?.description ??
			'RiffRap turns your singing or riffing into actual lyrics. Gibberish in. Killer lines out. You riff the bars — we fill the gaps.'
	);
	const canonical = $derived(metadata?.canonical ?? 'https://riffrap.app/');
	const robots = $derived(metadata?.robots ?? 'index, follow');
	const openGraph = $derived({
		title: metadata?.openGraph?.title ?? title,
		description: metadata?.openGraph?.description ?? description,
		image: metadata?.openGraph?.image ?? 'https://riffrap.app/og-image.png',
		url: metadata?.openGraph?.url ?? canonical,
		type: metadata?.openGraph?.type ?? 'website',
		imageAlt: metadata?.openGraph?.imageAlt ?? 'RiffRap - Turn your voice into song lyrics'
	});
	
	onMount(() => {
		// Initialize sound service
		soundService.init();
		
		// Make sound service available globally for other services
		if (typeof window !== 'undefined') {
			window.soundService = soundService;
		}
	});
</script>

<!-- SEO and Open Graph metadata -->
<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	<meta name="robots" content={robots} />

	<meta property="og:title" content={openGraph.title} />
	<meta property="og:description" content={openGraph.description} />
	<meta property="og:image" content={openGraph.image} />
	<meta property="og:image:alt" content={openGraph.imageAlt} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:url" content={openGraph.url} />
	<meta property="og:type" content={openGraph.type} />
	<meta property="og:site_name" content="RiffRap" />
	<meta property="og:locale" content="en_US" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={openGraph.title} />
	<meta name="twitter:description" content={openGraph.description} />
	<meta name="twitter:image" content={openGraph.image} />
	<meta name="twitter:image:alt" content={openGraph.imageAlt} />
</svelte:head>

<ErrorNotification position="top-right" />

<ErrorBoundary>
	{@render children()}
</ErrorBoundary>
