import { captureException } from '../../config/sentry';
import {
  fetchWallet,
  upsertWallet,
  createTransaction,
  fetchTransactionHistory,
  getWalletBalance as repoGetBalance,
} from './repository';
import {
  EarnCoinsInputSchema,
  SpendCoinsInputSchema,
} from './schemas';
import type {
  WalletRow,
  WalletTransaction,
  EarnCoinsInput,
  SpendCoinsInput,
  WalletState,
} from './types';

export class WalletServiceError extends Error {
  constructor(operation: string, public readonly cause?: unknown) {
    super(`WalletService ${operation} failed`);
  }
}

export async function getWalletState(userId: string): Promise<WalletState> {
  try {
    const rows = await fetchWallet(userId);
    const coins = rows.find((r) => r.currency === 'COINS')?.balance ?? 0;
    const gems = rows.find((r) => r.currency === 'GEMS')?.balance ?? 0;
    const focusPoints = rows.find((r) => r.currency === 'FOCUS_POINTS')?.balance ?? 0;

    return { userId, coins, gems, focusPoints };
  } catch (error) {
    captureException(error instanceof Error ? error : new Error(String(error)), {
      tags: { feature: 'wallet', operation: 'getWalletState' },
    });
    throw new WalletServiceError('getWalletState', error);
  }
}

export async function getBalance(
  userId: string,
  currency: string
): Promise<number> {
  try {
    return await repoGetBalance(userId, currency);
  } catch (error) {
    captureException(error instanceof Error ? error : new Error(String(error)), {
      tags: { feature: 'wallet', operation: 'getBalance' },
    });
    throw new WalletServiceError('getBalance', error);
  }
}

export async function earnCoins(
  input: EarnCoinsInput
): Promise<{ wallet: WalletRow; transaction: WalletTransaction }> {
  try {
    const validated = EarnCoinsInputSchema.parse(input);
    const currentBalance = await repoGetBalance(validated.userId, 'COINS');
    const newBalance = currentBalance + validated.amount;

    const wallet = await upsertWallet(validated.userId, 'COINS', newBalance);

    const transaction = await createTransaction({
      walletId: wallet.id,
      amount: validated.amount,
      type: validated.sourceTransactionType ?? 'EARN',
      description: validated.description,
      metadata: validated.metadata,
    });

    return { wallet, transaction };
  } catch (error) {
    captureException(error instanceof Error ? error : new Error(String(error)), {
      tags: { feature: 'wallet', operation: 'earnCoins' },
    });
    throw new WalletServiceError('earnCoins', error);
  }
}

export async function spendCoins(
  input: SpendCoinsInput
): Promise<{ wallet: WalletRow; transaction: WalletTransaction }> {
  try {
    const validated = SpendCoinsInputSchema.parse(input);
    const currentBalance = await repoGetBalance(validated.userId, 'COINS');

    if (currentBalance < validated.amount) {
      throw new WalletServiceError('spendCoins', new Error('Insufficient coins balance'));
    }

    const newBalance = currentBalance - validated.amount;
    const wallet = await upsertWallet(validated.userId, 'COINS', newBalance);

    const transaction = await createTransaction({
      walletId: wallet.id,
      amount: validated.amount,
      type: 'SPEND',
      description: validated.description,
      metadata: validated.metadata,
    });

    return { wallet, transaction };
  } catch (error) {
    captureException(error instanceof Error ? error : new Error(String(error)), {
      tags: { feature: 'wallet', operation: 'spendCoins' },
    });
    throw error instanceof WalletServiceError
      ? error
      : new WalletServiceError('spendCoins', error);
  }
}

export async function earnGems(
  input: EarnCoinsInput
): Promise<{ wallet: WalletRow; transaction: WalletTransaction }> {
  try {
    const validated = EarnCoinsInputSchema.parse(input);
    const currentBalance = await repoGetBalance(validated.userId, 'GEMS');
    const newBalance = currentBalance + validated.amount;

    const wallet = await upsertWallet(validated.userId, 'GEMS', newBalance);

    const transaction = await createTransaction({
      walletId: wallet.id,
      amount: validated.amount,
      type: validated.sourceTransactionType ?? 'EARN',
      description: validated.description,
      metadata: validated.metadata,
    });

    return { wallet, transaction };
  } catch (error) {
    captureException(error instanceof Error ? error : new Error(String(error)), {
      tags: { feature: 'wallet', operation: 'earnGems' },
    });
    throw new WalletServiceError('earnGems', error);
  }
}

export async function spendGems(
  input: SpendCoinsInput
): Promise<{ wallet: WalletRow; transaction: WalletTransaction }> {
  try {
    const validated = SpendCoinsInputSchema.parse(input);
    const currentBalance = await repoGetBalance(validated.userId, 'GEMS');

    if (currentBalance < validated.amount) {
      throw new WalletServiceError('spendGems', new Error('Insufficient gems balance'));
    }

    const newBalance = currentBalance - validated.amount;
    const wallet = await upsertWallet(validated.userId, 'GEMS', newBalance);

    const transaction = await createTransaction({
      walletId: wallet.id,
      amount: validated.amount,
      type: 'SPEND',
      description: validated.description,
      metadata: validated.metadata,
    });

    return { wallet, transaction };
  } catch (error) {
    captureException(error instanceof Error ? error : new Error(String(error)), {
      tags: { feature: 'wallet', operation: 'spendGems' },
    });
    throw error instanceof WalletServiceError
      ? error
      : new WalletServiceError('spendGems', error);
  }
}

export async function getTransactionHistory(
  userId: string,
  limit: number = 50
): Promise<WalletTransaction[]> {
  try {
    return await fetchTransactionHistory(userId, limit);
  } catch (error) {
    captureException(error instanceof Error ? error : new Error(String(error)), {
      tags: { feature: 'wallet', operation: 'getTransactionHistory' },
    });
    throw new WalletServiceError('getTransactionHistory', error);
  }
}
