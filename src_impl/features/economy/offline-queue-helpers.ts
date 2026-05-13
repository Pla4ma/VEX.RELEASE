/**
 * Economy Offline Queue - Helper Functions
 */

import type { QueueEntry } from './offline-queue-schemas';

type QueueEntryInput = Omit<
  QueueEntry,
  'id' | 'status' | 'createdAt' | 'updatedAt' | 'retryCount'
>;

export function createEarnEntry(
  userId: string,
  currency: string,
  amount: number,
  source: string,
  metadata?: Record<string, unknown>,
): QueueEntryInput {
  return {
    userId,
    type: 'EARN_CURRENCY',
    payload: { currency, amount, source, metadata, timestamp: Date.now() },
    priority: 3,
    maxRetries: 3,
    nextRetryAt: null,
    lastError: null,
    dedupeKey: `${userId}:earn:${source}:${metadata?.transactionId ?? ''}`,
    dependencies: [],
  };
}

export function createSpendEntry(
  userId: string,
  currency: string,
  amount: number,
  description: string,
  metadata?: Record<string, unknown>,
): QueueEntryInput {
  return {
    userId,
    type: 'SPEND_CURRENCY',
    payload: { currency, amount, description, metadata, timestamp: Date.now() },
    priority: 5,
    maxRetries: 3,
    nextRetryAt: null,
    lastError: null,
    dedupeKey: `${userId}:spend:${metadata?.purchaseId ?? Date.now()}`,
    dependencies: [],
  };
}

export function createConvertEntry(
  userId: string,
  fromCurrency: string,
  toCurrency: string,
  fromAmount: number,
  toAmount: number,
): QueueEntryInput {
  return {
    userId,
    type: 'CONVERT_CURRENCY',
    payload: {
      fromCurrency,
      toCurrency,
      fromAmount,
      toAmount,
      timestamp: Date.now(),
    },
    priority: 4,
    maxRetries: 3,
    nextRetryAt: null,
    lastError: null,
    dedupeKey: `${userId}:convert:${fromCurrency}:${toCurrency}:${Date.now()}`,
    dependencies: [],
  };
}

export function createPurchaseEntry(
  userId: string,
  itemDefinitionId: string,
  price: { currency: string; amount: number },
  shopItemId?: string,
): QueueEntryInput {
  return {
    userId,
    type: 'PURCHASE_ITEM',
    payload: { itemDefinitionId, price, shopItemId, timestamp: Date.now() },
    priority: 6,
    maxRetries: 3,
    nextRetryAt: null,
    lastError: null,
    dedupeKey: `${userId}:purchase:${shopItemId ?? itemDefinitionId}`,
    dependencies: [],
  };
}
