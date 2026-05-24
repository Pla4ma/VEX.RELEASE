/**
 * EconomyService
 *
 * Singleton accessor for the economy service layer.
 * Used by companion and other feature modules that need a stable service reference.
 */

import {
  getOrCreateWallet,
  getWalletSummary,
  getBalance,
  hasEnoughBalance,
  addCurrency,
  spendCurrency as rawSpendCurrency,
} from '../features/economy/service';

export interface EconomyServiceInstance {
  getOrCreateWallet: typeof getOrCreateWallet;
  getWalletSummary: typeof getWalletSummary;
  getBalance: typeof getBalance;
  hasEnoughBalance: typeof hasEnoughBalance;
  addCurrency: typeof addCurrency;
  spendCurrency: (userId: string, currency: string, amount: number, tag: string) => Promise<unknown>;
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
      spendCurrency: (userId: string, currency: string, amount: number, tag: string) =>
        rawSpendCurrency({
          userId,
          currency: currency as 'COINS' | 'GEMS',
          amount,
          sink: 'UPGRADE',
          description: tag,
        }),
    };
  }
  return instance;
}

export function resetEconomyService(): void {
  instance = null;
}
