# OS.js

Minimal OS.js implementation - a web desktop environment built on the [OS.js](https://github.com/os-js) framework.

## Features

- Full desktop environment with windows, panels, and dialogs
- Virtual file system (VFS)
- Authentication system
- Settings management
- Notifications
- GUI components
- **Polymorphic Session Management** - Serialize, sync, and restore entire OS state
  - Download/upload sessions as single JSON files
  - App-specific state serialization (polymorphic tooling)
  - Server-side session inspection API
  - Full VFS snapshot and restoration

## Quick Start

```bash
npm install
npm run build
npm run serve
```

Visit http://localhost:8000 to access the desktop.

## Development

```bash
npm run watch
```

Watches for file changes and rebuilds automatically.

## Structure

```
src/
├── client/               # Frontend application
│   ├── index.js          # Client entry point with service providers
│   ├── index.html        # HTML template
│   ├── index.scss        # Global styles
│   ├── session-manager.js    # Session capture/restore logic
│   ├── session-provider.js   # Session UI and controls
│   └── example-app.js    # Example apps with serialization
├── server/               # Backend server
│   ├── index.js          # Server entry point with service providers
│   ├── config.js         # Server configuration
│   ├── session-service.js    # Session storage and inspection
│   └── session-provider.js   # Session API endpoints
└── shared/               # Shared code
    └── session-protocol.js   # Session manifest format
```

## Technology Stack

- **Framework**: OS.js v3
- **UI**: Hyperapp
- **Build**: Webpack 5
- **Server**: Node.js with Express
- **Database**: Session storage via connect-loki

## Session Management

This OS.js implementation includes a polymorphic session management system that allows you to:

- **Capture**: Serialize the entire OS state (windows + VFS) to JSON
- **Restore**: Fully restore OS state from a session file
- **Sync**: Upload sessions to server for remote inspection
- **Inspect**: Server-side API to analyze sessions programmatically

### Quick Usage

**Keyboard Shortcuts:**
- `Ctrl+Shift+S` - Download current session
- `Ctrl+Shift+O` - Upload and restore session

**Console Commands:**
```javascript
openTextEditor()
openCalculator()
```

**Server-side Inspection:**
```bash
node examples/inspect-session.js

node examples/modify-session.js session.json
```

See [SESSION_MANAGER.md](SESSION_MANAGER.md) for complete documentation.

## License

MIT
