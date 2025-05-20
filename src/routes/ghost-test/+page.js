/**
 * Ghost Test page load function.
 * Demonstrates page-specific metadata for route-based SEO optimization
 */

export function load() {
  return {
    metadata: {
      title: 'LineSnap Ghost Test | Animation Playground',
      description: 'Test and develop ghost animations for the LineSnap application. A developer playground for UI component testing.',
      // Page-specific OpenGraph data
      openGraph: {
        title: 'LineSnap Ghost Test | Animation Development',
        description: 'Ghost animation development environment for LineSnap',
        image: '/static/ghost-template.svg',
        type: 'website'
      }
    }
  };
}