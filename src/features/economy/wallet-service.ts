import { RepositoryError, grantCurrencyRpc, spendCurrencyRpc } from './repository';
import { CurrencyRpcResultSchema } from './schemas';
import type { SpendError } from './types';

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

export async function addCurrency(grant: CurrencyGrant): Promise<boolean> {
  try {
    const result = await grantCurrencyRpc({
      userId: grant.userId,
      currency: grant.currency,
      amount: grant.amount,
      source: grant.source,
      sourceId: grant.sourceId ?? null,
      description: grant.description ?? null,
    });
    return result.success;
  } catch (err) {
    if (err instanceof RepositoryError) {throw err;}
    throw new RepositoryError('addCurrency', err as Error);
  }
}

export async function spendCurrency(input: SpendRequest): Promise<{
  success: boolean;
  error?: SpendError;
}> {
  try {
    const result = await spendCurrencyRpc({
      userId: input.userId,
      currency: input.currency,
      amount: input.amount,
      sink: input.sink,
    });
    return { success: result.success };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Spend failed';
    return { success: false, error: { code: 'DB_ERROR', message } };
  }
}
