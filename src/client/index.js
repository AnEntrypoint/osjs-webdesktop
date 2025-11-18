import {
  Core,
  CoreServiceProvider,
  DesktopServiceProvider,
  VFSServiceProvider,
  NotificationServiceProvider,
  SettingsServiceProvider,
  AuthServiceProvider
} from '@osjs/client';
import { PanelServiceProvider } from '@osjs/panels';
import { GUIServiceProvider } from '@osjs/gui';
import { DialogServiceProvider } from '@osjs/dialogs';
import { SessionServiceProvider } from './session-provider.js';
import { createTextEditorApp, createCalculatorApp } from './example-app.js';
import { MobileCarousel, isMobile } from './mobile-carousel.js';
import './index.scss';

const init = () => {
  const osjs = new Core({
    standalone: true
  }, {});

  osjs.register(CoreServiceProvider);
  osjs.register(DesktopServiceProvider);
  osjs.register(VFSServiceProvider);
  osjs.register(NotificationServiceProvider);
  osjs.register(SettingsServiceProvider, {before: true});
  osjs.register(AuthServiceProvider, {before: true});
  osjs.register(PanelServiceProvider);
  osjs.register(DialogServiceProvider);
  osjs.register(GUIServiceProvider);
  osjs.register(SessionServiceProvider);

  osjs.on('osjs/core:started', () => {
    const contents = document.querySelector('.osjs-contents');
    if (contents && !contents.querySelector('.osjs-desktop')) {
      const desktop = document.createElement('div');
      desktop.className = 'osjs-desktop';
      contents.appendChild(desktop);
    }

    const carousel = new MobileCarousel(osjs);

    osjs.on('osjs/window:create', (win) => {
      if (isMobile()) {
        setTimeout(() => {
          carousel.makeWindowFullscreen(win);
          win.focus();
        }, 50);
      }
    });

    osjs.on('osjs/window:render', (win) => {
      if (isMobile()) {
        setTimeout(() => {
          carousel.makeWindowFullscreen(win);
        }, 50);
      }
    });

    const textEditor = createTextEditorApp(osjs);
    const calculator = createCalculatorApp(osjs);

    window.openTextEditor = (filePath) => textEditor.open(filePath);
    window.openCalculator = () => calculator.open();

    osjs.make('osjs/notification', {
      title: 'Polymorphic Session Manager Ready',
      message: 'Try: openTextEditor() or openCalculator() in console'
    });
  });

  osjs.boot();
};

window.addEventListener('DOMContentLoaded', () => init());
