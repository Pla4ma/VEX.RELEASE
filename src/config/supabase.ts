/**
 * Supabase Configuration
 *
 * Backend client and configuration for Supabase.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { CURRENT_CONFIG } from "../constants/app";
import type { Database } from "../types/supabase";
import { createDebugger } from "../utils/debug";
import { getSecureStorage } from "../persistence/SecureStorage";

const debug = createDebugger("config:supabase");

/**
 * Create mock Supabase client for missing credentials
 */
function createMockSupabaseClient(): SupabaseClient {
  const err = new Error(
    "Supabase not configured. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your environment.",
  );

  const authErr = {
    message: err.message,
    code: "mock_error",
    status: 500,
    __isAuthError: true,
    name: "AuthError",
    toJSON: (): object => ({}),
  } as unknown as import("@supabase/supabase-js").AuthError;

  const mockClient = {
    auth: {
      signUp: async () => ({
        data: { user: null, session: null },
        error: authErr,
      }),
      signInWithPassword: async () => ({
        data: { user: null, session: null },
        error: authErr,
      }),
      signOut: async () => ({ error: authErr }),
      getSession: async () => ({
        data: { session: null },
        error: authErr,
      }),
      getUser: async () => ({
        data: { user: null },
        error: authErr,
      }),
      resetPasswordForEmail: async () => ({
        data: null,
        error: authErr,
      }),
      updateUser: async () => ({
        data: { user: null },
        error: authErr,
      }),
      onAuthStateChange: () => ({
        data: {
          subscription: {
            id: "mock-sub",
            callback: () => {},
            unsubscribe: () => {},
          },
        },
      }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            data: [] as never[],
            error: null,
          }),
        }),
      }),
    }),
  };

  // Partial mock — cast at boundary, documented
  return mockClient as unknown as SupabaseClient;
}

/**
 * Supabase configuration
 */
const IS_JEST = Boolean(process.env.JEST_WORKER_ID);
const TEST_SUPABASE_URL = IS_JEST ? "https://test.supabase.co" : "";
const TEST_SUPABASE_ANON_KEY = IS_JEST ? "test-anon-key" : "";
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || TEST_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || TEST_SUPABASE_ANON_KEY;

function createMissingSupabaseConfigError(): Error {
  return new Error(
    "Missing Supabase configuration. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY before starting the app.",
  );
}

/** Static storage adapter — no dynamic import on every auth operation */
const secureStorageAdapter = {
  getItem: (key: string): Promise<string | null> =>
    getSecureStorage().getItem(key).then((v) => v ?? null),
  setItem: (key: string, value: string): Promise<void> =>
    getSecureStorage().setItem(key, value),
  removeItem: (key: string): Promise<void> =>
    getSecureStorage().removeItem(key),
};

/**
 * Create Supabase client
 */
function createSupabaseClient(): SupabaseClient {
  if (IS_JEST) {
    debug.warn("[Supabase] Jest environment detected — using mock client");
    return createMockSupabaseClient();
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw createMissingSupabaseConfigError();
  }

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: secureStorageAdapter,
      autoRefreshToken: !IS_JEST,
      persistSession: !IS_JEST,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        "X-Client-Info": `vex-app/${CURRENT_CONFIG.version}`,
        "X-Platform": "react-native",
      },
    },
  });
}

/**
 * Supabase client singleton
 */
let supabaseClient: SupabaseClient | null = null;

/**
 * Get Supabase client instance
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createSupabaseClient();
  }
  return supabaseClient;
}

/**
 * Reset Supabase client (for testing or auth changes)
 */
export function resetSupabaseClient(): void {
  supabaseClient = null;
}

export const supabase = getSupabaseClient();

/**
 * Supabase error handler
 */
export function handleSupabaseError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  if (error !== null && typeof error === "object") {
    const err = error as Record<string, unknown>;
    const msg = typeof err.message === "string" ? err.message : undefined;
    const code = typeof err.code === "string" ? err.code : undefined;
    return new Error(msg || `Supabase error: ${code ?? "unknown"}`);
  }

  return new Error("Unknown Supabase error");
}

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export type { Database };
