// Metro 0.84.4 ESM/CJS interop bug: `import { createClient }` from @supabase/supabase-js
// resolves the .cjs file but Rolldown's __commonJSMin wrapper prevents named export
// extraction — createClient ends up undefined. require() returns module.exports directly.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require('@supabase/supabase-js') as typeof import('@supabase/supabase-js');
import type { SupabaseClient } from '@supabase/supabase-js';
import { CURRENT_CONFIG } from '../constants/app';
import type { Database } from '../types/supabase';
import { getSecureStorage } from '../persistence/SecureStorage';
import { createMockSupabaseClient } from './supabase-mock';
import { TEST_CONSTANTS } from '../constants/test';

const IS_JEST = Boolean(process.env.JEST_WORKER_ID);
const TEST_SUPABASE_URL = IS_JEST ? TEST_CONSTANTS.SUPABASE_URL : '';
const TEST_SUPABASE_ANON_KEY = IS_JEST ? TEST_CONSTANTS.SUPABASE_ANON_KEY : '';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || TEST_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || TEST_SUPABASE_ANON_KEY;

function createMissingSupabaseConfigError(): Error {
  return new Error(
    'Missing Supabase configuration. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY before starting the app.',
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
    console.warn('[Supabase] Jest environment detected — using mock client');
    return createMockSupabaseClient();
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw createMissingSupabaseConfigError();
  }

  try {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: secureStorageAdapter,
        autoRefreshToken: !IS_JEST,
        persistSession: !IS_JEST,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          'X-Client-Info': `vex-app/${CURRENT_CONFIG.version}`,
          'X-Platform': 'react-native',
        },
      },
    });
  } catch (error: unknown) {
    // createClient failed — Metro ESM/CJS interop or runtime initialization issue.
    // Fall back to mock to prevent a hard crash.
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : '';
    console.error(
      '[supabase] createClient failed. Falling back to mock client. Error:',
      message,
      '\nStack:',
      stack,
    );
    return createMockSupabaseClient();
  }
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
    return typeof value === 'function' ? value.bind(client) : value;
  },
};

// safe-cast: target is never read; every access is forwarded to the real
// client via the Proxy. The empty object only satisfies the Proxy<T> target.
export const supabase = new Proxy({} as SupabaseClient, lazySupabaseHandler);

export function handleSupabaseError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  if (error !== null && typeof error === 'object') {
    const err = error as { message?: string; code?: string; [key: string]: unknown };
    const msg = typeof err.message === 'string' ? err.message : undefined;
    const code = typeof err.code === 'string' ? err.code : undefined;
    return new Error(msg || `Supabase error: ${code ?? 'unknown'}`);
  }

  return new Error('Unknown Supabase error');
}

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export type { Database };
