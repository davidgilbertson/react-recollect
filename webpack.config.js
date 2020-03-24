const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

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
    globalObject: 'this',
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js)$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
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
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: false,
          },
          compress: {
            unsafe: true,
          },
        },
      }),
    ],
  },
  resolve: {
    extensions: ['.js', '.json', '.ts', '.tsx'],
  },
  externals: Object.keys(peerDependencies),
};
