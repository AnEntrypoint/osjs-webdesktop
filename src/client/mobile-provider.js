export class MobileServiceProvider {
  constructor(core, options = {}) {
    this.core = core;
    this.options = options;
    this.isMobile = false;
  }

  provides() {
    return ['osjs/mobile'];
  }

  init() {
    this.checkMobile();
    window.addEventListener('resize', () => this.checkMobile());

    this.core.on('osjs/core:started', () => {
      this.setupMobileBehavior();
    });
  }

  start() {
    this.core.make('osjs/mobile', this);
  }

  checkMobile() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 768;

    if (wasMobile !== this.isMobile) {
      this.core.emit('osjs/mobile:changed', this.isMobile);
    }

    return this.isMobile;
  }

  setupMobileBehavior() {
    if (!this.isMobile) return;

    this.core.on('osjs/window:create', (win) => {
      this.makeWindowFullscreen(win);
      this.setupWindowSwitching(win);
    });

    const windows = this.core.make('osjs/windows');
    windows.forEach(win => {
      this.makeWindowFullscreen(win);
      this.setupWindowSwitching(win);
    });
  }

  makeWindowFullscreen(win) {
    if (!this.isMobile) return;

    win.on('render', () => {
      const windowElement = win.$element;
      if (windowElement) {
        windowElement.style.position = 'fixed';
        windowElement.style.top = '0';
        windowElement.style.left = '0';
        windowElement.style.right = '0';
        windowElement.style.bottom = '48px';
        windowElement.style.width = '100%';
        windowElement.style.height = 'calc(100% - 48px)';
      }
    });

    win.on('minimize', () => {
      if (this.isMobile) {
        const windowElement = win.$element;
        if (windowElement) {
          windowElement.style.display = 'none';
        }
      }
    });

    win.on('raise', () => {
      if (this.isMobile) {
        const windowElement = win.$element;
        if (windowElement) {
          windowElement.style.display = 'block';
        }
        this.hideOtherWindows(win);
      }
    });
  }

  hideOtherWindows(activeWin) {
    if (!this.isMobile) return;

    const windows = this.core.make('osjs/windows');
    windows.forEach(win => {
      if (win.id !== activeWin.id) {
        const windowElement = win.$element;
        if (windowElement && !win.state.minimized) {
          windowElement.style.display = 'none';
        }
      }
    });
  }

  setupWindowSwitching(win) {
    if (!this.isMobile) return;

    win.on('render', () => {
      const header = win.$header;
      if (header) {
        header.style.touchAction = 'manipulation';
        header.addEventListener('touchstart', (e) => {
          this.handleWindowSwitch(win);
        });
      }
    });
  }

  handleWindowSwitch(win) {
    win.raise();
    win.focus();
  }

  switchToNextWindow() {
    if (!this.isMobile) return;

    const windows = this.core.make('osjs/windows')
      .filter(win => !win.state.minimized);

    if (windows.length === 0) return;

    const currentIndex = windows.findIndex(win => {
      const el = win.$element;
      return el && el.style.display !== 'none';
    });

    const nextIndex = (currentIndex + 1) % windows.length;
    const nextWindow = windows[nextIndex];

    if (nextWindow) {
      this.handleWindowSwitch(nextWindow);
    }
  }

  switchToPreviousWindow() {
    if (!this.isMobile) return;

    const windows = this.core.make('osjs/windows')
      .filter(win => !win.state.minimized);

    if (windows.length === 0) return;

    const currentIndex = windows.findIndex(win => {
      const el = win.$element;
      return el && el.style.display !== 'none';
    });

    const prevIndex = currentIndex <= 0 ? windows.length - 1 : currentIndex - 1;
    const prevWindow = windows[prevIndex];

    if (prevWindow) {
      this.handleWindowSwitch(prevWindow);
    }
  }
}
