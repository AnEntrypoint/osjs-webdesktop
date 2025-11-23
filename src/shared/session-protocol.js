export const SESSION_VERSION = '1.0.0';

export const createSessionManifest = () => ({
  version: SESSION_VERSION,
  timestamp: new Date().toISOString(),
  vfs: {},
  processes: [],
  settings: {},
  metadata: {}
});

export const validateSessionManifest = (manifest) => {
  if (!manifest || typeof manifest !== 'object') {
    return { valid: false, error: 'Invalid manifest object' };
  }
  if (manifest.version !== SESSION_VERSION) {
    return { valid: false, error: `Unsupported version: ${manifest.version}` };
  }
  if (!Array.isArray(manifest.processes)) {
    return { valid: false, error: 'Invalid processes array' };
  }
  if (typeof manifest.vfs !== 'object') {
    return { valid: false, error: 'Invalid VFS object' };
  }
  return { valid: true };
};

export const serializeVFSNode = (stat, content = null) => ({
  path: stat.path,
  filename: stat.filename,
  mime: stat.mime,
  size: stat.size,
  isDirectory: stat.isDirectory,
  isFile: stat.isFile,
  mtime: stat.mtime,
  content: content
});

export const serializeWindowState = (window) => ({
  id: window.id,
  title: window.state.title,
  position: window.state.position,
  dimension: window.state.dimension,
  maximized: window.state.maximized,
  minimized: window.state.minimized,
  zIndex: window.state.zIndex
});

export const createProcessDescriptor = (type, windowState, appState) => ({
  type,
  windowState,
  appState,
  timestamp: Date.now()
});
