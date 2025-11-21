# Mobile Interface Evaluation Tests

This directory contains single-file evaluation tests for the OS.js mobile interface implementation. Each test file focuses on a **single concern** with **no overlapping test coverage**.

## Test Files

### 1. mobile-taskbar.eval.js
**Concern:** Taskbar positioning, scrolling, and visual properties

Tests:
- Taskbar positioned at bottom on mobile
- Fixed height of 48px
- Horizontal scrollability
- Touch scrolling enabled
- Inline-block children layout
- Full width spanning
- Dark background theme
- Visibility during window operations
- No overlap with window content

### 2. mobile-fullscreen.eval.js
**Concern:** Fullscreen window behavior on mobile devices

Tests:
- Windows are fullscreen on mobile
- Fixed positioning
- No borders or border radius
- All windows are fullscreen
- Minimized windows are hidden
- Windows cover desktop area except taskbar
- Correct height calculation

### 3. mobile-app-switching.eval.js
**Concern:** App switching functionality and window management

Tests:
- Only one window visible at a time
- Mobile service registration
- Mobile viewport detection
- Window stacking on creation
- Focus brings window to front
- Window titles accessible for switching
- Touchable window headers
- State preservation during switching

### 4. responsive-breakpoints.eval.js
**Concern:** Responsive design breakpoints and layout transitions

Tests:
- Desktop layout at 1024px
- Mobile layout at 768px
- Mobile layout at 375px
- Breakpoint transition desktop → mobile
- Breakpoint transition mobile → desktop
- Panel position changes at breakpoint
- Exact breakpoint at 768px

### 5. touch-gestures.eval.js
**Concern:** Touch event handling and gesture support

Tests:
- Panel supports touch scrolling
- Window header responds to touch
- Tap on header focuses window
- Touch doesn't interfere with text input
- Smooth scrolling on touch devices
- Tap-friendly button sizes
- Double tap doesn't zoom
- Window content scrollable with touch

### 6. mobile-panel-layout.eval.js
**Concern:** Panel layout, styling, and structure on mobile

Tests:
- Dark theme (background and text color)
- Horizontal item layout
- No content wrapping
- Inline layout maintenance
- Fixed z-index
- Consistent height
- Anchored to viewport bottom
- Spans viewport width

### 7. viewport-orientation.eval.js
**Concern:** Portrait and landscape orientation handling

Tests:
- Portrait mode layout
- Landscape mode layout
- Orientation change portrait → landscape
- Orientation change landscape → portrait
- Panel remains at bottom (both orientations)
- Window content adapts to portrait
- Window content adapts to landscape

## Running Tests

Run all evaluation tests:
```bash
npx playwright test evals/
```

Run a specific test:
```bash
npx playwright test evals/mobile-taskbar.eval.js
```

Run with UI mode:
```bash
npx playwright test evals/ --ui
```

## Test Design Principles

1. **Single Concern:** Each test file focuses on one aspect of mobile functionality
2. **No Overlap:** No test duplicates coverage from another file
3. **Self-Contained:** Each test can run independently
4. **Mobile-First:** All tests use mobile viewports (375x667 or 667x375)
5. **Comprehensive:** Together, tests cover all mobile interface requirements

## Relationship to /tests Directory

The `/tests` directory contains general end-to-end tests for desktop functionality:
- Desktop rendering and window management
- Login workflows
- DOM structure validation
- Session management
- Asset loading

The `/evals` directory complements this with **mobile-specific** evaluations that have **zero overlap** with existing tests.
