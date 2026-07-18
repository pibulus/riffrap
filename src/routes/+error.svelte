<script>
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>RiffRap | Lost the beat</title>
</svelte:head>

<div class="error-page">
	<img src="/riffrap-icon.svg" alt="RiffRap mascot" class="mascot" width="120" height="120" />

	{#if $page.status === 404}
		<h1>That page dropped the mic.</h1>
		<p>Gibberish in, nothing out — we couldn't find this one. Let's get you back to the booth.</p>
	{:else}
		<h1>Off-key somewhere.</h1>
		<p>Something glitched on our end. Take a breath, we'll reset the beat.</p>
	{/if}

	<a href="/" class="home-link">Back to RiffRap</a>
</div>

<style>
	.error-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 2rem;
		text-align: center;
		background: #fff6e6;
		color: #2f2430;
		font-family: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
	}

	.mascot {
		width: 120px;
		height: 120px;
		margin-bottom: 1.5rem;
		border-radius: 24px;
	}

	h1 {
		font-size: 1.75rem;
		font-weight: 700;
		margin: 0 0 0.5rem;
	}

	p {
		font-size: 1rem;
		max-width: 32ch;
		opacity: 0.75;
		margin: 0 0 2rem;
	}

	.home-link {
		display: inline-block;
		padding: 0.75rem 1.75rem;
		border-radius: 999px;
		background: linear-gradient(to right, #f59e0b, #ec4899);
		color: #fffdf7;
		font-weight: 600;
		text-decoration: none;
		box-shadow: 0 6px 16px rgba(236, 72, 153, 0.25);
		transition: transform 0.2s ease;
	}

	.home-link:hover {
		transform: translateY(-2px);
	}
</style>
