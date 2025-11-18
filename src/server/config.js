const path = require('path');
const root = path.resolve(__dirname, '../../');

module.exports = {
  root,
  port: 8000,
  public: path.resolve(root, 'dist'),
  auth: {
    login: async (req, res) => {
      return {
        username: 'demo',
        groups: ['admin']
      };
    }
  },
  settings: {
    defaults: {
      'osjs/default-application': {},
      'osjs/session': [],
      'osjs/desktop': {
        theme: null,
        sounds: null,
        icons: null
      }
    }
  }
};
