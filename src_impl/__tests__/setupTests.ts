import '@testing-library/jest-native/extend-expect';
import 'whatwg-fetch';

if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
  process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
}
if (!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
}
if (typeof globalThis.crypto === 'undefined') {
  const cryptoModule: { webcrypto: Crypto } = require('crypto');
  Object.defineProperty(globalThis, 'crypto', { value: cryptoModule.webcrypto });
}

type TestServer = {
  listen: (options?: { onUnhandledRequest?: 'error' | 'warn' | 'bypass' }) => void;
  resetHandlers: () => void;
  close: () => void;
};

function recordSetupFallback(error: unknown): void {
  void error;
}

let server: TestServer | null = null;
try {
  const serverModule: { server: TestServer } = require('./mocks/server');
  server = serverModule.server;
} catch (error) {
  recordSetupFallback(error);
}

beforeAll(() => server?.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server?.resetHandlers());
afterAll(() => server?.close());

const mockChain = () => ({
  duration: jest.fn(function duration(this: unknown) { return this; }),
  delay: jest.fn(function delay(this: unknown) { return this; }),
});

try {
  jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
  jest.mock('react-native/src/private/animated/NativeAnimatedHelper', () => ({}));
} catch (error) {
  recordSetupFallback(error);
}

try {
  jest.mock('react-native-reanimated', () => {
    const mockAnimated = {
      View: 'Animated.View',
      Text: 'Animated.Text',
      ScrollView: 'Animated.ScrollView',
      VirtualizedList: 'Animated.VirtualizedList',
      Image: 'Animated.Image',
      createAnimatedComponent: jest.fn((component: unknown) => component),
    };
    return {
      __esModule: true,
      default: mockAnimated,
      Easing: {
      linear: jest.fn((t: number) => t),
      ease: jest.fn((t: number) => t),
      quad: jest.fn((t: number) => t * t),
      cubic: jest.fn((t: number) => t * t * t),
      inOut: jest.fn((easing: (t: number) => number) => (t: number) => (t < 0.5 ? easing(t * 2) / 2 : (2 - easing((1 - t) * 2)) / 2)),
      out: jest.fn((easing: (t: number) => number) => (t: number) => 1 - easing(1 - t)),
      in: jest.fn((easing: (t: number) => number) => easing),
    },
    useSharedValue: jest.fn((initial: number) => ({ value: initial })),
    useAnimatedStyle: jest.fn((fn: () => unknown) => fn()),
    useReducedMotion: jest.fn(() => false),
    useAnimatedGestureHandler: jest.fn(() => ({ onStart: jest.fn(), onActive: jest.fn(), onEnd: jest.fn() })),
    withTiming: jest.fn((toValue: number) => toValue),
    withSpring: jest.fn((toValue: number) => toValue),
    withDecay: jest.fn((config: unknown) => config),
    withDelay: jest.fn((_delay: number, animation: number) => animation),
    withSequence: jest.fn((...animations: number[]) => animations[animations.length - 1]),
    withRepeat: jest.fn((animation: number) => animation),
    interpolate: jest.fn((value: number, input: number[], output: number[]) => {
      const [inMin, inMax] = [input[0], input[input.length - 1]];
      const [outMin, outMax] = [output[0], output[output.length - 1]];
      return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
    }),
    Gesture: {
      Pan: () => ({ onBegin: jest.fn(function onBegin(this: unknown) { return this; }), onStart: jest.fn(function onStart(this: unknown) { return this; }), onUpdate: jest.fn(function onUpdate(this: unknown) { return this; }), onEnd: jest.fn(function onEnd(this: unknown) { return this; }), enabled: jest.fn(function enabled(this: unknown) { return this; }) }),
      Tap: () => ({ onBegin: jest.fn(function onBegin(this: unknown) { return this; }), onEnd: jest.fn(function onEnd(this: unknown) { return this; }) }),
    },
    runOnJS: jest.fn((fn: (...args: unknown[]) => unknown) => fn),
    runOnUI: jest.fn((fn: (...args: unknown[]) => unknown) => fn),
    Animated: mockAnimated,
    createAnimatedComponent: mockAnimated.createAnimatedComponent,
    FadeIn: mockChain(), FadeOut: mockChain(), FadeInUp: mockChain(), FadeInDown: mockChain(),
    FadeInLeft: mockChain(), FadeInRight: mockChain(), FadeOutUp: mockChain(), FadeOutDown: mockChain(),
    SlideInUp: mockChain(), SlideInDown: mockChain(), SlideInLeft: mockChain(), SlideInRight: mockChain(),
    SlideOutUp: mockChain(), SlideOutDown: mockChain(), ZoomIn: mockChain(), ZoomOut: mockChain(),
    BounceIn: mockChain(), BounceOut: mockChain(), StretchInX: mockChain(), StretchOutX: mockChain(),
      LightSpeedInLeft: mockChain(), LightSpeedOutLeft: mockChain(), Layout: mockChain(),
    };
  });
} catch (error) {
  recordSetupFallback(error);
}

