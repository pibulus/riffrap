/**
 * SvelteKit layout load function
 *
 * This file implements modern SvelteKit routing features to enhance SEO and improve page metadata.
 * It provides consistent handling of page titles, descriptions, and OpenGraph data across routes.
 */

export function load() {
  return {
    metadata: {
      title: 'RiffRap | Turn Your Voice Into Song Lyrics',
      description: 'RiffRap turns your singing or riffing into actual lyrics. Gibberish in. Killer lines out. You riff the bars — we fill the gaps.',
      canonical: 'https://riffrap.app/',
      robots: 'index, follow',
      openGraph: {
        title: 'RiffRap - From Gibberish to Gold',
        description: 'Gibberish in. Killer lines out. You riff the bars — we fill the gaps with RiffRap.',
        image: 'https://riffrap.app/og-image.png',
        type: 'website',
        url: 'https://riffrap.app/',
        imageAlt: 'RiffRap - Turn your voice into song lyrics'
      }
    }
  };
}
