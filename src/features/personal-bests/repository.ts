import { z } from 'zod';
import { getSupabaseClient } from '../../config/supabase';
import { PersonalBestCandidateSchema, PersonalBestRowSchema } from './schemas';
import type {
  DurationBucket,
  PersonalBest,
  PersonalBestCandidate,
  PersonalBestTableInsert,
  PersonalBestTableUpdate,
} from './types';
import type { SessionMode } from '../../session/modes';

export class PersonalBestsRepositoryError extends Error {
  constructor(operation: string, public readonly cause?: unknown) {
    super(`PersonalBestsRepository ${operation} failed`);
    this.name = 'PersonalBestsRepositoryError';
  }
}

function mapRow(row: unknown): PersonalBest {
  const parsed = PersonalBestRowSchema.parse(row);
  return {
    id: parsed.id,
    userId: parsed.user_id,
    sessionMode: parsed.session_mode,
    durationBucket: parsed.duration_bucket,
    bestPurityScore: parsed.best_purity_score,
    bestGrade: parsed.best_grade,
    totalSessions: parsed.total_sessions,
    achievedAt: parsed.achieved_at,
    updatedAt: parsed.updated_at,
  };
}

export async function getPersonalBest(
  userId: string,
  sessionMode: SessionMode,
  durationBucket: DurationBucket,
): Promise<PersonalBest | null> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('personal_bests')
      .select('*')
      .eq('user_id', userId)
      .eq('session_mode', sessionMode)
      .eq('duration_bucket', durationBucket)
      .maybeSingle();
    if (error) {
      throw new PersonalBestsRepositoryError('getPersonalBest', error);
    }
    return data ? mapRow(data) : null;
  } catch (error) {
    if (error instanceof PersonalBestsRepositoryError) {
      throw error;
    }
    throw new PersonalBestsRepositoryError('getPersonalBest', error);
  }
}

export async function upsertPersonalBest(candidate: PersonalBestCandidate): Promise<PersonalBest> {
  try {
    const parsed = PersonalBestCandidateSchema.parse(candidate);
    const current = await getPersonalBest(parsed.userId, parsed.sessionMode, parsed.durationBucket);
    if (current && parsed.bestPurityScore <= current.bestPurityScore) {
      return current;
    }
    const now = new Date().toISOString();
    if (!current) {
      const row: PersonalBestTableInsert = toInsert(parsed, now);
      const { data, error } = await getSupabaseClient()
        .from('personal_bests')
        .insert(row)
        .select('*')
        .single();
      if (error) {
        throw new PersonalBestsRepositoryError('upsertPersonalBest', error);
      }
      return mapRow(data);
    }
    const patch: PersonalBestTableUpdate = {
      achieved_at: now,
      best_grade: parsed.bestGrade,
      best_purity_score: parsed.bestPurityScore,
      total_sessions: current.totalSessions + 1,
      updated_at: now,
    };
    const { data, error } = await getSupabaseClient()
      .from('personal_bests')
      .update(patch)
      .eq('id', current.id)
      .select('*')
      .single();
    if (error) {
      throw new PersonalBestsRepositoryError('upsertPersonalBest', error);
    }
    return mapRow(data);
  } catch (error) {
    if (error instanceof PersonalBestsRepositoryError) {
      throw error;
    }
    throw new PersonalBestsRepositoryError('upsertPersonalBest', error);
  }
}

export async function getUserPersonalBests(userId: string): Promise<PersonalBest[]> {
  try {
    const { data, error } = await getSupabaseClient()
      .from('personal_bests')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    if (error) {
      throw new PersonalBestsRepositoryError('getUserPersonalBests', error);
    }
    return z.array(PersonalBestRowSchema).parse(data ?? []).map(mapRow);
  } catch (error) {
    if (error instanceof PersonalBestsRepositoryError) {
      throw error;
    }
    throw new PersonalBestsRepositoryError('getUserPersonalBests', error);
  }
}

function toInsert(candidate: PersonalBestCandidate, now: string): PersonalBestTableInsert {
  return {
    achieved_at: now,
    best_grade: candidate.bestGrade,
    best_purity_score: candidate.bestPurityScore,
    duration_bucket: candidate.durationBucket,
    session_mode: candidate.sessionMode,
    total_sessions: 1,
    updated_at: now,
    user_id: candidate.userId,
  };
}
