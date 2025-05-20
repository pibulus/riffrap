<script>
	import '../app.css';
	import { soundService } from '$lib/services/sound';
	import { onMount } from 'svelte';
	import { ErrorBoundary, ErrorNotification } from '$lib/components/ui';
	
	// Get data from the loader function and props
	let { children, data } = $props();
	
	// Extract metadata from data loaded in +layout.js using $derived (runes syntax)
	const metadata = $derived(data.metadata);
	
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
	<!-- Basic meta tags -->
	<title>{metadata.title}</title>
	<meta name="description" content={metadata.description} />
	
	<!-- OpenGraph tags for rich sharing on social media -->
	<meta property="og:title" content={metadata.openGraph.title} />
	<meta property="og:description" content={metadata.openGraph.description} />
	<meta property="og:image" content={metadata.openGraph.image} />
	<meta property="og:url" content={metadata.openGraph.url} />
	<meta property="og:type" content={metadata.openGraph.type} />
	
	<!-- Twitter Card data -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={metadata.openGraph.title} />
	<meta name="twitter:description" content={metadata.openGraph.description} />
	<meta name="twitter:image" content={metadata.openGraph.image} />
	
	<!-- Mobile optimization -->
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
	<meta name="theme-color" content="#8b5cf6" />
</svelte:head>

<ErrorNotification position="top-right" />

<ErrorBoundary>
	{@render children()}
</ErrorBoundary>
