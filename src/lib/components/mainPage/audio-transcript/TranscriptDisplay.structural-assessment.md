# TranscriptDisplay Component - Structural Assessment

## Component Overview

The TranscriptDisplay component is a large, complex component (1500+ lines) that displays transcribed text from audio recordings. It handles both display and interaction with the transcript, including text selection, copy/share functionality, snippet collection for lyrics, and visual feedback.

## Glam Zones Identified

### GLAM ZONE 1: CORE STATE & CONFIG
**Lines:** ~20-80
**Purpose:** Core state and configuration for the transcript display
**Contents:**
- Props passed from parent
- DOM references for direct manipulation
- Notification system state
- UI state flags
- Text selection state
- Event communication channel

**Dependencies:**
- Consumed by all other zones
- Used by template for reactive updates

**Optimization Notes:**
- State management could be extracted into a dedicated store

### GLAM ZONE 2: USER INTERACTION HANDLERS
**Lines:** ~81-185
**Purpose:** Handle direct user interactions with the transcript UI
**Contents:**
- Content extraction and manipulation
- Tooltip interactions
- Browser feature detection
- Re-roll functionality

**Dependencies:**
- Depends on Core State & Config zone for state access
- Used by the template to handle user events

**Optimization Notes:**
- These handlers could be extracted into a dedicated module to improve testability and maintainability

### GLAM ZONE 3: TEXT SELECTION SYSTEM
**Lines:** ~186-480
**Purpose:** Complex logic for handling text selection within the transcript
**Contents:**
- Detecting and processing user selections
- Line and text node selection logic
- Positioning highlight and selection UI elements
- Utility functions for DOM manipulation

**Dependencies:**
- Depends on Core State & Config zone for state access
- Used by the template for selection highlighting
- Provides data to the Notification & Feedback System

**Optimization Notes:**
- This is complex logic that could be extracted into a dedicated selection manager module

### GLAM ZONE 4: NOTIFICATION & FEEDBACK SYSTEM
**Lines:** ~481-600
**Purpose:** Handle user feedback interactions
**Contents:**
- Collecting snippets for lyrics
- Handling collection errors and success states
- Direct collection from text selections
- Toast notifications and visual feedback

**Dependencies:**
- Depends on Core State & Config zone for state access
- Uses results from Text Selection System
- Consumed by the template for visual feedback

**Optimization Notes:**
- Could be extracted into a dedicated notification and feedback module with a standard interface

### GLAM ZONE 5: LIFECYCLE HOOKS
**Lines:** ~700-750
**Purpose:** Component initialization and cleanup
**Contents:**
- Setup event listeners
- Initialize outside click handling
- Setup keyboard shortcuts
- Cleanup event listeners and DOM references

**Dependencies:** 
- Depends on Core State & Config zone for state access
- Sets up handlers from User Interaction and Text Selection zones

**Optimization Notes:**
- Lifecycle management could be simplified with a custom hook pattern

### GLAM ZONE 6: UI TEMPLATE
**Lines:** ~750-870
**Purpose:** Define the component's UI structure
**Contents:**
- Overall component layout
- Transcript text display
- Interactive elements (buttons, tooltips)
- Animation transitions
- Selection highlighting

**Dependencies:**
- Consumes all state from other zones
- Uses handlers from interaction zones

**Optimization Notes:**
- Could be split into smaller, focused sub-components

### GLAM ZONE 7: STYLES
**Lines:** ~870-1520
**Purpose:** Define the component's visual presentation
**Contents:**
- Container layout
- Box structure
- Selection visualization
- Animations
- Responsive behavior
- Accessibility styles

**Dependencies:**
- Standalone (minimal dependencies on other zones)

**Optimization Notes:**
- Styles could be modularized into theme-based components
- Many styles could be converted to utility classes

## Future Extraction Candidates

1. **SelectionManager**: Extract the text selection system into a reusable module
2. **TranscriptStore**: Create a dedicated store for transcript state management
3. **NotificationSystem**: Extract the notification logic into a reusable service
4. **UIComponents**: Split the large template into smaller, focused components:
   - TranscriptDisplay (core)
   - TranscriptControls
   - TranscriptSelectionUI
   - TranscriptNotifications

## OMG REF (App Glam-Up)
This file is a prime candidate for modularization in Phase 3. The complex selection system and notification feedback could be extracted into dedicated modules for better maintainability.