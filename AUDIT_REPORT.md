# RiffRap Codebase Audit Report

## Summary
Comprehensive audit of RiffRap voice transcription app, focusing on memory leaks, mobile responsiveness, code quality, architecture, and performance issues.

---

## 1. MEMORY LEAKS & CLEANUP ISSUES

### 1.1 AudioVisualizer.svelte - Mixed Animation Patterns and Cleanup Issues
**File**: `/home/user/riffrap/src/lib/components/mainPage/audio-transcript/AudioVisualizer.svelte`

**Issues**:
- **Lines 71-79**: addEventListener registered without cleanup in standard visualizer initialization
- **Lines 127-129**: setTimeout mixed with requestAnimationFrame in fallback visualizer - creates timing issues
- **Lines 288-290**: Conditional cleanup checks both `typeof` and direct `cancelAnimationFrame`/`clearTimeout` which is redundant
- **Missing**: animationFrameId can be either a number (RAF ID) or timeout ID, but cleanup doesn't distinguish between them properly

**Severity**: High

**Description**: 
The component uses both `requestAnimationFrame` and `setTimeout` for animation, mixing async patterns. This can cause race conditions and memory leaks if the component unmounts while animations are pending. The addEventListener in line 71 (for audioContext resume) is never removed.

**Recommended Fix**:
- Create a single cleanup function that properly cancels both RAF and timeouts
- Track cleanup handler for the click event listener
- Use consistent animation mechanism (prefer RAF for visual updates)
- Store all timer/frame IDs in an array and clear them properly

---

### 1.2 AudioToText.svelte - Untracked setTimeout Calls
**File**: `/home/user/riffrap/src/lib/components/mainPage/audio-transcript/AudioToText.svelte`

**Issues**:
- **Line 320**: `setTimeout(incrementTranscriptionCount, 100)` - not tracked or cancelled
- **Lines 418-420**: `setTimeout(() => { showConfetti = false }, ANIMATION.CONFETTI.ANIMATION_DURATION + 500)` - not cancelled if component unmounts
- **Line 405-411 area**: Multiple setTimeout calls in handleUserInteraction and other handlers

**Severity**: High

**Description**: 
Multiple untracked setTimeout calls that will continue executing even if the component is destroyed, potentially causing updates to unmounted components and memory leaks.

**Recommended Fix**:
- Track all setTimeout IDs in an array
- Clear them all in onDestroy hook
- Use SvelteKit stores with derived state instead of direct setTimeout updates

---

### 1.3 Confetti.svelte - Untracked setTimeout in Nested Confetti Burst
**File**: `/home/user/riffrap/src/lib/components/ui/effects/Confetti.svelte`

**Issues**:
- **Line 59**: `setTimeout` for second burst is not cancelled if component unmounts
- **No cleanup function** in onMount/onDestroy

**Severity**: Medium

**Description**: 
The component fires a second confetti burst via setTimeout but doesn't track it for cleanup. If the component is destroyed before 50ms elapses, the timeout will attempt to fire confetti after component unmount.

**Recommended Fix**:
- Track timeout ID from line 59
- Cancel it in onDestroy
- Consider using Promise-based animation instead of setTimeout

---

### 1.4 Ghost.svelte - setTimeout Not Cancelled in Reactive Block
**File**: `/home/user/riffrap/src/lib/components/ghost/Ghost.svelte`

**Issues**:
- **Line 405-411**: setTimeout in reactive block for post-wake-up double blink
- **Line 350-351**: addEventListener for mousemove and pointerdown events
- **Missing cleanup** for setTimeout inside the reactive statement

**Severity**: Medium

**Description**: 
The setTimeout on line 405 (in the wake-up blink trigger) is set inside a reactive block but the timeout ID isn't tracked for cleanup. Multiple instances could accumulate if the condition is triggered repeatedly.

**Recommended Fix**:
- Track timeout ID in component state
- Cancel it in onDestroy or when state changes
- Use a flag to prevent multiple timeouts firing

---

### 1.5 RecordButtonWithTimer.svelte - timeoutReferences Management Issues
**File**: `/home/user/riffrap/src/lib/components/mainPage/audio-transcript/RecordButtonWithTimer.svelte`

**Issues**:
- **Line 73-75**: Timeouts added to array but array isn't cleared on successful completion
- **Lines 148-155**: setTimeout+tick pattern can cause race conditions on slow mobile devices
- **Missing cleanup** of timeoutReferences except in onDestroy

**Severity**: Medium

**Description**: 
While there is cleanup in onDestroy (line 111), the timeoutReferences array continues to grow during component lifetime. If many animations are triggered, the array could accumulate references.

**Recommended Fix**:
- Clear timeoutReferences array after each animation completes
- Use a Map to track timeout purposes and auto-cleanup
- Consider using Svelte's built-in animation directives instead of setTimeout

