/**
 * Jest test environment setup
 *
 * Entry point for setupFilesAfterEnv. Imports all mock registrations
 * and lifecycle helpers from extracted modules.
 */

import '@testing-library/jest-native/extend-expect';
import 'whatwg-fetch';

// ── Environment variables ──────────────────────────────────────────

if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
  process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
}
if (!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
}
if (typeof globalThis.crypto === 'undefined') {
  const cryptoModule: { webcrypto: Crypto } = require('crypto');
  Object.defineProperty(globalThis, 'crypto', {
    value: cryptoModule.webcrypto,
  });
}

// ── MSW Server lifecycle ───────────────────────────────────────────

type TestServer = {
  listen: (options?: {
    onUnhandledRequest?: 'error' | 'warn' | 'bypass';
  }) => void;
  resetHandlers: () => void;
  close: () => void;
};

let server: TestServer | null = null;
try {
  const serverModule: { server: TestServer } = require('./mocks/server');
  server = serverModule.server;
} catch (error) {
  error;
}

beforeAll(() => server?.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server?.resetHandlers());
afterAll(() => server?.close());

// ── Mock registrations (extracted modules) ─────────────────────────

import './mocks/native-animated-helper-setup';
import './mocks/reanimated';
import './mocks/expo-third-party';
import './mocks/analytics-navigation';

/**
 * Theme mock for tests with reduced-motion + border.DEFAULT support.
 * Matches the current tokens shape and satisfies screens/components importing from @/theme.
 */
jest.mock('@/theme', () => {
  const colors = {
    background: { primary: '#fff', secondary: '#f5f5f5', tertiary: '#efefef' },
    text: { primary: '#111', secondary: '#555', disabled: '#999', dark: '#0A0A0A' },
    border: { DEFAULT: '#333333', light: '#444444', heavy: '#222222' },
    overlay: { modal: 'rgba(0,0,0,0.5)' },
  };
  return {
    __esModule: true,
    useTheme: () => ({
      colors,
      spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
      borderRadius: { sm: 4, md: 8, lg: 12, xl: 16 },
      typography: {
        h1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
        body: { fontSize: 16, fontWeight: '400', lineHeight: 22 },
      },
      motion: {
        reducedMotion: false,
        duration: { fast: 120, normal: 200, slow: 320 },
      },
    }),
    createTheme: () => ({ colors, spacing: {}, borderRadius: {}, typography: {}, motion: {} }),
    ReduceMotion: { System: 'system', Always: 'always', Never: 'never', muted: 'muted' },
    useReducedMotion: () => false,
  };
});

// ── Console suppression, lifecycle hooks, custom matchers ───────────

import './setup/testLifecycle';
