import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import nodeResolve from '@rollup/plugin-node-resolve';
import bundleSize from 'rollup-plugin-bundle-size';

const { peerDependencies } = require('./package.json');

module.exports = {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'umd',
    name: 'ReactRecollect',
    globals: {
      react: 'React',
    },
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript(),
    terser({
      output: {
        comments: false,
      },
      compress: {
        unsafe: true,
      },
    }),
    bundleSize(),
  ],
  external: Object.keys(peerDependencies),
};
