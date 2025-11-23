const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8000';

const sampleManifest = {
  version: '1.0.0',
  timestamp: new Date().toISOString(),
  vfs: {
    'home:/test.txt': {
      path: 'home:/test.txt',
      filename: 'test.txt',
      mime: 'text/plain',
      size: 13,
      isDirectory: false,
      isFile: true,
      content: 'Hello World!'
    },
    'home:/docs': {
      path: 'home:/docs',
      filename: 'docs',
      isDirectory: true,
      isFile: false
    }
  },
  processes: [
    {
      type: 'text-editor',
      windowState: {
        id: 'test-1',
        title: 'Test Editor',
        position: { left: 100, top: 100 },
        dimension: { width: 600, height: 400 }
      },
      appState: { content: 'Test content', cursorPosition: 0 },
      timestamp: Date.now()
    },
    {
      type: 'calculator',
      windowState: {
        id: 'test-2',
        title: 'Calculator',
        position: { left: 200, top: 200 },
        dimension: { width: 300, height: 400 }
      },
      appState: { displayValue: '42', history: [] },
      timestamp: Date.now()
    }
  ],
  settings: { theme: 'dark' },
  metadata: { name: 'test-session', author: 'test' }
};

test.describe('Server API Endpoints', () => {
  let savedSessionId = null;

  test('POST /api/session/import - should save session manifest', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/session/import`, {
      data: sampleManifest
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.sessionId).toContain('session-');
    expect(body.path).toContain('.json');

    savedSessionId = body.sessionId;
  });

  test('GET /api/session/export/:sessionId - should load saved session', async ({ request }) => {
    const importRes = await request.post(`${BASE_URL}/api/session/import`, {
      data: sampleManifest
    });
    const { sessionId } = await importRes.json();

    const response = await request.get(`${BASE_URL}/api/session/export/${sessionId}`);

    expect(response.status()).toBe(200);
    const manifest = await response.json();
    expect(manifest.version).toBe('1.0.0');
    expect(manifest.processes).toHaveLength(2);
    expect(manifest.metadata.name).toBe('test-session');
  });

  test('GET /api/session/export/:sessionId - should return 404 for non-existent session', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/session/export/nonexistent-session-12345`);
    expect(response.status()).toBe(404);
  });

  test('GET /api/session/list - should list all sessions', async ({ request }) => {
    await request.post(`${BASE_URL}/api/session/import`, { data: sampleManifest });

    const response = await request.get(`${BASE_URL}/api/session/list`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.sessions).toBeDefined();
    expect(Array.isArray(body.sessions)).toBe(true);
    expect(body.sessions.length).toBeGreaterThan(0);

    const session = body.sessions[0];
    expect(session.id).toBeDefined();
    expect(session.timestamp).toBeDefined();
  });

  test('GET /api/session/inspect - should inspect current session', async ({ request }) => {
    await request.post(`${BASE_URL}/api/session/import`, { data: sampleManifest });

    const response = await request.get(`${BASE_URL}/api/session/inspect`);

    expect(response.status()).toBe(200);
    const inspection = await response.json();
    expect(inspection.version).toBe('1.0.0');
    expect(inspection.processCount).toBe(2);
    expect(inspection.fileCount).toBe(2);
  });

  test('GET /api/session/vfs - should inspect VFS contents', async ({ request }) => {
    await request.post(`${BASE_URL}/api/session/import`, { data: sampleManifest });

    const response = await request.get(`${BASE_URL}/api/session/vfs`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.vfs).toBeDefined();
    expect(Array.isArray(body.vfs)).toBe(true);

    const fileEntry = body.vfs.find(f => f.path === 'home:/test.txt');
    expect(fileEntry).toBeDefined();
    expect(fileEntry.type).toBe('file');
    expect(fileEntry.mime).toBe('text/plain');
  });

  test('GET /api/session/vfs?path=... - should filter VFS by path', async ({ request }) => {
    await request.post(`${BASE_URL}/api/session/import`, { data: sampleManifest });

    const response = await request.get(`${BASE_URL}/api/session/vfs?path=home:/test.txt`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.vfs).toBeDefined();
    expect(body.vfs.filename).toBe('test.txt');
  });

  test('GET /api/session/vfs/tree - should get VFS tree structure', async ({ request }) => {
    await request.post(`${BASE_URL}/api/session/import`, { data: sampleManifest });

    const response = await request.get(`${BASE_URL}/api/session/vfs/tree`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.tree).toBeDefined();
  });

  test('GET /api/session/processes - should list all processes', async ({ request }) => {
    await request.post(`${BASE_URL}/api/session/import`, { data: sampleManifest });

    const response = await request.get(`${BASE_URL}/api/session/processes`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.processes).toBeDefined();
    expect(Array.isArray(body.processes)).toBe(true);
    expect(body.processes.length).toBe(2);

    const textEditor = body.processes.find(p => p.type === 'text-editor');
    expect(textEditor).toBeDefined();
  });

  test('GET /api/session/processes?type=... - should filter by process type', async ({ request }) => {
    await request.post(`${BASE_URL}/api/session/import`, { data: sampleManifest });

    const response = await request.get(`${BASE_URL}/api/session/processes?type=calculator`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.processes).toHaveLength(1);
    expect(body.processes[0].type).toBe('calculator');
  });

  test('GET /api/session/processes/:index - should get process detail', async ({ request }) => {
    await request.post(`${BASE_URL}/api/session/import`, { data: sampleManifest });

    const response = await request.get(`${BASE_URL}/api/session/processes/0`);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.process).toBeDefined();
    expect(body.process.type).toBe('text-editor');
    expect(body.process.windowState).toBeDefined();
    expect(body.process.appState).toBeDefined();
  });

  test('GET /api/session/processes/:index - should return 404 for invalid index', async ({ request }) => {
    await request.post(`${BASE_URL}/api/session/import`, { data: sampleManifest });

    const response = await request.get(`${BASE_URL}/api/session/processes/999`);

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.error).toBe('Process not found');
  });

  test('POST /api/session/import - should handle invalid data gracefully', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/session/import`, {
      data: { invalid: 'data' }
    });

    expect(response.status()).toBe(200);
  });

  test('static assets - should serve bundle.js', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/bundle.js`);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('javascript');
  });

  test('static assets - should serve main.css', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/main.css`);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('css');
  });

  test('static assets - should serve index.html', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/`);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('html');
  });
});
