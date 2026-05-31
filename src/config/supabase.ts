import { createClient, AuthError, type SupabaseClient } from "@supabase/supabase-js";
import { CURRENT_CONFIG } from "../constants/app";
import type { Database } from "../types/supabase";
import { createDebugger } from "../utils/debug";
import { getSecureStorage } from "../persistence/SecureStorage";

const debug = createDebugger("config:supabase");

function createMockSupabaseClient(): SupabaseClient {
  const err = new Error(
    "Supabase not configured. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your environment.",
  );

  const authErr = new AuthError(err.message, 500, "mock_error");

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

  // TODO(safe-cast): Partial mock — SupabaseClient has hundreds of methods.
  // Proper fix: use a branded mock type that satisfies the methods actually
  // called in test paths, or use a full mock library (e.g. msw).
  return mockClient as unknown as SupabaseClient;
}

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

let supabaseClient: SupabaseClient | null = null;

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

/**
 * Lazily-resolved Supabase client. Importing this module must NOT construct the
 * client — construction throws on missing config, which would crash before any
 * error boundary mounts. Access is forwarded to {@link getSupabaseClient} so the
 * real client is built on first use and `resetSupabaseClient()` is respected.
 */
const lazySupabaseHandler: ProxyHandler<SupabaseClient> = {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = Reflect.get(client, prop);
    return typeof value === "function" ? value.bind(client) : value;
  },
};

// safe-cast: target is never read; every access is forwarded to the real
// client via the Proxy. The empty object only satisfies the Proxy<T> target.
export const supabase = new Proxy({} as SupabaseClient, lazySupabaseHandler);

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

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export type { Database };
