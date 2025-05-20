#!/usr/bin/env node

/**
 * Lyrics Collection Integration Verification Script
 * 
 * This script verifies that the LyricsCollection component has been
 * properly integrated and is compatible with existing code.
 */

console.log('\n🔍 Verifying LyricsCollection integration...\n');

// Import paths to check
const paths = [
  // Main component
  '../src/lib/components/mainPage/lyrics-collection/LyricsCollection.svelte',
  
  // Store
  '../src/lib/components/mainPage/lyrics-collection/stores/lyricsStore.js',
  
  // Modules 
  '../src/lib/components/mainPage/lyrics-collection/modules/themeManager.js',
  '../src/lib/components/mainPage/lyrics-collection/modules/storageManager.js',
  '../src/lib/components/mainPage/lyrics-collection/modules/dragDropManager.js',
  '../src/lib/components/mainPage/lyrics-collection/modules/transcriptMonitor.js',
  '../src/lib/components/mainPage/lyrics-collection/modules/exportManager.js',
  '../src/lib/components/mainPage/lyrics-collection/modules/notificationSystem.js',
  '../src/lib/components/mainPage/lyrics-collection/modules/compilationManager.js',
  '../src/lib/components/mainPage/lyrics-collection/modules/textUtils.js',
  '../src/lib/components/mainPage/lyrics-collection/modules/soundIntegration.js',
  
  // Wrapper component
  '../src/lib/components/mainPage/PurpleStyleCollectionBox.svelte',
  
  // Index file
  '../src/lib/components/mainPage/lyrics-collection/index.js',
];

// Check each path
const fs = require('fs');
const path = require('path');

let allFilesExist = true;
const missingFiles = [];

paths.forEach(p => {
  const fullPath = path.resolve(__dirname, p);
  try {
    if (fs.existsSync(fullPath)) {
      console.log(`✅ Found: ${p}`);
    } else {
      console.error(`❌ Missing: ${p}`);
      missingFiles.push(p);
      allFilesExist = false;
    }
  } catch (err) {
    console.error(`❌ Error checking ${p}: ${err.message}`);
    missingFiles.push(p);
    allFilesExist = false;
  }
});

console.log('\n');

if (allFilesExist) {
  console.log('✅ All required files are present! The integration appears to be complete.');
  console.log('   Run the dev server to test the component in action:');
  console.log('   npm run dev\n');
} else {
  console.error('❌ Some files are missing. The integration is not complete.');
  console.error('   Missing files:', missingFiles.join(', '));
  console.error('   Please check the integration steps in the documentation.\n');
  process.exit(1);
}

// Add execution permission to the script
fs.chmodSync(__filename, '755');