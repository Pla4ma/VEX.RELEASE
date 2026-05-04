/**
 * Jest Setup Tests
 *
 * Global test configuration and mocks for Jest + Expo SDK 54 + TypeScript
 *
 * Includes:
 * - Testing Library setup with jest-native matchers
 * - React Native mocks
 * - Reanimated mock for animations
 * - MSW server setup for API mocking
 * - Expo modules mocks
 * - Global test utilities
 */

import '@testing-library/jest-native/extend-expect';
import 'whatwg-fetch';

if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
  process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
}
if (!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
}

function recordSetupFallback(error: unknown): void {
  void error;
}

// ============================================================================
// MSW Setup
// ============================================================================

let server:
  | {
      listen: (options?: { onUnhandledRequest?: 'error' | 'warn' | 'bypass' }) => void;
      resetHandlers: () => void;
      close: () => void;
    }
  | null = null;

try {
  ({ server } = require('./mocks/server'));
} catch (error) { recordSetupFallback(error);
  server = null;
}

// Start MSW server before all tests
beforeAll(() => server?.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => server?.resetHandlers());

// Close server after all tests
afterAll(() => server?.close());

// ============================================================================
// React Native Mocks
// ============================================================================

// Mock react-native modules that don't work in Node environment
try {
  jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
  jest.mock('react-native/src/private/animated/NativeAnimatedHelper', () => ({}));
} catch (error) { recordSetupFallback(error);
  // Module not available in node environment
}

// jest-expo already installs the React Native test environment.

// ============================================================================
// Reanimated Mock
// ============================================================================

try {
  jest.mock('react-native-reanimated', () => {
    // Extend the mock with additional methods used in the app
    return {
      // Easing functions
      Easing: {
        linear: jest.fn((t: number) => t),
        ease: jest.fn((t: number) => t),
        quad: jest.fn((t: number) => t * t),
        cubic: jest.fn((t: number) => t * t * t),
        inOut: jest.fn((easing: (t: number) => number) => (t: number) => {
          if (t < 0.5) {
            return easing(t * 2) / 2;
          }
          return (2 - easing((1 - t) * 2)) / 2;
        }),
        out: jest.fn((easing: (t: number) => number) => (t: number) => 1 - easing(1 - t)),
        in: jest.fn((easing: (t: number) => number) => easing),
        bounce: jest.fn((t: number) => {
          if (t < 1 / 2.75) {
            return 7.5625 * t * t;
          } else if (t < 2 / 2.75) {
            return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
          } else if (t < 2.5 / 2.75) {
            return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
          }
          return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }),
        elastic: jest.fn((t: number) => {
          if (t === 0 || t === 1) {return t;}
          return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
        }),
      },

      // Animation hooks
      useSharedValue: jest.fn((initial: number) => ({ value: initial })),
      useAnimatedStyle: jest.fn((fn: () => unknown) => fn()),
      useAnimatedGestureHandler: jest.fn(() => ({
        onStart: jest.fn(),
        onActive: jest.fn(),
        onEnd: jest.fn(),
      })),

      // Animation functions
      withTiming: jest.fn((toValue: number) => toValue),
      withSpring: jest.fn((toValue: number) => toValue),
      withDecay: jest.fn((config: unknown) => config),
      withDelay: jest.fn((delay: number, animation: number) => animation),
      withSequence: jest.fn((...animations: number[]) => animations[animations.length - 1]),
      withRepeat: jest.fn((animation: number) => animation),

      // Interpolation
      interpolate: jest.fn((value: number, input: number[], output: number[]) => {
        // Simple linear interpolation
        const [inMin, inMax] = [input[0], input[input.length - 1]];
        const [outMin, outMax] = [output[0], output[output.length - 1]];
        const t = (value - inMin) / (inMax - inMin);
        return outMin + t * (outMax - outMin);
      }),

      // Gesture handler
      Gesture: {
        Pan: () => ({
          onBegin: jest.fn(function(this: unknown) { return this; }),
          onStart: jest.fn(function(this: unknown) { return this; }),
          onUpdate: jest.fn(function(this: unknown) { return this; }),
          onEnd: jest.fn(function(this: unknown) { return this; }),
          enabled: jest.fn(function(this: unknown) { return this; }),
        }),
        Tap: () => ({
          onBegin: jest.fn(function(this: unknown) { return this; }),
          onEnd: jest.fn(function(this: unknown) { return this; }),
        }),
      },

      // Worklets
      runOnJS: jest.fn((fn: (...args: unknown[]) => unknown) => fn),
      runOnUI: jest.fn((fn: (...args: unknown[]) => unknown) => fn),

      // Components
      Animated: {
        View: 'Animated.View',
        Text: 'Animated.Text',
        ScrollView: 'Animated.ScrollView',
        FlatList: 'Animated.FlatList',
        Image: 'Animated.Image',
      },
      createAnimatedComponent: jest.fn((component: unknown) => component),
    };
  });
} catch (error) { recordSetupFallback(error);
  // reanimated not available in node environment
}

// ============================================================================
// Expo Modules Mocks
// ============================================================================

