/**
 * SvelteKit layout load function
 *
 * This file implements modern SvelteKit routing features to enhance SEO and improve page metadata.
 * It provides consistent handling of page titles, descriptions, and OpenGraph data across routes.
 */

// Enable prerendering for static export
export const prerender = true;
export const ssr = false;

// Function that runs on the server and provides data to the layout
export function load() {
  return {
    // Default metadata that can be overridden by individual pages
    metadata: {
      title: 'RiffRap | Turn Your Voice Into Song Lyrics',
      description: 'RiffRap turns your singing or riffing into actual lyrics. Gibberish in. Killer lines out. You riff the bars — we fill the gaps.',
      // Default OpenGraph data for social sharing
      openGraph: {
        title: 'RiffRap | Voice to Lyrics Converter',
        description: 'Turn your voice recordings into killer lyrics with RiffRap',
        image: 'https://riffrap.app/og-image.png',
        type: 'website',
        url: 'https://riffrap.app'
      }
    }
  };
}