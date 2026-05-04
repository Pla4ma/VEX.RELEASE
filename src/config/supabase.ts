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
 * Supabase configuration
 */
const IS_JEST = Boolean(process.env.JEST_WORKER_ID);
const TEST_SUPABASE_URL = IS_JEST ? 'https://test.supabase.co' : '';
const TEST_SUPABASE_ANON_KEY = IS_JEST ? 'test-anon-key' : '';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || TEST_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || TEST_SUPABASE_ANON_KEY;

/**
 * Create Supabase client
 */
function createSupabaseClient(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    debug.warn('[Supabase] Missing URL or anon key, client will not function');
  }

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      // Storage is handled by our secure storage
      storage: {
        getItem: async (key: string) => {
          // Import dynamically to avoid circular deps
          const { getSecureStorage } = await import('../persistence');
          const value = await getSecureStorage().getItem(key);
          return value ?? null;
        },
        setItem: async (key: string, value: string) => {
          const { getSecureStorage } = await import('../persistence');
          return getSecureStorage().setItem(key, value);
        },
        removeItem: async (key: string) => {
          const { getSecureStorage } = await import('../persistence');
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

  if (typeof error === 'object' && error !== null) {
    const err = error as { message?: string; code?: string };
    return new Error(err.message || `Supabase error: ${err.code || 'unknown'}`);
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
