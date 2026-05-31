import { getSupabase, RepositoryError, spendCurrencyRpc, addCurrencyRpc } from './repository';
import { WalletSchema, SpendInputSchema, type SpendInput } from './schemas';
import type { WalletSummary, SpendError } from './types';

export async function getOrCreateWallet(
  userId: string,
): Promise<{ coins: number; gems: number }> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('wallets')
    .upsert({ user_id: userId, coins: 0, gems: 0 }, { onConflict: 'user_id' })
    .select()
    .single();
  if (error) {throw new RepositoryError('getOrCreateWallet', error);}
  const wallet = WalletSchema.parse(data);
  return { coins: wallet.coins, gems: wallet.gems };
}

export async function getWalletSummary(): Promise<WalletSummary> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {return { coins: 0, gems: 0 };}
  return getOrCreateWallet(user.id);
}

export async function getBalance(userId: string): Promise<number> {
  const wallet = await getOrCreateWallet(userId);
  return wallet.coins;
}

export async function hasEnoughBalance(
  userId: string,
  amount: number,
  currency: 'COINS' | 'GEMS' = 'COINS',
): Promise<boolean> {
  const wallet = await getOrCreateWallet(userId);
  return currency === 'COINS' ? wallet.coins >= amount : wallet.gems >= amount;
}

export async function spendCurrency(input: SpendInput): Promise<boolean> {
  const parsed = SpendInputSchema.parse(input);
  const result = await spendCurrencyRpc({
    userId: parsed.userId,
    currency: parsed.currency,
    amount: parsed.amount,
    sink: parsed.sink,
  });
  return result.success;
}

export async function addCurrency(
  userId: string,
  amount: number,
  currency: 'COINS' | 'GEMS',
  source: string,
): Promise<void> {
  await addCurrencyRpc({ userId, currency, amount, source });
}
