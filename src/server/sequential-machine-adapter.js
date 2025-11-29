const fs = require('fs-extra');
const path = require('path');
const fh = require('filehound');

const getRealPath = (core, mount, file) => {
  const root = mount.attributes.workdir;
  const str = file.path ? file.path.substr(mount.root.length - 1) : '';
  return path.join(root, str);
};

const createFileIter = (core, realRoot, file) => {
  const filename = path.basename(file.path || file);
  const realPath = path.join(realRoot, filename);
  const {mime} = core.make('osjs/vfs');

  const createStat = stat => ({
    isDirectory: stat.isDirectory(),
    isFile: stat.isFile(),
    mime: stat.isFile() ? mime(realPath) : null,
    size: stat.size,
    path: file.path || file,
    filename,
    stat
  });

  return fs.stat(realPath)
    .then(createStat)
    .catch(error => {
      core.logger.warn(error);
      return createStat({
        isDirectory: () => false,
        isFile: () => true,
        size: 0
      });
    });
};

module.exports = (core) => {
  const wrapper = (method, cb, ...args) => vfs => (file, options = {}) => {
    const promise = Promise.resolve(getRealPath(core, vfs.mount, file))
      .then(realPath => fs[method](realPath, ...args));

    return typeof cb === 'function'
      ? cb(promise, options)
      : promise.then(() => true);
  };

  const crossWrapper = method => (srcVfs, destVfs) => (src, dest, options = {}) => Promise.resolve({
    realSource: getRealPath(core, srcVfs.mount, src),
    realDest: getRealPath(core, destVfs.mount, dest)
  })
    .then(({realSource, realDest}) => fs[method](realSource, realDest))
    .then(() => true);

  return {
    watch: () => ({close: () => {}}),

    exists: vfs => file => Promise.resolve(getRealPath(core, vfs.mount, file))
      .then(realPath => fs.access(realPath).then(() => true).catch(() => false)),

    stat: vfs => file => Promise.resolve(getRealPath(core, vfs.mount, file))
      .then(realPath => fs.stat(realPath))
      .then(stat => ({
        isDirectory: stat.isDirectory(),
        isFile: stat.isFile(),
        path: file.path,
        filename: path.basename(file.path),
        mime: stat.isDirectory() ? null : core.make('osjs/vfs').mime(realPath),
        size: stat.size,
        stat: {
          mode: stat.mode,
          atime: stat.atime,
          mtime: stat.mtime,
          ctime: stat.ctime
        }
      })),

    readdir: vfs => (file, options = {}) => Promise.resolve(getRealPath(core, vfs.mount, file))
      .then(realPath => fs.readdir(realPath))
      .then(files => Promise.all(files.map(f => createFileIter(core, getRealPath(core, vfs.mount, file), {
        path: path.join(file.path, f)
      })))),

    readfile: vfs => (file, options = {}) => Promise.resolve(getRealPath(core, vfs.mount, file))
      .then(realPath => fs.readFile(realPath))
      .then(body => ({
        body,
        mime: core.make('osjs/vfs').mime(getRealPath(core, vfs.mount, file))
      })),

    writefile: wrapper('writeFile', (promise, options) =>
      promise.then(() => options.upload !== false)),

    copy: crossWrapper('copy'),

    rename: crossWrapper('rename'),

    mkdir: wrapper('ensureDir'),

    unlink: vfs => file => Promise.resolve(getRealPath(core, vfs.mount, file))
      .then(realPath => fs.stat(realPath).then(stat => ({realPath, stat})))
      .then(({realPath, stat}) => stat.isDirectory()
        ? fs.remove(realPath)
        : fs.unlink(realPath))
      .then(() => true),

    search: vfs => (root, pattern) => {
      const realRoot = getRealPath(core, vfs.mount, root);
      return fh.create()
        .paths(realRoot)
        .match(pattern)
        .find()
        .then(files => Promise.all(files.map(filename => createFileIter(core, realRoot, {
          path: root.path + '/' + path.basename(filename)
        }))));
    }
  };
};
