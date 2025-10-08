# Glossary - RiffRap

## Components (Svelte)
- `AudioToText` - Main recording and transcription container (lib/components/mainPage/audio-transcript/AudioToText.svelte)
- `RecordButtonWithTimer` - Recording control with visual feedback (lib/components/mainPage/audio-transcript/RecordButtonWithTimer.svelte)
- `AudioVisualizer` - Real-time audio waveform visualization (lib/components/mainPage/audio-transcript/AudioVisualizer.svelte)
- `TranscriptDisplay` - Transcription result display (lib/components/mainPage/audio-transcript/TranscriptDisplay.svelte)
- `PermissionError` - Microphone permission error handling (lib/components/mainPage/audio-transcript/PermissionError.svelte)
- `DirectCollectionLink` - Quick link to lyrics collection (lib/components/mainPage/audio-transcript/DirectCollectionLink.svelte)
- `SelectionButton` - Text selection button (lib/components/mainPage/audio-transcript/SelectionButton.svelte)
- `LyricsCollectionHeader` - Collection header (lib/components/mainPage/audio-transcript/LyricsCollectionHeader.svelte)
- `LyricsCollection` - Organize/edit/export lyrics (lib/components/mainPage/lyrics-collection/LyricsCollection.svelte)
- `SnippetItem` - Individual lyric snippet (lib/components/mainPage/lyrics-collection/components/SnippetItem.svelte)
- `MemoizedSnippetList` - Optimized snippet list (lib/components/mainPage/lyrics-collection/components/MemoizedSnippetList.svelte)
- `EmptyState` - Empty collection state (lib/components/mainPage/lyrics-collection/components/EmptyState.svelte)
- `HeaderActions` - Collection header actions (lib/components/mainPage/lyrics-collection/components/HeaderActions.svelte)
- `NotificationDisplay` - In-app notifications (lib/components/mainPage/lyrics-collection/components/NotificationDisplay.svelte)
- `GhostContainer` - Ghost character with personality (lib/components/mainPage/GhostContainer.svelte)
- `AnimatedTitle` - Staggered text animation (lib/components/mainPage/AnimatedTitle.svelte)
- `SettingsModal` - Settings dialog (lib/components/mainPage/settings/SettingsModal.svelte)
- `TranscriptionStyleSelector` - Style selection (lib/components/mainPage/settings/TranscriptionStyleSelector.svelte)
- `ErrorNotification` - Error notification UI (lib/components/ui/ErrorNotification.svelte)
- `ErrorBoundary` - Error boundary wrapper (lib/components/ui/ErrorBoundary.svelte)
- `Confetti` - Celebration effect (lib/components/ui/effects/Confetti.svelte)
- `PageLayout` - Base page layout (lib/components/layout/PageLayout.svelte)

## Services
- `audioService.js` - Microphone access, recording, audio processing (lib/services/audio/)
- `AudioService_Recording.js` - Recording logic (lib/services/audio/)
- `AudioService_Visualizer.js` - Visualizer logic (lib/services/audio/)
- `AudioService_Core.js` - Core audio functionality (lib/services/audio/)
- `AudioService_Platform.js` - Platform-specific audio (iOS vs others) (lib/services/audio/)
- `transcriptionService.js` - Gemini API transcription (lib/services/transcription/)
- `snippetStore.js` - Lyrics collection state (lib/services/lyrics/)
- `geminiService.js` - Gemini API wrapper (lib/services/)
- `modalService.js` - Modal management (lib/services/modals/)
- `routeManager.js` - Route management (lib/services/)
- `firstVisitService.js` - First-visit experience (lib/services/first-visit/)
- `gradientThemes.js` - Ghost gradient themes (lib/services/theme/)

## Infrastructure Services
- `errorHandler.js` - Centralized error handling with custom error classes
- `eventBridge.js` - Cross-component event communication
- `loggerService.js` - Structured logging system
- `storageUtils.js` - LocalStorage abstraction with encryption

## Core Concepts
- **Service-Oriented Architecture** - AudioService, TranscriptionService, Infrastructure Services
- **Ghost Animation System** - SVG-based reactive theming, eye tracking, state-based animations
- **Lyrics Collection** - Organize, edit, export transcribed snippets
- **Error Handling** - Custom error classes (RiffRapError, ApiError, UIError), centralized handler
- **Staggered Text Animation** - Letter-by-letter timing with hardware-accelerated transforms
- **Platform-Specific Audio** - iOS vs other implementations
- **Gemini Transcription** - Audio to text via Gemini API
