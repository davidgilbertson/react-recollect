if (process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line global-require
  module.exports = require('./dist/esm/production/index.js');
} else {
  // eslint-disable-next-line global-require
  module.exports = require('./dist/esm/development/index.js');
}
