# SVG Animation Performance Optimization Guide

This document outlines best practices and optimization techniques for improving the performance of SVG animations in LineSnap, particularly for the Ghost component and other animated SVG elements.

## Current Animation Implementations

LineSnap uses SVG animations in several key components:
- Ghost animations (eyes, body movement)
- Logo and icon transitions
- UI element transitions and effects

## Optimization Techniques

### 1. SVG File Optimization

#### Minimize SVG File Size
- **Use SVGO**: Optimize all SVG files with SVGO to remove unnecessary metadata, comments, and attributes
- **Simplify paths**: Reduce path complexity by removing unnecessary points and smoothing curves
- **Remove unused elements**: Eliminate hidden elements, unused groups, and redundant definitions

Example:
```bash
# Using SVGO CLI to optimize ghost-paths.svg
npx svgo src/lib/components/ghost/ghost-paths.svg -o src/lib/components/ghost/ghost-paths.optimized.svg
```

#### File Structure Best Practices
- Group related elements that animate together
- Use meaningful IDs for elements that will be animated
- Keep the DOM structure as flat as possible
- Add `will-change` hints on elements that will animate frequently

### 2. Animation Performance Techniques

#### Use Hardware-Accelerated Properties
When animating SVG elements, prioritize these properties for best performance:
- `transform` (translate, scale, rotate)
- `opacity`
- `filter` (use sparingly)

Avoid animating these properties when possible:
- `width`/`height`
- `x`/`y` coordinates
- `points` or `d` (path data)
- `stroke-dasharray`/`stroke-dashoffset` (use carefully)

#### CSS vs. JavaScript Animation
- Use CSS animations for simple, predictable animations
- Use JavaScript (RAF) for complex, interactive animations
- Consider GSAP for complex sequencing or performance-critical animations

#### Animation Throttling & Batching
- Limit animation frame rates for subtle animations (e.g., blinking)
- Batch multiple animation updates together
- Use `requestAnimationFrame` correctly and avoid nested calls

### 3. Ghost Component Specific Optimizations

#### Eye Tracking
- Reduce calculation frequency with throttling
- Simplify eye movement math
- Add more caching of calculated positions

```javascript
// Before
function updateEyePosition(mouseX, mouseY) {
  // Calculate on every frame
  // ...complex math
}

// After
const throttledUpdateEyePosition = throttle((mouseX, mouseY) => {
  // Only calculate periodically
  // ...optimized math
}, 50); // 50ms throttle (20fps)
```

#### Layering Strategy
- Split the ghost into separate layers:
  - Static background
  - Animated body
  - Animated eyes
  - Effects (glow, etc.)
- Use opacity and transforms for transitions between states

#### Reduce Repaints
- Use CSS `will-change` property on animated elements
- Force GPU acceleration with `transform: translateZ(0)`
- Avoid animating properties that trigger layout

### 4. Implementation Suggestions

#### SVG Animation Best Practices
- Pre-compute animation values where possible
- Use CSS custom properties (variables) for values that change frequently
- Create efficient animation sequences with proper timing functions
- Use `will-change` selectively on elements that will animate (but don't overuse)

#### Animation Toggling
- Pause animations when not visible
- Reduce animation complexity on low-power devices
- Consider reducing animation based on `prefers-reduced-motion` media query

```javascript
// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Adjust animation based on preference
if (prefersReducedMotion) {
  // Use simplified animations or disable them
} else {
  // Use full animations
}
```

### 5. Performance Monitoring

#### Metrics to Track
- Frame rate during animations
- Time to first animation frame
- Animation jank (dropped frames)
- Memory usage during sustained animation

#### Testing Methods
- Use Chrome DevTools Performance panel to profile animations
- Monitor in the field with user experience metrics
- Test on low-end devices regularly

## Example Implementation Changes

### Ghost Eye Animation Optimization

```javascript
// Current implementation
function animateEyes(mouseX, mouseY) {
  // Complex calculations on every frame
  const leftEye = document.getElementById('left-eye');
  const rightEye = document.getElementById('right-eye');
  
  // Calculate positions...
  leftEye.setAttribute('cx', newLeftX);
  leftEye.setAttribute('cy', newLeftY);
  rightEye.setAttribute('cx', newRightX);
  rightEye.setAttribute('cy', newRightY);
}

// Optimized implementation
const eyeElements = {
  left: null,
  right: null
};

// Cache eye elements on mount
function cacheEyeElements() {
  eyeElements.left = document.getElementById('left-eye');
  eyeElements.right = document.getElementById('right-eye');
}

// Use transforms instead of cx/cy attributes
function animateEyesOptimized(mouseX, mouseY) {
  // Throttled and simplified calculations
  // Use transforms instead of attribute changes
  eyeElements.left.style.transform = `translate(${newLeftX}px, ${newLeftY}px)`;
  eyeElements.right.style.transform = `translate(${newRightX}px, ${newRightY}px)`;
}

// Throttle the eye tracking for better performance
const throttledEyeAnimation = throttle(animateEyesOptimized, 33); // ~30fps
```

## Next Steps

1. Audit current SVG animations in the codebase
2. Implement optimization techniques from this guide
3. Measure performance improvements
4. Document best practices for future animation development

## Additional Resources

- [CSS Tricks: Weighing SVG Animation Techniques](https://css-tricks.com/weighing-svg-animation-techniques-benchmarks/)
- [SVGator: Optimize SVG Animations](https://www.svgator.com/blog/svg-optimizations-improve-page-speed/)
- [GSAP Documentation](https://greensock.com/docs/)
- [MDN Web Docs: SVG Performance](https://developer.mozilla.org/en-US/docs/Web/SVG/SVG_animation_with_SMIL)