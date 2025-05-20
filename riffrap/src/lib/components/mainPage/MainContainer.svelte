<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import GhostContainer from './GhostContainer.svelte';
	import ContentContainer from './ContentContainer.svelte';
	import FooterComponent from './FooterComponent.svelte';
	import { geminiService } from '$lib/services/geminiService';
	import { themeService } from '$lib/services/theme';
	import { modalService } from '$lib/services/modals';
	import { firstVisitService, isFirstVisit } from '$lib/services/first-visit';
	import { pwaService, deferredInstallPrompt, showPwaInstallPrompt } from '$lib/services/pwa';
	import { isRecording as recordingStore } from '$lib/services';
	import { PageLayout } from '$lib/components/layout';
	import { eventBridge } from '$lib/services/infrastructure/eventBridge';
	import { createLogger } from '$lib/services/infrastructure/loggerService';
	import { errorHandler, UIError } from '$lib/services/infrastructure/errorHandler';
	import { ErrorBoundary } from '$lib/components/ui';
	import { fade } from 'svelte/transition';
	import { StorageUtils } from '$lib/services/infrastructure/storageUtils';
	import { STORAGE_KEYS } from '$lib/constants';

	// Import modals lazily
	import { AboutModal, ExtensionModal, IntroModal } from './modals';

	// Lazy load components that aren't needed immediately
	let SettingsModal;
	let PwaInstallPrompt;
	let loadingSettingsModal = false;
	let loadingPwaPrompt = false;

	// Track speech model preloading state
	let speechModelPreloaded = false;

	// State variables to pass to children
	let isProcessing = false;

	// Create a logger for this component
	const logger = createLogger('MainContainer');
	
	// Debug Helper - use the logger instead of console.log
	function debug(message) {
		// Uses the debug level so it only appears when debug mode is enabled
		logger.debug(message);
	}

	// Modal functions
	function showAboutModal() {
		debug('showAboutModal called');
		modalService.openModal('about_modal');
	}

	function showExtensionModal() {
		debug('showExtensionModal called');
		modalService.openModal('extension_modal');
	}

	async function openSettingsModal() {
		debug('openSettingsModal called');

		// First, ensure any open dialogs are closed
		if (modalService.isModalOpen()) {
			debug('Another modal was open, closing it first.');
			modalService.closeModal();
			await new Promise((resolve) => setTimeout(resolve, 50));
		}

		// Check if we're already loading the modal
		if (loadingSettingsModal) {
			debug('SettingsModal is already loading, aborting.');
			return;
		}

		// Use modern dynamic import pattern with error handling
		if (!SettingsModal) {
			loadingSettingsModal = true;
			debug('Lazy loading SettingsModal component...');

			try {
				// Use dynamic import with more precise error handling
				const module = await import('./settings/SettingsModal.svelte')
					.catch(error => {
						// Log to error handler instead of console
						errorHandler.handleError(
							new UIError('Failed to load settings modal', { cause: error }),
							{ notify: false }
						);
						throw error; // Re-throw to trigger catch block
					});
					
				SettingsModal = module.default;
				debug('SettingsModal component loaded successfully');
			} catch (err) {
				debug(`Error loading SettingsModal: ${err.message}`);
				return; // Don't proceed if loading failed
			} finally {
				loadingSettingsModal = false; // Ensure this is always reset
			}
		}

		// Open the settings modal
		modalService.openModal('settings_modal');
	}

	function closeSettingsModal() {
		debug('closeSettingsModal called');
		modalService.closeModal();
	}

	function closeModal() {
		modalService.closeModal();
	}

	// Function to preload speech model for faster initial response
	function preloadSpeechModel() {
		if (!speechModelPreloaded && browser) {
			debug('Preloading speech model for faster response');
			speechModelPreloaded = true; // Assume success initially

			// Make sure the current prompt style is set before preloading
			if (browser) {
				const savedStyle = StorageUtils.getItem(STORAGE_KEYS.PROMPT_STYLE);
				if (savedStyle) {
					debug(`Setting prompt style from localStorage: ${savedStyle}`);
					geminiService.setPromptStyle(savedStyle);
				}
			}

			// Log available prompt styles
			const availableStyles = geminiService.getAvailableStyles();
			debug(`Available prompt styles: ${availableStyles.join(', ')}`);

			geminiService
				.preloadModel()
				.then(() => {
					debug('Speech model preloaded successfully.');
				})
				.catch((err) => {
					// Handle the error with our error handler
					errorHandler.handleError(err, {
						notify: false, // Don't notify user for preload failures
						emitEvent: true // Still emit the event for system awareness
					});
					
					debug(`Error preloading speech model: ${err.message}`);
					// Reset so we can try again
					speechModelPreloaded = false;
				});
		} else if (speechModelPreloaded) {
			debug('Speech model already preloaded or preloading.');
		}
	}

	// Event handlers for recording state changes
	function handleRecordingStart() {
		isProcessing = false;
	}

	function handleRecordingStop() {
		// No need to set isRecording - it's handled by the store
	}

	function handleProcessingStart() {
		isProcessing = true;
	}

	function handleProcessingEnd() {
		isProcessing = false;
	}

	// Handle toggle recording from ghost
	function handleToggleRecording() {
		debug('Toggle recording triggered from ghost');

		if ($recordingStore) {
			// ghostContainer.stopWobbleAnimation(); // Removed - Wobble handled internally
			contentContainer.stopRecording();
		} else {
			// ghostContainer.startWobbleAnimation(); // Removed - Wobble handled internally
			contentContainer.startRecording();
		}
	}

	// Function to trigger ghost click
	function triggerGhostClick() {
		debug('Triggering ghost click after intro modal close');
		// Forward to the toggle recording handler
		handleToggleRecording();
	}

	// Handle transcription completed event for PWA prompt
	async function handleTranscriptionCompleted(event) {
		if (!browser) return;

		const newCount = event.detail.count;
		debug(`🔔 Transcription completed event received. Count: ${newCount}`);

		// The PWA service handles most of the logic, but we need to lazy-load the component
		if ($showPwaInstallPrompt && !PwaInstallPrompt) {
			// Prevent multiple simultaneous loading attempts
			if (loadingPwaPrompt) {
				debug('PWA prompt is already loading');
				return;
			}
			
			loadingPwaPrompt = true;
			debug('📱 Lazy loading PWA install prompt component...');

			try {
				// Use dynamic import with more precise error handling
				const module = await import('./pwa/PwaInstallPrompt.svelte')
					.catch(error => {
						// Log to error handler instead of console
						errorHandler.handleError(
							new UIError('Failed to load PWA install prompt', { cause: error }),
							{ notify: false }
						);
						throw error; // Re-throw to trigger catch block
					});
					
				PwaInstallPrompt = module.default;
				debug('📱 PWA install prompt component loaded successfully');
			} catch (err) {
				debug(`Error loading PWA install prompt: ${err.message}`);
			} finally {
				loadingPwaPrompt = false;
			}
		}
	}

	// Closes the PWA install prompt
	function closePwaInstallPrompt() {
		debug('ℹ️ PWA install prompt dismissed.');
		// Update the store value through the service
		pwaService.dismissPrompt();
	}

	// Component references
	let ghostContainer;
	let contentContainer;

	// Lifecycle hooks
	onMount(() => {
		// Use requestIdleCallback (or fallback) to pre-load components during browser idle time
		const requestIdleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 1000));
		
		// Pre-load the SettingsModal component when browser is idle
		requestIdleCallback(async () => {
			if (!SettingsModal && !loadingSettingsModal) {
				try {
					loadingSettingsModal = true;
					debug('Pre-loading SettingsModal component during idle time');
					const module = await import('./settings/SettingsModal.svelte');
					SettingsModal = module.default;
					debug('SettingsModal component pre-loaded successfully');
				} catch (err) {
					errorHandler.handleError(
						new UIError('Failed to pre-load settings modal', { cause: err }),
						{ notify: false }
					);
					debug(`Error pre-loading SettingsModal: ${err.message}`);
				} finally {
					loadingSettingsModal = false;
				}
			}
		});

		// Check for auto-record setting and start recording if enabled
		if (browser && StorageUtils.getBooleanItem(STORAGE_KEYS.AUTO_RECORD, false)) {
			// Wait minimal time for component initialization
			setTimeout(() => {
				if (contentContainer && !$recordingStore) {
					debug('Auto-record enabled, attempting to start recording immediately');
					try {
						contentContainer.startRecording();
						ghostContainer.startWobbleAnimation();
						debug('Auto-record: Called startRecording()');
					} catch (err) {
						debug(`Auto-record: Error starting recording: ${err.message}`);
					}
				} else {
					debug('Auto-record: Conditions not met (no component or already recording).');
				}
			}, 500); // Reduced delay - just enough for component initialization
		} else {
			debug('Auto-record not enabled or not in browser.');
		}

		// Set up event listeners using eventBridge
		if (browser) {
			// Store removal functions to clean up later
			const removeListeners = [];
			
			// Listen for autoRecord setting changes
			const removeAutoRecordListener = eventBridge.addSettingChangeListener('autoRecord', (value) => {
				debug(`Setting changed event: autoRecord = ${value}`);
				// No immediate action needed, setting will apply on next page load/refresh
			});
			removeListeners.push(removeAutoRecordListener);
			
			// Listen for promptStyle setting changes
			const removePromptStyleListener = eventBridge.addSettingChangeListener('promptStyle', (value) => {
				debug('Prompt style setting changed:', value);
				// Update the prompt style in the service
				geminiService.setPromptStyle(value);
			});
			removeListeners.push(removePromptStyleListener);
			
			// Listen for geminiApiKey setting changes
			const removeApiKeyListener = eventBridge.addSettingChangeListener('geminiApiKey', (value) => {
				debug('Gemini API key updated:', value ? 'Key provided' : 'No key');
				// Refresh the page to apply the new API key
				if (value && confirm('API key saved! Refresh the page to apply changes?')) {
					window.location.reload();
				}
			});
			removeListeners.push(removeApiKeyListener);
			
			// Listen for API key error that needs to show settings
			// This is an application event, not a setting change
			const removeShowSettingsListener = eventBridge.addAppEventListener('show-settings', () => {
				debug('show-settings event received, opening settings modal');
				openSettingsModal();
			});
			removeListeners.push(removeShowSettingsListener);
			
			// Clean up all listeners on component destroy
			onDestroy(() => {
				debug('Cleaning up event listeners');
				removeListeners.forEach(remove => remove());
			});
			
			debug('Added listeners for settings changes and show-settings events');
		}

		// Check if first visit to show intro
		firstVisitService.showIntroModal();
	});
