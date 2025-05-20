/**
 * Theme management system for the lyrics collection component
 * 
 * This module defines color themes, theme switching logic, and persistence
 * for the lyrics collection component.
 */

/**
 * Theme definitions with 9-color gradient support for lyrics cards
 */
export const themes = {
  purple: {
    name: 'Purple Haze',
    cardColors: [
      '#F8F0FF', // Nearly white purple
      '#F3E8FF', // Lightest purple
      '#EBE0FF', // Light purple
      '#E2D9FE', // Medium-light purple
      '#D9D2FD', // Medium purple
      '#D0CBFC', // Medium-dark purple
      '#C6C4FB', // Dark purple
      '#BDB9FA', // Deeper purple
      '#ADA0F9', // Darkest purple
    ],
    cardEvenBackground: '#F3E8FF', // For backwards compatibility
    cardEvenBorder: '#9F7AEA', // Medium purple
    cardOddBackground: '#FEEBC8', // Light amber
    cardOddBorder: '#ED8936', // Medium amber
    accentColor: '#9F7AEA'
  },
  sunset: {
    name: 'Sunset Vibes',
    cardColors: [
      '#FFF6E6', // Nearly white amber
      '#FEEBC8', // Lightest amber
      '#FEE2C0', // Light amber
      '#FDDAB8', // Medium-light amber
      '#FDD2B0', // Medium amber
      '#FDCAA8', // Medium-dark amber
      '#FDC1A0', // Dark amber
      '#FCB896', // Deeper amber
      '#FCA889', // Darkest amber/orange
    ],
    cardEvenBackground: '#FEEBC8', // For backwards compatibility
    cardEvenBorder: '#ED8936', // Medium amber
    cardOddBackground: '#FED7D7', // Light red
    cardOddBorder: '#F56565', // Medium red
    accentColor: '#F56565'
  },
  ocean: {
    name: 'Ocean Breeze',
    cardColors: [
      '#F0FFFD', // Nearly white teal
      '#E6FFFA', // Lightest teal
      '#D9F7F6', // Light teal
      '#CCF0F2', // Medium-light teal
      '#BFE8EE', // Medium teal
      '#B3E1EA', // Medium-dark teal
      '#A6D9E6', // Dark teal
      '#99D1E2', // Deeper teal
      '#8CC9DE', // Darkest teal
    ],
    cardEvenBackground: '#E6FFFA', // For backwards compatibility
    cardEvenBorder: '#38B2AC', // Medium teal
    cardOddBackground: '#BEE3F8', // Light blue
    cardOddBorder: '#4299E1', // Medium blue
    accentColor: '#4299E1'
  },
  forest: {
    name: 'Forest Chill',
    cardColors: [
      '#E3FCE9', // Nearly white green
      '#C6F6D5', // Lightest green
      '#BEEFD0', // Light green
      '#B6E8CA', // Medium-light green
      '#AEE1C5', // Medium green
      '#A6DAC0', // Medium-dark green
      '#9ED3BA', // Dark green
      '#96CCB5', // Deeper green
      '#8EC5B0', // Darkest green
    ],
    cardEvenBackground: '#C6F6D5', // For backwards compatibility
    cardEvenBorder: '#48BB78', // Medium green
    cardOddBackground: '#E6FFFA', // Light teal
    cardOddBorder: '#38B2AC', // Medium teal
    accentColor: '#48BB78'
  }
};

/**
 * Storage key for theme persistence
 */
const THEME_STORAGE_KEY = 'lineSnap-lyrics-theme';

/**
 * Default theme to use if none is specified or found in storage
 */
const DEFAULT_THEME = 'purple';

/**
 * Load saved theme from localStorage if available
 * 
 * @returns {Object} The loaded theme configuration
 */
export function loadSavedTheme() {
  if (typeof localStorage === 'undefined') {
    console.log('Using default purple theme (localStorage not available)');
    return { 
      id: DEFAULT_THEME, 
      styles: themes[DEFAULT_THEME]
    };
  }

  // Try to get saved theme ID from localStorage
  const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME;

  // Apply the theme if it exists, otherwise use default
  if (themes[savedThemeId]) {
    console.log(`Loaded saved theme: ${themes[savedThemeId].name}`);
    return {
      id: savedThemeId,
      styles: themes[savedThemeId]
    };
  } else {
    console.log('Using default purple theme');
    return {
      id: DEFAULT_THEME,
      styles: themes[DEFAULT_THEME]
    };
  }
}

/**
 * Apply a theme by ID
 * 
 * @param {string} themeId - The ID of the theme to apply
 * @returns {Object} The applied theme configuration
 */
export function applyTheme(themeId) {
  // Simple validation
  if (!themes[themeId]) {
    themeId = DEFAULT_THEME;
  }

  // Store theme in localStorage if available
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  }
  
  // Return the theme data
  return {
    id: themeId,
    styles: themes[themeId]
  };
}

/**
 * Get a list of all available themes
 * 
 * @returns {Array} Array of theme objects with id and name
 */
export function getAvailableThemes() {
  return Object.keys(themes).map(id => ({
    id,
    name: themes[id].name
  }));
}

/**
 * Get a specific theme by ID
 * 
 * @param {string} themeId - The ID of the theme to get
 * @returns {Object|null} The theme object or null if not found
 */
export function getTheme(themeId) {
  return themes[themeId] || null;
}