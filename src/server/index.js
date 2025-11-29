const { Core } = require('@osjs/server');
const path = require('path');
const fs = require('fs-extra');

const sequentialMachinePath = path.join(__dirname, '../../../sequential-machine');
const { StateKit } = require(sequentialMachinePath);
const sequentialMachineAdapter = require('./sequential-machine-adapter');

const PORT = process.env.PORT || 8003;
const STATEKIT_DIR = process.env.SEQUENTIAL_MACHINE_DIR || path.join(process.cwd(), '.sequential-machine');
const WORK_DIR = process.env.SEQUENTIAL_MACHINE_WORK || path.join(STATEKIT_DIR, 'work');

async function ensureDirectories() {
  await fs.ensureDir(STATEKIT_DIR);
  await fs.ensureDir(WORK_DIR);
  await fs.ensureDir(path.join(STATEKIT_DIR, 'layers'));
  await fs.ensureDir(path.join(process.cwd(), 'vfs'));
  console.log('✓ Sequential-OS directories initialized');
}

async function initializeStateKit() {
  const kit = new StateKit({
    stateDir: STATEKIT_DIR,
    workdir: WORK_DIR
  });

  const status = await kit.status();
  console.log(`✓ StateKit initialized (${status.added.length + status.modified.length + status.deleted.length} uncommitted changes)`);

  return kit;
}

