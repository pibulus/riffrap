<script>
	import { onMount } from 'svelte';
	export let title = 'RiffRap | Turn Your Voice Into Song Lyrics';
	export let description =
		'Gibberish in. Killer lines out. You riff the bars — we fill the gaps with RiffRap.';
	export const footerYear = new Date().getFullYear();
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
</svelte:head>

<section
	class="bg-gradient-mesh main center hero grid min-h-[100dvh] gap-5 px-4 pt-4 pb-6 font-sans text-black antialiased sm:px-6 md:px-8 overflow-visible"
>
	<div
		class="mx-auto flex w-full max-w-md flex-col items-center justify-center pt-16 sm:pt-20 md:pt-24 pb-20 sm:pb-24 min-h-[calc(100dvh-180px)] sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-[900px] overflow-visible"
	>
		<slot />
	</div>

	<!-- Footer section with attribution and Chrome extension info -->
	<footer
		class="fixed bottom-0 left-0 right-0 z-10 box-border bg-transparent pb-0 pt-2 text-center text-xs text-gray-600 sm:pb-0 sm:pt-3 overflow-hidden"
	>
		<div
			class="w-full mx-auto px-4 flex flex-col flex-wrap items-center justify-center gap-2 sm:flex-row sm:gap-4"
		>
			<slot name="footer-buttons" />
		</div>
	</footer>
</section>

<style>
	:global(.bg-gradient-mesh) {
		background-color: #fff6e6;
		background-image: radial-gradient(
			circle at center,
			#fff6e6 0%,
			#fff6e6 50%,
			#fff3df 85%,
			#ffefda 100%
		);
		background-attachment: fixed;
	}

	/* Unified responsive layout with modern CSS */
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding-top: 0;
		padding-bottom: 0;
		min-height: 100dvh;
	}

	/* Mobile-specific adjustments */
	@media (max-width: 640px) {
		footer {
			padding: 0.75rem 0;
		}
		
		section {
			padding-top: 0;
			padding-bottom: 0;
			gap: 3;
		}
	}
	
	/* Safari viewport height fix */
	@supports (-webkit-touch-callout: none) {
		section {
			min-height: -webkit-fill-available;
		}
		
		.min-h-\[calc\(100dvh-180px\)\] {
			min-height: calc(100vh - 180px);
			min-height: calc(-webkit-fill-available - 180px);
		}
	}
</style>
