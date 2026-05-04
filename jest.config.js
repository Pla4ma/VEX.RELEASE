/**
 * Jest Configuration for VEX App
 * 
 * Expo SDK 54 + React Native + TypeScript Testing Setup
 * 
 * Features:
 * - react-native preset for Expo SDK 54 compatibility
 * - TypeScript support via ts-jest
 * - Testing Library setup with custom matchers
 * - MSW for API mocking
 * - Reanimated mock for animation testing
 * - Module resolution matching babel.config.js
 */

module.exports = {
  // Use jest-expo preset for Expo SDK 54 compatibility
  preset: 'jest-expo',
  
  // Environment setup
  testEnvironment: 'node',
  
  // File extensions to consider
  moduleFileExtensions: [
    'mjs',
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node',
  ],
  
  // Module name mapper for path aliases (must match babel.config.js)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@theme/(.*)$': '<rootDir>/src/theme/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@navigation/(.*)$': '<rootDir>/src/navigation/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@overlays/(.*)$': '<rootDir>/src/overlays/$1',
    '^@animation/(.*)$': '<rootDir>/src/animation/$1',
    '^@icons/(.*)$': '<rootDir>/src/icons/$1',
    '^@a11y/(.*)$': '<rootDir>/src/a11y/$1',
    '^@events/(.*)$': '<rootDir>/src/events/$1',
    '^@analytics/(.*)$': '<rootDir>/src/analytics/$1',
    '^@featureFlags/(.*)$': '<rootDir>/src/featureFlags/$1',
    '^@settings/(.*)$': '<rootDir>/src/settings/$1',
    '^@persistence/(.*)$': '<rootDir>/src/persistence/$1',
    '^@network/(.*)$': '<rootDir>/src/network/$1',
    '^@errors/(.*)$': '<rootDir>/src/errors/$1',
    '^@states/(.*)$': '<rootDir>/src/states/$1',
    '^@shell/(.*)$': '<rootDir>/src/shell/$1',
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@validation/(.*)$': '<rootDir>/src/validation/$1',
    '^expo-modules-core/src/Refs$': '<rootDir>/src/__tests__/mocks/expo-modules-core-Refs.ts',
    '^expo-modules-core/src/web/index.web$': '<rootDir>/src/__tests__/mocks/expo-modules-core-web-index.ts',
    '^react-native/Libraries/BatchedBridge/NativeModules$': '<rootDir>/src/__tests__/mocks/native-modules.ts',
    '^@sentry/node$': '<rootDir>/src/__tests__/mocks/sentry-node.ts',
    '^vitest$': '<rootDir>/src/__tests__/mocks/vitest.ts',
  },
  
  // Setup files to run before tests
  setupFilesAfterEnv: [
    '<rootDir>/src/__tests__/setupTests.ts',
  ],
  
  // Transform configuration for TypeScript
  transform: {
    '^.+\\.(mjs|js|jsx|ts|tsx)$': 'babel-jest',
  },
  
  // Transform ignore patterns - include all React Native and Expo modules
  transformIgnorePatterns: [
    'node_modules/(?!((react-native|@react-native|@react-navigation|@gorhom|react-native-reanimated|react-native-gesture-handler|react-native-svg|styled-components|@tanstack|expo|expo-modules-core|@expo|msw|@mswjs|@open-draft|rettime|until-async|headers-polyfill|outvariant|strict-event-emitter|is-node-process|graphql)/))',
  ],
  
  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
    '**/?(*.)+(spec|test).ts',
    '**/?(*.)+(spec|test).tsx',
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__tests__/**',
    '!src/**/__tests__/**',
    '!src/**/*.test.ts',
    '!src/**/*.test.tsx',
  ],
  
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
    '/__mocks__/',
  ],
  
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Module directories
  moduleDirectories: ['node_modules', 'src'],
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Fail tests on console errors (optional, can be disabled)
  // errorOnDeprecated: true,
  
  // Verbose output for debugging
  verbose: true,
  
  // Timeout for tests
  testTimeout: 10000,
  
  // Globals (if needed for legacy packages)
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react-jsx',
      },
    },
  },
};
