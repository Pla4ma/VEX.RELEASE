/**
 * Economy service wrapper — thin legacy layer over features/economy stubs.
 *
 * Active runtime must NOT depend on this module for wallet/shop/wagers.
 * This file kept for migration compatibility only (category D).
 *
 * All economy functions return zero — real money/gems/gacha logic archived.
 */
import {
  getOrCreateWallet,
  getWalletSummary,
  getBalance,
  hasEnoughBalance,
  addCurrency,
} from '../features/economy/service';

export interface EconomyServiceInstance {
  getOrCreateWallet: typeof getOrCreateWallet;
  getWalletSummary: typeof getWalletSummary;
  getBalance: typeof getBalance;
  hasEnoughBalance: typeof hasEnoughBalance;
  addCurrency: typeof addCurrency;
  spendCurrency: () => Promise<false>;
}

let instance: EconomyServiceInstance | null = null;

export function getEconomyService(): EconomyServiceInstance {
  if (!instance) {
    instance = {
      getOrCreateWallet,
      getWalletSummary,
      getBalance,
      hasEnoughBalance,
      addCurrency,
      spendCurrency: () => Promise.resolve(false),
    };
  }
  return instance;
}

export function resetEconomyService(): void {
  instance = null;
}
