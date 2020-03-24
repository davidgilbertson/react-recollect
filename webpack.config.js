const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const SizePlugin = require('size-plugin');

const { peerDependencies } = require('./package.json');

// The below creates two outputs, dist/index.js and dist/index.min.js
// These are selected between in react-recollect/index.js - the entry point for the package
const configVariants = [
  // Development
  {
    mode: 'development',
    output: {
      filename: 'index.js',
    },
    optimization: {
      minimize: false,
    },
  },
  // Production
  {
    mode: 'production',
    output: {
      filename: 'index.min.js',
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
    plugins: [new SizePlugin()],
  },
];

module.exports = configVariants.map((config) => ({
  mode: config.mode,
  devtool: 'source-map',
  entry: path.resolve(__dirname, 'src/index.ts'),
  output: {
    filename: config.output.filename,
    path: path.resolve(__dirname, 'dist'),
    library: 'ReactRecollect',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  stats: 'minimal',
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
  optimization: config.optimization,
  resolve: {
    extensions: ['.js', '.json', '.ts', '.tsx'],
  },
  plugins: config.plugins,
  externals: Object.keys(peerDependencies),
}));
