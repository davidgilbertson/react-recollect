const path = require('path');
const { peerDependencies } = require('./package.json');

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  entry: path.resolve(__dirname, 'src/index.ts'),
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'ReactRecollect',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js)$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              logLevel: 'info',
              onlyCompileBundledFiles: true, // Skip parsing tests, etc.
            },
          },
        ],
      },
      {
        enforce: 'pre',
        test: /\.(ts|tsx)$/,
        use: 'source-map-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.json', '.ts', '.tsx'],
  },
  externals: Object.keys(peerDependencies),
};
