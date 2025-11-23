#!/usr/bin/env node

const http = require('http');
const fs = require('fs');

function apiRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:8000/api/session${endpoint}`);

    const options = {
      method,
      headers: {}
    };

    if (data) {
      options.headers['Content-Type'] = 'application/json';
    }

    const req = http.request(url, options, (res) => {
      let responseData = '';

      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseData));
        } catch (err) {
          resolve(responseData);
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function modifySession(sessionFile) {
  console.log('=== OS.js Session Modifier ===\n');

  try {
    const sessionData = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));

    console.log(`Loaded session: ${sessionData.timestamp}`);
    console.log(`  Processes: ${sessionData.processes.length}`);
    console.log(`  Files: ${Object.keys(sessionData.vfs).length}\n`);

    console.log('Applying modifications...\n');

    for (const proc of sessionData.processes) {
      if (proc.type === 'text-editor') {
        const content = proc.appState?.content || '';

        console.log(`Modifying text editor: ${proc.windowState.title}`);
        console.log(`  Original length: ${content.length} chars`);

        proc.appState.content = content.toUpperCase();
        proc.windowState.title += ' [MODIFIED]';

        console.log(`  Modified length: ${proc.appState.content.length} chars`);
        console.log(`  New title: ${proc.windowState.title}\n`);
      }

      if (proc.type === 'calculator') {
        console.log(`Modifying calculator: ${proc.windowState.title}`);
        proc.appState.displayValue = '42';
        proc.windowState.title += ' [MODIFIED]';
        console.log(`  Set display to: 42\n`);
      }
    }

    for (const [path, node] of Object.entries(sessionData.vfs)) {
      if (node.isFile && node.mime === 'text/plain' && node.content) {
        console.log(`Modifying file: ${path}`);
        console.log(`  Original: ${node.content.substring(0, 50)}...`);

        node.content = node.content.toUpperCase();

        console.log(`  Modified: ${node.content.substring(0, 50)}...\n`);
      }
    }

    sessionData.metadata.modified = true;
    sessionData.metadata.modifiedAt = new Date().toISOString();
    sessionData.metadata.modifications = 'Converted text to uppercase';

    const outputFile = sessionFile.replace('.json', '-modified.json');
    fs.writeFileSync(outputFile, JSON.stringify(sessionData, null, 2));

    console.log(`\nModified session saved to: ${outputFile}`);
    console.log('\nYou can now:');
    console.log(`  1. Upload to server: curl -X POST http://localhost:8000/api/session/import -H "Content-Type: application/json" -d @${outputFile}`);
    console.log(`  2. Restore in OS.js: Use Ctrl+Shift+O and select ${outputFile}`);

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  const sessionFile = process.argv[2];

  if (!sessionFile) {
    console.error('Usage: node modify-session.js <session-file.json>');
    process.exit(1);
  }

  modifySession(sessionFile);
}

module.exports = { modifySession };
