/**
 * Jest test environment setup
 *
 * Entry point for setupFilesAfterEnv. Imports all mock registrations
 * and lifecycle helpers from extracted modules.
 */
import '@testing-library/jest-native/extend-expect';
import 'whatwg-fetch';
import { TEST_CONSTANTS } from '../constants/test';

// ── Environment variables ──────────────────────────────────────────

if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
  process.env.EXPO_PUBLIC_SUPABASE_URL = TEST_CONSTANTS.SUPABASE_URL;
}
if (!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = TEST_CONSTANTS.SUPABASE_ANON_KEY;
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

jest.mock('@/theme', () => {
  const colors = {
    background: { primary: '#fff', secondary: '#f5f5f5', tertiary: '#efefef' },
    text: { primary: '#111', secondary: '#555', disabled: '#999', dark: '#0A0A0A' },
    border: { DEFAULT: '#333333', light: '#444444', heavy: '#222222' },
    overlay: { modal: 'rgba(0,0,0,0.5)' },
    success: { DEFAULT: '#22c55e', light: '#86efac' },
    error: { DEFAULT: '#ef4444', light: '#fca5a5' },
    warning: { DEFAULT: '#eab308', light: '#fde047' },
    info: { DEFAULT: '#3b82f6', light: '#93c5fd' },
  };
  const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
  const borderRadius = { sm: 4, md: 8, lg: 12, xl: 16 };
  const typography = {
    display: { large: { fontSize: 48, fontWeight: '700', lineHeight: 56 } },
    heading: { h1: { fontSize: 32, lineHeight: 40 }, h2: { fontSize: 28, lineHeight: 34 }, h3: { fontSize: 24, lineHeight: 30 }, h4: { fontSize: 20, lineHeight: 26 } },
    body: { medium: { fontSize: 16, lineHeight: 22 }, large: { fontSize: 18, lineHeight: 24 }, small: { fontSize: 14, lineHeight: 18 } },
    ui: { caption: { fontSize: 12, lineHeight: 16 }, label: { fontSize: 12, lineHeight: 16 }, button: { fontSize: 16, lineHeight: 20 } },
  };
  const fontWeights = { heavy: '700', semibold: '600', bold: '700' };
  const motion = {
    reducedMotion: false,
    duration: { fast: 120, normal: 200, slow: 320 },
  };
  const theme = { colors, spacing, borderRadius, typography, fontWeights, motion };
  const tokensShape = { theme, colors, spacing, borderRadius, typography, fontWeights, motion };
  return {
    __esModule: true,
    ...tokensShape,
    useTheme: () => tokensShape,
    createTheme: () => tokensShape,
    ReduceMotion: { System: 'system', Always: 'always', Never: 'never', muted: 'muted' },
    useReducedMotion: () => false,
  };
});

// ── Console suppression, lifecycle hooks, custom matchers ───────────

import './setup/testLifecycle';
