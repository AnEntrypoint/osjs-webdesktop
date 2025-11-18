export const isMobile = () => {
  return window.innerWidth <= 768 ||
         ('ontouchstart' in window) ||
         (navigator.maxTouchPoints > 0);
};

export class MobileCarousel {
  constructor(osjs) {
    this.osjs = osjs;
    this.carousel = null;
    this.windowIconMap = new Map();

    if (isMobile()) {
      this.init();
    }
  }

  init() {
    this.createCarousel();
    this.setupWindowListeners();
    this.updateCarousel();

    window.addEventListener('resize', () => {
      if (isMobile()) {
        if (!this.carousel) {
          this.createCarousel();
          this.setupWindowListeners();
        }
        this.updateCarousel();
      }
    });
  }

  createCarousel() {
    this.carousel = document.createElement('div');
    this.carousel.className = 'mobile-carousel';

    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'mobile-carousel-scroll';

    const iconContainer = document.createElement('div');
    iconContainer.className = 'mobile-carousel-icons';

    scrollContainer.appendChild(iconContainer);
    this.carousel.appendChild(scrollContainer);

    document.body.appendChild(this.carousel);
  }

  setupWindowListeners() {
    this.osjs.on('osjs/window:create', () => {
      setTimeout(() => this.updateCarousel(), 100);
    });

    this.osjs.on('osjs/window:destroy', () => {
      setTimeout(() => this.updateCarousel(), 100);
    });

    this.osjs.on('osjs/window:change', () => {
      setTimeout(() => this.updateCarousel(), 100);
    });
  }

  updateCarousel() {
    if (!this.carousel || !isMobile()) {
      return;
    }

    const iconContainer = this.carousel.querySelector('.mobile-carousel-icons');
    if (!iconContainer) {
      return;
    }

    const windows = this.osjs.make('osjs/windows');
    const currentWindows = Array.from(windows);

    iconContainer.innerHTML = '';
    this.windowIconMap.clear();

    currentWindows.forEach((win) => {
      const iconWrapper = document.createElement('div');
      iconWrapper.className = 'mobile-carousel-icon';

      const isActive = win.state.focused;
      if (isActive) {
        iconWrapper.classList.add('active');
      }

      const icon = document.createElement('div');
      icon.className = 'icon-circle';

      const iconText = this.getIconForWindow(win);
      icon.textContent = iconText;

      const label = document.createElement('div');
      label.className = 'icon-label';
      label.textContent = win.state.title || 'Window';

      iconWrapper.appendChild(icon);
      iconWrapper.appendChild(label);

      iconWrapper.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.switchToWindow(win);
      });

      iconContainer.appendChild(iconWrapper);
      this.windowIconMap.set(win.id, iconWrapper);
    });
  }

  getIconForWindow(win) {
    const title = (win.state.title || '').toLowerCase();

    if (title.includes('text') || title.includes('editor')) {
      return '📝';
    } else if (title.includes('calc')) {
      return '🔢';
    } else if (title.includes('file')) {
      return '📁';
    } else if (title.includes('settings')) {
      return '⚙️';
    } else if (title.includes('terminal')) {
      return '💻';
    }

    return '🪟';
  }

  switchToWindow(win) {
    if (!win || win.state.minimized) {
      win.restore();
    }

    win.focus();
    win.raise();

    if (isMobile()) {
      this.makeWindowFullscreen(win);
    }

    this.updateCarousel();
  }

  makeWindowFullscreen(win) {
    const panel = document.querySelector('.osjs-panel');
    const panelHeight = panel ? panel.offsetHeight : 0;
    const carouselHeight = this.carousel ? this.carousel.offsetHeight : 80;

    const availableHeight = window.innerHeight - panelHeight - carouselHeight;

    win.setPosition({ x: 0, y: 0 });
    win.setDimension({
      width: window.innerWidth,
      height: availableHeight
    });
  }

  makeAllWindowsFullscreen() {
    if (!isMobile()) {
      return;
    }

    const windows = this.osjs.make('osjs/windows');
    Array.from(windows).forEach(win => {
      this.makeWindowFullscreen(win);
    });
  }
}
