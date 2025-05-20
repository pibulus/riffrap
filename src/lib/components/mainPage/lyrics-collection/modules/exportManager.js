/**
 * Export management system for lyrics collection
 * 
 * This module handles copying lyrics to clipboard and
 * exporting/downloading lyrics as text files.
 */

import { playCopySound } from './soundIntegration.js';
import { createFilename } from './textUtils';

/**
 * Copy lyrics to clipboard
 * 
 * @param {Array} snippets - Array of lyric snippets to copy
 * @param {Function} onSuccess - Callback function called on successful copy
 * @param {Function} onError - Callback function called on copy error
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(snippets, onSuccess, onError) {
  if (!snippets || snippets.length === 0) {
    return false;
  }

  const text = snippets.map((snippet) => snippet.text).join('\n\n');

  if (navigator.clipboard && text) {
    try {
      await navigator.clipboard.writeText(text);
      
      // Play a sound when copying successfully
      playCopySound();
      
      // Call success callback if provided
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess();
      }
      
      return true;
    } catch (err) {
      console.error('Failed to copy: ', err);
      
      // Call error callback if provided
      if (onError && typeof onError === 'function') {
        onError(err);
      }
      
      return false;
    }
  }
  
  return false;
}

/**
 * Format lyrics for download
 * 
 * @param {Array} snippets - Array of lyric snippets to format
 * @param {string} customTitle - Optional custom title for the lyrics
 * @returns {Object} Formatted text and generated title
 */
export function formatLyricsForDownload(snippets, customTitle = '') {
  if (!snippets || snippets.length === 0) {
    return { 
      formattedText: '',
      title: ''
    };
  }

  // Create date strings for the file
  const date = new Date();
  const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  const formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

  // Create a title for the lyrics
  let title = customTitle || 'Untitled Lyrics';

  // If no custom title and we have snippets, use text from first snippet
  if (!customTitle && snippets.length > 0) {
    const firstLine = snippets[0].text.split('\n')[0];
    const words = firstLine.split(' ');
    if (words.length > 5) {
      // Use first 5 words + "..."
      title = words.slice(0, 5).join(' ') + '...';
    } else {
      // Use the whole first line if it's short
      title = firstLine;
    }
  }

  // Format the header
  let formattedText = `${title}\n`;
  formattedText += `${'-'.repeat(title.length)}\n\n`;
  formattedText += `Created: ${formattedDate} at ${formattedTime}\n\n`;

  // Divider between header and content
  formattedText += `${'* '.repeat(30)}\n\n`;

  // Format the lyrics with spacing between stanzas
  const lyricsText = snippets
    .map((snippet) => snippet.text)
    .join('\n\n');

  formattedText += lyricsText;

  // Add a footer
  formattedText += `\n\n${'* '.repeat(30)}\n\n`;
  formattedText += `Generated with LineSnap\n`;

  return {
    formattedText,
    title,
    formattedDate
  };
}

/**
 * Download lyrics as a text file
 * 
 * @param {Array} snippets - Array of lyric snippets to download
 * @param {string} customTitle - Optional custom title for the file
 * @param {Function} onSuccess - Callback function called on successful download
 * @param {Function} onError - Callback function called on error
 * @returns {boolean} Success status
 */
export function downloadLyricsAsText(snippets, customTitle = '', onSuccess, onError) {
  // Check if we have any snippets to download
  if (!snippets || snippets.length === 0) {
    if (onError && typeof onError === 'function') {
      onError('No lyrics to download');
    }
    return false;
  }

  try {
    // Format the lyrics
    const { formattedText, title, formattedDate } = formatLyricsForDownload(snippets, customTitle);

    // Create a Blob with the text content
    const blob = new Blob([formattedText], { type: 'text/plain' });

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;

    // Set the download filename - use date for uniqueness
    // Clean the title to use as filename - remove special characters
    const cleanTitle = createFilename(title);
    link.download = `lyrics-${cleanTitle}-${formattedDate}.txt`;

    // Append to the document temporarily
    document.body.appendChild(link);

    // Trigger the download
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Call success callback if provided
    if (onSuccess && typeof onSuccess === 'function') {
      onSuccess('Lyrics downloaded successfully!');
    }

    return true;
  } catch (error) {
    console.error('Download error:', error);
    
    // Call error callback if provided
    if (onError && typeof onError === 'function') {
      onError('Error downloading lyrics');
    }
    
    return false;
  }
}