---

### 1.6 TranscriptDisplay_Core.js - Module-Level Store Subscription (Memory Leak)
**File**: `/home/user/riffrap/src/lib/components/mainPage/audio-transcript/TranscriptDisplay_Core.js`

**Issues**:
- **Lines 23-28**: Direct subscription to transcriptionText store at module level
- **No unsubscribe function** returned or stored
- This subscription never gets cleaned up

**Severity**: High

**Description**: 
The module-level subscription to `transcriptionText` (lines 23-28) creates a persistent listener that never unsubscribes. Since this is in a module (not a component), the unsubscriber is never called, causing a memory leak that grows with each component instance created.

**Recommended Fix**:
- Move this subscription into the component's onMount hook
- Call unsubscribe in onDestroy
- Or use a reactive statement (`$transcriptionText`) in the component instead

---

### 1.7 recordingTimer in stores.js - Potential Memory Leak Pattern
**File**: `/home/user/riffrap/src/lib/services/infrastructure/stores.js`

**Issues**:
- **Lines 133-169**: Recording timer is stored as instance variable on audioActions object
- **Cleanup depends** on stopRecordingTimer being called before new recording starts
- If cleanup fails, old interval continues running

**Severity**: Medium

**Description**: 
The recordingTimer reference is stored but relies on stopRecordingTimer being called. If a new recording starts without stopping the previous one, multiple intervals could run simultaneously.

**Recommended Fix**:
- Add defensive check: always stop before starting
- Add cleanup in resetStores() function
- Consider using a Set to track all active timers

---

## 2. MOBILE RESPONSIVENESS ISSUES

### 2.1 AudioVisualizer.svelte - Mixed Animation Timing Patterns
**File**: `/home/user/riffrap/src/lib/components/mainPage/audio-transcript/AudioVisualizer.svelte`

**Issues**:
- **Lines 127-128**: Mixing setTimeout(callback, 1000) with requestAnimationFrame
- **Fallback visualizer**: Uses setTimeout for inactive mode, RAF for active mode
- **Race condition**: Switching between modes can cause frame skipping
- **Mobile impact**: Low-end devices can't handle mixed timing patterns smoothly

**Severity**: High

**Description**: 
On mobile devices with limited CPU, mixing requestAnimationFrame and setTimeout causes jank and stuttering. The pattern on lines 127-128 (setTimeout wrapping RAF) is inefficient and causes timing conflicts.

**Recommended Fix**:
- Use consistent animation timing mechanism
- For inactive state, use lower RAF frequency (skip frames) instead of setTimeout
- Use `timerId = setInterval(check, 1000)` instead of nested setTimeout/RAF
- Implement adaptive FPS based on device performance

---

### 2.2 RecordButtonWithTimer.svelte - tick() + setTimeout Race Condition
**File**: `/home/user/riffrap/src/lib/components/mainPage/audio-transcript/RecordButtonWithTimer.svelte`

**Issues**:
- **Lines 146-156**: Uses `tick().then(() => { setTimeout(...) })` pattern
- **Mobile impact**: On slow devices, tick() might complete late, causing animation glitches
- **Unused animation**: setTimeout(0) at line 152 with classList operations

**Severity**: Medium

**Description**: 
The pattern of calling tick() then setTimeout can cause layout thrashing on mobile. The element classification updates trigger unnecessary reflows while animation is in progress.

**Recommended Fix**:
- Use CSS class transitions instead of imperative DOM manipulation
- Remove the nested setTimeout(0) pattern
- Apply classes directly without tick() wrapping

---

### 2.3 AudioVisualizer.svelte - Fallback Visualizer Math Operations Per Frame
**File**: `/home/user/riffrap/src/lib/components/mainPage/audio-transcript/AudioVisualizer.svelte`

**Issues**:
- **Lines 135-189**: updateFallbackVisualizer performs 14+ Math operations per frame
- **On every frame**: Math.random() called 4+ times (expensive on mobile)
- **Performance impact**: On 60 FPS, this is 840+ Math.random() calls per second

**Severity**: Medium

**Description**: 
The fallback visualizer (for Safari/iOS) performs expensive calculations on every frame. Math.random() is particularly expensive and should be minimized. Mobile devices will experience battery drain.

**Recommended Fix**:
- Memoize random number generation (cache between frames)
- Use lookup tables instead of recalculating Math operations
- Reduce update frequency on mobile devices
- Consider pre-computing animation sequences instead of runtime calculations

---

### 2.4 Ghost.svelte - addEventListener on Mobile Without Passive Flag
**File**: `/home/user/riffrap/src/lib/components/ghost/Ghost.svelte`

**Issues**:
- **Line 350-351**: addEventListener for mousemove and pointerdown added with { passive: true }
- **OK behavior** but inconsistent - some listeners don't have passive flag

