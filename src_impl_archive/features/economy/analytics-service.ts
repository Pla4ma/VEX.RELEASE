/**
 * Economy Analytics Service
 * Transaction history and analytics
 */

import * as repository from './repository';
import type { CurrencyType, TransactionSource, WalletTransaction } from './schemas';

/**
 * Get transaction history for a user
 */
export async function getTransactionHistory(
  userId: string,
  options: {
    currency?: CurrencyType;
    source?: TransactionSource;
    startDate?: number;
    endDate?: number;
    limit?: number;
    offset?: number;
  } = {}
): Promise<WalletTransaction[]> {
  return repository.fetchTransactions(userId, {
    currency: options.currency,
    source: options.source,
    startDate: options.startDate,
    endDate: options.endDate,
    limit: options.limit,
    offset: options.offset,
  });
}

/**
 * Get economy analytics for a period
 */
export async function getEconomyAnalytics(
  userId: string,
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY',
  periodStart: number,
  periodEnd: number
): Promise<{
  totalEarned: Record<CurrencyType, number>;
  totalSpent: Record<CurrencyType, number>;
  transactionsBySource: Record<string, number>;
}> {
  return repository.fetchEconomyAnalytics(userId, period, periodStart, periodEnd);
}
