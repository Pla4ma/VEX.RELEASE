import { supabase } from '../../config/supabase';
import {
  CreateRewardLedgerInputSchema,
  RewardLedgerRecordSchema,
} from './schemas';
import type { CreateRewardLedgerInput, RewardLedgerRecord } from './types';
import * as z from 'zod';

export class RewardLedgerRepositoryError extends Error {
  constructor(
    operation: string,
    public readonly cause?: unknown,
  ) {
    super(`RewardLedgerRepository ${operation} failed`);
  }
}

export async function upsertRewardLedger(
  input: CreateRewardLedgerInput,
): Promise<RewardLedgerRecord> {
  const validated = CreateRewardLedgerInputSchema.parse(input);

  const { data, error } = await supabase
    .from('reward_ledger')
    .upsert(
      {
        user_id: validated.userId,
        idempotency_key: validated.idempotencyKey,
        reward_type: validated.rewardType,
        amount: validated.amount,
        currency: validated.currency,
        status: 'pending',
        source_event: validated.sourceEvent,
        created_at: new Date().toISOString(),
        expires_at: validated.expiresAt ?? null,
      },
      { onConflict: 'idempotency_key' }
    )
    .select('amount,created_at,currency,delivered_at,expires_at,failed_reason,id,idempotency_key,reward_type,source_event,status,user_id')
    .single();

  if (error) {
    throw new RewardLedgerRepositoryError('upsert', error);
  }

  return RewardLedgerRecordSchema.parse({
    id: data.id,
    userId: data.user_id,
    idempotencyKey: data.idempotency_key,
    rewardType: data.reward_type,
    amount: data.amount,
    currency: data.currency,
    status: data.status,
    sourceEvent: data.source_event,
    createdAt: data.created_at,
    deliveredAt: data.delivered_at,
    failedReason: data.failed_reason,
    expiresAt: data.expires_at,
  });
}

export async function getRewardLedgerById(
  ledgerId: string,
): Promise<RewardLedgerRecord> {
  const { data, error } = await supabase
    .from('reward_ledger')
    .select('id,user_id,idempotency_key,reward_type,amount,currency,status,source_event,created_at,delivered_at,failed_reason,expires_at')
    .eq('id', ledgerId)
    .single();

  if (error) {
    throw new RewardLedgerRepositoryError('getById', error);
  }

  return RewardLedgerRecordSchema.parse({
    id: data.id,
    userId: data.user_id,
    idempotencyKey: data.idempotency_key,
    rewardType: data.reward_type,
    amount: data.amount,
    currency: data.currency,
    status: data.status,
    sourceEvent: data.source_event,
    createdAt: data.created_at,
    deliveredAt: data.delivered_at,
    failedReason: data.failed_reason,
    expiresAt: data.expires_at,
  });
}

export async function updateRewardLedgerStatus(
  ledgerId: string,
  status: 'delivered' | 'failed' | 'expired',
  failedReason?: string,
): Promise<RewardLedgerRecord> {
  const updateData: Record<string, unknown> = {
    status,
    delivered_at: status === 'delivered' ? new Date().toISOString() : null,
    failed_reason: failedReason ?? null,
  };

  const { data, error } = await supabase
    .from('reward_ledger')
    .update(updateData)
    .eq('id', ledgerId)
    .select('amount,created_at,currency,delivered_at,expires_at,failed_reason,id,idempotency_key,reward_type,source_event,status,user_id')
    .single();

  if (error) {
    throw new RewardLedgerRepositoryError('updateStatus', error);
  }

  return RewardLedgerRecordSchema.parse({
    id: data.id,
    userId: data.user_id,
    idempotencyKey: data.idempotency_key,
    rewardType: data.reward_type,
    amount: data.amount,
    currency: data.currency,
    status: data.status,
    sourceEvent: data.source_event,
    createdAt: data.created_at,
    deliveredAt: data.delivered_at,
    failedReason: data.failed_reason,
    expiresAt: data.expires_at,
  });
}

export async function fetchPendingRewards(
  userId: string,
): Promise<RewardLedgerRecord[]> {
  const { data, error } = await supabase
    .from('reward_ledger')
    .select('id,user_id,idempotency_key,reward_type,amount,currency,status,source_event,created_at,delivered_at,failed_reason,expires_at')
    .eq('user_id', userId)
    .eq('status', 'pending');

  if (error) {
    throw new RewardLedgerRepositoryError('fetchPending', error);
  }

  return z.array(RewardLedgerRecordSchema).parse(
    data.map((d) => ({
      id: d.id,
      userId: d.user_id,
      idempotencyKey: d.idempotency_key,
      rewardType: d.reward_type,
      amount: d.amount,
      currency: d.currency,
      status: d.status,
      sourceEvent: d.source_event,
      createdAt: d.created_at,
      deliveredAt: d.delivered_at,
      failedReason: d.failed_reason,
      expiresAt: d.expires_at,
    })),
  );
}
