/**
 * Refund Service
 * Purchase refund and reversal management
 */

import * as repository from './repository';
import * as analytics from './analytics';
import {
  ProcessRefundInputSchema,
  type RefundRequest,
  type ProcessRefundInput,
} from './schemas';
import { addCurrency } from './wallet-service';

/**
 * Request a refund
 */
export async function requestRefund(
  purchaseId: string,
  userId: string,
  reason: string
): Promise<RefundRequest> {
  const purchase = await repository.fetchPurchaseById(purchaseId);

  if (!purchase) {
    throw new Error('Purchase not found');
  }

  if (purchase.status !== 'COMPLETED') {
    throw new Error('Only completed purchases can be refunded');
  }

  if (purchase.refundedAt) {
    throw new Error('Purchase already refunded');
  }

  const refund = await repository.createRefundRequest({
    purchaseId,
    userId,
    reason,
    status: 'PENDING',
    requestedAt: Date.now(),
    refundAmount: purchase.totalPrice,
    itemsRecovered: false,
  });

  analytics.trackRefundRequested(userId, purchaseId, reason);

  return refund;
}

/**
 * Process a refund request
 */
export async function processRefund(input: ProcessRefundInput): Promise<RefundRequest> {
  const validated = ProcessRefundInputSchema.parse(input);

  const refund = await repository.fetchRefundRequestById(validated.refundRequestId);

  if (!refund) {
    throw new Error('Refund request not found');
  }

  if (refund.status !== 'PENDING') {
    throw new Error('Refund request already processed');
  }

  const purchase = await repository.fetchPurchaseById(refund.purchaseId);

  if (!purchase) {
    throw new Error('Purchase not found');
  }

  if (validated.approved) {
    await addCurrency({
      userId: refund.userId,
      currency: refund.refundAmount?.currency ?? 'COINS',
      amount: refund.refundAmount?.amount ?? 0,
      source: 'REFUND',
      description: `Refund for purchase ${refund.purchaseId}`,
      skipEvents: false,
      metadata: { refundId: refund.id, purchaseId: refund.purchaseId },
    });

    await repository.markPurchaseRefunded(refund.purchaseId, refund.reason);

    await repository.updateRefundStatus(refund.id, {
      status: 'PROCESSED',
      processedAt: Date.now(),
      itemsRecovered: true,
    });

    analytics.trackRefundProcessed(refund.userId, refund.purchaseId, true);
  } else {
    await repository.updateRefundStatus(refund.id, {
      status: 'REJECTED',
      processedAt: Date.now(),
    });

    analytics.trackRefundProcessed(refund.userId, refund.purchaseId, false);
  }

  return repository.fetchRefundRequestById(refund.id) as Promise<RefundRequest>;
}

/**
 * Refund a purchase automatically
 */
export async function refundPurchase(purchaseId: string, reason: string): Promise<RefundRequest> {
  const purchase = await repository.fetchPurchaseById(purchaseId);

  if (!purchase) {
    throw new Error('Purchase not found');
  }

  const refund = await repository.createRefundRequest({
    purchaseId,
    userId: purchase.userId,
    reason,
    status: 'APPROVED',
    requestedAt: Date.now(),
    refundAmount: purchase.totalPrice,
    itemsRecovered: false,
  });

  return processRefund({
    refundRequestId: refund.id,
    approved: true,
    adminId: 'system',
    notes: 'Automatic refund',
  });
}
