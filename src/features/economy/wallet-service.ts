import type { SpendError } from './types';

/**
 * Economy currency is DISABLED (ARCH-04).
 * All spendable currency logic is archived.
 * These functions are no-ops that always return failure/zero.
 * Streak insurance is the only active economy feature.
 */

export interface CurrencyGrant {
  userId: string;
  amount: number;
  currency: 'COINS' | 'GEMS' | 'XP' | 'SEASONAL' | 'FOCUS_POINTS';
  source: string;
  sourceId?: string | null;
  description?: string;
  skipEvents?: boolean;
  metadata?: Record<string, unknown>;
}

export interface SpendRequest {
  userId: string;
  currency: string;
  amount: number;
  sink: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * No-op: currency system is archived.
 * Always returns false (no currency granted).
 */
export async function addCurrency(_grant: CurrencyGrant): Promise<boolean> {
  return false;
}

/**
 * No-op: currency system is archived.
 * Always returns { success: false } (no currency spent).
 */
export async function spendCurrency(_input: SpendRequest): Promise<{
  success: boolean;
  error?: SpendError;
}> {
  return { success: false, error: { code: 'DB_ERROR', message: 'Currency system is disabled' } };
}
