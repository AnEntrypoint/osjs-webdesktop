# CLAUDE.md

Technical guidance for Claude Code when working with this OS.js implementation.

## Architecture

**Minimal OS.js v3 setup** with client/server architecture using CommonJS (server) and ES modules (client).

### Core Components

**Server** (`src/server/index.js`): Express-based server with OS.js service providers
- CoreServiceProvider: Core functionality
- PackageServiceProvider: Application package management
- VFSServiceProvider: Virtual file system
- AuthServiceProvider: Authentication
- SettingsServiceProvider: User settings

**Client** (`src/client/index.js`): Browser-based desktop environment
- CoreServiceProvider: Client core
- DesktopServiceProvider: Desktop windowing system
- VFSServiceProvider: Client-side VFS
- NotificationServiceProvider: System notifications
- SettingsServiceProvider: Settings UI
- AuthServiceProvider: Client auth
- PanelServiceProvider: Desktop panels
- DialogServiceProvider: System dialogs
- GUIServiceProvider: UI components

**Config** (`src/server/config.js`): Server configuration (port 8000, dist directory)

**Build** (`webpack.config.js`): Webpack 5 with HtmlWebpackPlugin, MiniCssExtractPlugin, SCSS support

### Data Flow

```
Client (Browser) <-> WebSocket/HTTP <-> Server (Express) <-> VFS/Auth/Settings
```

## Key Constraints

**Port**: Server runs on port 8000 (configurable in src/server/config.js)

**Build Required**: Client code must be built via webpack before server can serve it

**File Limits**: Keep files under 200 lines per project standards

**Module Systems**: Server uses CommonJS (require/module.exports), client uses ES modules (import/export)

**Dependencies**: All in package.json dependencies (not devDependencies for deployment)

## Development Workflow

### Starting Development

```bash
npm install           # Install dependencies
npm run build        # Build client once
npm run serve        # Start server
```

For active development:
```bash
npm run watch        # Terminal 1: Auto-rebuild on changes
npm run serve        # Terminal 2: Run server
```

### Testing

**Manual testing via browser**: http://localhost:8000

**Playwright testing**: Use MCP playwright for automated browser testing
- Set type to 'jpeg' for screenshots (not png)
- Close browser before each test
- Artifacts go to /tmp/sandboxbox-vZWAzQ/tmp

**Server-side testing**: Use MCP glootie for Node.js code execution

### File Changes

**Server changes**: Restart server (Ctrl+C, `npm run serve`)

**Client changes**:
- Rebuild: `npm run build` or use `npm run watch`
- Refresh browser to see changes

## Common Tasks

### Adding New Service Provider

1. Install provider package: `npm install @osjs/provider-name`
2. Register in `src/server/index.js` or `src/client/index.js`
3. Rebuild client if client-side change

### Modifying Server Config

Edit `src/server/config.js` for:
- Port changes
- Directory paths
- Additional configuration options

### Adding Styles

Edit `src/client/index.scss` or create new SCSS files and import them

### Debugging

**Server**: Check console output from `npm run serve`

**Client**: Use browser DevTools console (F12)

**Build issues**: Check webpack output from `npm run build`

**WebSocket issues**: Verify server started successfully and port 8000 is available

## Deployment

1. Build production bundle: `NODE_ENV=production npm run build`
2. Ensure dist/ directory is generated
3. Run server: `npm run serve`

## Project Standards

**No comments**: Use clear naming instead

**No hardcoded values**: Use config files

**Clean architecture**: DRY, modular, forward-thinking

**File size**: Under 200 lines per file

**Testing**: Playwright (browser), glootie (server), manual verification

## Known Issues

**Background processes**: Multiple server instances may be running (check with ps/lsof)

**Port conflicts**: Default port 8000 may conflict with other services

**Build artifacts**: dist/ directory must exist and contain built files
