const appConfig = require('./jest.config');

module.exports = {
  ...appConfig,
  testMatch: ['<rootDir>/jobs/**/__tests__/**/*.test.ts'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  collectCoverageFrom: ['jobs/**/*.ts', '!jobs/**/__tests__/**'],
};
