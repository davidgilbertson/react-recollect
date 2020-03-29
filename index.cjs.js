if (process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line global-require
  module.exports = require('./dist/cjs/index.production.js');
} else {
  // eslint-disable-next-line global-require
  module.exports = require('./dist/cjs/index.development.js');
}
