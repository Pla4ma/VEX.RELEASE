import { getSupabaseClient } from '../../config/supabase';
import { withResilience } from '../../utils/supabase-resilience';
import {
  WalletSchema,
  WalletTransactionSchema,
  PurchaseAttemptSchema,
  RefundRequestSchema,
  type Wallet,
  type WalletTransaction,
  type PurchaseAttempt,
  type RefundRequest,
  type CurrencyType,
  type TransactionSource,
} from './schemas';

class RepositoryError extends Error {
  constructor(public operation: string, public originalError: unknown) {
    super(`Repository error in ${operation}: ${originalError instanceof Error ? originalError.message : 'Unknown error'}`);
    this.name = 'RepositoryError';
  }
}

const supabase = getSupabaseClient();

export * from "./repository.part1";
export * from "./repository.part2";
export * from "./repository.part3";