try {
  jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(() => Promise.resolve(null)), setItemAsync: jest.fn(() => Promise.resolve()), deleteItemAsync: jest.fn(() => Promise.resolve()) }));
  jest.mock('expo-linear-gradient', () => ({ LinearGradient: 'LinearGradient' }));
  jest.mock('@react-native-async-storage/async-storage', () => ({ setItem: jest.fn(() => Promise.resolve()), getItem: jest.fn(() => Promise.resolve(null)), removeItem: jest.fn(() => Promise.resolve()), mergeItem: jest.fn(() => Promise.resolve()), clear: jest.fn(() => Promise.resolve()), getAllKeys: jest.fn(() => Promise.resolve([])), multiGet: jest.fn(() => Promise.resolve([])), multiSet: jest.fn(() => Promise.resolve()), multiRemove: jest.fn(() => Promise.resolve()), multiMerge: jest.fn(() => Promise.resolve()) }));
  jest.mock('@react-native-community/netinfo', () => ({ addEventListener: jest.fn(() => jest.fn()), fetch: jest.fn(() => Promise.resolve({ type: 'wifi', isConnected: true, isInternetReachable: true })), useNetInfo: jest.fn(() => ({ type: 'wifi', isConnected: true, isInternetReachable: true })) }));
} catch (error) {
  recordSetupFallback(error);
}

try {
  jest.mock('@sentry/react-native', () => ({ init: jest.fn(), captureException: jest.fn(), captureMessage: jest.fn(), addBreadcrumb: jest.fn(), setUser: jest.fn(), setTag: jest.fn(), setContext: jest.fn(), withScope: jest.fn((callback: (scope: unknown) => void) => callback({})), configureScope: jest.fn(), startTransaction: jest.fn(() => ({ finish: jest.fn(), setData: jest.fn(), setStatus: jest.fn() })), getCurrentHub: jest.fn(() => ({ getClient: jest.fn(), configureScope: jest.fn() })) }));
  jest.mock('posthog-react-native', () => {
    const React = require('react');
    const client = () => ({ capture: jest.fn(), flush: jest.fn(() => Promise.resolve()), getFeatureFlag: jest.fn(), identify: jest.fn(), isFeatureEnabled: jest.fn(() => false), reset: jest.fn() });
    return { PostHog: jest.fn().mockImplementation(client), PostHogProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children), usePostHog: jest.fn(client) };
  });
  jest.mock('@react-navigation/native', () => ({ ...jest.requireActual('@react-navigation/native'), useNavigation: jest.fn(() => ({ navigate: jest.fn(), goBack: jest.fn(), reset: jest.fn(), setParams: jest.fn(), dispatch: jest.fn(), isFocused: jest.fn(() => true), canGoBack: jest.fn(() => true), getParent: jest.fn(), getState: jest.fn(() => ({ routes: [], index: 0 })) })), useRoute: jest.fn(() => ({ params: {}, name: 'TestScreen', key: 'test-key' })), useIsFocused: jest.fn(() => true) }));
} catch (error) {
  recordSetupFallback(error);
}

declare global { var __TEST__: boolean; }
global.__TEST__ = true;

const testConsole = globalThis['console'];
const originalConsoleError = testConsole.error;
const originalConsoleWarn = testConsole.warn;

testConsole.error = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && /Warning.*not wrapped in act|Native module cannot be null/.test(args[0])) return;
  originalConsoleError.call(testConsole, ...args);
};

testConsole.warn = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && /has been renamed/.test(args[0])) return;
  originalConsoleWarn.call(testConsole, ...args);
};

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllTimers();
});

expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    return {
      message: () => pass ? `expected ${received} not to be within range ${floor} - ${ceiling}` : `expected ${received} to be within range ${floor} - ${ceiling}`,
      pass,
    };
  },
});

declare module 'expect' {
  interface AsymmetricMatchers { toBeWithinRange(floor: number, ceiling: number): void; }
  interface Matchers<R> { toBeWithinRange(floor: number, ceiling: number): R; }
}
