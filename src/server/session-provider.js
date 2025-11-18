const SessionService = require('./session-service.js');

class SessionServiceProvider {
  constructor(core, options = {}) {
    this.core = core;
    this.options = options;
    this.sessionService = null;
  }

  async init() {
    this.sessionService = new SessionService(this.core, this.options);
    await this.sessionService.init();

    this.core.singleton('osjs/session-manager', () => this.sessionService);
  }

  destroy() {
  }

  async start() {
    this.core.app.post('/api/session/import', async (req, res) => {
      try {
        const sessionId = `session-${Date.now()}`;
        const manifest = req.body;
        const result = await this.sessionService.saveSession(sessionId, manifest);
        res.json({ success: true, ...result });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    this.core.app.get('/api/session/export/:sessionId', async (req, res) => {
      try {
        const manifest = await this.sessionService.loadSession(req.params.sessionId);
        res.json(manifest);
      } catch (err) {
        res.status(404).json({ error: 'Session not found' });
      }
    });

    this.core.app.get('/api/session/list', async (req, res) => {
      try {
        const sessions = await this.sessionService.listSessions();
        res.json({ sessions });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    this.core.app.get('/api/session/inspect', (req, res) => {
      const inspection = this.sessionService.inspectSession();
      if (!inspection) {
        return res.status(404).json({ error: 'No session loaded' });
      }
      res.json(inspection);
    });

    this.core.app.get('/api/session/vfs', (req, res) => {
      const filePath = req.query.path;
      const vfs = this.sessionService.inspectVFS(filePath);

      if (!vfs) {
        return res.status(404).json({ error: 'No session loaded' });
      }

      res.json({ vfs });
    });

    this.core.app.get('/api/session/vfs/tree', (req, res) => {
      const rootPath = req.query.root || 'home:/';
      const tree = this.sessionService.getVFSTree(rootPath);

      if (!tree) {
        return res.status(404).json({ error: 'No session loaded' });
      }

      res.json({ tree });
    });

    this.core.app.get('/api/session/processes', (req, res) => {
      const processType = req.query.type;
      const processes = this.sessionService.inspectProcesses(processType);
      res.json({ processes });
    });

    this.core.app.get('/api/session/processes/:index', (req, res) => {
      const index = parseInt(req.params.index, 10);
      const process = this.sessionService.getProcessDetail(index);

      if (!process) {
        return res.status(404).json({ error: 'Process not found' });
      }

      res.json({ process });
    });
  }
}

module.exports = SessionServiceProvider;
