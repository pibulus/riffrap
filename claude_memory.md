# Claude Memory: Riff Rap Layout Fixes

## Overview
Fixed critical layout issues in the Riff Rap voice transcription app related to alignment and layout jumping during rerolls.

## Issues Resolved

### 1. Container Alignment Mismatch
**Problem**: Lyrics collection was shifting left when transcription box appeared
**Root Cause**: Different container widths between transcript and lyrics components
- TranscriptDisplay: Fixed 700px container with 600px transcript box
- ContentContainer: Responsive Tailwind classes (max-w-2xl = 672px)

**Fix Applied**:
- Changed ContentContainer desktop layout from responsive Tailwind to fixed `700px` width
- Changed lyrics collection max-width from `680px` to `600px`
- Both components now use consistent 700px container with 600px content

### 2. Height Jumping During Reroll
**Problem**: Layout jumped when switching between normal transcript and "Re-rolling lyrics..." state
**Root Cause**: Different DOM structures for different content types
- Normal transcript: Text wrapped in `.lyric-line` divs with consistent styling
- Reroll text: Treated as raw HTML, bypassing `.lyric-line` wrapper

**Fix Applied**:
- Removed conditional HTML rendering in TranscriptDisplay.svelte (lines 242-248)
- Now all content uses consistent `.lyric-line` wrapper structure
- Eliminates layout differences between states

### 3. Transcript Box Height Consistency
**Additional Fix**: Increased transcript box min-height from 200px to 300px to prevent shrinking during short content states

## Files Modified
1. `/src/lib/components/mainPage/ContentContainer.svelte`
   - Desktop container: Changed to fixed 700px width
   - Lyrics collection: Changed to 600px max-width

2. `/src/lib/components/mainPage/audio-transcript/TranscriptDisplay.svelte`
   - Removed conditional HTML rendering
   - Unified content structure with `.lyric-line` wrapper
   - Increased min-height to 300px

## Key Learning
Layout jumping often occurs due to:
1. **Container width mismatches** between related components
2. **Inconsistent DOM structures** for different content states
3. **Height variations** in dynamic content containers

Always ensure related UI components use identical container dimensions and DOM structures for consistent layouts.

## Current State
✅ Alignment between transcript and lyrics collection
✅ No layout jumping during reroll operations
✅ Consistent transcript box dimensions
✅ Proper button height consistency (reverted height fix that broke text centering)