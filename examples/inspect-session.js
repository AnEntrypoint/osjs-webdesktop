#!/usr/bin/env node

const http = require('http');

const API_BASE = 'http://localhost:8000/api/session';

function apiRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE}${endpoint}`;

    http.get(url, (res) => {
      let data = '';

      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function inspectSession() {
  console.log('=== OS.js Session Inspector ===\n');

  try {
    const inspection = await apiRequest('/inspect');

    console.log('Session Overview:');
    console.log(`  Version: ${inspection.version}`);
    console.log(`  Timestamp: ${new Date(inspection.timestamp).toLocaleString()}`);
    console.log(`  Processes: ${inspection.processCount}`);
    console.log(`  Files: ${inspection.fileCount}`);
    console.log(`  Capture Size: ${(inspection.metadata?.captureSize / 1024).toFixed(2)} KB\n`);

    console.log('Running Processes:');
    for (let i = 0; i < inspection.processCount; i++) {
      const proc = inspection.processes[i];
      console.log(`  [${i}] ${proc.type} - ${proc.title || 'Untitled'}`);
      console.log(`      Has state: ${proc.hasAppState ? 'Yes' : 'No'}`);
    }
    console.log();

    console.log('VFS Structure:');
    const vfsTree = await apiRequest('/vfs/tree?root=home:/');
    console.log(JSON.stringify(vfsTree.tree, null, 2));
    console.log();

    console.log('Process Details:');
    for (let i = 0; i < Math.min(inspection.processCount, 3); i++) {
      const detail = await apiRequest(`/processes/${i}`);
      console.log(`\nProcess ${i} (${detail.process.type}):`);
      console.log(`  Window State:`, detail.process.windowState);
      console.log(`  App State:`, detail.process.appState);
    }

    console.log('\n=== App-Specific Tooling Example ===\n');

    const textEditors = inspection.processes.filter(p => p.type === 'text-editor');

    if (textEditors.length > 0) {
      console.log(`Found ${textEditors.length} text editor(s)\n`);

      for (const proc of textEditors) {
        const index = inspection.processes.indexOf(proc);
        const detail = await apiRequest(`/processes/${index}`);

        const content = detail.process.appState?.content || '';
        const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
        const lineCount = content.split('\n').length;
        const charCount = content.length;

        console.log(`Text Editor: "${detail.process.windowState.title}"`);
        console.log(`  Characters: ${charCount}`);
        console.log(`  Words: ${wordCount}`);
        console.log(`  Lines: ${lineCount}`);
        console.log(`  Cursor: ${detail.process.appState?.cursorPosition || 0}`);
        console.log();
      }
    }

    const calculators = inspection.processes.filter(p => p.type === 'calculator');

    if (calculators.length > 0) {
      console.log(`Found ${calculators.length} calculator(s)\n`);

      for (const proc of calculators) {
        const index = inspection.processes.indexOf(proc);
        const detail = await apiRequest(`/processes/${index}`);

        console.log(`Calculator: "${detail.process.windowState.title}"`);
        console.log(`  Display: ${detail.process.appState?.displayValue || '0'}`);
        console.log(`  History: ${detail.process.appState?.history?.length || 0} operations`);
        console.log();
      }
    }

  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      console.error('Error: Cannot connect to OS.js server on port 8000');
      console.error('Make sure the server is running: npm run serve');
    } else {
      console.error('Error:', err.message);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  inspectSession();
}

module.exports = { inspectSession, apiRequest };