</script>

<PageLayout>
	<ErrorBoundary>
		<div class="flex flex-col items-center justify-start flex-1 gap-1 sm:gap-0">
			<GhostContainer
				bind:this={ghostContainer}
				isRecording={$recordingStore}
				{isProcessing}
				on:toggleRecording={handleToggleRecording}
			/>
			<ContentContainer
				bind:this={contentContainer}
				ghostComponent={ghostContainer}
				{speechModelPreloaded}
				onPreloadRequest={preloadSpeechModel}
				on:recordingstart={handleRecordingStart}
				on:recordingstop={handleRecordingStop}
				on:processingstart={handleProcessingStart}
				on:processingend={handleProcessingEnd}
				on:transcriptionCompleted={handleTranscriptionCompleted}
			/>
		</div>
	</ErrorBoundary>
	<svelte:fragment slot="footer-buttons">
		<FooterComponent
			on:showAbout={showAboutModal}
			on:showSettings={openSettingsModal}
			on:showExtension={showExtensionModal}
		/>
	</svelte:fragment>
</PageLayout>

<!-- Modals -->
<AboutModal {closeModal} />
<ExtensionModal {closeModal} />
<IntroModal
	{closeModal}
	markIntroAsSeen={() => firstVisitService.markIntroAsSeen()}
	{triggerGhostClick}
/>

<!-- Settings Modal - lazy loaded -->
{#if SettingsModal}
	<!-- Pass the close function down to the component -->
	<svelte:component this={SettingsModal} on:close={closeSettingsModal} />
{/if}

<!-- PWA Install Prompt -->
{#if $showPwaInstallPrompt && PwaInstallPrompt}
	<div transition:fade={{ duration: 300 }}>
		<svelte:component
			this={PwaInstallPrompt}
			installPromptEvent={$deferredInstallPrompt}
			on:closeprompt={closePwaInstallPrompt}
		/>
	</div>
{/if}
