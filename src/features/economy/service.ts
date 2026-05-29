import { getSupabase, RepositoryError } from "./repository";
import { WalletSchema, SpendInputSchema, type SpendInput } from "./schemas";
import type { WalletSummary, SpendError } from "./types";

export async function getOrCreateWallet(
  userId: string,
): Promise<{ coins: number; gems: number }> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("wallets")
    .upsert({ user_id: userId, coins: 0, gems: 0 }, { onConflict: "user_id" })
    .select()
    .single();
  if (error) throw new RepositoryError("getOrCreateWallet", error);
  const wallet = WalletSchema.parse(data);
  return { coins: wallet.coins, gems: wallet.gems };
}

export async function getWalletSummary(): Promise<WalletSummary> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { coins: 0, gems: 0 };
  return getOrCreateWallet(user.id);
}

export async function getBalance(userId: string): Promise<number> {
  const wallet = await getOrCreateWallet(userId);
  return wallet.coins;
}

export async function hasEnoughBalance(
  userId: string,
  amount: number,
  currency: "COINS" | "GEMS" = "COINS",
): Promise<boolean> {
  const wallet = await getOrCreateWallet(userId);
  return currency === "COINS" ? wallet.coins >= amount : wallet.gems >= amount;
}

export async function spendCurrency(input: SpendInput): Promise<boolean> {
  const parsed = SpendInputSchema.parse(input);
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc("atomic_spend_currency", {
    p_user_id: parsed.userId,
    p_currency: parsed.currency,
    p_amount: parsed.amount,
    p_sink: parsed.sink,
  });
  if (error) throw new RepositoryError("spendCurrency", error);
  return (data as { success: boolean }).success;
}

export async function addCurrency(
  userId: string,
  amount: number,
  currency: "COINS" | "GEMS",
  source: string,
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.rpc("atomic_add_currency", {
    p_user_id: userId,
    p_currency: currency,
    p_amount: amount,
    p_source: source,
  });
  if (error) throw new RepositoryError("addCurrency", error);
}