try {
  jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(() => Promise.resolve(null)),
    setItemAsync: jest.fn(() => Promise.resolve()),
    deleteItemAsync: jest.fn(() => Promise.resolve()),
  }));
} catch (error) { recordSetupFallback(error);
  // expo-secure-store not available
}

try {
  jest.mock('expo-linear-gradient', () => ({
    LinearGradient: 'LinearGradient',
  }));
} catch (error) { recordSetupFallback(error);
  // expo-linear-gradient not available
}

try {
  jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
    mergeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
    multiMerge: jest.fn(() => Promise.resolve()),
  }));
} catch (error) { recordSetupFallback(error);
  // async-storage not available
}

try {
  jest.mock('@react-native-community/netinfo', () => ({
    addEventListener: jest.fn(() => jest.fn()),
    fetch: jest.fn(() => Promise.resolve({
      type: 'wifi',
      isConnected: true,
      isInternetReachable: true,
    })),
    useNetInfo: jest.fn(() => ({
      type: 'wifi',
      isConnected: true,
      isInternetReachable: true,
    })),
  }));
} catch (error) { recordSetupFallback(error);
  // netinfo not available
}

// ============================================================================
// Sentry Mock
// ============================================================================

try {
  jest.mock('@sentry/react-native', () => ({
    init: jest.fn(),
    captureException: jest.fn(),
    captureMessage: jest.fn(),
    addBreadcrumb: jest.fn(),
    setUser: jest.fn(),
    setTag: jest.fn(),
    setContext: jest.fn(),
    withScope: jest.fn((callback: (scope: unknown) => void) => callback({})),
    configureScope: jest.fn(),
    startTransaction: jest.fn(() => ({
      finish: jest.fn(),
      setData: jest.fn(),
      setStatus: jest.fn(),
    })),
    getCurrentHub: jest.fn(() => ({
      getClient: jest.fn(),
      configureScope: jest.fn(),
    })),
  }));
} catch (error) { recordSetupFallback(error);
  // sentry not available
}

try {
  jest.mock('posthog-react-native', () => {
    const React = require('react');

    return {
      PostHog: jest.fn().mockImplementation(() => ({
        capture: jest.fn(),
        flush: jest.fn(() => Promise.resolve()),
        getFeatureFlag: jest.fn(),
        identify: jest.fn(),
        isFeatureEnabled: jest.fn(() => false),
        reset: jest.fn(),
      })),
      PostHogProvider: ({ children }: { children: React.ReactNode }) =>
        React.createElement(React.Fragment, null, children),
      usePostHog: jest.fn(() => ({
        capture: jest.fn(),
        flush: jest.fn(() => Promise.resolve()),
        identify: jest.fn(),
        reset: jest.fn(),
      })),
    };
  });
} catch (error) { recordSetupFallback(error);
  // posthog not available
}

// ============================================================================
// React Navigation Mocks
// ============================================================================

try {
  jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: jest.fn(() => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      reset: jest.fn(),
      setParams: jest.fn(),
      dispatch: jest.fn(),
      isFocused: jest.fn(() => true),
      canGoBack: jest.fn(() => true),
      getParent: jest.fn(),
      getState: jest.fn(() => ({ routes: [], index: 0 })),
    })),
    useRoute: jest.fn(() => ({
      params: {},
      name: 'TestScreen',
      key: 'test-key',
    })),
    useIsFocused: jest.fn(() => true),
  }));
} catch (error) { recordSetupFallback(error);
  // react-navigation not available
}

// ============================================================================
// Zustand Store Mock Helper
// ============================================================================

// Helper to reset Zustand stores between tests
const resetZustandStores = () => {
  // Reset any global store state here if needed.
};

// ============================================================================
// Global Test Utilities
// ============================================================================

// Global test flag
declare global {
  var __TEST__: boolean;
}

global.__TEST__ = true;

// Suppress specific console warnings during tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args: unknown[]) => {
  // Suppress React act() warnings
  if (typeof args[0] === 'string' && /Warning.*not wrapped in act/.test(args[0])) {
    return;
  }
  // Suppress native module warnings
  if (typeof args[0] === 'string' && /Native module cannot be null/.test(args[0])) {
    return;
  }
  originalConsoleError.call(console, ...args);
};

console.warn = (...args: unknown[]) => {
  // Suppress specific warnings
  if (typeof args[0] === 'string' && /has been renamed/.test(args[0])) {
    return;
  }
  originalConsoleWarn.call(console, ...args);
};

// ============================================================================
// Test Lifecycle Hooks
// ============================================================================

beforeEach(() => {
  // Reset Zustand stores
  resetZustandStores();

  // Clear all mocks
  jest.clearAllMocks();
});

afterEach(() => {
  // Cleanup any pending timers
  jest.clearAllTimers();
});

// ============================================================================
// Custom Matchers (if needed beyond jest-native)
// ============================================================================

// Add custom matchers here if needed
expect.extend({
  // Example custom matcher
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    }
    return {
      message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
      pass: false,
    };
  },
});

// Extend Jest matchers type
declare module 'expect' {
  interface AsymmetricMatchers {
    toBeWithinRange(floor: number, ceiling: number): void;
  }
  interface Matchers<R> {
    toBeWithinRange(floor: number, ceiling: number): R;
  }
}
