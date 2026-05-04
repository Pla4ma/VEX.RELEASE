/**
 * Simple Jest Configuration
 * 
 * For running tests without React Native / Expo dependencies
 * Useful for pure logic/schema testing
 */

module.exports = {
  preset: 'jest-expo',
  
  testEnvironment: 'node',
  
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  setupFilesAfterEnv: [
    '<rootDir>/src/__tests__/setupTests-simple.ts',
  ],
  
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  
  transformIgnorePatterns: [
    'node_modules/(?!((react-native|@react-native|@react-navigation|@tanstack)/))',
  ],
  
  testMatch: [
    '**/__tests__/**/*.test.ts',
  ],
  
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/examples/component.test.tsx',
    '/__tests__/examples/service.test.ts',
  ],
  
  clearMocks: true,
  restoreMocks: true,
  verbose: true,
};
