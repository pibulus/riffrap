# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development

- `npm run dev` - Start development server (runs on port 3002)
- `npm run dev -- --open` - Start development server and open in browser
- `npm run build` - Create production build (outputs to `/build`)
- `npm run preview` - Preview production build
- `npm run format` - Run Prettier formatter
- `npm run lint` - Check code formatting and run ESLint

## Environment Setup

Create a `.env` file in the project root with:

```
VITE_GEMINI_API_KEY=your_api_key_here
```

Get a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey)

## Core Architecture

Riff Rap is a voice transcription web app that allows users to record audio, transcribe it to text, and collect/organize lyrics. The app is built with SvelteKit and uses the following architecture:

### Service Layer

The app follows a service-oriented architecture with several key services:

1. **AudioService** (`/src/lib/services/audio/audioService.js`):
   - Handles microphone access, recording, and audio processing
   - Manages recording state via a state machine
   - Handles platform-specific audio implementations (iOS vs other)

2. **TranscriptionService** (`/src/lib/services/transcription/transcriptionService.js`):
   - Processes audio through Gemini API to generate text transcriptions
   - Manages transcription state and progress
   - Provides clipboard and sharing functionality

3. **Infrastructure Services**:
   - `errorHandler.js`: Centralized error handling with custom error classes
   - `eventBridge.js`: Cross-component communication via events
   - `loggerService.js`: Structured logging system
   - `storageUtils.js`: LocalStorage abstraction with encryption support

### Component Structure

- **Ghost Component** (`/src/lib/components/ghost/`):
  - Central UI element using SVG with reactive theming
  - Provides visual feedback for app states via animations
  - Implements a hybrid state management approach with Svelte stores

- **Audio/Transcript Components** (`/src/lib/components/mainPage/audio-transcript/`):
  - `AudioToText.svelte`: Main container managing recording and transcription
  - `RecordButtonWithTimer.svelte`: Recording control with visual feedback
  - `AudioVisualizer.svelte`: Real-time audio visualization

- **Lyrics Collection** (`/src/lib/components/mainPage/lyrics-collection/`):
  - Allows organizing, editing and exporting transcribed snippets

### State Management

- Uses Svelte stores for reactive state management
- Each service exposes public stores and action methods
- Follows a unidirectional data flow pattern
- State updates trigger UI changes via store subscriptions

### Error Handling System

Riff Rap implements a comprehensive error handling system via:

- Custom error classes (RiffRapError, ApiError, UIError, etc.)
- Centralized error handler that logs, notifies, and manages errors
- Integration with UI notification system
- Error wrapping utilities for async functions
- Mapped error codes to user-friendly messages

## Animation Systems

### Text Animation System

- Uses staggered animations for text entry with letter-by-letter timing
- Implements slide-in animations for subtitle and content blocks
- Coordinates animation sequences (Title → Subtitle → Interactive elements)
- Uses hardware-accelerated CSS transforms for performance

### Ghost Animation System

The Ghost component has a sophisticated animation system including:

- SVG-based animations targeting specific elements via ID selectors
- Theme system with reactive updates and localStorage persistence
- Gradient animations through combined CSS and JavaScript approaches
- Eye tracking system that follows cursor movement
- State-based animations (idle, recording, processing)

### UI Animation Guidelines

When implementing animations in the UI:

- Hardware accelerate with `will-change` and `transform`
- Force browser reflow between animations with `void element.offsetWidth`
- Maintain clear separation between theme and animation logic
- Use CSS variables for all theme colors and timing values
- Clear timeouts properly to avoid animation conflicts

## Code Style Guidelines

- **Framework**: Use idiomatic Svelte patterns with reactive declarations
- **JavaScript**: Standard JS (not TypeScript) with JSConfig for type checking
- **Formatting**: Prettier with Svelte and Tailwind plugins
- **CSS**: Tailwind CSS with DaisyUI components
- **Component Structure**: Organize by functionality in lib/components
- **Services**: External API interactions belong in lib/services
- **Documentation**: Include JSDoc comments for functions
- **Error Handling**: Use the central error handler and avoid direct console.error

## Common Issues & Solutions

1. **Audio Permission Handling**: Always check platform (iOS, Android, desktop) before requesting permissions and provide fallbacks.

2. **SVG Animation Issues**: Animations should target SVG elements directly by ID, not container groups. Use forced reflow to prevent animation conflicts.

3. **Browser Compatibility**: Use feature detection and graceful degradation, especially for advanced audio features.

4. **Memory Management**: Clear all timeouts, event listeners, and animation frames in onDestroy hooks.

5. **Performance**: For UI components with frequent updates, use:
   - Memoization for expensive calculations
   - CSS containment where appropriate
   - Throttling/debouncing for high-frequency events

## Deployment

RiffRap uses `@sveltejs/adapter-static` for flexible deployment to any static hosting provider.

### Deploy to Cloudflare Pages (Recommended)

1. Connect GitHub repo to Cloudflare Pages
2. Build command: `npm run build`
3. Output directory: `build`
4. Add environment variable: `VITE_GEMINI_API_KEY=your_key`

### Deploy to Netlify

1. Connect GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `build`
4. Add environment variable: `VITE_GEMINI_API_KEY=your_key`

### Other Static Hosts

The `/build` directory works on GitHub Pages, Surge, Vercel (static), or any CDN.

## SEO & Accessibility

The app includes comprehensive production features:

- **SEO**: Open Graph tags, Twitter cards, structured data (JSON-LD), sitemap, robots.txt
- **Accessibility**: ARIA labels, skip-to-main link, keyboard navigation, focus indicators, screen reader support
- **Mobile**: Responsive breakpoints (sm/md/lg/xl), pinch-to-zoom enabled, PWA-ready with manifest
- **Performance**: Hardware-accelerated animations, lazy loading, optimized assets

## Editor Configuration

- Default branch: master
- Code width: 80 characters
- Tab size: 2 spaces