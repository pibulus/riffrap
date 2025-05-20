# RiffRap Nomenclature Reformation Report

## Overview 📜
This report details the comprehensive rebranding from LineSnap/LyricSnap/TalkType to RiffRap across all metadata, configuration, and SEO-relevant files in the codebase. All changes have been implemented with backward compatibility considerations where appropriate.

## Files Updated ✓

### Core Application Files
1. **AnimatedTitle.svelte**
   - Updated title text from "Line Snap" to "Riff Rap"
   - Adjusted letter spacing and animations for new 7-letter logo (previously 8)
   - Updated container class name to "riffrap-main-word"

2. **+layout.js**
   - Updated title: 'RiffRap | Turn Your Voice Into Song Lyrics'
   - Updated description with new tagline
   - Updated OpenGraph metadata URL, title, and description

### PWA Configuration
1. **manifest.json**
   - Updated name and short_name to "RiffRap"
   - Updated description and shortcut labels
   - Updated action descriptions to match new branding 

2. **site.webmanifest**
   - Changed from "LyricSnap" to "RiffRap" for both name and short_name

### HTML and Metadata
1. **app.html**
   - Updated all meta description tags
   - Updated keyword list to include "rap" and "riff"
   - Changed canonical URL to "https://riffrap.app"
   - Updated Apple mobile web app title
   - Updated all Open Graph metadata for social sharing
   - Updated all Twitter card metadata
   - Updated Schema.org structured data
   - Updated localStorage theme key with backward compatibility

2. **offline.html**
   - Changed "TalkType" references to "RiffRap" throughout
   - Updated offline message copy

### Service Files
1. **humans.txt**
   - Updated site URL to "https://riffrap.app"
   - Updated Twitter handle to "@RiffRapApp"

2. **robots.txt**
   - Updated comment from "LyricSnap" to "RiffRap"
   - Updated sitemap URL to "https://riffrap.app/sitemap.xml"

## Backward Compatibility Measures 🔄
To ensure a smooth transition without breaking existing installations:

1. **LocalStorage Keys**:
   - Added dual-key storage approach in app.html:
     ```javascript
     const THEME_KEY = 'riffrap-theme'; 
     const OLD_THEME_KEY = 'linesnap-theme';
     ```
   - Values are read from both keys with new key taking precedence
   - Values are written to both keys to ensure full compatibility
   - This approach requires no user intervention or data migration

2. **Event Handlers**:
   - Updated EventBridge configuration to maintain both old and new event prefixes
   - Legacy event names will continue to function alongside new ones

## SEO & Social Impact 🌐
The new metadata configuration ensures:

1. Consistent brand presentation across search engines
2. Updated social sharing cards with new branding
3. Proper structured data for improved search result enrichment
4. Updated Twitter and OpenGraph metadata for social media sharing

## Asset Recommendations 🖼️
The following icon assets should be updated in a subsequent update:
- `/LyricSnapIcon.png` → `/RiffRapIcon.png`
- Favicon assets in /icons/ and /favicons/ directories
- Open Graph sharing image at `/og-image.png`

## Verification Checklist ✅
- [x] All UI components display "RiffRap" properly
- [x] PWA configuration updated consistently
- [x] localStorage theme value storage functions with backward compatibility
- [x] All SEO metadata and OpenGraph tags updated
- [x] Schema.org structured data updated
- [x] All URLs updated to new domain pattern

---

*🧐 Report compiled by Archivist Unit 7*  
*Dated: The Day of Lexical Liberation*