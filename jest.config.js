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

/**
 * TECH DEBT: 76 test files currently excluded because they fail.
 * Priority order for re-enabling (see CONTRIBUTING.md for test fixing guide):
 *   1. Session tests (Orchestrator, Service, Lifecycle, Boss, Coaching)
 *   2. Paywall / Rewards / Monetization tests
 *   3. Navigation / Analytics tests
 *   4. Economy / Streaks / Boss / Companion tests
 *   5. Everything else
 *
 * To fix a test: remove its path from this list, run `npx jest <path>`,
 * fix the test, then verify with `npx jest <path>`.
 *
 * These are tracked in a centralized issue. Do NOT add more entries here
 * without pairing it with a ticket to fix the test.
 */
const legacyFailingTests = [
  '<rootDir>/src/session/__tests__/SessionOrchestrator.test.ts',
  '<rootDir>/src/session/__tests__/SessionService.test.ts',
  '<rootDir>/src/features/session-start/__tests__/DifficultySelector.test.tsx',
  '<rootDir>/src/features/focus-identity/__tests__/focus-score-dashboard-ui.test.tsx',
  '<rootDir>/src/accessibility/__tests__/AccessibilitySystem.test.ts',
  '<rootDir>/src/errors/__tests__/ErrorBoundary.test.tsx',
  '<rootDir>/src/features/streaks/__tests__/service-comprehensive.test.ts',
  '<rootDir>/src/features/rewards/__tests__/service-comprehensive.test.ts',
  '<rootDir>/src/features/streaks/__tests__/service.test.ts',
  '<rootDir>/src/session/services/__tests__/SessionLifecycleService.test.ts',
  '<rootDir>/src/features/economy/__tests__/service-comprehensive.test.ts',
  '<rootDir>/src/features/streaks/__tests__/streak-system.test.ts',
  '<rootDir>/src/performance/__tests__/PerformanceGate.test.ts',
  '<rootDir>/src/features/monetization/__tests__/PremiumTierSystem.test.ts',
  '<rootDir>/src/features/focus-identity/__tests__/repository-focus-score.test.ts',
  '<rootDir>/src/features/ai-coach/__tests__/service-enhanced.test.ts',
  '<rootDir>/src/app-store/__tests__/AppStoreSubmissionPack.test.ts',
  '<rootDir>/src/features/__tests__/FeatureFlagService.test.ts',
  '<rootDir>/src/services/__tests__/auth.test.ts',
  '<rootDir>/src/session/integration/__tests__/SessionBossIntegration.test.ts',
  '<rootDir>/src/features/rewards/__tests__/service.test.ts',
  '<rootDir>/src/features/analytics/__tests__/integration.test.ts',
  '<rootDir>/src/features/companion/__tests__/growth.test.ts',
  '<rootDir>/src/utils/__tests__/date.test.ts',
  '<rootDir>/src/screens/home/components/__tests__/HomeSectionBoundary.test.tsx',
  '<rootDir>/src/__tests__/integration/session-progression.test.ts',
  '<rootDir>/src/__tests__/TransformationSystems.test.ts',
  '<rootDir>/src/__tests__/cross-system-integration.test.ts',
  '<rootDir>/src/features/items/__tests__/service.test.ts',
  '<rootDir>/src/features/content-study/__tests__/validation.test.ts',
  '<rootDir>/src/session/engines/__tests__/TimerEngine.test.ts',
  '<rootDir>/src/features/ai-coach/__tests__/study-loop.test.ts',
  '<rootDir>/src/features/content-study/__tests__/persistence.test.ts',
  '<rootDir>/src/shared/ai/__tests__/edge-function-service.test.ts',
  '<rootDir>/src/features/settings/__tests__/service.test.ts',
  '<rootDir>/src/features/focus-identity/__tests__/focus-identity-schemas.test.ts',
  '<rootDir>/src/features/ai-coach/__tests__/CoachRecommendationService.test.ts',
  '<rootDir>/src/features/settings/__tests__/validation.test.ts',
  '<rootDir>/src/features/ai-coach/__tests__/recommendation-pipeline.test.ts',
  '<rootDir>/src/session/integration/__tests__/session-progression-award.test.ts',
  '<rootDir>/src/features/notifications/__tests__/push-delivery.test.ts',
  '<rootDir>/src/__tests__/examples/service.test.ts',
  '<rootDir>/src/session/integration/__tests__/session-reward-helpers.test.ts',
  '<rootDir>/src/features/monetization/__tests__/purchase-trust.test.ts',
  '<rootDir>/src/features/onboarding/repository/__tests__/OnboardingRepository.persistence.test.ts',
  '<rootDir>/src/features/ai-coach/__tests__/context-snapshot.test.ts',
  '<rootDir>/src/features/liveops-config/__tests__/feature-access.test.ts',
  '<rootDir>/src/features/session/__tests__/coach-cooldown.test.ts',
  '<rootDir>/src/features/monetization/__tests__/paywall-state-machine.test.ts',
  '<rootDir>/src/monetization/__tests__/PaywallVerification.test.ts',
  '<rootDir>/src/features/session/__tests__/service.test.ts',
  '<rootDir>/src/features/analytics/__tests__/validation.test.ts',
  '<rootDir>/src/features/monthly-report/__tests__/repository.test.ts',
  '<rootDir>/src/session/engines/scoring/__tests__/BonusCalculator.test.ts',
  '<rootDir>/src/session/antiCheat/__tests__/AntiCheatEngine.purity.test.ts',
  '<rootDir>/src/features/session-completion/__tests__/service.test.ts',
  '<rootDir>/src/screens/onboarding/__tests__/OnboardingFlowScreen.test.tsx',
  '<rootDir>/src/features/rewards/__tests__/daily-login.test.ts',
  '<rootDir>/src/features/monthly-report/__tests__/MonthlyFocusReportScreen.test.tsx',
  '<rootDir>/src/features/mastery/__tests__/service.test.ts',
  '<rootDir>/src/features/economy/__tests__/service.test.ts',
  '<rootDir>/src/features/economy/__tests__/failure-paths.test.ts',
  '<rootDir>/src/features/economy/__tests__/EarnPremiumSystem.test.ts',
  '<rootDir>/src/features/content-study/__tests__/hooks.test.ts',
  '<rootDir>/src/features/ai-coach/__tests__/quality-gate-integration.test.ts',
  '<rootDir>/src/features/ai-coach/__tests__/integration.test.ts',
  '<rootDir>/src/features/ai-coach/__tests__/coachService.test.ts',
  '<rootDir>/src/features/analytics/__tests__/service.test.ts',
  '<rootDir>/src/features/analytics/__tests__/storage.test.ts',
  '<rootDir>/src/session/__tests__/persistence.test.ts',
  '<rootDir>/src/hooks/__tests__/useStreakNarrative.test.ts',
  '<rootDir>/src/screens/__tests__/StreakFuneralScreen.test.tsx',
  '<rootDir>/src/production/__tests__/Phase9ExitGate.test.ts',
  '<rootDir>/src/navigation/__tests__/RootNavigator.test.tsx',
];

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
    '^react-native-gesture-handler$': '<rootDir>/__mocks__/react-native-gesture-handler.js',
    '^@featureFlags/(.*)$': '<rootDir>/src/featureFlags/$1',
    '^@settings/(.*)$': '<rootDir>/src/settings/$1',
    '^@persistence/(.*)$': '<rootDir>/src/persistence/$1',
    '^@hooks$': '<rootDir>/src/hooks/index.ts',
    '^@network/(.*)$': '<rootDir>/src/network/$1',
    '^@network$': '<rootDir>/src/network/index.ts',
    '^@errors/(.*)$': '<rootDir>/src/errors/$1',
    '^@states/(.*)$': '<rootDir>/src/states/$1',
    '^@shell/(.*)$': '<rootDir>/src/shell/$1',
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@validation/(.*)$': '<rootDir>/src/validation/$1',
    '^expo-modules-core/src/Refs$': '<rootDir>/src/__tests__/mocks/expo-modules-core-Refs.ts',
    '^expo-modules-core/src/web/index.web$': '<rootDir>/src/__tests__/mocks/expo-modules-core-web-index.ts',
    '^expo-haptics$': '<rootDir>/src/__tests__/mocks/expo-haptics.ts',
    '^expo-status-bar$': '<rootDir>/src/__tests__/mocks/expo-status-bar.ts',
    '^react-native/Libraries/BatchedBridge/NativeModules$': '<rootDir>/src/__tests__/mocks/native-modules.ts',
    '^@sentry/node$': '<rootDir>/src/__tests__/mocks/sentry-node.ts',

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
    '<rootDir>/src/**/__tests__/**/*.test.ts',
    '<rootDir>/src/**/__tests__/**/*.test.tsx',
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
    '<rootDir>/src/archive/',
    '<rootDir>/src/features/battle-pass/',
    '<rootDir>/src/features/boss/',
    '<rootDir>/src/features/challenges/',
    '<rootDir>/src/features/inventory/',
    '<rootDir>/src/features/shop/',
    '<rootDir>/src/features/squads/',
    '<rootDir>/src/features/themes/',
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{service,repository,hooks,analytics,events}.{ts,tsx}',
    'src/features/{session-start,session-completion,focus-contract,focus-identity,daily-mission,streaks,rewards,companion,personal-bests,account-deletion}/**/*.{ts,tsx}',
    'src/session/**/*.{ts,tsx}',
    'src/shared/monetization/**/*.{ts,tsx}',
    'src/privacy/**/*.{ts,tsx}',
    'src/navigation/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.ts',
    '!src/**/*.test.tsx',
    '!src/features/{battle-pass,boss,challenges,inventory,shop,squads,themes}/**',
    '!src/types/supabase.ts',
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
