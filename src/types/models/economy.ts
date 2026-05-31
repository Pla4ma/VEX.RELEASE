import type { BaseModel } from './user';

export interface Wallet extends BaseModel {
  userId: string;
  balance: number;
  currency: string;
  frozenBalance: number;
  transactions: Transaction[];
  stats: WalletStats;
}

export interface Transaction extends BaseModel {
  walletId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  description?: string;
  metadata?: Record<string, unknown>;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'transfer'
  | 'purchase'
  | 'reward'
  | 'refund'
  | 'fee'
  | 'bonus';

export type TransactionStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'reversed';

export interface WalletStats {
  totalDeposits: number;
  totalWithdrawals: number;
  totalTransactions: number;
  volume24h: number;
  volume7d: number;
  volume30d: number;
}