async function main() {
  try {
    console.log('Starting Sequential Desktop...');

    await ensureDirectories();

    const config = {
      port: PORT,
      public: path.resolve(__dirname, '../../dist'),
      logging: {
        level: process.env.DEBUG ? 'debug' : 'info'
      },
      session: {
        options: {
          name: 'sequential-desktop-session',
          secret: process.env.SESSION_SECRET || 'sequential-desktop-secret-change-me',
          rolling: true,
          resave: false,
          saveUninitialized: false
        }
      },
      vfs: {
        adapters: {
          'sequential-machine': sequentialMachineAdapter
        },
        mountpoints: [
          {
            name: 'osjs',
            root: 'osjs:/',
            label: 'OS.js',
            adapter: 'system',
            attributes: {
              root: path.join(process.cwd(), 'vfs')
            }
          },
          {
            name: 'sequential-machine',
            root: 'sequential-machine:/',
            label: 'Sequential-OS',
            adapter: 'sequential-machine',
            attributes: {
              stateDir: STATEKIT_DIR,
              workdir: WORK_DIR
            }
          }
        ]
      }
    };

    const app = await Core.boot(config);
    const kit = await initializeStateKit();

  app.on('osjs/core:started', () => {
    console.log(`Sequential Desktop running on http://localhost:${PORT}`);
    console.log(`Sequential-OS State: ${STATEKIT_DIR}`);
    console.log(`Sequential-OS Workdir: ${WORK_DIR}`);
  });

  app.instance('sequential-os', kit);

    app.route('get', '/api/sequential-os/status', async (req, res) => {
      try {
        const status = await kit.status();
        res.json(status);
      } catch (error) {
        app.logger.error('Status error:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
      }
    });

    app.route('post', '/api/sequential-os/run', async (req, res) => {
      try {
        const { instruction } = req.body;
        if (!instruction) {
          return res.status(400).json({ error: 'instruction required' });
        }
        const result = await kit.run(instruction);
        res.json(result);
      } catch (error) {
        app.logger.error('Run error:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
      }
    });

    app.route('post', '/api/sequential-os/exec', async (req, res) => {
      try {
        const { instruction } = req.body;
        if (!instruction) {
          return res.status(400).json({ error: 'instruction required' });
        }
        const result = await kit.exec(instruction);
        res.json({ output: result, success: true });
      } catch (error) {
        app.logger.error('Exec error:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
      }
    });

    app.route('get', '/api/sequential-os/history', async (req, res) => {
      try {
        const history = kit.history();
        res.json(history);
      } catch (error) {
        app.logger.error('History error:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
      }
    });

    app.route('get', '/api/sequential-os/head', async (req, res) => {
      try {
        const head = kit.head();
        res.json({ hash: head });
      } catch (error) {
        app.logger.error('Head error:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
      }
    });

    app.route('post', '/api/sequential-os/checkout', async (req, res) => {
      try {
        const { ref } = req.body;
        if (!ref) {
          return res.status(400).json({ error: 'ref required' });
        }
        await kit.checkout(ref);
        res.json({ success: true, ref });
      } catch (error) {
        app.logger.error('Checkout error:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
      }
    });

    app.route('get', '/api/sequential-os/tags', async (req, res) => {
      try {
        const tags = kit.tags();
        res.json(tags);
      } catch (error) {
        app.logger.error('Tags error:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
      }
    });

    app.route('post', '/api/sequential-os/tag', async (req, res) => {
      try {
        const { name, ref } = req.body;
        if (!name) {
          return res.status(400).json({ error: 'name required' });
        }
        kit.tag(name, ref);
        res.json({ success: true, name, ref });
      } catch (error) {
        app.logger.error('Tag error:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
      }
    });

    app.route('get', '/api/sequential-os/inspect/:ref', async (req, res) => {
      try {
        const { ref } = req.params;
        const info = kit.inspect(ref);
        res.json(info);
      } catch (error) {
        app.logger.error('Inspect error:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
      }
    });

    app.route('post', '/api/sequential-os/diff', async (req, res) => {
      try {
        const { ref1, ref2 } = req.body;
        if (!ref1 || !ref2) {
          return res.status(400).json({ error: 'ref1 and ref2 required' });
        }
        const diff = await kit.diff(ref1, ref2);
        res.json(diff);
      } catch (error) {
        app.logger.error('Diff error:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
      }
    });

    app.route('post', '/api/sequential-os/rebuild', async (req, res) => {
      try {
        await kit.rebuild();
        res.json({ success: true });
      } catch (error) {
        app.logger.error('Rebuild error:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
      }
    });

    app.route('post', '/api/sequential-os/reset', async (req, res) => {
      try {
        await kit.reset();
        res.json({ success: true });
      } catch (error) {
        app.logger.error('Reset error:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
      }
    });

    app.route('get', '/terminal', async (req, res) => {
      try {
        const terminalPath = path.join(__dirname, '../../dist/terminal.html');
        const html = await fs.readFile(terminalPath, 'utf-8');
        res.type('html').send(html);
      } catch (error) {
        res.status(404).send('Terminal not found');
      }
    });

    app.route('get', '/debugger', async (req, res) => {
      try {
        const debuggerPath = path.join(__dirname, '../../dist/debugger.html');
        const html = await fs.readFile(debuggerPath, 'utf-8');
        res.type('html').send(html);
      } catch (error) {
        res.status(404).send('Debugger not found');
      }
    });

    console.log('\n✓ Sequential Desktop initialized successfully');
    console.log(`\nAccess points:`);
    console.log(`  Web Desktop: http://localhost:${PORT}`);
    console.log(`  Sequential-OS API: http://localhost:${PORT}/api/sequential-os/*`);
    console.log(`  VFS Mountpoints:`);
    console.log(`    - osjs:/ → ${path.join(process.cwd(), 'vfs')}`);
    console.log(`    - sequential-machine:/ → ${WORK_DIR}`);
    console.log(`\nAvailable applications:`);
    console.log(`  - Sequential Terminal`);
    console.log(`  - Filesystem Debugger`);
    console.log(`\nPress Ctrl+C to shutdown\n`);

    app.start();
  } catch (error) {
    console.error('\n✗ Failed to start Sequential Desktop');
    console.error(`  Error: ${error.message}`);
    if (process.env.DEBUG) {
      console.error(`  Stack: ${error.stack}`);
    }
    console.error('\nTroubleshooting:');
    console.error('  1. Check if port 8003 is available');
    console.error('  2. Verify @osjs/server is installed: cd packages/osjs-webdesktop && npm install');
    console.error('  3. Ensure Sequential-OS is built: cd packages/sequential-machine && npm install');
    console.error('  4. Run with DEBUG=1 for detailed logs\n');
    throw error;
  }
}

process.on('SIGINT', () => {
  console.log('\n\nShutting down Sequential Desktop...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\nShutting down Sequential Desktop...');
  process.exit(0);
});

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
