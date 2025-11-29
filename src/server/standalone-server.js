const express = require('express');
const path = require('path');
const fs = require('fs-extra');

const sequentialMachinePath = path.join(__dirname, '../../../sequential-machine');
const { StateKit } = require(sequentialMachinePath);

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
    console.log('Starting Sequential Desktop...\n');

    await ensureDirectories();

    const app = express();
    const kit = await initializeStateKit();

    app.use(express.json());
    app.use(express.static(path.join(__dirname, '../../dist')));

    app.get('/api/sequential-os/status', async (req, res) => {
      try {
        const status = await kit.status();
        res.json(status);
      } catch (error) {
        res.status(500).json({ error: error.message, stack: error.stack });
      }
    });

    app.post('/api/sequential-os/run', async (req, res) => {
      try {
        const { instruction } = req.body;
        if (!instruction) {
          return res.status(400).json({ error: 'instruction required' });
        }
        const result = await kit.run(instruction);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message, stack: error.stack });
      }
    });

    app.post('/api/sequential-os/exec', async (req, res) => {
      try {
        const { instruction } = req.body;
        if (!instruction) {
          return res.status(400).json({ error: 'instruction required' });
        }
        const result = await kit.exec(instruction);
        res.json({ output: result, success: true });
      } catch (error) {
        res.status(500).json({ error: error.message, stack: error.stack });
      }
    });

    app.get('/api/sequential-os/history', async (req, res) => {
      try {
        const history = kit.history();
        res.json(history);
      } catch (error) {
        res.status(500).json({ error: error.message, stack: error.stack });
      }
    });

    app.get('/api/sequential-os/head', async (req, res) => {
      try {
        const head = kit.head();
        res.json({ hash: head });
      } catch (error) {
        res.status(500).json({ error: error.message, stack: error.stack });
      }
    });

    app.post('/api/sequential-os/checkout', async (req, res) => {
      try {
        const { ref } = req.body;
        if (!ref) {
          return res.status(400).json({ error: 'ref required' });
        }
        await kit.checkout(ref);
        res.json({ success: true, ref });
      } catch (error) {
        res.status(500).json({ error: error.message, stack: error.stack });
      }
    });

    app.get('/api/sequential-os/tags', async (req, res) => {
      try {
        const tags = kit.tags();
        res.json(tags);
      } catch (error) {
        res.status(500).json({ error: error.message, stack: error.stack });
      }
    });

    app.post('/api/sequential-os/tag', async (req, res) => {
      try {
        const { name, ref } = req.body;
        if (!name) {
          return res.status(400).json({ error: 'name required' });
        }
        kit.tag(name, ref);
        res.json({ success: true, name, ref });
      } catch (error) {
        res.status(500).json({ error: error.message, stack: error.stack });
      }
    });

    app.get('/api/sequential-os/inspect/:ref', async (req, res) => {
      try {
        const { ref } = req.params;
        const info = kit.inspect(ref);
        res.json(info);
      } catch (error) {
        res.status(500).json({ error: error.message, stack: error.stack });
      }
    });

    app.post('/api/sequential-os/diff', async (req, res) => {
      try {
        const { ref1, ref2 } = req.body;
        if (!ref1 || !ref2) {
          return res.status(400).json({ error: 'ref1 and ref2 required' });
        }
        const diff = await kit.diff(ref1, ref2);
        res.json(diff);
      } catch (error) {
        res.status(500).json({ error: error.message, stack: error.stack });
      }
    });

    app.post('/api/sequential-os/rebuild', async (req, res) => {
      try {
        await kit.rebuild();
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: error.message, stack: error.stack });
      }
    });

    app.post('/api/sequential-os/reset', async (req, res) => {
      try {
        await kit.reset();
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: error.message, stack: error.stack });
      }
    });

    app.listen(PORT, () => {
      console.log('\n✓ Sequential Desktop initialized successfully');
      console.log(`\nAccess points:`);
      console.log(`  Web Desktop: http://localhost:${PORT}`);
      console.log(`  Sequential-OS API: http://localhost:${PORT}/api/sequential-os/*`);
      console.log(`  State Directory: ${STATEKIT_DIR}`);
      console.log(`  Work Directory: ${WORK_DIR}`);
      console.log(`\nPress Ctrl+C to shutdown\n`);
    });

  } catch (error) {
    console.error('\n✗ Failed to start Sequential Desktop');
    console.error(`  Error: ${error.message}`);
    if (process.env.DEBUG) {
      console.error(`  Stack: ${error.stack}`);
    }
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
