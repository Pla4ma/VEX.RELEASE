import { z } from 'zod';
import { getSupabaseClient } from '../../config/supabase';
import {
  CompanionMemoryCreateSchema,
  CompanionMemoryRowSchema,
} from './memory-schemas';
import type {
  CompanionMemory,
  CompanionMemoryCreate,
  CompanionMemoryTableInsert,
  CompanionMemoryType,
} from './memory-types';

export class CompanionMemoryRepositoryError extends Error {
  constructor(
    operation: string,
    public readonly cause?: unknown,
  ) {
    super(`CompanionMemoryRepository ${operation} failed`);
    this.name = 'CompanionMemoryRepositoryError';
  }
}

export async function createMemory(
  memory: CompanionMemoryCreate,
): Promise<CompanionMemory | null> {
  try {
    const parsed = CompanionMemoryCreateSchema.parse(memory);
    const row: CompanionMemoryTableInsert = {
      body: parsed.body,
      grade: parsed.grade,
      purity_score: parsed.purityScore,
      session_date: parsed.sessionDate,
      session_id: parsed.sessionId,
      streak_day: parsed.streakDay,
      title: parsed.title,
      type: parsed.type,
      user_id: parsed.userId,
    };
    const { data, error } = await getSupabaseClient()
      .from('companion_memories')
      .insert(row)
      .select('id,user_id,body,created_at,grade,purity_score,session_date,session_id,streak_day,title,type')
      .single();
    if (error) {
      if (isDuplicateError(error)) {
        return null;
      }
      throw new CompanionMemoryRepositoryError('createMemory', error);
    }
    return mapRow(data);
  } catch (error) {
    if (error instanceof CompanionMemoryRepositoryError) {
      throw error;
    }
    throw new CompanionMemoryRepositoryError('createMemory', error);
  }
}

export async function getMemories(userId: string): Promise<CompanionMemory[]> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('companion_memories')
      .select('id,user_id,body,created_at,grade,purity_score,session_date,session_id,streak_day,title,type')
      .eq('user_id', z.string().uuid().parse(userId))
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) {
      throw new CompanionMemoryRepositoryError('getMemories', error);
    }
    return z
      .array(CompanionMemoryRowSchema)
      .parse(data ?? [])
      .map(mapRow);
  } catch (error) {
    if (error instanceof CompanionMemoryRepositoryError) {
      throw error;
    }
    throw new CompanionMemoryRepositoryError('getMemories', error);
  }
}

export async function hasMemory(
  userId: string,
  type: CompanionMemoryType,
): Promise<boolean> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('companion_memories')
      .select('id')
      .eq('user_id', z.string().uuid().parse(userId))
      .eq('type', type)
      .maybeSingle();
    if (error) {
      throw new CompanionMemoryRepositoryError('hasMemory', error);
    }
    return Boolean(data);
  } catch (error) {
    if (error instanceof CompanionMemoryRepositoryError) {
      throw error;
    }
    throw new CompanionMemoryRepositoryError('hasMemory', error);
  }
}

function mapRow(row: unknown): CompanionMemory {
  const parsed = CompanionMemoryRowSchema.parse(row);
  return {
    body: parsed.body,
    createdAt: parsed.created_at,
    grade: parsed.grade,
    id: parsed.id,
    purityScore: parsed.purity_score,
    sessionDate: parsed.session_date,
    sessionId: parsed.session_id,
    streakDay: parsed.streak_day,
    title: parsed.title,
    type: parsed.type,
    userId: parsed.user_id,
  };
}

function isDuplicateError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === '23505'
  );
}
