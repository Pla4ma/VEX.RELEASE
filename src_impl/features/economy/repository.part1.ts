import { getSupabaseClient } from "../../config/supabase";
import { withResilience } from "../../utils/supabase-resilience";
import { WalletSchema, WalletTransactionSchema, PurchaseAttemptSchema, RefundRequestSchema, type Wallet, type WalletTransaction, type PurchaseAttempt, type RefundRequest, type CurrencyType, type TransactionSource } from "./schemas";


export async function fetchWallet(userId: string): Promise<Wallet | null> {
  const { data, error } = await withResilience(
    supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single(),
    { operation: 'fetchWallet' }
  );

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new RepositoryError('fetchWallet', error);
  }

  if (!data) {return null;}
  return WalletSchema.parse(data);
}

export async function createWallet(userId: string): Promise<Wallet> {
  const now = Date.now();
  const newWallet = {
    user_id: userId,
    coins: 0,
    gems: 0,
    total_coins_earned: 0,
    total_coins_spent: 0,
    total_gems_earned: 0,
    total_gems_spent: 0,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await withResilience(
    supabase
      .from('wallets')
      .insert(newWallet)
      .select()
      .single(),
    { operation: 'createWallet', fallbackValue: newWallet }
  );

  if (error) {
    throw new RepositoryError('createWallet', error);
  }

  return WalletSchema.parse(data);
}

export async function updateWalletBalance(userId: string, updates: {
  coins?: number;
  gems?: number;
  totalCoinsEarned?: number;
  totalCoinsSpent?: number;
  totalGemsEarned?: number;
  totalGemsSpent?: number
}): Promise<Wallet> {
  const { data, error } = await withResilience(
    supabase
      .from('wallets')
      .update({ ...updates, updated_at: Date.now() })
      .eq('user_id', userId)
      .select()
      .single(),
    { operation: 'updateWalletBalance' }
  );

  if (error) {
    throw new RepositoryError('updateWalletBalance', error);
  }

  return WalletSchema.parse(data);
}

export async function atomicBalanceUpdate(userId: string, currency: CurrencyType, amount: number, operation: 'ADD' | 'SUBTRACT'): Promise<Wallet> {
  const column = currency === 'COINS' ? 'coins' : 'gems';
  const { data, error } = await withResilience(
    supabase.rpc('update_wallet_balance', {
      p_user_id: userId,
      p_currency: column,
      p_amount: amount,
      p_operation: operation,
    }),
    { operation: 'atomicBalanceUpdate' }
  );

  if (error) {
    throw new RepositoryError('atomicBalanceUpdate', error);
  }

  return WalletSchema.parse(data);
}

export async function createTransaction(transaction: Omit<WalletTransaction, 'id' | 'createdAt'>): Promise<WalletTransaction> {
  const now = Date.now();
  const { data, error } = await withResilience(
    supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: transaction.walletId,
        user_id: transaction.userId,
        type: transaction.type,
        currency: transaction.currency,
        amount: transaction.amount,
        balance_before: transaction.balanceBefore,
        balance_after: transaction.balanceAfter,
        source: transaction.source,
        source_id: transaction.sourceId,
        description: transaction.description,
        metadata: transaction.metadata,
        created_at: now,
      })
      .select()
      .single(),
    { operation: 'createTransaction' }
  );

  if (error) {
    throw new RepositoryError('createTransaction', error);
  }

  return WalletTransactionSchema.parse(data);
}

export async function fetchTransactions(userId: string, options: {
  currency?: CurrencyType;
  source?: TransactionSource;
  startDate?: number;
  endDate?: number;
  limit?: number;
  offset?: number
} = {}): Promise<WalletTransaction[]> {
  let query = supabase.from('wallet_transactions').select('*').eq('user_id', userId);

  if (options.currency) {
    query = query.eq('currency', options.currency);
  }
  if (options.source) {
    query = query.eq('source', options.source);
  }
  if (options.startDate) {
    query = query.gte('created_at', options.startDate);
  }
  if (options.endDate) {
    query = query.lte('created_at', options.endDate);
  }

  const { data, error } = await withResilience(
    query
      .order('created_at', { ascending: false })
      .limit(options.limit ?? 50)
      .range(options.offset ?? 0, (options.offset ?? 0) + (options.limit ?? 50) - 1),
    { operation: 'fetchTransactions', fallbackValue: [] }
  );

  if (error) {
    throw new RepositoryError('fetchTransactions', error);
  }

  return WalletTransactionSchema.array().parse(data ?? []);
}