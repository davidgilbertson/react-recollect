import lodashMerge from 'lodash/merge';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import bundleSize from 'rollup-plugin-bundle-size';
import pkg from './package.json';

const merge = (...args) => lodashMerge({}, ...args);

const EXTERNALS = {
  ALL: Object.keys(merge(pkg.peerDependencies, pkg.dependencies)),
  PEERS: Object.keys(pkg.peerDependencies),
};

const GLOBALS = {
  react: 'React',
  'react-dom': 'ReactDOM',
};

const FORMATS = {
  CJS: 'cjs',
  ESM: 'esm',
  UMD: 'umd',
};

const ENVIRONMENTS = {
  DEV: 'development',
  PRD: 'production',
};

// These are settings we don't want in tsconfig.json
// because they interfere with tests/linting
const tsConfigBase = {
  check: false,
  tsconfigOverride: {
    compilerOptions: {
      module: 'ES2015',
    },
    include: ['src'],
  },
};

// These options are slow and only need to be executed for one of the configs
const tsConfigExtended = {
  check: true,
  useTsconfigDeclarationDir: true,
  tsconfigOverride: {
    compilerOptions: {
      declaration: true,
      declarationDir: 'dist/types',
    },
  },
};

export default (flags) => {
  const configs = [];

  // We loop over the 3 formats and 2 environments
  Object.values(FORMATS).forEach((format) => {
    Object.values(ENVIRONMENTS).forEach((env) => {
      // Only one of the configs needs to run checks and output TS declarations
      // For performance, we'll pick one that doesn't run in watch mode
      const tsConfig =
        format === FORMATS.UMD && env === ENVIRONMENTS.PRD
          ? merge(tsConfigBase, tsConfigExtended)
          : tsConfigBase;

      // Shared options for all configs
      const config = {
        cache: true,
        input: 'src/index.ts',
        output: {
          format,
        },
        plugins: [
          commonjs(),
          nodeResolve(),
          typescript(tsConfig), // must be after nodeResolve
          replace({ 'process.env.NODE_ENV': `'${env}'` }), // must be after typescript
          // terser will be added after this for minified bundles
        ],
      };

      // We don't concatenate for ESM
      if (format === FORMATS.ESM) {
        config.preserveModules = true;
        config.output.dir = `dist/${format}/${env}`;
      } else {
        config.output.file = `dist/${format}/index.${env}.js`;
      }

      // UMD files only externalise peers
      if (format === FORMATS.UMD) {
        config.external = EXTERNALS.PEERS;
        config.output.name = 'ReactRecollect';
        config.output.globals = GLOBALS;
      } else {
        // Other formats externalise everything
        config.external = EXTERNALS.ALL;
      }

      // We minify for UMD production
      if (format === FORMATS.UMD && env === ENVIRONMENTS.PRD) {
        config.plugins.push(terser());
        config.plugins.push(bundleSize());
      }

      // We only build some configs in watch mode
      // Further down we filter based on config.watch
      if (
        env === ENVIRONMENTS.DEV &&
        (format === FORMATS.CJS || format === FORMATS.ESM)
      ) {
        config.watch = {
          include: 'src/**/*',
        };
      }

      configs.push(config);
    });
  });

  return flags.watch ? configs.filter((config) => config.watch) : configs;
};
