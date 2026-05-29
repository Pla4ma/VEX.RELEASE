import { getSupabase, RepositoryError } from "./repository";
import type { SpendError } from "./types";

export interface CurrencyGrant {
  userId: string;
  amount: number;
  currency: "COINS" | "GEMS" | "XP" | "SEASONAL" | "FOCUS_POINTS";
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
  const supabase = getSupabase();
  try {
    const { data, error } = await supabase.rpc("grant_currency", {
      p_user_id: grant.userId,
      p_currency: grant.currency,
      p_amount: grant.amount,
      p_source: grant.source,
      p_source_id: grant.sourceId ?? null,
      p_description: grant.description ?? null,
    });
    if (error) throw new RepositoryError("addCurrency", error);
    return (data as { success: boolean }).success;
  } catch (err) {
    if (err instanceof RepositoryError) throw err;
    throw new RepositoryError("addCurrency", err as Error);
  }
}

export async function spendCurrency(input: SpendRequest): Promise<{
  success: boolean;
  error?: SpendError;
}> {
  const supabase = getSupabase();
  try {
    const { data, error } = await supabase.rpc("atomic_spend_currency", {
      p_user_id: input.userId,
      p_currency: input.currency,
      p_amount: input.amount,
      p_sink: input.sink,
    });
    if (error) throw new RepositoryError("spendCurrency", error);
    return { success: (data as { success: boolean }).success };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Spend failed";
    return { success: false, error: { code: "DB_ERROR", message } };
  }
}
