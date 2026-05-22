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

const legacyFailingTests = require('./jest.legacy-failing-tests');

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
    '^@theme/(.*)$': '<rootDir>/src_impl/theme/$1',
    '^@components/(.*)$': '<rootDir>/src_impl/components/$1',
    '^@navigation/(.*)$': '<rootDir>/src_impl/navigation/$1',
    '^@store/(.*)$': '<rootDir>/src_impl/store/$1',
    '^@utils/(.*)$': '<rootDir>/src_impl/utils/$1',
    '^@types/(.*)$': '<rootDir>/src_impl/types/$1',
    '^@constants/(.*)$': '<rootDir>/src_impl/constants/$1',
    '^@overlays/(.*)$': '<rootDir>/src_impl/overlays/$1',
    '^@animation/(.*)$': '<rootDir>/src_impl/animation/$1',
    '^@icons/(.*)$': '<rootDir>/src_impl/icons/$1',
    '^@a11y/(.*)$': '<rootDir>/src_impl/a11y/$1',
    '^@events/(.*)$': '<rootDir>/src_impl/events/$1',
    '^@analytics/(.*)$': '<rootDir>/src_impl/analytics/$1',
    '^react-native-gesture-handler$': '<rootDir>/__mocks__/react-native-gesture-handler.js',
    '^@featureFlags/(.*)$': '<rootDir>/src_impl/featureFlags/$1',
    '^@settings/(.*)$': '<rootDir>/src_impl/settings/$1',
    '^@persistence/(.*)$': '<rootDir>/src_impl/persistence/$1',
    '^@hooks$': '<rootDir>/src/hooks/index.ts',
    '^@network/(.*)$': '<rootDir>/src_impl/network/$1',
    '^@network$': '<rootDir>/src_impl/network/index.ts',
    '^@errors/(.*)$': '<rootDir>/src_impl/errors/$1',
    '^@states/(.*)$': '<rootDir>/src_impl/states/$1',
    '^@shell/(.*)$': '<rootDir>/src_impl/shell/$1',
    '^@app/(.*)$': '<rootDir>/src_impl/app/$1',
    '^@screens/(.*)$': '<rootDir>/src_impl/screens/$1',
    '^@validation/(.*)$': '<rootDir>/src_impl/validation/$1',
    '^expo-modules-core/src/Refs$': '<rootDir>/src/__tests__/mocks/expo-modules-core-Refs.ts',
    '^expo-modules-core/src/web/index.web$': '<rootDir>/src/__tests__/mocks/expo-modules-core-web-index.ts',
    '^expo-haptics$': '<rootDir>/src/__tests__/mocks/expo-haptics.ts',
    '^expo-status-bar$': '<rootDir>/src/__tests__/mocks/expo-status-bar.ts',
    '^react-native/Libraries/BatchedBridge/NativeModules$': '<rootDir>/src/__tests__/mocks/native-modules.ts',
    '^@sentry/node$': '<rootDir>/src/__tests__/mocks/sentry-node.ts',
    '^vitest$': '<rootDir>/src/__tests__/mocks/vitest.ts',
  },
  
  // Setup files to run before tests
  setupFilesAfterEnv: [
    '<rootDir>/src_impl/__tests__/setupTests.ts',
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
    '<rootDir>/src_impl/**/__tests__/**/*.test.ts',
    '<rootDir>/src_impl/**/__tests__/**/*.test.tsx',
    '<rootDir>/src/app_root/**/__tests__/**/*.test.ts',
    '<rootDir>/src/app_root/**/__tests__/**/*.test.tsx',
  ],

  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/archive/',
    '<rootDir>/jobs/',
    '<rootDir>/e2e/',
    '<rootDir>/tmp/',
    '<rootDir>/coverage/',
    ...legacyFailingTests,
    '<rootDir>/src_impl/archive/',
    '<rootDir>/src_impl/features/battle-pass/',
    '<rootDir>/src_impl/features/boss/',
    '<rootDir>/src_impl/features/challenges/',
    '<rootDir>/src_impl/features/inventory/',
    '<rootDir>/src_impl/features/shop/',
    '<rootDir>/src_impl/features/squads/',
    '<rootDir>/src_impl/features/themes/',
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src_impl/**/*.{service,repository,hooks,analytics,events}.{ts,tsx}',
    'src_impl/features/{session-start,session-completion,focus-contract,focus-identity,daily-mission,streaks,rewards,companion,personal-bests,account-deletion}/**/*.{ts,tsx}',
    'src_impl/session/**/*.{ts,tsx}',
    'src_impl/shared/monetization/**/*.{ts,tsx}',
    'src_impl/privacy/**/*.{ts,tsx}',
    'src_impl/navigation/**/*.{ts,tsx}',
    '!src_impl/**/*.d.ts',
    '!src_impl/**/__tests__/**',
    '!src_impl/**/*.test.ts',
    '!src_impl/**/*.test.tsx',
    '!src_impl/features/{battle-pass,boss,challenges,inventory,shop,squads,themes}/**',
    '!src_impl/types/supabase.ts',
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
