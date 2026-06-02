import { getSupabaseClient } from '../../config/supabase';
import { RepositoryError } from './repository';
import { WalletSchema } from './schemas';
import type { WalletSummary } from './types';

export async function getOrCreateWallet(
  userId: string,
): Promise<{ coins: number; gems: number }> {
  const supabase = getSupabaseClient();
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
  const supabase = getSupabaseClient();
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
