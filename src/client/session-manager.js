import {
  createSessionManifest,
  serializeVFSNode,
  serializeWindowState,
  createProcessDescriptor
} from '../shared/session-protocol.js';

export class SessionManager {
  constructor(osjs) {
    this.osjs = osjs;
    this.appSerializers = new Map();
  }

  registerAppSerializer(type, serializer) {
    if (typeof serializer.serialize !== 'function' || typeof serializer.deserialize !== 'function') {
      throw new Error(`Invalid serializer for type ${type}: must have serialize() and deserialize() methods`);
    }
    this.appSerializers.set(type, serializer);
  }

  async captureVFSSnapshot(rootPath = 'home:/') {
    const vfs = this.osjs.make('osjs/vfs');
    const snapshot = {};

    const traverseDirectory = async (path) => {
      try {
        const entries = await vfs.readdir(path);

        for (const entry of entries) {
          const fullPath = entry.path;

          if (entry.isDirectory) {
            snapshot[fullPath] = serializeVFSNode(entry);
            await traverseDirectory(fullPath);
          } else if (entry.isFile) {
            const content = await vfs.readfile(fullPath, 'text');
            snapshot[fullPath] = serializeVFSNode(entry, content);
          }
        }
      } catch (err) {
        console.warn(`Failed to traverse ${path}:`, err);
      }
    };

    await traverseDirectory(rootPath);
    return snapshot;
  }

  captureProcesses() {
    const windows = this.osjs.make('osjs/windows');
    const processes = [];

    for (const win of windows) {
      const windowState = serializeWindowState(win);
      const appType = win.attributes?.appType || 'generic';

      let appState = {};
      const serializer = this.appSerializers.get(appType);

      if (serializer) {
        try {
          appState = serializer.serialize(win);
        } catch (err) {
          console.error(`Failed to serialize app ${appType}:`, err);
        }
      }

      processes.push(createProcessDescriptor(appType, windowState, appState));
    }

    return processes;
  }

  async captureSettings() {
    const settings = this.osjs.make('osjs/settings');
    return await settings.get() || {};
  }

  async captureSession() {
    const manifest = createSessionManifest();

    manifest.vfs = await this.captureVFSSnapshot();
    manifest.processes = this.captureProcesses();
    manifest.settings = await this.captureSettings();
    manifest.metadata = {
      windowCount: manifest.processes.length,
      fileCount: Object.keys(manifest.vfs).length,
      captureSize: JSON.stringify(manifest).length
    };

    return manifest;
  }

  async restoreVFS(vfsSnapshot) {
    const vfs = this.osjs.make('osjs/vfs');

    const sorted = Object.entries(vfsSnapshot).sort((a, b) => {
      const depthA = a[0].split('/').length;
      const depthB = b[0].split('/').length;
      return depthA - depthB;
    });

    for (const [path, node] of sorted) {
      try {
        if (node.isDirectory) {
          await vfs.mkdir({ path });
        } else if (node.isFile && node.content !== null) {
          await vfs.writefile({ path }, node.content);
        }
      } catch (err) {
        console.warn(`Failed to restore ${path}:`, err);
      }
    }
  }

  async restoreProcesses(processes) {
    for (const proc of processes) {
      const serializer = this.appSerializers.get(proc.type);

      if (serializer) {
        try {
          await serializer.deserialize(this.osjs, proc.windowState, proc.appState);
        } catch (err) {
          console.error(`Failed to restore process ${proc.type}:`, err);
        }
      } else {
        console.warn(`No serializer registered for app type: ${proc.type}`);
      }
    }
  }

  async restoreSettings(settings) {
    const settingsService = this.osjs.make('osjs/settings');

    for (const [key, value] of Object.entries(settings)) {
      await settingsService.set(key, value);
    }
  }

  async restoreSession(manifest) {
    await this.restoreVFS(manifest.vfs);
    await this.restoreSettings(manifest.settings);
    await this.restoreProcesses(manifest.processes);
  }

  async downloadSession() {
    const manifest = await this.captureSession();
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `osjs-session-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }

  async uploadSession() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';

      input.onchange = async (e) => {
        try {
          const file = e.target.files[0];
          const text = await file.text();
          const manifest = JSON.parse(text);
          await this.restoreSession(manifest);
          resolve(manifest);
        } catch (err) {
          reject(err);
        }
      };

      input.click();
    });
  }
}
