module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  setupFilesAfterEnv: ['jest-dom/extend-expect'],
  clearMocks: true,
  modulePaths: ['<rootDir>/'],
};
