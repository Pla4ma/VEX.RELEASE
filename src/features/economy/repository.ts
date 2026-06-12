import { getSupabaseClient } from '../../config/supabase';
import {
  CurrencyRpcResultSchema,
  SpendCurrencyRpcInputSchema,
  GrantCurrencyRpcInputSchema,
  AddCurrencyRpcParamsSchema,
  WalletSchema,
  type CurrencyRpcResult,
} from './schemas';
import { RepositoryError } from '../../lib/repository/error-handling';
import { tableColumns } from '../../lib/repository/tableColumns';

export { RepositoryError };

/**
 * Upsert a wallet row for the given user and return the parsed wallet.
 * This is the canonical data-access layer for wallet creation — moved
 * from service.ts to enforce the repository pattern.
 */
export async function getOrCreateWallet(
  userId: string,
): Promise<{ coins: number; gems: number }> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('wallets')
    .upsert(
      { user_id: userId },
      { onConflict: 'user_id', ignoreDuplicates: true },
    )
    .select(tableColumns('wallets'))
    .single();
  if (error) {throw new RepositoryError('getOrCreateWallet', error);}
  const wallet = WalletSchema.parse(data);
  return { coins: wallet.coins, gems: wallet.gems };
}

/**
 * Get the current authenticated user's ID from Supabase Auth.
 * Repository-level accessor so service code does not touch the client directly.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function spendCurrencyRpc(params: {
  userId: string;
  currency: string;
  amount: number;
  sink: string;
}): Promise<CurrencyRpcResult> {
  const parsed = SpendCurrencyRpcInputSchema.parse(params);
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('atomic_spend_currency', {
    p_user_id: parsed.userId,
    p_currency: parsed.currency,
    p_amount: parsed.amount,
    p_sink: parsed.sink,
  });
  if (error) {throw new RepositoryError('spendCurrencyRpc', error);}
  return CurrencyRpcResultSchema.parse(data);
}

export async function grantCurrencyRpc(params: {
  userId: string;
  currency: string;
  amount: number;
  source: string;
  sourceId?: string | null;
  description?: string | null;
}): Promise<CurrencyRpcResult> {
  const parsed = GrantCurrencyRpcInputSchema.parse(params);
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('grant_currency', {
    p_user_id: parsed.userId,
    p_currency: parsed.currency,
    p_amount: parsed.amount,
    p_source: parsed.source,
    p_source_id: parsed.sourceId ?? null,
    p_description: parsed.description ?? null,
  });
  if (error) {throw new RepositoryError('grantCurrencyRpc', error);}
  return CurrencyRpcResultSchema.parse(data);
}

export async function addCurrencyRpc(params: {
  userId: string;
  currency: string;
  amount: number;
  source: string;
}): Promise<void> {
  const parsed = AddCurrencyRpcParamsSchema.parse(params);
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc('atomic_add_currency', {
    p_user_id: parsed.userId,
    p_currency: parsed.currency,
    p_amount: parsed.amount,
    p_source: parsed.source,
  });
  if (error) {throw new RepositoryError('addCurrencyRpc', error);}
}
