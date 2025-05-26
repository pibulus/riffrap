import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { promptTemplates, applyTemplate } from './promptTemplates';

// Create a store for the current prompt style
const STORAGE_KEY = 'riffrap-prompt-style';
const LEGACY_STORAGE_KEY = 'linesnap-prompt-style';
const DEFAULT_STYLE = 'standard';

// Initialize with stored preference or default
const createPromptStyleStore = () => {
  const store = writable(DEFAULT_STYLE);
  
  // Initialize from localStorage if in browser (with legacy support)
  if (browser) {
    let storedStyle = localStorage.getItem(STORAGE_KEY);
    
    // Check legacy storage if new key doesn't exist
    if (!storedStyle) {
      storedStyle = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (storedStyle) {
        // Migrate legacy key to new key
        localStorage.setItem(STORAGE_KEY, storedStyle);
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    }
    
    // Handle legacy style name migration
    if (storedStyle === 'surlyPirate') {
      storedStyle = 'lyricsMode';
      localStorage.setItem(STORAGE_KEY, storedStyle);
    }
    
    if (storedStyle && promptTemplates[storedStyle]) {
      store.set(storedStyle);
    } else if (storedStyle && !promptTemplates[storedStyle]) {
      console.log(`Stored prompt style '${storedStyle}' is no longer available, using default`);
      localStorage.setItem(STORAGE_KEY, DEFAULT_STYLE);
      store.set(DEFAULT_STYLE);
    }
  }
  
  // Return the store with custom methods
  return {
    ...store,
    setStyle: (style) => {
      if (!promptTemplates[style]) {
        console.error(`Prompt style '${style}' not found`);
        return false;
      }
      
      store.set(style);
      
      // Save to localStorage if in browser
      if (browser) {
        localStorage.setItem(STORAGE_KEY, style);
      }
      
      return true;
    },
    getAvailableStyles: () => {
      return Object.keys(promptTemplates);
    }
  };
};

// Create the store (only used internally)
const promptStyleStore = createPromptStyleStore();

// Prompt manager functions
export const promptManager = {
  // Get the current prompt style
  getCurrentStyle: () => get(promptStyleStore),
  
  // Set the current prompt style
  setStyle: (style) => promptStyleStore.setStyle(style),
  
  // Get available prompt styles
  getAvailableStyles: () => promptStyleStore.getAvailableStyles(),
  
  // Get a prompt for a specific operation using the current style
  getPrompt: (operation, variables = {}) => {
    let currentStyle = get(promptStyleStore);
    
    // Check if current style exists, if not, reset to default
    if (!promptTemplates[currentStyle]) {
      console.error(`Prompt style '${currentStyle}' not found, falling back to standard`);
      currentStyle = DEFAULT_STYLE;
      // Update the store to prevent repeated errors
      promptStyleStore.setStyle(DEFAULT_STYLE);
    }
    
    if (!promptTemplates[currentStyle][operation]) {
      console.error(`Operation '${operation}' not found in style '${currentStyle}', falling back to standard`);
      return applyTemplate(promptTemplates.standard[operation].text, variables);
    }
    
    return applyTemplate(promptTemplates[currentStyle][operation].text, variables);
  },
  
  // Subscribe to style changes
  subscribe: (callback) => promptStyleStore.subscribe(callback)
};
