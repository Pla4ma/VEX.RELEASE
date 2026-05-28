/**
 * Jest test environment setup
 *
 * Entry point for setupFilesAfterEnv. Imports all mock registrations
 * and lifecycle helpers from extracted modules.
 */

import "@testing-library/jest-native/extend-expect";
import "whatwg-fetch";

// ── Environment variables ──────────────────────────────────────────

if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
  process.env.EXPO_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
}
if (!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
}
if (typeof globalThis.crypto === "undefined") {
  const cryptoModule: { webcrypto: Crypto } = require("crypto");
  Object.defineProperty(globalThis, "crypto", {
    value: cryptoModule.webcrypto,
  });
}

// ── MSW Server lifecycle ───────────────────────────────────────────

type TestServer = {
  listen: (options?: {
    onUnhandledRequest?: "error" | "warn" | "bypass";
  }) => void;
  resetHandlers: () => void;
  close: () => void;
};

let server: TestServer | null = null;
try {
  const serverModule: { server: TestServer } = require("./mocks/server");
  server = serverModule.server;
} catch (error) {
  void error;
}

beforeAll(() => server?.listen({ onUnhandledRequest: "error" }));
afterEach(() => server?.resetHandlers());
afterAll(() => server?.close());

// ── Mock registrations (extracted modules) ─────────────────────────

import "./mocks/native-animated-helper-setup";
import "./mocks/reanimated";
import "./mocks/expo-third-party";
import "./mocks/analytics-navigation";

// ── Console suppression, lifecycle hooks, custom matchers ───────────

import "./setup/testLifecycle";
