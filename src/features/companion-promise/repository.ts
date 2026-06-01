import { z } from 'zod';
import { getSupabaseClient } from '../../config/supabase';
import {
  CompanionPromiseRepositoryRowSchema,
  CompanionPromiseSchema,
  CreateCompanionPromiseInputSchema,
} from './schemas';
import type {
  CompanionPromise,
  CompanionPromiseInsert,
  CompanionPromiseUpdate,
  CreateCompanionPromiseInput,
} from './types';

const DomainStatusByDatabaseStatus = {
  active: 'pending',
  fulfilled: 'fulfilled',
  missed: 'missed',
  recovered: 'replaced',
  skipped: 'replaced',
} as const;

export class CompanionPromiseRepositoryError extends Error {
  constructor(
    operation: string,
    public readonly cause?: unknown,
  ) {
    super(`CompanionPromiseRepository ${operation} failed`);
    this.name = 'CompanionPromiseRepositoryError';
  }
}

function mapRow(row: unknown): CompanionPromise {
  const parsed = CompanionPromiseRepositoryRowSchema.parse(row);
  return CompanionPromiseSchema.parse({
    createdAt: parsed.created_at,
    fulfilledAt: parsed.fulfilled_at,
    id: parsed.id,
    missedAt: parsed.missed_at,
    sourceSessionId: parsed.source_session_id,
    status:
      DomainStatusByDatabaseStatus[
        parsed.status as keyof typeof DomainStatusByDatabaseStatus
      ] ?? 'pending',
    targetDate: parsed.promised_for,
    targetDurationMinutes: parsed.recommended_duration_minutes,
    targetMode: parsed.recommended_mode,
    userId: parsed.user_id,
  });
}

function toLegacyWindow(targetDate: string): { end: string; start: string } {
  return {
    end: new Date(`${targetDate}T23:59:59.999`).toISOString(),
    start: new Date(`${targetDate}T00:00:00.000`).toISOString(),
  };
}

async function updatePromiseById(
  promiseId: string,
  patch: CompanionPromiseUpdate,
): Promise<CompanionPromise> {
  const { data, error } = await getSupabaseClient()
    .from('companion_promises')
    .update(patch)
    .eq('id', promiseId)
    .select('*')
    .single();
  if (error) {
    throw new CompanionPromiseRepositoryError('update', error);
  }
  return mapRow(data);
}

export async function createPromise(
  input: CreateCompanionPromiseInput,
): Promise<CompanionPromise> {
  try {
    const parsed = CreateCompanionPromiseInputSchema.parse(input);
    const legacyWindow = toLegacyWindow(parsed.targetDate);
    const row: CompanionPromiseInsert = {
      copy_seed: {},
      created_at: parsed.createdAt,
      promised_for: parsed.targetDate,
      recommended_duration_minutes: parsed.targetDurationMinutes,
      recommended_mode: parsed.targetMode,
      source_session_id: parsed.sourceSessionId,
      status: 'active',
      target_date: parsed.targetDate,
      target_duration_minutes: parsed.targetDurationMinutes,
      target_mode: parsed.targetMode,
      user_id: parsed.userId,
      window_end: legacyWindow.end,
      window_start: legacyWindow.start,
    };
    const { data, error } = await getSupabaseClient()
      .from('companion_promises')
      .insert(row)
      .select('*')
      .single();
    if (error) {
      throw new CompanionPromiseRepositoryError('create', error);
    }
    return mapRow(data);
  } catch (error) {
    if (
      error instanceof CompanionPromiseRepositoryError ||
      error instanceof z.ZodError
    ) {
      throw error;
    }
    throw new CompanionPromiseRepositoryError('create', error);
  }
}

export async function getRecentPromises(
  userId: string,
  limit = 3,
): Promise<CompanionPromise[]> {
  const { data, error } = await getSupabaseClient()
    .from('companion_promises')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    throw new CompanionPromiseRepositoryError('getRecent', error);
  }
  return z
    .array(CompanionPromiseRepositoryRowSchema)
    .parse(data ?? [])
    .map(mapRow);
}

export async function getPendingPromise(
  userId: string,
): Promise<CompanionPromise | null> {
  const promises = await getRecentPromises(userId, 5);
  return promises.find((promise) => promise.status === 'pending') ?? null;
}

export async function replacePromise(
  promiseId: string,
): Promise<CompanionPromise> {
  return updatePromiseById(promiseId, { status: 'skipped' });
}

export async function fulfillPromise(
  promiseId: string,
  fulfilledAt: string,
  sessionId: string,
): Promise<CompanionPromise> {
  return updatePromiseById(promiseId, {
    fulfilled_at: fulfilledAt,
    fulfilled_session_id: sessionId,
    status: 'fulfilled',
  });
}

export async function markPromiseMissed(
  promiseId: string,
  missedAt: string,
): Promise<CompanionPromise> {
  return updatePromiseById(promiseId, {
    missed_at: missedAt,
    status: 'missed',
  });
}

export async function dismissRecoveryPromise(
  promiseId: string,
): Promise<CompanionPromise> {
  return updatePromiseById(promiseId, { status: 'skipped' });
}
