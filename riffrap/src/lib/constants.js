/**
 * TalkType Constants
 *
 * Central configuration for app-wide constants to maintain DRY principles
 * and make future adjustments easier.
 */

// Theme/Vibe Configuration
export const THEMES = {
	PEACH: 'peach',
	MINT: 'mint',
	BUBBLEGUM: 'bubblegum',
	RAINBOW: 'rainbow'
};

export const DEFAULT_THEME = THEMES.PEACH;

// Local Storage Keys
export const STORAGE_KEYS = {
	// Application Settings
	THEME: 'riffrap-theme',
	FIRST_VISIT: 'hasSeenRiffRapIntro',
	AUTO_RECORD: 'riffrap-autoRecord',
	PROMPT_STYLE: 'riffrap-prompt-style',
	DEBUG_MODE: 'riffrap-debug-mode',
	LYRICS_COLLECTION: 'riffRap-collection',  // Key for stored lyrics collection
	LYRICS_ORIGINALS: 'riffRap-originals',  // Key for storing original snippets before combining
	LYRICS_THEME: 'riffRap-gradient-theme',  // Key for storing the gradient theme for lyrics box

	// PWA Related
	TRANSCRIPTION_COUNT: 'riffrap-transcription-count',
	PWA_PROMPT_SHOWN: 'riffrap-pwa-prompt-shown',
	PWA_PROMPT_COUNT: 'riffrap-pwa-prompt-count',
	PWA_LAST_PROMPT_DATE: 'riffrap-pwa-last-prompt-date',
	PWA_INSTALLED: 'riffrap-pwa-installed'
};

// Prompt Styles
export const PROMPT_STYLES = {
	STANDARD: 'standard',
	LYRICS: 'surlyPirate', // Keeping the same key for backwards compatibility
	LEET_SPEAK: 'leetSpeak',
	SPARKLE_POP: 'sparklePop',
	CODE_WHISPERER: 'codeWhisperer',
	QUILL_AND_INK: 'quillAndInk'
};

export const DEFAULT_PROMPT_STYLE = PROMPT_STYLES.LYRICS;

// App Configuration
export const APP_CONFIG = {
	NAME: 'Riff Rap',
	VERSION: '1.0.0',
	DESCRIPTION: 'Freestyle-ready lyric scrapbook. You riff the bars — we fill the gaps.',
	AUTHORS: 'Dennis & Pabs'
};

// Animation Timing (in ms)
export const ANIMATION = {
	// Button animations
	BUTTON: {
		PRESS_DURATION: 400, // Duration of button press animation
		HOVER_TRANSITION: 300, // Transition time for button hover effects
		NOTIFICATION_TIMER: 2500 // Time to display notification in button
	},

	// Toast notifications
	TOAST: {
		DISPLAY_DURATION: 3000, // How long toasts stay visible
		ERROR_DURATION: 5000 // How long error toasts stay visible
	},

	// Modal timing
	MODAL: {
		CLOSE_DELAY: 50, // Delay before running closeModal function
		PERMISSION_ERROR_DURATION: 8000 // How long the permission error shows
	},

	// Recording time limits
	RECORDING: {
		FREE_LIMIT: 60, // Maximum recording time in seconds for free users
		PREMIUM_LIMIT: 600, // Maximum recording time in seconds for premium users
		WARNING_THRESHOLD: 15, // Seconds remaining when to start showing warning
		DANGER_THRESHOLD: 8, // Seconds remaining when to start showing danger state
		ALMOST_DONE_THRESHOLD: 3, // Seconds remaining for final warning flash
		SCROLL_DELAY: 100, // Delay before scrolling during recording
		POST_RECORDING_SCROLL_DELAY: 650 // Delay after transcription to scroll
	},

	// Copy functionality
	COPY: {
		TOOLTIP_MAX_COUNT: 3, // Maximum number of times to show the copy tooltip
		SUCCESS_TIMER: 2500, // How long to show the success message
		FOCUS_RETURN_DELAY: 100 // Delay before returning focus after copy
	},

	// Confetti animation
	CONFETTI: {
		PIECE_COUNT: 150, // Increased number of confetti pieces for more impact
		MIN_SIZE: 6, // Minimum confetti size in px
		MAX_SIZE: 16, // Maximum confetti size in px
		ANIMATION_DURATION: 3000, // Duration of entire confetti animation
		COLORS: ['#ff9cef', '#fde68a', '#a78bfa', '#f472b6', '#60a5fa', '#ec4899', '#8b5cf6', '#f59e0b', '#10b981'], // Default vibrant colors
		
		// Theme-specific color palettes
		THEME_COLORS: {
			peach: ['#f472b6', '#ec4899', '#f59e0b', '#ff9cef', '#fde68a', '#ff9cb8'],
			mint: ['#10b981', '#34d399', '#a78bfa', '#60a5fa', '#00dfa7', '#8af9ff'],
			bubblegum: ['#ff9cef', '#f472b6', '#ec4899', '#8b5cf6', '#e879f9', '#ff99d6'],
			rainbow: ['#ff9cef', '#fde68a', '#a78bfa', '#f472b6', '#60a5fa', '#f59e0b', '#10b981', '#8b5cf6', '#e879f9']
		}
	}
};

