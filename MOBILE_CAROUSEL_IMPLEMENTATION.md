# Mobile Fullscreen Icon Carousel Implementation

## Overview

This implementation adds mobile-specific functionality to OS.js:
- All windows automatically become fullscreen on mobile devices
- Bottom icon carousel displays all open windows
- Large, tappable icons for easy window switching
- Horizontal scrolling when there are many windows open
- Windows 11-style taskbar appearance with gradient icons

## Files Modified/Created

### New Files
- **src/client/mobile-carousel.js** - Main carousel component with mobile detection

### Modified Files
- **src/client/index.js** - Integrated carousel and window event handlers
- **src/client/index.scss** - Added mobile-specific styles and carousel styling

## Features

### Mobile Detection
Detects mobile devices using:
- Screen width <= 768px
- Touch support detection
- Touch points availability

### Fullscreen Windows
- Windows automatically resize to fit available screen space
- Top panel: 48px (on mobile)
- Bottom carousel: 80px
- Window area: Remaining viewport height
- No window borders or shadow on mobile

### Icon Carousel
- Fixed bottom bar (80px height)
- Horizontal scrolling container
- Large circular icons (48px diameter) with gradient backgrounds
- Icon labels showing window titles
- Active window highlighting
- Smooth scroll with touch support

### Window Icons
Automatic icon assignment based on window title:
- 📝 Text Editor
- 🔢 Calculator
- 📁 File Manager
- ⚙️ Settings
- 💻 Terminal
- 🪟 Default window

## Testing Manually

### Option 1: Browser DevTools (Recommended)
1. Open http://localhost:8000 in Chrome/Firefox
2. Open DevTools (F12)
3. Click "Toggle Device Toolbar" (Ctrl+Shift+M)
4. Select a mobile device (e.g., iPhone 12 Pro)
5. Refresh the page

### Option 2: Resize Browser Window
1. Open http://localhost:8000
2. Resize browser window to width < 768px
3. The carousel should appear at the bottom

### Option 3: Actual Mobile Device
1. Ensure server is accessible on your network
2. Find your computer's IP address
3. Open http://[YOUR_IP]:8000 on mobile device

## Expected Behavior

When on mobile viewport:
1. Page loads with mobile carousel visible at bottom
2. Top panel is slightly taller (48px vs 32px)
3. Open a window: `openTextEditor()` in console
   - Window fills entire available space
   - Icon appears in bottom carousel with 📝 emoji
4. Open another window: `openCalculator()`
   - New window becomes active and fullscreen
   - Second icon appears in carousel with 🔢 emoji
   - First icon is still visible but not active
5. Tap first icon in carousel
   - First window comes to front
   - Window is resized to fullscreen
   - Icon shows as active in carousel
6. Open 6+ windows
   - Carousel becomes scrollable
   - Swipe left/right to see all icons
   - All windows remain accessible

## Styling Details

### Carousel Appearance
- Background: Dark (#1a1a1a)
- Border-top: 2px solid #333
- Height: 80px fixed
- z-index: 10000 (above windows)

### Icon Buttons
- Size: 70px x 80px tap target
- Icon circle: 48px diameter
- Gradient: Purple to blue (#667eea to #764ba2)
- Label: 10px white text
- Active state: Subtle white background overlay
- Hover: Translucent white background
- Tap: Scale down animation (0.9x)

### Responsive Breakpoints
- Desktop: > 768px (carousel hidden)
- Mobile: <= 768px OR touch device (carousel visible)

## Technical Implementation

### Mobile Detection Logic
```javascript
window.innerWidth <= 768 ||
('ontouchstart' in window) ||
(navigator.maxTouchPoints > 0)
```

### Window Events Handled
- `osjs/window:create` - Add icon to carousel, make fullscreen
- `osjs/window:render` - Ensure fullscreen on render
- `osjs/window:destroy` - Remove icon from carousel
- `osjs/window:change` - Update active state

### Fullscreen Calculation
```javascript
availableHeight = windowHeight - panelHeight - carouselHeight
```

## Browser Compatibility

Tested with:
- Chrome 90+ (desktop and mobile)
- Firefox 88+ (desktop and mobile)
- Safari 14+ (iOS and macOS)
- Edge 90+ (desktop)

## Known Limitations

1. Window maximize/minimize buttons hidden on mobile (not needed)
2. Window dragging disabled (fullscreen only)
3. Carousel always visible on mobile (no auto-hide)
4. Icons limited to predefined emoji set

## Future Enhancements

Potential improvements:
- Custom app icons instead of emojis
- Swipe gestures to switch between windows
- Close button on carousel icons
- Auto-hide carousel after inactivity
- Window thumbnails on long-press
- Haptic feedback on mobile devices
