# Refined Glam Zones Summary

This document compiles the refined glam zone boundaries based on our detailed assessment of key components in the LineSnap application.

## TranscriptDisplay.svelte

### Original Glam Zones
1. **Core State & Config** (Lines ~20-80)
2. **User Interaction Handlers** (Lines ~81-185)
3. **Text Selection System** (Lines ~186-480)
4. **Notification & Feedback System** (Lines ~481-600)
5. **Lifecycle Hooks** (Lines ~700-750)
6. **UI Template** (Lines ~750-870)
7. **Styles** (Lines ~870-1520)

### Refined Glam Zones
1. **Core State & Config**: No change needed, well-defined
2. **User Interaction Handlers**: Split into two zones:
   - **General UI Handlers**: General UI interaction like copy, tooltips, scrolling
   - **Collection-Specific Handlers**: Handlers specifically for lyrics collection
3. **Text Selection System**: Boundary refined to exclude collection logic
4. **Notification & Feedback System**: Expanded to include all collection functions
5. **Lifecycle Hooks**: Refined to exclude debug-only code
6. **UI Template**: Split into two zones:
   - **Main Template**: Core transcript display structure
   - **Notification UI**: Toast and feedback UI elements
7. **Styles**: Organized by functional area:
   - **Base Styles**: Container and layout styles
   - **Interaction Styles**: Hover, focus, and selection styles
   - **Animation Styles**: Visual feedback animations
   - **Responsive Styles**: Mobile and screen size adaptations

## AudioService.js

### Original Glam Zones
1. **Core Initialization & Construction** (Lines ~1-75)
2. **Permissions & Device Management** (Lines ~76-160)
3. **Recording Lifecycle** (Lines ~161-350)
4. **Audio Analysis & Visualization** (Lines ~351-450)
5. **Cleanup & Resource Management** (Lines ~451-550)
6. **Public API & Exports** (Lines ~551-664)

### Refined Glam Zones
1. **Core Initialization & Service Definition**: No changes needed
2. **Platform Detection & Feature Testing**: New zone extracted from original Zone 2
   - Platform-specific logic (iOS vs. standard browsers)
   - Browser capability detection
3. **Permissions Management**: Core of original Zone 2, focused on permissions
4. **Recording Lifecycle**: Boundary refined to exclude visualization setup
5. **Audio Analysis & Visualization**: Expanded to include setup code from Zone 3
6. **Resource Management**: No changes needed
7. **Public API**: No changes needed

## EventBridge.js

### Original Glam Zones
1. **Constants and Utilities** (Lines ~35-75)
2. **Event Dispatching** (Lines ~80-165)
3. **Event Listening** (Lines ~169-286)
4. **Public API Interface** (Lines ~290-344)

### Refined Glam Zones
1. **Constants and Utilities**: No changes needed
2. **Event Dispatching**: Split into two zones:
   - **Setting Event Dispatching**: Specifically for settings with legacy support
   - **Application Event Dispatching**: For app-wide events without legacy needs
3. **Event Listening**: Split into two zones:
   - **Setting Event Listening**: With legacy compatibility and filtering
   - **Application Event Listening**: Simpler pattern without legacy support
4. **Public API Interface**: No changes needed

## Cross-Component Patterns

Several patterns emerged across all components that should guide future development:

1. **Clear Input/Output Boundaries**:
   - Components and services should have well-defined inputs and outputs
   - Side effects should be documented and localized

2. **Legacy Compatibility Strategy**:
   - Legacy code should be isolated for easier future removal
   - New code should follow current naming conventions

3. **Resource Management**:
   - Consistent cleanup patterns for event listeners and resources
   - Cleanup functions should be returned and used consistently

4. **Platform-Specific Logic**:
   - Platform-specific code should be extracted into strategy patterns
   - Feature detection should be explicit and centralized

5. **Modular Structure**:
   - Large components should be split into focused sub-components
   - Common functionality should be extracted into reusable modules

## Extraction Priorities

Based on the detailed assessments, these are the highest priority candidates for extraction:

1. **SelectionManager** from TranscriptDisplay
   - Handles all text selection and interaction logic
   - Clear boundaries and specific responsibility

2. **NotificationSystem** from TranscriptDisplay
   - Provides consistent user feedback across components
   - Already follows a clear pattern

3. **PlatformSpecificRecorders** from AudioService
   - Separate implementations for iOS and standard browsers
   - Reduces complexity in the main service

4. **AudioVisualizer** from AudioService
   - Self-contained visualization logic
   - Clear input/output boundaries

5. **LegacyEventAdapter** from EventBridge
   - Isolates backward compatibility code
   - Makes future removal easier

## OMG REF (App Glam-Up)
These refined zones provide clearer boundaries for the Phase 3 modularization work. By extracting these components according to the refined boundaries, we'll create a more maintainable and flexible codebase while preserving all existing functionality.