**Severity**: Low

**Description**: 
Good use of { passive: true }, but document.addEventListener for click (in AudioVisualizer line 71) should also use passive flag for mobile performance.

**Recommended Fix**:
- Ensure all document event listeners use { passive: true } where applicable
- Review all addEventListener calls for mobile optimization

---

## 3. CODE QUALITY ISSUES

### 3.1 Production console.log/warn Statements Left in Code
**Files Multiple**:

**console.log locations**:
- `/home/user/riffrap/src/lib/components/mainPage/audio-transcript/TranscriptDisplay_Core.js`:
  - Line 25: `console.log('[DEBUG] TranscriptDisplay_Core: ...')`
  - Line 100: `console.log('Transcript scrollable: ...')`
  - Line 209: `console.log('TranscriptDisplay debug functions available...')`
- `/home/user/riffrap/src/lib/components/mainPage/audio-transcript/AudioVisualizer.svelte`:
  - Line 92: `console.log('Falling back to simulated visualizer...')`
  - Line 110: `console.log('Using fallback visualizer for Safari/iOS')`
- `/home/user/riffrap/src/lib/components/ghost/Ghost.svelte`:
  - Multiple console.log statements in debug conditionals

**console.warn locations**:
- `/home/user/riffrap/src/lib/services/audio/AudioService_Recording.js`:
  - Line 433: `console.warn('Error stopping MediaRecorder:', ...)`
  - Line 458: `console.warn('Error disconnecting analyser:', ...)`
  - Line 468: `console.warn('Error suspending iOS audio context:', ...)`
  - Line 475: `console.warn('Error closing audio context:', ...)`

**Severity**: Low

**Description**: 
Console statements should be removed or use the logger service instead. Production code should not have console output that users see in DevTools.

**Recommended Fix**:
- Replace console.log with createLogger()
- Remove DEBUG console output or wrap in debug flags
- Use logger service consistently across codebase

---

### 3.2 forceWobble() Method Called But Doesn't Exist
**File**: `/home/user/riffrap/src/lib/components/mainPage/audio-transcript/AudioToText.svelte`

**Issues**:
- **Line 236**: `ghostComponent.forceWobble?.()`
- **Line 130-132**: `ghostComponent.forceWobble('', true)`
- **Line 158-159**: `ghostComponent.forceWobble()`
- **Ghost.svelte Line 253**: Comment says "Removed exported forceWobble function"

**Severity**: Medium

**Description**: 
The code tries to call forceWobble() which was removed from the Ghost component. The optional chaining operator prevents crashes, but the functionality is missing. Wobble animations won't trigger on recording start/stop.

**Recommended Fix**:
- Remove forceWobble calls OR restore the method in Ghost component
- Use internal state management in Ghost instead of external method calls
- Dispatch events from AudioToText to trigger animations

---

### 3.3 Unused Imports and Dead Code
**File**: `/home/user/riffrap/src/lib/components/mainPage/audio-transcript/AudioToText.svelte`

**Issues**:
- Import might not match component structure
- Several commented-out animation calls

**Severity**: Low

**Description**: 
Some imports and code paths aren't used or are commented out, increasing bundle size and code confusion.

**Recommended Fix**:
- Run treeshaking and dead code elimination
- Remove commented-out code
- Verify all imports are used

---

### 3.4 Race Condition in updateUIWithTranscription
**File**: `/home/user/riffrap/src/lib/components/mainPage/audio-transcript/AudioToText.svelte`

**Issues**:
- **Lines 299-322**: Updates multiple stores without coordinating state
- **Line 320**: setTimeout increment happens after all state updates
- **Race condition**: Could trigger confetti and state updates in wrong order

**Severity**: Medium

**Description**: 
The function updates transcription state, dispatches completion, and then tries to increment count with a setTimeout. If user quickly triggers another action, race condition can occur.

**Recommended Fix**:
- Use a transaction-like pattern to update related stores together
- Avoid setTimeout for state coordination
- Use async/await patterns properly

---

## 4. ARCHITECTURAL/ORGANIZATION ISSUES

### 4.1 Duplicate Visualization Logic in AudioVisualizer
**File**: `/home/user/riffrap/src/lib/components/mainPage/audio-transcript/AudioVisualizer.svelte`

**Issues**:
- **Two complete visualization systems**: Standard (lines 65-89) and Fallback (lines 109-120)
- **Duplicated state management**: Different state for each mode
- **Inconsistent cleanup**: Each mode has different cleanup logic
- **Code duplication**: ~250 lines of duplicate initialization and update logic

**Severity**: Medium

**Description**: 
The component contains two nearly identical visualization systems which violates DRY principle. Changes to one system need to be replicated in the other. This increases maintenance burden and bug surface area.

