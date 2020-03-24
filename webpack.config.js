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
    optimization: {
      minimize: false,
    },
    output: {
      filename: 'index.js',
    },
  },
  // Production
  {
    mode: 'production',
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
    output: {
      filename: 'index.min.js',
    },
    plugins: [new SizePlugin()],
  },
];

module.exports = configVariants.map((config) => ({
  devtool: 'source-map',
  entry: path.resolve(__dirname, 'src/index.ts'),
  externals: Object.keys(peerDependencies),
  mode: config.mode,
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
  output: {
    filename: config.output.filename,
    path: path.resolve(__dirname, 'dist'),
    library: 'ReactRecollect',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  plugins: config.plugins,
  resolve: {
    extensions: ['.js', '.json', '.ts', '.tsx'],
  },
  stats: 'minimal',
}));
