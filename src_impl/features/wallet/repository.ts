import { supabase } from '../../config/supabase';
import {
  WalletRowSchema,
  WalletTransactionSchema,
  CurrencyTypeSchema,
} from './schemas';
import type { WalletRow, WalletTransaction, CreateTransactionInput } from './types';
import { z } from 'zod';

async function findWalletRow(
  userId: string,
  currency: string
): Promise<WalletRow | null> {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .eq('currency', currency)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new WalletRepositoryError('findWalletRow', error);
  }

  return WalletRowSchema.parse({
    id: data.id,
    userId: data.user_id,
    balance: data.balance ?? 0,
    currency: data.currency ?? currency,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  });
}

export * from "./repository.part1";
