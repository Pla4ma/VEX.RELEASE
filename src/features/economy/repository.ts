import { getSupabaseClient } from '../../config/supabase';
import {
  CurrencyRpcResultSchema,
  SpendCurrencyRpcInputSchema,
  GrantCurrencyRpcInputSchema,
  type CurrencyRpcResult,
} from './schemas';
import { RepositoryError } from '../../lib/repository/error-handling';

export { RepositoryError };

export function getSupabase() {
  return getSupabaseClient();
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
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc('atomic_add_currency', {
    p_user_id: params.userId,
    p_currency: params.currency,
    p_amount: params.amount,
    p_source: params.source,
  });
  if (error) {throw new RepositoryError('addCurrencyRpc', error);}
}
