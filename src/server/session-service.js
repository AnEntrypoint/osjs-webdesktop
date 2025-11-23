const fs = require('fs').promises;
const path = require('path');

class SessionService {
  constructor(core, options = {}) {
    this.core = core;
    this.sessionsDir = options.sessionsDir || path.join(process.cwd(), 'sessions');
    this.currentSession = null;
  }

  async init() {
    try {
      await fs.mkdir(this.sessionsDir, { recursive: true });
    } catch (err) {
      this.core.logger.warn('Failed to create sessions directory:', err);
    }
  }

  async saveSession(sessionId, manifest) {
    const sessionPath = path.join(this.sessionsDir, `${sessionId}.json`);
    await fs.writeFile(sessionPath, JSON.stringify(manifest, null, 2));
    this.currentSession = manifest;
    return { sessionId, path: sessionPath };
  }

  async loadSession(sessionId) {
    const sessionPath = path.join(this.sessionsDir, `${sessionId}.json`);
    const data = await fs.readFile(sessionPath, 'utf8');
    const manifest = JSON.parse(data);
    this.currentSession = manifest;
    return manifest;
  }

  async listSessions() {
    const files = await fs.readdir(this.sessionsDir);
    const sessions = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const sessionPath = path.join(this.sessionsDir, file);
        const data = await fs.readFile(sessionPath, 'utf8');
        const manifest = JSON.parse(data);

        sessions.push({
          id: file.replace('.json', ''),
          timestamp: manifest.timestamp,
          metadata: manifest.metadata
        });
      }
    }

    return sessions;
  }

  inspectSession(sessionId = null) {
    if (!this.currentSession) {
      return null;
    }

    return {
      version: this.currentSession.version,
      timestamp: this.currentSession.timestamp,
      metadata: this.currentSession.metadata,
      processCount: this.currentSession.processes?.length || 0,
      fileCount: Object.keys(this.currentSession.vfs || {}).length,
      processes: this.currentSession.processes || []
    };
  }

  inspectVFS(filePath = null) {
    if (!this.currentSession) {
      return null;
    }

    if (filePath) {
      return this.currentSession.vfs[filePath] || null;
    }

    return Object.entries(this.currentSession.vfs).map(([path, node]) => ({
      path,
      type: node.isDirectory ? 'directory' : 'file',
      size: node.size,
      mime: node.mime
    }));
  }

  inspectProcesses(processType = null) {
    if (!this.currentSession) {
      return [];
    }

    const processes = this.currentSession.processes || [];

    if (processType) {
      return processes.filter(p => p.type === processType);
    }

    return processes.map(p => ({
      type: p.type,
      title: p.windowState?.title,
      timestamp: p.timestamp,
      hasAppState: Object.keys(p.appState || {}).length > 0
    }));
  }

  getProcessDetail(processIndex) {
    if (!this.currentSession || !this.currentSession.processes) {
      return null;
    }

    return this.currentSession.processes[processIndex] || null;
  }

  getVFSTree(rootPath = 'home:/') {
    if (!this.currentSession) {
      return null;
    }

    const tree = {};
    const vfs = this.currentSession.vfs;

    for (const [path, node] of Object.entries(vfs)) {
      if (path.startsWith(rootPath) || rootPath === '/') {
        const parts = path.split('/').filter(Boolean);
        let current = tree;

        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];

          if (i === parts.length - 1) {
            current[part] = {
              type: node.isDirectory ? 'directory' : 'file',
              mime: node.mime,
              size: node.size,
              content: node.content
            };
          } else {
            current[part] = current[part] || {};
            current = current[part];
          }
        }
      }
    }

    return tree;
  }
}

module.exports = SessionService;
