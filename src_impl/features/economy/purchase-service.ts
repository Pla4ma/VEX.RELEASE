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

export * from "./purchase-service.part1";
