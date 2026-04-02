/**
 * Ghost Test page load function.
 * Demonstrates page-specific metadata for route-based SEO optimization
 */

export function load() {
  return {
    metadata: {
      title: 'RiffRap Ghost Test | Animation Playground',
      description: 'Test and develop ghost animations for the RiffRap application. A developer playground for UI component testing.',
      // Page-specific OpenGraph data
      openGraph: {
        title: 'RiffRap Ghost Test | Animation Development',
        description: 'Ghost animation development environment for RiffRap',
        image: 'https://riffrap.app/ghost-template.svg',
        type: 'website',
        url: 'https://riffrap.app/ghost-test'
      },
      canonical: 'https://riffrap.app/ghost-test',
      robots: 'noindex, nofollow'
    }
  };
}
