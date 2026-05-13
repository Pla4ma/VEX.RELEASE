import * as Sentry from "@sentry/react-native";
import type { CurrencyType, TransactionSource, PurchaseError } from "./schemas";


export function trackWalletCreated(userId: string): void {
  Sentry.addBreadcrumb({
    message: 'Wallet created',
    category: 'economy',
    data: { userId },
    level: 'info',
  });
}

export function trackCurrencyEarned(userId: string, currency: CurrencyType, amount: number, source: TransactionSource, multiplier: number): void {
  Sentry.addBreadcrumb({
    message: `Currency earned: ${amount} ${currency}`,
    category: 'economy',
    data: {
      userId,
      currency,
      amount,
      source,
      multiplier,
    },
    level: 'info',
  });
}

export function trackCurrencySpent(userId: string, currency: CurrencyType, amount: number, sink: string): void {
  Sentry.addBreadcrumb({
    message: `Currency spent: ${amount} ${currency}`,
    category: 'economy',
    data: {
      userId,
      currency,
      amount,
      sink,
    },
    level: 'info',
  });
}

export function trackPurchaseInitiated(userId: string, purchaseId: string, shopItemId: string, quantity: number, totalPrice: number, currency: CurrencyType): void {
  Sentry.addBreadcrumb({
    message: 'Purchase initiated',
    category: 'economy.purchase',
    data: {
      userId,
      purchaseId,
      shopItemId,
      quantity,
      totalPrice,
      currency,
    },
    level: 'info',
  });
}

export function trackPurchasePaymentSuccess(userId: string, purchaseId: string, currency: CurrencyType, amount: number): void {
  Sentry.addBreadcrumb({
    message: 'Purchase payment successful',
    category: 'economy.purchase',
    data: {
      userId,
      purchaseId,
      currency,
      amount,
    },
    level: 'info',
  });
}

export function trackPurchaseCompleted(userId: string, purchaseId: string, shopItemId: string, itemsDelivered: number): void {
  Sentry.addBreadcrumb({
    message: 'Purchase completed',
    category: 'economy.purchase',
    data: {
      userId,
      purchaseId,
      shopItemId,
      itemsDelivered,
    },
    level: 'info',
  });
}

export function trackPurchaseFailed(userId: string, purchaseId: string, errorCode: PurchaseError['code'] | string): void {
  Sentry.addBreadcrumb({
    message: 'Purchase failed',
    category: 'economy.purchase',
    data: {
      userId,
      purchaseId,
      errorCode,
    },
    level: 'warning',
  });
}

export function trackRefundRequested(userId: string, purchaseId: string, reason: string): void {
  Sentry.addBreadcrumb({
    message: 'Refund requested',
    category: 'economy.refund',
    data: {
      userId,
      purchaseId,
      reason,
    },
    level: 'info',
  });
}

export function trackRefundProcessed(userId: string, purchaseId: string, approved: boolean): void {
  Sentry.addBreadcrumb({
    message: `Refund ${approved ? 'approved' : 'rejected'}`,
    category: 'economy.refund',
    data: {
      userId,
      purchaseId,
      approved,
    },
    level: approved ? 'info' : 'warning',
  });
}

export function trackRefundFailed(userId: string, purchaseId: string, error: string): void {
  Sentry.captureMessage('Refund processing failed', {
    level: 'error',
    tags: {
      feature: 'economy',
      operation: 'refund',
    },
    extra: {
      userId,
      purchaseId,
      error,
    },
  });
}

export function trackOfferClaimed(userId: string, offerId: string, purchaseId: string): void {
  Sentry.addBreadcrumb({
    message: 'Limited offer claimed',
    category: 'economy.offer',
    data: {
      userId,
      offerId,
      purchaseId,
    },
    level: 'info',
  });
}

export function trackOfferExpired(offerId: string, totalClaims: number): void {
  Sentry.addBreadcrumb({
    message: 'Limited offer expired',
    category: 'economy.offer',
    data: {
      offerId,
      totalClaims,
    },
    level: 'info',
  });
}

export function trackCurrencyConverted(userId: string, fromCurrency: CurrencyType, toCurrency: CurrencyType, fromAmount: number, toAmount: number): void {
  Sentry.addBreadcrumb({
    message: `Currency converted: ${fromAmount} ${fromCurrency} → ${toAmount} ${toCurrency}`,
    category: 'economy.conversion',
    data: {
      userId,
      fromCurrency,
      toCurrency,
      fromAmount,
      toAmount,
    },
    level: 'info',
  });
}