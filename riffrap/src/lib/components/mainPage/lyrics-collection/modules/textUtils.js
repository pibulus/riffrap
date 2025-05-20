/**
 * Text manipulation utilities for the lyrics collection component
 * 
 * This module provides text formatting, cleaning, and manipulation functions
 * for lyrics text.
 */

/**
 * Format and clean up text input
 * 
 * @param {string} text - The text to format
 * @returns {string} The formatted text with first letter capitalized
 */
export function formatText(text) {
  if (!text || !text.trim()) {
    return '';
  }

  let trimmedText = text.trim();

  // Capitalize the first letter
  if (trimmedText.length > 0) {
    trimmedText = trimmedText.charAt(0).toUpperCase() + trimmedText.slice(1);
  }

  return trimmedText;
}

/**
 * Format a snippet for display
 * 
 * @param {Object} snippet - The snippet object to format
 * @returns {Object} A new snippet object with formatted text
 */
export function formatSnippet(snippet) {
  return {
    ...snippet,
    text: formatText(snippet.text),
    isParagraph: snippet.text.includes('\n')
  };
}

/**
 * Create a filename from text with special characters removed
 * 
 * @param {string} text - The text to convert to a filename
 * @param {number} maxLength - Maximum length of the resulting filename
 * @returns {string} A clean filename
 */
export function createFilename(text, maxLength = 30) {
  return text
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, maxLength);
}

/**
 * Format multiple snippets into a single text block
 * 
 * @param {Array} snippets - Array of snippet objects
 * @returns {string} Combined text with proper spacing
 */
export function combineSnippets(snippets) {
  return snippets
    .map(snippet => {
      // Clean up any extra whitespace in each snippet
      return snippet.text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');
    })
    .join('\n\n');
}

/**
 * Format lyrics for download as a text file
 * 
 * @param {Array} snippets - Array of snippet objects
 * @param {string} title - Optional title for the lyrics
 * @returns {string} Formatted text for download
 */
export function formatLyricsForDownload(snippets, title = '') {
  // Check if we have any snippets to format
  if (snippets.length === 0) {
    return '';
  }

  // Create a date string for the file
  const date = new Date();
  const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

  // Create a title for the lyrics if not provided
  let lyricsTitle = title || 'Untitled Lyrics';

  // If no title provided and we have snippets, use the first snippet
  if (!title && snippets.length > 0) {
    const firstLine = snippets[0].text.split('\n')[0];
    const words = firstLine.split(' ');
    
    if (words.length > 5) {
      // Use first 5 words + "..."
      lyricsTitle = words.slice(0, 5).join(' ') + '...';
    } else {
      // Use the whole first line if it's short
      lyricsTitle = firstLine;
    }
  }

  // Format the header
  let formattedText = `${lyricsTitle}\n`;
  formattedText += `${'-'.repeat(lyricsTitle.length)}\n\n`;
  formattedText += `Created: ${formattedDate} at ${formattedTime}\n\n`;

  // Divider between header and content
  formattedText += `${'* '.repeat(30)}\n\n`;

  // Format the lyrics with spacing between stanzas
  const lyricsText = snippets
    .map(snippet => snippet.text)
    .join('\n\n');

  formattedText += lyricsText;

  // Add a footer
  formattedText += `\n\n${'* '.repeat(30)}\n\n`;
  formattedText += `Generated with LineSnap\n`;

  return formattedText;
}

/**
 * Get text from the current document selection
 * 
 * @returns {string} The currently selected text or empty string
 */
export function getCurrentSelection() {
  if (typeof window === 'undefined' || !window.getSelection) {
    return '';
  }

  const selection = window.getSelection();
  return selection ? selection.toString().trim() : '';
}