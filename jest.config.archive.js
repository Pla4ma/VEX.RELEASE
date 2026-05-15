const appConfig = require('./jest.config');

module.exports = {
  ...appConfig,
  testMatch: ['<rootDir>/archive/**/__tests__/**/*.test.ts'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  collectCoverageFrom: ['archive/**/*.ts', '!archive/**/__tests__/**'],
};
