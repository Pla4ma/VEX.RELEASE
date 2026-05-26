/**
 * Supabase Configuration
 *
 * Backend client and configuration for Supabase.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { CURRENT_CONFIG } from '../constants/app';
import type { Database } from '../types/supabase';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('config:supabase');

/**
 * Create mock Supabase client for missing credentials
 */
function createMockSupabaseClient(): SupabaseClient {
  const error = new Error('Supabase not configured. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your environment.');

  return {
    auth: {
      signUp: async () => ({ data: { user: null }, error: { message: error.message } }),
      signInWithPassword: async () => ({ data: { user: null }, error: { message: error.message } }),
      signOut: async () => ({ error: { message: error.message } }),
      getSession: async () => ({ data: { session: null }, error: { message: error.message } }),
      getUser: async () => ({ data: { user: null }, error: { message: error.message } }),
      resetPasswordForEmail: async () => ({ error: { message: error.message } }),
      updateUser: async () => ({ error: { message: error.message } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            data: [],
            error: { message: error.message },
          }),
        }),
      }),
    }),
  // Intentionally partial mock — only runs in Jest. Doesn't implement
  // full SupabaseClient (missing supabaseUrl, storage, realtime, etc.)
  } as unknown as SupabaseClient;
}

/**
 * Supabase configuration
 */
const IS_JEST = Boolean(process.env.JEST_WORKER_ID);
const TEST_SUPABASE_URL = IS_JEST ? 'https://test.supabase.co' : '';
const TEST_SUPABASE_ANON_KEY = IS_JEST ? 'test-anon-key' : '';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || TEST_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || TEST_SUPABASE_ANON_KEY;

function createMissingSupabaseConfigError(): Error {
  return new Error(
    'Missing Supabase configuration. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY before starting the app.',
  );
}

/**
 * Create Supabase client
 */
function createSupabaseClient(): SupabaseClient {
  if (IS_JEST) {
    debug.warn('[Supabase] Jest environment detected — using mock client');
    return createMockSupabaseClient();
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw createMissingSupabaseConfigError();
  }

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      // Storage is handled by our secure storage
      storage: {
        getItem: async (key: string) => {
          const { getSecureStorage } = await import('../persistence/SecureStorage');
          const value = await getSecureStorage().getItem(key);
          return value ?? null;
        },
        setItem: async (key: string, value: string) => {
          const { getSecureStorage } = await import('../persistence/SecureStorage');
          return getSecureStorage().setItem(key, value);
        },
        removeItem: async (key: string) => {
          const { getSecureStorage } = await import('../persistence/SecureStorage');
          return getSecureStorage().removeItem(key);
        },
      },
      autoRefreshToken: !IS_JEST,
      persistSession: !IS_JEST,
      detectSessionInUrl: false, // Not applicable for native
    },
    global: {
      headers: {
        'X-Client-Info': `vex-app/${CURRENT_CONFIG.version}`,
        'X-Platform': 'react-native',
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

  if (error !== null && typeof error === 'object') {
    // Narrowing from unknown to read .message / .code — validated via typeof guards
    const err = error as Record<string, unknown>;
    const msg = typeof err.message === 'string' ? err.message : undefined;
    const code = typeof err.code === 'string' ? err.code : undefined;
    return new Error(msg || `Supabase error: ${code ?? 'unknown'}`);
  }

  return new Error('Unknown Supabase error');
}

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export { SUPABASE_URL, SUPABASE_ANON_KEY };
export type { Database };
