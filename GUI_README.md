# Sequential Desktop GUI

Full development environment with content-addressable filesystem powered by Sequential-OS (StateKit).

## Quick Start

```bash
# From sequential-ecosystem root
npx sequential-ecosystem gui

# Or from this directory
./setup-gui.sh
npm start
```

Access: http://localhost:8003

## What You Get

### Applications
- **Sequential Terminal** - Full CLI with all Sequential-OS commands
- **Filesystem Debugger** - Visual inspector with layer history
- **Zellous** (separate) - WebRTC collaboration on ws://localhost:3003

### VFS Mountpoints
- `osjs://` - Traditional filesystem
- `sequential-machine://` - Content-addressable layers (backed by StateKit)

### API Endpoints

All at `http://localhost:8003/api/sequential-os/*`:

```bash
# Status and info
GET  /status                 # Get uncommitted changes
GET  /history                # List all layers
GET  /head                   # Get current HEAD hash
GET  /tags                   # List all tags
GET  /inspect/:ref           # Inspect specific layer

# Operations
POST /run                    # Execute and capture (body: {instruction})
POST /exec                   # Execute without capture (body: {instruction})
POST /checkout               # Navigate to layer (body: {ref})
POST /tag                    # Create tag (body: {name, ref?})
POST /diff                   # Compare layers (body: {ref1, ref2})

# Management
POST /rebuild                # Reconstruct workdir from layers
POST /reset                  # Clear all state (DESTRUCTIVE)
```

## Directory Structure

```
.sequential-machine/
├── layers/                  # Content-addressed layer tarballs
├── store.json               # Layer index and tags
└── work/                    # Current working directory

vfs/                         # OS.js traditional filesystem

src/
├── server/
│   ├── index.js                              # Main server
│   └── sequential-machine-adapter.js         # VFS adapter
└── packages/
    ├── SequentialTerminal/                   # Terminal app
    └── FileSystemDebugger/                   # Debugger app
```

## Environment Variables

```bash
PORT=8003                                     # Server port
SEQUENTIAL_MACHINE_DIR=.sequential-machine    # State directory
SEQUENTIAL_MACHINE_WORK=.sequential-machine/work  # Working directory
DEBUG=1                                       # Enable debug logging
SESSION_SECRET=your-secret                    # Session encryption key
```

## Setup Script

`./setup-gui.sh` does:
1. Check Node.js 18+
2. Install @osjs/server and dependencies
3. Verify Sequential-OS (StateKit) is available
4. Create required directories
5. Generate package manifests
6. Create dist/index.html

## Terminal Commands

Once in Sequential Terminal:

```bash
# Layer management
status                       # Show uncommitted changes
history                      # View layer history
run "npm install"            # Execute and capture
exec "cat file.txt"          # Execute without capture
checkout abc123              # Navigate to layer

# Tagging
tags                         # List all tags
tag v1                       # Tag current HEAD
tag release abc123           # Tag specific layer

# Inspection
inspect v1                   # Show layer details
diff abc123 def456           # Compare layers

# Management
rebuild                      # Reconstruct workdir
reset                        # Clear all state

# Shell
ls, cd, pwd, cat, clear
```

## Filesystem Debugger

1. **Load Files** - Browse current workdir
2. **Load History** - View layer commits
3. **Select files** - View/edit content
4. **Status** - Check uncommitted changes
5. **Switch mountpoints** - Toggle osjs:/ vs sequential-machine://
6. **Checkout layers** - Time travel to any state
7. **Debug console** - Monitor all operations

## API Examples

```bash
# Get status
curl http://localhost:8003/api/sequential-os/status

# Execute command and capture layer
curl -X POST http://localhost:8003/api/sequential-os/run \
  -H "Content-Type: application/json" \
  -d '{"instruction":"echo hello > test.txt"}'

# View history
curl http://localhost:8003/api/sequential-os/history

# Checkout layer
curl -X POST http://localhost:8003/api/sequential-os/checkout \
  -H "Content-Type: application/json" \
  -d '{"ref":"abc123"}'

# Create tag
curl -X POST http://localhost:8003/api/sequential-os/tag \
  -H "Content-Type: application/json" \
  -d '{"name":"v1"}'
```

## Troubleshooting

**Port 8003 already in use**
```bash
PORT=8004 npm start
```

**Sequential-OS not found**
```bash
cd ../sequential-machine && npm install
```

**Missing @osjs/server**
```bash
./setup-gui.sh
```

**Dist directory empty**
- The setup script creates a simple dist/index.html
- Full OS.js desktop UI requires additional build steps (optional)
- API and VFS work without dist build

## Architecture

**Server**: Express + OS.js + StateKit
**VFS**: Dual mountpoints (traditional + content-addressable)
**API**: REST endpoints for all Sequential-OS operations
**Apps**: Hyperapp-based UI components
**State**: Content-addressed filesystem layers

## Next Steps

1. Run `./setup-gui.sh`
2. Start server: `npm start`
3. Open http://localhost:8003
4. Test API with curl
5. Read `SEQUENTIAL_OS_GUI.md` for full documentation

## Documentation

- `SEQUENTIAL_OS_GUI.md` - Complete user guide
- `SEQUENTIAL_OS_INTEGRATION_SUMMARY.md` - Technical implementation
- `../../CLAUDE.md` - Overall architecture reference
