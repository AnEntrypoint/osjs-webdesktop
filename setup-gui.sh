#!/bin/bash

set -e

echo "========================================"
echo " Sequential Desktop - Setup Script"
echo "========================================"
echo ""

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "✗ Error: Node.js 18+ required (found $(node -v))"
  exit 1
fi
echo "✓ Node.js $(node -v)"

# Install OS.js server dependencies
echo ""
echo "Installing OS.js dependencies..."
npm install --no-save @osjs/server@^3.0.0 \
  @osjs/common@^3.0.0 \
  body-parser@^1.19.0 \
  chokidar@^3.4.0 \
  fs-extra@^10.0.0 \
  filehound@^1.17.0

echo "✓ OS.js dependencies installed"

# Ensure Sequential-OS is available
echo ""
echo "Checking Sequential-OS..."
cd ../sequential-machine
npm install
cd ../osjs-webdesktop
echo "✓ Sequential-OS ready"

# Create required directories
echo ""
echo "Creating directory structure..."
mkdir -p .sequential-machine/work
mkdir -p .sequential-machine/layers
mkdir -p vfs
mkdir -p dist
echo "✓ Directories created"

# Create package manifests
echo ""
echo "Creating package manifests..."

# Sequential Terminal package.json
cat > src/packages/SequentialTerminal/package.json <<'EOF'
{
  "name": "@sequential-desktop/terminal",
  "version": "1.0.0",
  "description": "Sequential-OS Terminal application for OS.js",
  "main": "index.js",
  "scripts": {},
  "keywords": ["osjs", "sequential", "terminal"],
  "dependencies": {
    "hyperapp": "^1.2.10"
  }
}
EOF

# Filesystem Debugger package.json
cat > src/packages/FileSystemDebugger/package.json <<'EOF'
{
  "name": "@sequential-desktop/debugger",
  "version": "1.0.0",
  "description": "Filesystem Debugger for Sequential-OS",
  "main": "index.js",
  "scripts": {},
  "keywords": ["osjs", "sequential", "debugger", "filesystem"],
  "dependencies": {
    "hyperapp": "^1.2.10"
  }
}
EOF

echo "✓ Package manifests created"

# Create simple dist index.html if it doesn't exist
if [ ! -f "dist/index.html" ]; then
  echo ""
  echo "Creating dist/index.html..."
  cat > dist/index.html <<'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sequential Desktop</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
    }
    .container {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 60px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    h1 {
      font-size: 3em;
      margin-bottom: 20px;
      font-weight: 700;
    }
    p {
      font-size: 1.2em;
      margin-bottom: 30px;
      opacity: 0.9;
    }
    .status {
      background: rgba(255, 255, 255, 0.2);
      padding: 20px;
      border-radius: 10px;
      margin-top: 30px;
    }
    .status h3 {
      margin-bottom: 15px;
      font-size: 1.3em;
    }
    .endpoints {
      text-align: left;
      display: inline-block;
      margin: 20px auto;
    }
    .endpoints li {
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }
    .endpoints li:last-child { border: none; }
    code {
      background: rgba(0, 0, 0, 0.3);
      padding: 3px 8px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Sequential Desktop</h1>
    <p>Content-Addressable Development Environment</p>

    <div class="status">
      <h3>System Status</h3>
      <p>✓ Server Running</p>
      <p>✓ Sequential-OS Initialized</p>
      <p>✓ VFS Mounted</p>
    </div>

    <div class="status">
      <h3>Available Applications</h3>
      <ul class="endpoints">
        <li>📟 <strong>Sequential Terminal</strong> - Full OS CLI with layer management</li>
        <li>🔍 <strong>Filesystem Debugger</strong> - Visual inspector with history</li>
        <li>💬 <strong>Zellous</strong> - WebRTC collaboration (port 3003)</li>
      </ul>
    </div>

    <div class="status">
      <h3>API Endpoints</h3>
      <ul class="endpoints">
        <li><code>GET  /api/sequential-os/status</code></li>
        <li><code>POST /api/sequential-os/run</code></li>
        <li><code>GET  /api/sequential-os/history</code></li>
        <li><code>POST /api/sequential-os/checkout</code></li>
        <li><code>GET  /api/sequential-os/tags</code></li>
      </ul>
    </div>

    <p style="margin-top: 40px; font-size: 0.9em; opacity: 0.7;">
      Note: Full OS.js desktop UI requires build step.<br>
      See <code>SEQUENTIAL_OS_GUI.md</code> for details.
    </p>
  </div>
</body>
</html>
EOF
  echo "✓ Created dist/index.html"
fi

echo ""
echo "========================================"
echo " ✓ Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. Start the GUI: npm start"
echo "  2. Access: http://localhost:8003"
echo "  3. Test API: curl http://localhost:8003/api/sequential-os/status"
echo ""
echo "Documentation:"
echo "  - SEQUENTIAL_OS_GUI.md (user guide)"
echo "  - SEQUENTIAL_OS_INTEGRATION_SUMMARY.md (technical details)"
echo ""