// Service Events - shared event types for services
export const SERVICE_EVENTS = {
	// Audio Service Events
	AUDIO: {
		RECORDING_STARTED: 'audio:recordingStarted',
		RECORDING_STOPPED: 'audio:recordingStopped',
		RECORDING_ERROR: 'audio:recordingError',
		STATE_CHANGED: 'audio:stateChanged',
		WAVEFORM_DATA: 'audio:waveformData'
	},

	// Transcription Service Events
	TRANSCRIPTION: {
		STARTED: 'transcription:started',
		PROGRESS: 'transcription:progress',
		COMPLETED: 'transcription:completed',
		ERROR: 'transcription:error',
		COPIED: 'transcription:copied',
		SHARED: 'transcription:shared'
	},

	// UI Component Events
	UI: {
		BUTTON_CLICKED: 'ui:buttonClicked',
		TRANSCRIPT_EDITED: 'ui:transcriptEdited',
		COPY_REQUESTED: 'ui:copyRequested',
		SHARE_REQUESTED: 'ui:shareRequested'
	}
};

// CTA Button Phrases
export const CTA_PHRASES = [
	"Start Riffin'", // Always first
	'Click & Speak',
	'Talk Now',
	'Transcribe Me Baby',
	"Start Yer Yappin'",
	'Say the Thing',
	'Feed Words Now',
	'Just Say It',
	'Speak Up Friend',
	'Talk to Me',
	'Ready When You Are'
];

// Clipboard Success Messages
export const COPY_MESSAGES = [
	'Copied to clipboard! ✨',
	'Boom! In your clipboard! 🎉',
	'Text saved to clipboard! 👍',
	'Snagged that for you! 🙌',
	'All yours now! 💫',
	'Copied and ready to paste! 📋',
	'Captured in clipboard! ✅',
	'Text copied successfully! 🌟',
	'Got it! Ready to paste! 🚀',
	'Your text is saved! 💖',
	'Copied with magic! ✨',
	'Text safely copied! 🔮',
	'Copied and good to go! 🎯',
	'Saved to clipboard! 🎊'
];

// Attribution Tags
export const ATTRIBUTION = {
	SIMPLE_TAG: '𝘙𝘪𝘧𝘧𝘦𝘥 𝘣𝘺 𝘙𝘪𝘧𝘧 𝘙𝘢𝘱 💜',
	SHARE_POSTFIX: '\n\n𝘙𝘪𝘧𝘧𝘦𝘥 𝘣𝘺 𝘙𝘪𝘧𝘧 𝘙𝘢𝘱 💜',
	FOCUS_RECOVERY_MESSAGE: 'Click in window first, then copy again! 🔍'
};

// Offline Haikus
export const OFFLINE_HAIKUS = [
	`Connection is lost
Words float in digital void
Try again, speak soon`,

	`Microphone silent
No network to hear your words
Waiting for signals`,

	`Ghostly transcription
Cannot find your voice today
Internet missing`,

	`Voice lost in the waves
Digital silence prevails
Connect and try again`,

	`Whispers unheard now
The ghost waits patiently
Until we're online`
];

// Random haiku picker
export function getRandomHaiku() {
	return OFFLINE_HAIKUS[Math.floor(Math.random() * OFFLINE_HAIKUS.length)];
}

// Get a random element from any array
export function getRandomFromArray(array) {
	return array[Math.floor(Math.random() * array.length)];
}

// Vibration Patterns
export const VIBRATION = {
	START_RECORDING: [40, 60, 40],
	STOP_RECORDING: 50,
	COPY_SUCCESS: 25,
	ERROR: [20, 150, 20],
	PERMISSION_ERROR: [20, 100, 20, 100, 20]
};
