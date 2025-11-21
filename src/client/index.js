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
import { MobileServiceProvider } from './mobile-provider.js';
import { createTextEditorApp, createCalculatorApp } from './example-app.js';
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
  osjs.register(MobileServiceProvider);

  osjs.on('osjs/core:started', () => {
    const contents = document.querySelector('.osjs-contents');
    if (contents && !contents.querySelector('.osjs-desktop')) {
      const desktop = document.createElement('div');
      desktop.className = 'osjs-desktop';
      contents.appendChild(desktop);
    }

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
