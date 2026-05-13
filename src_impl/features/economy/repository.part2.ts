import { getSupabaseClient } from "../../config/supabase";
import { withResilience } from "../../utils/supabase-resilience";
import { WalletSchema, WalletTransactionSchema, PurchaseAttemptSchema, RefundRequestSchema, type Wallet, type WalletTransaction, type PurchaseAttempt, type RefundRequest, type CurrencyType, type TransactionSource } from "./schemas";


export async function fetchTransactionById(transactionId: string): Promise<WalletTransaction | null> {
  const { data, error } = await withResilience(
    supabase
      .from('wallet_transactions')
      .select('*')
      .eq('id', transactionId)
      .single(),
    { operation: 'fetchTransactionById' }
  );

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new RepositoryError('fetchTransactionById', error);
  }

  return WalletTransactionSchema.parse(data);
}

export async function createPurchaseAttempt(purchase: Omit<PurchaseAttempt, 'id' | 'createdAt' | 'updatedAt'>): Promise<PurchaseAttempt> {
  const now = Date.now();
  const { data, error } = await withResilience(
    supabase
      .from('purchase_attempts')
      .insert({
        user_id: purchase.userId,
        shop_item_id: purchase.shopItemId,
        quantity: purchase.quantity,
        unit_price_currency: purchase.unitPrice.currency,
        unit_price_amount: purchase.unitPrice.amount,
        total_price_currency: purchase.totalPrice.currency,
        total_price_amount: purchase.totalPrice.amount,
        status: purchase.status,
        error_code: purchase.errorCode,
        error_message: purchase.errorMessage,
        inventory_item_ids: purchase.inventoryItemIds,
        refunded_at: purchase.refundedAt,
        refund_reason: purchase.refundReason,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single(),
    { operation: 'createPurchaseAttempt' }
  );

  if (error) {
    throw new RepositoryError('createPurchaseAttempt', error);
  }

  return PurchaseAttemptSchema.parse(data);
}

export async function updatePurchaseStatus(purchaseId: string, updates: {
  status: PurchaseAttempt['status'];
  errorCode?: PurchaseAttempt['errorCode'];
  errorMessage?: PurchaseAttempt['errorMessage'];
  inventoryItemIds?: PurchaseAttempt['inventoryItemIds']
}): Promise<PurchaseAttempt> {
  const { data, error } = await withResilience(
    supabase
      .from('purchase_attempts')
      .update({
        status: updates.status,
        error_code: updates.errorCode,
        error_message: updates.errorMessage,
        inventory_item_ids: updates.inventoryItemIds,
        updated_at: Date.now(),
      })
      .eq('id', purchaseId)
      .select()
      .single(),
    { operation: 'updatePurchaseStatus' }
  );

  if (error) {
    throw new RepositoryError('updatePurchaseStatus', error);
  }

  return PurchaseAttemptSchema.parse(data);
}

export async function fetchPurchaseById(purchaseId: string): Promise<PurchaseAttempt | null> {
  const { data, error } = await withResilience(
    supabase
      .from('purchase_attempts')
      .select('*')
      .eq('id', purchaseId)
      .single(),
    { operation: 'fetchPurchaseById' }
  );

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new RepositoryError('fetchPurchaseById', error);
  }

  return PurchaseAttemptSchema.parse(data);
}

export async function fetchUserPurchases(userId: string, options: {
  status?: PurchaseAttempt['status'];
  limit?: number;
  offset?: number
} = {}): Promise<PurchaseAttempt[]> {
  let query = supabase.from('purchase_attempts').select('*').eq('user_id', userId);
  if (options.status) {
    query = query.eq('status', options.status);
  }

  const { data, error } = await withResilience(
    query
      .order('created_at', { ascending: false })
      .limit(options.limit ?? 50)
      .range(options.offset ?? 0, (options.offset ?? 0) + (options.limit ?? 50) - 1),
    { operation: 'fetchUserPurchases', fallbackValue: [] }
  );

  if (error) {
    throw new RepositoryError('fetchUserPurchases', error);
  }

  return PurchaseAttemptSchema.array().parse(data ?? []);
}

export async function markPurchaseRefunded(purchaseId: string, reason: string): Promise<PurchaseAttempt> {
  const { data, error } = await withResilience(
    supabase
      .from('purchase_attempts')
      .update({ status: 'REFUNDED', refunded_at: Date.now(), refund_reason: reason, updated_at: Date.now() })
      .eq('id', purchaseId)
      .select()
      .single(),
    { operation: 'markPurchaseRefunded' }
  );

  if (error) {
    throw new RepositoryError('markPurchaseRefunded', error);
  }

  return PurchaseAttemptSchema.parse(data);
}

export async function createRefundRequest(refund: Omit<RefundRequest, 'id' | 'processedAt'>): Promise<RefundRequest> {
  const { data, error } = await withResilience(
    supabase
      .from('refund_requests')
      .insert({
        purchase_id: refund.purchaseId,
        user_id: refund.userId,
        reason: refund.reason,
        status: refund.status,
        requested_at: refund.requestedAt,
        refund_amount_currency: refund.refundAmount?.currency,
        refund_amount_amount: refund.refundAmount?.amount,
        items_recovered: refund.itemsRecovered,
      })
      .select()
      .single(),
    { operation: 'createRefundRequest' }
  );

  if (error) {
    throw new RepositoryError('createRefundRequest', error);
  }

  return RefundRequestSchema.parse(data);
}