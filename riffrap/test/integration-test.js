/**
 * Integration test for LyricsCollection component
 * 
 * This script tests that the modular lyrics collection system
 * can be successfully imported and exports all necessary functions.
 */

import * as lyricsCollection from '../src/lib/components/mainPage/lyrics-collection/index.js';

console.log('Testing LyricsCollection integration...');

// Check that all required exports are available
const requiredExports = [
  'lyricsStore',
  'themes', 
  'loadSavedTheme', 
  'applyTheme',
  'formatText',
  'combineSnippets', 
  'formatLyricsForDownload',
  'initDragDrop',
  'createNotificationSystem',
  'copyToClipboard',
  'downloadLyricsAsText',
  'createCompilationManager',
  'createTranscriptMonitor'
];

const missingExports = [];

for (const exportName of requiredExports) {
  if (!(exportName in lyricsCollection)) {
    missingExports.push(exportName);
  }
}

if (missingExports.length > 0) {
  console.error('❌ Missing exports:', missingExports.join(', '));
  process.exit(1);
} else {
  console.log('✅ All required exports are available!');
  
  // Log the available exports for reference
  console.log('Available exports:');
  for (const [key, value] of Object.entries(lyricsCollection)) {
    const type = typeof value;
    console.log(`- ${key} (${type})`);
  }
  
  console.log('Integration test passed! The LyricsCollection component can be successfully imported.');
  process.exit(0);
}