import { captureSilentFailure } from '../../utils/silent-failure';
/**
 * Neuroplasticity Trainer Repository
 *
 * Database abstraction layer with error handling and retry logic.
 */

import { z } from 'zod';
import { getSupabaseClient } from '../../config/supabase';
import * as Sentry from '@sentry/react-native';
import type { CognitiveDomain, DomainProgress, CognitiveProfile } from './NeuroplasticityTrainer';

// ============================================================================
// ERROR HANDLING
// ============================================================================

class RepositoryError extends Error {
  constructor(
    public operation: string,
    public originalError: unknown
  ) {
    super(`Repository error in ${operation}: ${originalError}`);
    this.name = 'RepositoryError';
  }
}

// ============================================================================
// RETRY LOGIC
// ============================================================================

async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        Sentry.captureException(error, {
          tags: { repository: 'neuroplasticity', operation: operationName },
          extra: { attempt, maxRetries },
        });
        throw new RepositoryError(operationName, error);
      }

      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }

  throw new RepositoryError(operationName, lastError);
}

// ============================================================================
// SCHEMAS
// ============================================================================

const NptProfileRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  adhd_subtype: z.enum(['INATTENTIVE', 'HYPERACTIVE', 'COMBINED', 'UNSPECIFIED']),
  overall_level: z.number(),
  title: z.string(),
  total_training_minutes: z.number(),
  current_streak_days: z.number(),
  longest_streak_days: z.number(),
  total_interventions_delivered: z.number(),
  baseline_scores: z.record(z.number()),
  current_scores: z.record(z.number()),
  priority_domains: z.array(z.string()),
  created_at: z.string(),
  updated_at: z.string(),
});

const NptDomainProgressRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  domain: z.string(),
  level: z.number(),
  xp: z.number(),
  xp_to_next_level: z.number(),
  accuracy: z.number(),
  response_time_ms: z.number(),
  streak_days: z.number(),
  total_sessions: z.number(),
  baseline_score: z.number(),
  current_score: z.number(),
  improvement_percent: z.number(),
  current_difficulty: z.string(),
  last_trained_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

const NptSessionRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  domain: z.string(),
  accuracy: z.number(),
  xp_earned: z.number(),
  level_up: z.boolean(),
  session_duration_seconds: z.number(),
  started_at: z.string(),
  completed_at: z.string(),
});

// ============================================================================
// PROFILE OPERATIONS
// ============================================================================

export async function getNptProfile(userId: string): Promise<CognitiveProfile | null> {
  return withRetry(async () => {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('npt_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {return null;}
      throw error;
    }

    if (!data) {return null;}

    const parsed = NptProfileRowSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(`Invalid profile data: ${parsed.error.message}`);
    }

    return transformRowToProfile(parsed.data);
  }, 'getNptProfile');
}

export async function createNptProfile(
  userId: string,
  profile: CognitiveProfile
): Promise<CognitiveProfile> {
  return withRetry(async () => {
    const supabase = getSupabaseClient();

    const row = {
      user_id: userId,
      adhd_subtype: profile.adhdSubtype,
      overall_level: profile.overallLevel,
      title: profile.title,
      total_training_minutes: profile.totalTrainingMinutes,
      current_streak_days: profile.currentStreakDays,
      longest_streak_days: profile.longestStreakDays,
      total_interventions_delivered: profile.totalInterventionsDelivered,
      baseline_scores: profile.baselineScores,
      current_scores: profile.currentScores,
      priority_domains: profile.priorityDomains,
    };

    const { data, error } = await supabase
      .from('npt_profiles')
      .insert(row)
      .select()
      .single();

    if (error) {throw error;}

    return transformRowToProfile(data);
  }, 'createNptProfile');
}

export async function updateNptProfile(
  userId: string,
  updates: Partial<CognitiveProfile>
): Promise<CognitiveProfile> {
  return withRetry(async () => {
    const supabase = getSupabaseClient();

    const rowUpdates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.overallLevel !== undefined) {rowUpdates.overall_level = updates.overallLevel;}
    if (updates.title !== undefined) {rowUpdates.title = updates.title;}
    if (updates.totalTrainingMinutes !== undefined) {rowUpdates.total_training_minutes = updates.totalTrainingMinutes;}
    if (updates.currentStreakDays !== undefined) {rowUpdates.current_streak_days = updates.currentStreakDays;}
    if (updates.longestStreakDays !== undefined) {rowUpdates.longest_streak_days = updates.longestStreakDays;}
    if (updates.totalInterventionsDelivered !== undefined) {
      rowUpdates.total_interventions_delivered = updates.totalInterventionsDelivered;
    }
    if (updates.currentScores !== undefined) {rowUpdates.current_scores = updates.currentScores;}
    if (updates.priorityDomains !== undefined) {rowUpdates.priority_domains = updates.priorityDomains;}

    const { data, error } = await supabase
      .from('npt_profiles')
      .update(rowUpdates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {throw error;}

    return transformRowToProfile(data);
  }, 'updateNptProfile');
}

// ============================================================================
// DOMAIN PROGRESS OPERATIONS
// ============================================================================

export async function getDomainProgress(userId: string, domain: CognitiveDomain): Promise<DomainProgress | null> {
  return withRetry(async () => {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('npt_domain_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('domain', domain)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {return null;}
      throw error;
    }

    if (!data) {return null;}

    const parsed = NptDomainProgressRowSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(`Invalid domain progress data: ${parsed.error.message}`);
    }

    return transformRowToDomainProgress(parsed.data);
  }, 'getDomainProgress');
}

