module.exports = {
  preset: 'ts-jest',
  setupFilesAfterEnv: [
    '@testing-library/jest-dom/extend-expect',
    './jestSetup.js',
  ],
  clearMocks: true,
  modulePaths: ['<rootDir>/'],
  watchPathIgnorePatterns: [
    'node_modules/.cache', // don't listen to rollup-typescript cache
    'src', // don't listen to source, it's /dist changes we care about
    'dist/esm', // just cjs
  ],
};
