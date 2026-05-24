/**
 * Spending Service
 * Currency spending and transaction management
 */

import * as repository from './repository';
import * as analytics from './analytics';
import { eventBus } from '../../events';
import {
  SpendCurrencyInputSchema,
  type Wallet,
  type WalletTransaction,
  type SpendCurrencyInput,
  type CurrencyType,
} from './schemas';
import { getOrCreateWallet, hasEnoughBalance } from './wallet-service';

/**
 * Spend currency from wallet
 */
export async function spendCurrency(input: SpendCurrencyInput): Promise<{
  success: boolean;
  newBalance: number;
  transaction: WalletTransaction | null;
  error: { code: string; message: string; recoverable: boolean } | null;
}> {
  const validated = SpendCurrencyInputSchema.parse(input);
  const wallet = await getOrCreateWallet(validated.userId);

  if (!hasEnoughBalance(wallet, validated.currency, validated.amount)) {
    return {
      success: false,
      newBalance: 0,
      transaction: null,
      error: {
        code: 'INSUFFICIENT_FUNDS',
        message: `Insufficient ${validated.currency.toLowerCase()}`,
        recoverable: false,
      },
    };
  }

  let newBalance = 0;
  switch (validated.currency) {
    case 'COINS':
      newBalance = wallet.coins - validated.amount;
      break;
    case 'GEMS':
      newBalance = wallet.gems - validated.amount;
      break;
    case 'FOCUS_POINTS':
      newBalance = wallet.focusPoints - validated.amount;
      break;
    case 'SEASONAL': {
      const seasonId = Object.entries(wallet.seasonal).find(
        ([, balance]) => balance >= validated.amount
      )?.[0] ?? 'current';
      newBalance = (wallet.seasonal[seasonId] ?? 0) - validated.amount;
      break;
    }
  }

  const updateData: Parameters<typeof repository.updateWalletBalance>[1] = {};
  switch (validated.currency) {
    case 'COINS':
      updateData.coins = newBalance;
      updateData.totalCoinsSpent = wallet.totalCoinsSpent + validated.amount;
      break;
    case 'GEMS':
      updateData.gems = newBalance;
      updateData.totalGemsSpent = wallet.totalGemsSpent + validated.amount;
      break;
    case 'FOCUS_POINTS':
      updateData.focusPoints = newBalance;
      break;
    case 'SEASONAL':
      const seasonId = Object.entries(wallet.seasonal).find(
        ([, balance]) => balance >= validated.amount
      )?.[0] ?? 'current';
      updateData.seasonal = { ...wallet.seasonal, [seasonId]: newBalance };
      break;
  }

  await repository.updateWalletBalance(validated.userId, updateData);

  const transaction = await repository.createTransaction({
    walletId: wallet.id,
    userId: validated.userId,
    type: 'SPEND',
    currency: validated.currency,
    amount: validated.amount,
    balanceBefore: validated.currency === 'COINS' ? wallet.coins :
                    validated.currency === 'GEMS' ? wallet.gems :
                    validated.currency === 'FOCUS_POINTS' ? wallet.focusPoints :
                    (wallet.seasonal[Object.entries(wallet.seasonal).find(
                      ([, balance]) => balance >= validated.amount
                    )?.[0] ?? 'current'] ?? 0),
    balanceAfter: newBalance,
    source: 'SHOP',
    sourceId: null,
    description: validated.description,
    metadata: validated.metadata ?? null,
  });

  analytics.trackCurrencySpent(
    validated.userId,
    validated.currency,
    validated.amount,
    validated.sink
  );

  eventBus.publish('economy:currency_spent', {
    userId: validated.userId,
    currency: validated.currency,
    amount: validated.amount,
    description: validated.description,
    newBalance,
  });

  return { success: true, newBalance, transaction, error: null };
}
