import { getSupabaseClient } from "../../config/supabase";
import { withResilience } from "../../utils/supabase-resilience";
import { WalletSchema, WalletTransactionSchema, PurchaseAttemptSchema, RefundRequestSchema, type Wallet, type WalletTransaction, type PurchaseAttempt, type RefundRequest, type CurrencyType, type TransactionSource } from "./schemas";


export async function updateRefundStatus(refundId: string, updates: {
  status: RefundRequest['status'];
  refundAmount?: RefundRequest['refundAmount'];
  itemsRecovered?: boolean;
  processedAt?: number
}): Promise<RefundRequest> {
  const { data, error } = await withResilience(
    supabase
      .from('refund_requests')
      .update({
        status: updates.status,
        refund_amount_currency: updates.refundAmount?.currency,
        refund_amount_amount: updates.refundAmount?.amount,
        items_recovered: updates.itemsRecovered,
        processed_at: updates.processedAt,
      })
      .eq('id', refundId)
      .select()
      .single(),
    { operation: 'updateRefundStatus' }
  );

  if (error) {
    throw new RepositoryError('updateRefundStatus', error);
  }

  return RefundRequestSchema.parse(data);
}

export async function fetchRefundRequestById(refundId: string): Promise<RefundRequest | null> {
  const { data, error } = await withResilience(
    supabase
      .from('refund_requests')
      .select('*')
      .eq('id', refundId)
      .single(),
    { operation: 'fetchRefundRequestById' }
  );

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new RepositoryError('fetchRefundRequestById', error);
  }

  return RefundRequestSchema.parse(data);
}

export async function fetchEconomyAnalytics(userId: string, period: 'DAILY' | 'WEEKLY' | 'MONTHLY', periodStart: number, periodEnd: number): Promise<{
  totalEarned: Record<CurrencyType, number>;
  totalSpent: Record<CurrencyType, number>;
  transactionsBySource: Record<TransactionSource, number>
}> {
  const { data, error } = await withResilience(
    supabase.rpc('get_economy_analytics', {
      p_user_id: userId,
      p_period: period,
      p_period_start: periodStart,
      p_period_end: periodEnd,
    }),
    { operation: 'fetchEconomyAnalytics', fallbackValue: { total_earned: {}, total_spent: {}, transactions_by_source: {} } }
  );

  if (error) {
    throw new RepositoryError('fetchEconomyAnalytics', error);
  }

  return {
    totalEarned: data.total_earned as Record<CurrencyType, number>,
    totalSpent: data.total_spent as Record<CurrencyType, number>,
    transactionsBySource: data.transactions_by_source as Record<TransactionSource, number>,
  };
}