export async function getAllDomainProgress(userId: string): Promise<Record<CognitiveDomain, DomainProgress> | null> {
  return withRetry(async () => {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('npt_domain_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) {throw error;}

    if (!data || data.length === 0) {return null;}

    const result = {} as Record<CognitiveDomain, DomainProgress>;

    for (const row of data) {
      const parsed = NptDomainProgressRowSchema.safeParse(row);
      if (parsed.success) {
        result[parsed.data.domain as CognitiveDomain] = transformRowToDomainProgress(parsed.data);
      }
    }

    return result;
  }, 'getAllDomainProgress');
}

export async function upsertDomainProgress(
  userId: string,
  progress: DomainProgress
): Promise<DomainProgress> {
  return withRetry(async () => {
    const supabase = getSupabaseClient();

    const row = {
      user_id: userId,
      domain: progress.domain,
      level: progress.level,
      xp: progress.xp,
      xp_to_next_level: progress.xpToNextLevel,
      accuracy: progress.accuracy,
      response_time_ms: progress.responseTimeMs,
      streak_days: progress.streakDays,
      total_sessions: progress.totalSessions,
      baseline_score: progress.baselineScore,
      current_score: progress.currentScore,
      improvement_percent: progress.improvementPercent,
      current_difficulty: progress.currentDifficulty,
      last_trained_at: progress.lastTrainedAt ? new Date(progress.lastTrainedAt).toISOString() : null,
    };

    const { data, error } = await supabase
      .from('npt_domain_progress')
      .upsert(row, { onConflict: 'user_id,domain' })
      .select()
      .single();

    if (error) {throw error;}

    return transformRowToDomainProgress(data);
  }, 'upsertDomainProgress');
}

// ============================================================================
// SESSION OPERATIONS
// ============================================================================

export async function recordTrainingSession(
  userId: string,
  session: {
    domain: CognitiveDomain;
    accuracy: number;
    xpEarned: number;
    levelUp: boolean;
    sessionDurationSeconds: number;
    startedAt: number;
    completedAt: number;
  }
): Promise<void> {
  return withRetry(async () => {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('npt_sessions')
      .insert({
        user_id: userId,
        domain: session.domain,
        accuracy: session.accuracy,
        xp_earned: session.xpEarned,
        level_up: session.levelUp,
        session_duration_seconds: session.sessionDurationSeconds,
        started_at: new Date(session.startedAt).toISOString(),
        completed_at: new Date(session.completedAt).toISOString(),
      });

    if (error) {throw error;}
  }, 'recordTrainingSession');
}

export async function getTrainingStats(
  userId: string,
  days: number = 30
): Promise<{
  totalSessions: number;
  averageAccuracy: number;
  totalXp: number;
  sessionsByDomain: Record<string, number>;
}> {
  return withRetry(async () => {
    const supabase = getSupabaseClient();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data, error } = await supabase
      .from('npt_sessions')
      .select('domain, accuracy, xp_earned')
      .eq('user_id', userId)
      .gte('completed_at', cutoffDate.toISOString());

    if (error) {throw error;}

    const sessions = data || [];

    const sessionsByDomain: Record<string, number> = {};
    let totalXp = 0;
    let totalAccuracy = 0;

    for (const session of sessions) {
      sessionsByDomain[session.domain] = (sessionsByDomain[session.domain] || 0) + 1;
      totalXp += session.xp_earned;
      totalAccuracy += session.accuracy;
    }

    return {
      totalSessions: sessions.length,
      averageAccuracy: sessions.length > 0 ? totalAccuracy / sessions.length : 0,
      totalXp,
      sessionsByDomain,
    };
  }, 'getTrainingStats');
}

// ============================================================================
// TRANSFORMERS
// ============================================================================

function transformRowToProfile(row: z.infer<typeof NptProfileRowSchema>): CognitiveProfile {
  return {
    userId: row.user_id,
    adhdSubtype: row.adhd_subtype,
    assessedAt: new Date(row.created_at).getTime(),
    baselineScores: row.baseline_scores as Record<CognitiveDomain, number>,
    currentScores: row.current_scores as Record<CognitiveDomain, number>,
    priorityDomains: row.priority_domains as CognitiveDomain[],
    recommendedSessionStructure: {
      focusDurationMinutes: 25,
      breakFrequencyMinutes: 25,
      microInterventionType: 'ATTENTION_RESET',
      difficultyCurve: 'MODERATE',
    },
    totalTrainingMinutes: row.total_training_minutes,
    currentStreakDays: row.current_streak_days,
    longestStreakDays: row.longest_streak_days,
    totalInterventionsDelivered: row.total_interventions_delivered,
    overallLevel: row.overall_level,
    title: row.title,
    assessments: [],
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

function transformRowToDomainProgress(row: z.infer<typeof NptDomainProgressRowSchema>): DomainProgress {
  return {
    domain: row.domain as CognitiveDomain,
    level: row.level,
    xp: row.xp,
    xpToNextLevel: row.xp_to_next_level,
    accuracy: row.accuracy,
    responseTimeMs: row.response_time_ms,
    streakDays: row.streak_days,
    totalSessions: row.total_sessions,
    lastTrainedAt: row.last_trained_at ? new Date(row.last_trained_at).getTime() : null,
    baselineScore: row.baseline_score,
    currentScore: row.current_score,
    improvementPercent: row.improvement_percent,
    currentDifficulty: row.current_difficulty as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT',
    adaptiveParameters: {
      stimulusDuration: 1000,
      interStimulusInterval: 2000,
      distractionProbability: 0.1,
      workingMemoryLoad: 1,
    },
  };
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

export async function isRepositoryHealthy(): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('npt_profiles').select('count', { count: 'exact', head: true });
    return !error;
  } catch (error) { captureSilentFailure(error, { feature: 'neuroplasticity', operation: 'network-fallback', type: 'network' });
    return false;
  }
}
