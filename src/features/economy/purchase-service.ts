import { captureSilentFailure } from '../../utils/silent-failure';
/**
 * Purchase Service
 * Shop purchase flow and order management
 */

import * as repository from './repository';
import * as analytics from './analytics';
import { eventBus } from '../../events';
import {
  InitiatePurchaseInputSchema,
  PurchaseResultSchema,
  type PurchaseResult,
  type PurchaseError,
  type CurrencyType,
} from './schemas';
import { spendCurrency } from './spending-service';

/**
 * Initiate a new purchase
 */
export async function initiatePurchase(input: {
  userId: string;
  shopItemId: string;
  quantity: number;
  expectedPrice?: { currency: CurrencyType; amount: number };
}): Promise<PurchaseResult> {
  const validated = InitiatePurchaseInputSchema.parse(input);

  const unitPrice = validated.expectedPrice?.currency && validated.expectedPrice?.amount
    ? { currency: validated.expectedPrice.currency, amount: validated.expectedPrice.amount }
    : { currency: 'COINS' as const, amount: 0 };

  const totalPrice = validated.expectedPrice?.currency && validated.expectedPrice?.amount
    ? { currency: validated.expectedPrice.currency, amount: validated.expectedPrice.amount * validated.quantity }
    : { currency: 'COINS' as const, amount: 0 };

  const purchase = await repository.createPurchaseAttempt({
    userId: validated.userId,
    shopItemId: validated.shopItemId,
    quantity: validated.quantity,
    unitPrice,
    totalPrice,
    status: 'PENDING',
    errorCode: null,
    errorMessage: null,
    inventoryItemIds: null,
    refundedAt: null,
    refundReason: null,
  });

  return PurchaseResultSchema.parse({
    success: true,
    purchaseId: purchase.id,
    inventoryItemIds: null,
    error: null,
    remainingBalance: null,
  });
}

/**
 * Process purchase payment
 */
export async function processPurchasePayment(
  purchaseId: string,
  currency: CurrencyType,
  amount: number
): Promise<PurchaseResult> {
  const purchase = await repository.fetchPurchaseById(purchaseId);

  if (!purchase) {
    return createErrorResult('Purchase not found', 'SYSTEM_ERROR', false);
  }

  if (purchase.status !== 'PENDING' && purchase.status !== 'VALIDATING') {
    return createErrorResult(
      `Purchase in invalid state: ${purchase.status}`,
      'SYSTEM_ERROR',
      false,
      purchase.id
    );
  }

  await repository.updatePurchaseStatus(purchaseId, { status: 'PROCESSING_PAYMENT' });

  const spendResult = await spendCurrency({
    userId: purchase.userId,
    currency,
    amount,
    sink: 'SHOP',
    description: `Purchase: ${purchase.shopItemId}`,
    metadata: { purchaseId },
  });

  if (!spendResult.success) {
    const errorCode = (spendResult.error?.code ?? 'SYSTEM_ERROR') as PurchaseError['code'];
    await repository.updatePurchaseStatus(purchaseId, {
      status: 'FAILED',
      errorCode,
      errorMessage: spendResult.error?.message ?? 'Payment failed',
    });

    analytics.trackPurchaseFailed(purchase.userId, purchaseId, errorCode);

    return createErrorResult(
      spendResult.error?.message ?? 'Payment failed',
      errorCode,
      false,
      purchase.id
    );
  }

  await repository.updatePurchaseStatus(purchaseId, { status: 'DELIVERING' });
  analytics.trackPurchasePaymentSuccess(purchase.userId, purchaseId, currency, amount);

  return PurchaseResultSchema.parse({
    success: true,
    purchaseId: purchase.id,
    inventoryItemIds: null,
    error: null,
    remainingBalance: {
      currency,
      amount: spendResult.newBalance,
    },
  });
}

/**
 * Complete purchase delivery
 */
export async function completePurchaseDelivery(
  purchaseId: string,
  inventoryItemIds: string[]
): Promise<PurchaseResult> {
  const purchase = await repository.fetchPurchaseById(purchaseId);

  if (!purchase) {
    return createErrorResult('Purchase not found', 'SYSTEM_ERROR', false);
  }

  await repository.updatePurchaseStatus(purchaseId, {
    status: 'COMPLETED',
    inventoryItemIds,
  });

  analytics.trackPurchaseCompleted(purchase.userId, purchaseId, purchase.shopItemId, inventoryItemIds.length);

  eventBus.publish('shop:purchase', {
    userId: purchase.userId,
    itemId: purchase.shopItemId,
    price: purchase.totalPrice,
  });

  return PurchaseResultSchema.parse({
    success: true,
    purchaseId: purchase.id,
    inventoryItemIds,
    error: null,
    remainingBalance: null,
  });
}

/**
 * Handle purchase failure
 */
export async function handlePurchaseFailure(
  purchaseId: string,
  errorCode: PurchaseError['code'],
  errorMessage: string,
  recoverable: boolean
): Promise<PurchaseResult> {
  const purchase = await repository.fetchPurchaseById(purchaseId);

  if (!purchase) {
    return createErrorResult(errorMessage, errorCode, recoverable);
  }

  if (purchase.status === 'PROCESSING_PAYMENT' || purchase.status === 'DELIVERING') {
    try {
      await refundPurchaseInternal(purchaseId, 'Purchase failed - automatic refund');
    } catch (error) { captureSilentFailure(error, { feature: 'economy', operation: 'network-fallback', type: 'network' });
      analytics.trackRefundFailed(purchase.userId, purchaseId, errorMessage);
    }
  }

  await repository.updatePurchaseStatus(purchaseId, {
    status: 'FAILED',
    errorCode,
    errorMessage,
  });

  analytics.trackPurchaseFailed(purchase.userId, purchaseId, errorCode);

  return createErrorResult(errorMessage, errorCode, recoverable, purchase.id);
}

// Helper functions
function createErrorResult(
  message: string,
  code: string,
  recoverable: boolean,
  purchaseId?: string | null
): PurchaseResult {
  return PurchaseResultSchema.parse({
    success: false,
    purchaseId: purchaseId ?? null,
    inventoryItemIds: null,
    error: { code, message, recoverable },
    remainingBalance: null,
  });
}

async function refundPurchaseInternal(purchaseId: string, reason: string): Promise<void> {
  // Implementation moved from main service file
  const purchase = await repository.fetchPurchaseById(purchaseId);
  if (!purchase) {throw new Error('Purchase not found');}

  // Create and auto-approve refund
  await repository.createRefundRequest({
    purchaseId,
    userId: purchase.userId,
    reason,
    status: 'APPROVED',
    requestedAt: Date.now(),
    refundAmount: purchase.totalPrice,
    itemsRecovered: false,
  });
}
