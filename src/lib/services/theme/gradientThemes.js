/**
 * Simple Flat Gradient Themes for Lyrics Collection Box
 * 
 * Each theme provides a simple, flat color palette inspired by clean, 
 * modern design aesthetics with a nostalgic twist.
 */

// Purple Theme (matching the UI)
export const purpleTheme = {
  id: 'purple',
  name: 'Purple Haze',
  headerGradient: 'linear-gradient(to right, #9F7AEA, #B794F4, #D6BCFA, #E9D8FD)',
  bodyBackground: '#FAF5FF',
  cardEven: {
    background: '#F3E8FF', // Light purple
    border: '#9F7AEA'      // Medium purple
  },
  cardOdd: {
    background: '#FEEBC8', // Light amber
    border: '#ED8936'      // Medium amber
  },
  titleGradient: 'linear-gradient(90deg, #9F7AEA, #ED8936)',
  accentColor: '#9F7AEA',
  buttonGradient: 'linear-gradient(to right, #9F7AEA, #D6BCFA)'
};

// Ocean Theme (matching the UI)
export const oceanTheme = {
  id: 'ocean',
  name: 'Ocean Breeze',
  headerGradient: 'linear-gradient(to right, #4299E1, #63B3ED, #90CDF4, #BEE3F8)',
  bodyBackground: '#EBF8FF',
  cardEven: {
    background: '#E6FFFA', // Light teal
    border: '#38B2AC'      // Medium teal
  },
  cardOdd: {
    background: '#BEE3F8', // Light blue
    border: '#4299E1'      // Medium blue
  },
  titleGradient: 'linear-gradient(90deg, #38B2AC, #4299E1)',
  accentColor: '#4299E1',
  buttonGradient: 'linear-gradient(to right, #4299E1, #90CDF4)'
};

// Forest Theme (matching the UI)
export const forestTheme = {
  id: 'forest',
  name: 'Forest Chill',
  headerGradient: 'linear-gradient(to right, #48BB78, #68D391, #9AE6B4, #C6F6D5)',
  bodyBackground: '#F0FFF4',
  cardEven: {
    background: '#C6F6D5', // Light green
    border: '#48BB78'      // Medium green
  },
  cardOdd: {
    background: '#E6FFFA', // Light teal
    border: '#38B2AC'      // Medium teal
  },
  titleGradient: 'linear-gradient(90deg, #48BB78, #38B2AC)',
  accentColor: '#48BB78',
  buttonGradient: 'linear-gradient(to right, #48BB78, #9AE6B4)'
};

// Simple Sunset Theme
export const sunsetTheme = {
  id: 'sunset',
  name: 'Simple Sunset',
  headerGradient: 'linear-gradient(to right, #F9E79F, #F5B041, #E67E22, #E74C3C)',
  bodyBackground: '#FDEBD0',
  cardEven: {
    background: '#FDEBD0', // Light peach
    border: '#E67E22'      // Orange
  },
  cardOdd: {
    background: '#FADBD8', // Light coral
    border: '#E74C3C'      // Red
  },
  titleGradient: 'linear-gradient(90deg, #E67E22, #E74C3C)',
  accentColor: '#E67E22',
  buttonGradient: 'linear-gradient(to right, #E67E22, #E74C3C)'
};

// Collection of all themes
export const allThemes = [
  purpleTheme,
  sunsetTheme,
  oceanTheme,
  forestTheme
];

// Get random theme
export function getRandomTheme() {
  const randomIndex = Math.floor(Math.random() * allThemes.length);
  return allThemes[randomIndex];
}

// Get theme by ID
export function getThemeById(id) {
  console.log(`Looking for theme with ID: ${id}`);
  const theme = allThemes.find(theme => theme.id === id);
  if (theme) {
    console.log(`Found theme: ${theme.name}`);
    return theme;
  }
  console.log(`Theme not found, defaulting to Purple Haze`);
  return purpleTheme; // Default to purple theme
}

export default {
  allThemes,
  getRandomTheme,
  getThemeById
};