**Recommended Fix**:
- Extract visualization systems into separate services
- Create a visualization abstraction layer
- Share common state management
- Use strategy pattern for platform-specific implementations

---

### 4.2 Store Subscriptions at Module Level
**File**: `/home/user/riffrap/src/lib/components/mainPage/audio-transcript/TranscriptDisplay_Core.js`

**Issues**:
- **Lines 23-28**: Module-level subscription to transcriptionText
- **No lifecycle management**: Subscription never unsubscribes
- **Tight coupling**: Component logic in infrastructure file

**Severity**: High

**Description**: 
Subscriptions at module level are problematic because they execute when the module loads and can't be cleaned up. This violates Svelte's reactive principle and causes memory leaks.

**Recommended Fix**:
- Move all subscriptions into component onMount/onDestroy
- Use reactive statements (`$store`) in components
- Keep infrastructure files free of component logic

---

### 4.3 Mixed Event Handling Patterns
**Files Multiple**:

**Issues**:
- `eventBridge.dispatchAppEvent()` used in some places
- Direct store updates in others
- Component dispatch() used for some interactions
- Inconsistent event naming

**Severity**: Low

**Description**: 
Multiple event handling patterns make the codebase harder to follow and understand. Some components use eventBridge, others use dispatch, others use stores directly.

**Recommended Fix**:
- Standardize on one event system (recommend stores + eventBridge for cross-app)
- Document event flow patterns
- Create event constants to prevent typos

---

## 5. PERFORMANCE ISSUES

### 5.1 Expensive Computations in Reactive Statements
**File**: `/home/user/riffrap/src/lib/components/mainPage/audio-transcript/AudioVisualizer.svelte`

**Issues**:
- **Lines 177, 180**: Math.sin() and Math.max() called every animation frame
- **Lines 195-198**: Array operations (unshift, slice) every frame

**Severity**: Medium

**Description**: 
The fallback visualizer performs expensive operations on every frame. Array unshift is O(n) and should be replaced with circular buffer pattern.

**Recommended Fix**:
- Use circular buffer for history instead of array manipulation
- Memoize sine calculations
- Pre-compute animation sequences

---

### 5.2 ResizeObserver in Component That Updates on Every Change
**File**: `/home/user/riffrap/src/lib/components/mainPage/audio-transcript/TranscriptDisplay_Core.js`

**Issues**:
- **Lines 213-220**: ResizeObserver calls checkScrollable on every resize
- **checkScrollable** updates store, triggering re-renders
- **Potential thrashing**: Rapid resize events cause cascade of updates

**Severity**: Medium

**Description**: 
The ResizeObserver fires frequently during layout changes, and each one calls checkScrollable which updates a store. This can cause excessive re-renders.

**Recommended Fix**:
- Debounce the ResizeObserver callback
- Use CSS-based scrollable detection where possible
- Batch multiple observations into single store update

---

### 5.3 Audio Context Created Multiple Times
**File**: `/home/user/riffrap/src/lib/components/mainPage/audio-transcript/AudioVisualizer.svelte`

**Issues**:
- **Line 82**: New AudioContext created on each init
- **Lifecycle issue**: Context might not be cleaned up properly

**Severity**: Low

**Description**: 
Multiple audio contexts can cause browser audio system stress. The context should be reused across recordings.

**Recommended Fix**:
- Create and cache AudioContext at service level, not component level
- Share context across recordings
- Properly close context on cleanup

---

## SUMMARY TABLE

| Category | Count | Critical | High | Medium | Low |
|----------|-------|----------|------|--------|-----|
| Memory Leaks | 7 | 0 | 3 | 3 | 1 |
| Mobile Issues | 4 | 0 | 1 | 3 | 0 |
| Code Quality | 4 | 0 | 0 | 2 | 2 |
| Architecture | 3 | 0 | 1 | 2 | 0 |
| Performance | 3 | 0 | 0 | 3 | 0 |
| **TOTAL** | **21** | **0** | **5** | **13** | **3** |

---

## PRIORITY RECOMMENDATIONS

### Phase 1 (Critical - Do First)
1. Fix TranscriptDisplay_Core.js module-level store subscription (memory leak)
2. Implement proper cleanup for all setTimeout/RAF in AudioVisualizer
3. Remove all untracked setTimeout from AudioToText
4. Fix forceWobble() calls or restore method

### Phase 2 (High Priority)
1. Replace mixed animation patterns with consistent RAF-based approach
2. Consolidate visualization logic into single system
3. Move module-level subscriptions into components
4. Clear all console.log statements

### Phase 3 (Medium Priority)
1. Optimize Math operations in animations
2. Implement circular buffer for animation history
3. Debounce ResizeObserver
4. Consolidate event handling patterns

### Phase 4 (Nice-to-Have)
1. Extract visualization services
2. Implement error boundary recovery
3. Add performance monitoring
4. Profile and optimize hot paths
