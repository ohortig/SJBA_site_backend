/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': '<rootDir>/jest.transformer.cjs',
  },
  testMatch: ['**/*.test.ts'],
  watchman: false,
};
