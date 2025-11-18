const path = require('path');
const root = path.resolve(__dirname, '../../');

module.exports = {
  root,
  port: 8000,
  public: path.resolve(root, 'dist')
};
