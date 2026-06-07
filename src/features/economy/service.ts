import { getOrCreateWallet, getCurrentUserId } from './repository';
export { getOrCreateWallet } from './repository';
import type { WalletSummary } from './types';

export async function getWalletSummary(): Promise<WalletSummary> {
  const userId = await getCurrentUserId();
  if (!userId) {return { coins: 0, gems: 0 };}
  return getOrCreateWallet(userId);
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
