# Polymorphic Session Manager

Complete state management system for OS.js that enables full serialization, transfer, and restoration of OS sessions including filesystem and running applications.

## Features

**Polymorphic App State**: Each app type can define custom serialization logic
**VFS Snapshot**: Complete filesystem capture including all files and directories
**Server-side Inspection**: API for external processes to inspect sessions
**Portable Sessions**: Export/import sessions as single JSON files
**Auto-sync**: Push sessions to server for remote inspection

## Architecture

### Session Manifest Format

```json
{
  "version": "1.0.0",
  "timestamp": "2025-11-18T...",
  "vfs": {
    "home:/file.txt": {
      "path": "home:/file.txt",
      "filename": "file.txt",
      "mime": "text/plain",
      "size": 1234,
      "isFile": true,
      "content": "..."
    }
  },
  "processes": [
    {
      "type": "text-editor",
      "windowState": {
        "title": "Text Editor",
        "position": { "top": 100, "left": 100 },
        "dimension": { "width": 600, "height": 400 }
      },
      "appState": {
        "content": "...",
        "cursorPosition": 42
      }
    }
  ],
  "settings": {},
  "metadata": {}
}
```

## Usage

### Client-side

#### Download/Upload Sessions

```javascript
const sessionManager = osjs.make('osjs/session-manager');

await sessionManager.downloadSession();

await sessionManager.uploadSession();
```

#### Keyboard Shortcuts

- **Ctrl+Shift+S**: Download current session
- **Ctrl+Shift+O**: Upload and restore session

#### Tray Menu

Click the "Session Manager" tray icon for quick access to:
- Download Session
- Upload Session
- Sync to Server
- Session Info

### Server-side Inspection API

#### Import Session

```bash
curl -X POST http://localhost:8000/api/session/import \
  -H "Content-Type: application/json" \
  -d @session.json
```

#### List Sessions

```bash
curl http://localhost:8000/api/session/list
```

#### Inspect Current Session

```bash
curl http://localhost:8000/api/session/inspect
```

Response:
```json
{
  "version": "1.0.0",
  "timestamp": "2025-11-18T...",
  "processCount": 3,
  "fileCount": 15,
  "processes": [
    {
      "type": "text-editor",
      "title": "Text Editor",
      "hasAppState": true
    }
  ]
}
```

#### Browse VFS

```bash
curl http://localhost:8000/api/session/vfs/tree?root=home:/
```

#### List Processes

```bash
curl http://localhost:8000/api/session/processes

curl http://localhost:8000/api/session/processes?type=text-editor
```

#### Get Process Details

```bash
curl http://localhost:8000/api/session/processes/0
```

## Creating Apps with Custom Serialization

### Example: Text Editor

```javascript
const sessionManager = osjs.make('osjs/session-manager');

sessionManager.registerAppSerializer('text-editor', {
  serialize: (win) => {
    const textarea = win.$content.querySelector('textarea');
    return {
      content: textarea.value,
      cursorPosition: textarea.selectionStart,
      scrollTop: textarea.scrollTop
    };
  },

  deserialize: async (osjs, windowState, appState) => {
    const win = osjs.make('osjs/window', {
      title: windowState.title,
      position: windowState.position,
      dimension: windowState.dimension,
      attributes: { appType: 'text-editor' }
    });

    const textarea = document.createElement('textarea');
    textarea.value = appState.content;
    win.$content.appendChild(textarea);
    win.render();

    textarea.selectionStart = appState.cursorPosition;
    textarea.scrollTop = appState.scrollTop;

    return win;
  }
});
```

### App Type Registration

Set `appType` in window attributes:

```javascript
const win = osjs.make('osjs/window', {
  title: 'My App',
  attributes: {
    appType: 'my-custom-app'
  }
});
```

## Server Process Integration

### Inspecting Sessions from Node.js

```javascript
const fetch = require('node-fetch');

const session = await fetch('http://localhost:8000/api/session/inspect')
  .then(r => r.json());

console.log(`Session has ${session.processCount} processes`);

const vfsTree = await fetch('http://localhost:8000/api/session/vfs/tree')
  .then(r => r.json());

console.log('VFS structure:', vfsTree.tree);

for (let i = 0; i < session.processCount; i++) {
  const proc = await fetch(`http://localhost:8000/api/session/processes/${i}`)
    .then(r => r.json());

  console.log(`Process ${i}:`, proc.process.type);
  console.log('App state:', proc.process.appState);
}
```

### Custom Tooling per App Type

Server processes can provide app-specific tooling:

```javascript
const processes = await fetch('http://localhost:8000/api/session/processes?type=text-editor')
  .then(r => r.json());

for (const proc of processes.processes) {
  const detail = await fetch(`http://localhost:8000/api/session/processes/${proc.index}`)
    .then(r => r.json());

  const content = detail.process.appState.content;

  const wordCount = content.split(/\s+/).length;
  console.log(`Text editor has ${wordCount} words`);
}
```

## Files

- `src/shared/session-protocol.js`: Shared protocol definitions
- `src/client/session-manager.js`: Client session capture/restore
- `src/client/session-provider.js`: Client service provider with UI
- `src/server/session-service.js`: Server session storage and inspection
- `src/server/session-provider.js`: Server API endpoints
- `src/client/example-app.js`: Example apps with serialization

## Session Storage

Sessions are stored in `/sessions/` directory on the server as JSON files.

## Workflow Example

1. User works in OS.js, opens apps, creates files
2. User presses Ctrl+Shift+S to download session
3. Session JSON file downloaded to local machine
4. User uploads session to external server process
5. Server process inspects VFS, reads files, analyzes app states
6. Server process performs automated tasks with app-specific tooling
7. Server process can modify and re-upload session
8. User presses Ctrl+Shift+O to restore modified session

## Extending

Add new app serializers by calling `registerAppSerializer()` in your app initialization code. The session manager will automatically include your app state in captures and restorations.
