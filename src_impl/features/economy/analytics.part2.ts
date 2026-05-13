import * as Sentry from "@sentry/react-native";
import type { CurrencyType, TransactionSource, PurchaseError } from "./schemas";


export function trackWagerPlaced(userId: string, wagerType: string, betAmount: number, currency: string): void {
  Sentry.addBreadcrumb({
    category: 'economy.wager',
    message: `Wager placed: ${wagerType}`,
    level: 'info',
    data: { userId: hashUserId(userId), wagerType, betAmount, currency },
  });
}

export function trackWagerResolved(userId: string, wagerId: string, outcome: 'WIN' | 'LOSS', coinsEarned: number): void {
  Sentry.addBreadcrumb({
    category: 'economy.wager',
    message: `Wager resolved: ${outcome}`,
    level: 'info',
    data: { userId: hashUserId(userId), wagerId, outcome, coinsEarned },
  });
}

export function trackInsurancePurchased(userId: string, costGems: number, streakDays: number): void {
  Sentry.addBreadcrumb({
    category: 'economy.insurance',
    message: 'Streak insurance purchased',
    level: 'info',
    data: {
      userId: hashUserId(userId),
      costGems,
      streakDays,
    },
  });
}

export function trackInsuranceConsumed(userId: string, restoredStreakDays: number): void {
  Sentry.addBreadcrumb({
    category: 'economy.insurance',
    message: 'Streak insurance consumed - streak restored',
    level: 'info',
    data: {
      userId: hashUserId(userId),
      restoredStreakDays,
    },
  });
}

export function trackInsufficientFunds(userId: string, currency: CurrencyType, required: number, available: number): void {
  Sentry.addBreadcrumb({
    message: 'Insufficient funds',
    category: 'economy.error',
    data: {
      userId,
      currency,
      required,
      available,
    },
    level: 'warning',
  });
}

export function trackWalletSyncError(userId: string, operation: string, error: unknown): void {
  Sentry.captureException(error, {
    tags: {
      feature: 'economy',
      operation: 'wallet_sync',
    },
    extra: {
      userId,
      operation,
    },
  });
}