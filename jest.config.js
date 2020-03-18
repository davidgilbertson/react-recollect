module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
  clearMocks: true,
  modulePaths: ['<rootDir>/'],
};
