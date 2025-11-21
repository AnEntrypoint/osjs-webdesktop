import { SessionManager } from './session-manager.js';

export class SessionServiceProvider {
  constructor(core, options = {}) {
    this.core = core;
    this.options = options;
    this.sessionManager = null;
  }

  async init() {
    this.sessionManager = new SessionManager(this.core);
    this.core.singleton('osjs/session-manager', () => this.sessionManager);
  }

  destroy() {
  }

  async start() {
    try {
      const tray = this.core.make('osjs/tray');

      if (tray) {
        tray.create({
          title: 'Session Manager',
          icon: 'system-save',
          onclick: () => this.openSessionMenu()
        });
      }
    } catch (err) {
      console.warn('Tray not available:', err.message);
    }

    this.core.on('osjs/core:started', () => {
      this.registerKeyboardShortcuts();
    });
  }

  registerKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        this.sessionManager.downloadSession();
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'O') {
        e.preventDefault();
        this.sessionManager.uploadSession();
      }
    });
  }

  async openSessionMenu() {
    const menu = [
      {
        label: 'Download Session (Ctrl+Shift+S)',
        onclick: () => this.sessionManager.downloadSession()
      },
      {
        label: 'Upload Session (Ctrl+Shift+O)',
        onclick: () => this.sessionManager.uploadSession()
      },
      {
        label: 'Sync to Server',
        onclick: () => this.syncToServer()
      },
      {
        label: 'Session Info',
        onclick: () => this.showSessionInfo()
      }
    ];

    this.core.make('osjs/contextmenu').show({
      position: { top: 0, right: 0 },
      menu
    });
  }

  async syncToServer() {
    try {
      const manifest = await this.sessionManager.captureSession();

      const response = await fetch('/api/session/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manifest)
      });

      const result = await response.json();

      if (result.success) {
        this.core.make('osjs/notification', {
          title: 'Session Synced',
          message: `Session saved as ${result.sessionId}`
        });
      }
    } catch (err) {
      this.core.make('osjs/notification', {
        title: 'Sync Failed',
        message: err.message,
        type: 'error'
      });
    }
  }

  async showSessionInfo() {
    const manifest = await this.sessionManager.captureSession();

    const info = `
Session Information:
- Windows: ${manifest.processes.length}
- Files: ${manifest.metadata.fileCount}
- Size: ${(manifest.metadata.captureSize / 1024).toFixed(2)} KB
- Timestamp: ${new Date(manifest.timestamp).toLocaleString()}
    `.trim();

    this.core.make('osjs/notification', {
      title: 'Session Info',
      message: info
    });
  }
}
