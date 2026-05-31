import { getSupabaseClient } from "../../config/supabase";
import { CurrencyRpcResultSchema, type CurrencyRpcResult } from "./schemas";
import type { PostgrestError } from "@supabase/supabase-js";

export class RepositoryError extends Error {
  public readonly operation: string;
  public readonly cause: PostgrestError | Error;

  constructor(operation: string, cause: PostgrestError | Error) {
    super(`Repository operation "${operation}" failed: ${cause.message}`);
    this.name = "RepositoryError";
    this.operation = operation;
    this.cause = cause;
  }
}

export function getSupabase() {
  return getSupabaseClient();
}

export async function spendCurrencyRpc(params: {
  userId: string;
  currency: string;
  amount: number;
  sink: string;
}): Promise<CurrencyRpcResult> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("atomic_spend_currency", {
    p_user_id: params.userId,
    p_currency: params.currency,
    p_amount: params.amount,
    p_sink: params.sink,
  });
  if (error) throw new RepositoryError("spendCurrencyRpc", error);
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
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("grant_currency", {
    p_user_id: params.userId,
    p_currency: params.currency,
    p_amount: params.amount,
    p_source: params.source,
    p_source_id: params.sourceId ?? null,
    p_description: params.description ?? null,
  });
  if (error) throw new RepositoryError("grantCurrencyRpc", error);
  return CurrencyRpcResultSchema.parse(data);
}

export async function addCurrencyRpc(params: {
  userId: string;
  currency: string;
  amount: number;
  source: string;
}): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.rpc("atomic_add_currency", {
    p_user_id: params.userId,
    p_currency: params.currency,
    p_amount: params.amount,
    p_source: params.source,
  });
  if (error) throw new RepositoryError("addCurrencyRpc", error);
}
