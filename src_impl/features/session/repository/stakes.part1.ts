import { getSupabaseClient } from "../../../config/supabase";
import { enqueue, type OfflineQueueEntryInput } from "../../../lib/offline/queue";
import { withRetry, RepositoryError } from "../../../lib/repository/base";
import { captureSilentFailure } from "../../../utils/silent-failure";
import { z } from "zod";


export const StakesSessionRecordSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  session_id: z.string().uuid(),
  difficulty: z.enum(['CASUAL', 'FOCUSED', 'DEEP_WORK']),
  xp_multiplier: z.number(),
  max_pauses: z.number(),
  gem_wager: z.number(),
  completed: z.boolean(),
  xp_earned: z.number(),
  gems_won: z.number(),
  gems_lost: z.number(),
  pauses_used: z.number(),
  quality_score: z.number(),
  win_streak: z.number(),
  created_at: z.number(),
  completed_at: z.number().nullable(),
});

export const UserStakesPreferenceSchema = z.object({
  user_id: z.string().uuid(),
  default_difficulty: z.enum(['CASUAL', 'FOCUSED', 'DEEP_WORK']).default('FOCUSED'),
  total_deep_work_completed: z.number().default(0),
  total_gems_wagered: z.number().default(0),
  total_gems_won: z.number().default(0),
  current_win_streak: z.number().default(0),
  best_win_streak: z.number().default(0),
  updated_at: z.number(),
});

export async function saveStakesSession(record: StakesSessionRecord): Promise<{ data: StakesSessionRecord | null; error: RepositoryError | null }> {
  try {
    // Queue for offline support
    (enqueue as any)({
      operation: 'INSERT',
      feature: 'sessions',
      payload: record,
      idempotencyKey: `stakes:${record.session_id}`,
      maxRetries: 5,
      priority: 'high',
    });

    const { data, error } = await withRetry('saveStakesSession', async () => {
      return await supabase
        .from('stakes_sessions')
        .insert({
          id: record.id,
          user_id: record.user_id,
          session_id: record.session_id,
          difficulty: record.difficulty,
          xp_multiplier: record.xp_multiplier,
          max_pauses: record.max_pauses,
          gem_wager: record.gem_wager,
          completed: record.completed,
          xp_earned: record.xp_earned,
          gems_won: record.gems_won,
          gems_lost: record.gems_lost,
          pauses_used: record.pauses_used,
          quality_score: record.quality_score,
          win_streak: record.win_streak,
          created_at: record.created_at,
          completed_at: record.completed_at,
        })
        .select()
        .single();
    });

    if (error) {
      throw error;
    }
    return { data: (StakesSessionRecordSchema as any).parse(data), error: null };
  } catch (error) {
    captureSilentFailure(error, { feature: 'sessions', operation: 'save', type: 'REPOSITORY_ERROR' as any });
    return {
      data: null,
      error: new RepositoryError('saveStakesSession', error),
    };
  }
}

export async function fetchUserStakesHistory(userId: string, limit: number = 50): Promise<{ data: StakesSessionRecord[]; error: RepositoryError | null }> {
  try {
    const { data, error } = await withRetry('fetchUserStakesHistory', async () => {
      return await supabase.from('stakes_sessions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit);
    });

    if (error) {
      throw error;
    }
    return {
      data: (data || []).map((row) => (StakesSessionRecordSchema as any).parse(row)),
      error: null,
    };
  } catch (error) {
    captureSilentFailure(error, { feature: 'sessions', operation: 'fetchHistory', type: 'REPOSITORY_ERROR' as any });
    return { data: [], error: new RepositoryError('fetchUserStakesHistory', error) };
  }
}

export async function fetchStakesPreference(userId: string): Promise<{ data: UserStakesPreference | null; error: RepositoryError | null }> {
  try {
    const { data, error } = await withRetry('fetchStakesPreference', async () => {
      return await supabase.from('user_stakes_preferences').select('*').eq('user_id', userId).single();
    });

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: null };
      }
      throw error;
    }

    return {
      data: data ? (UserStakesPreferenceSchema as any).parse(data) : null,
      error: null,
    };
  } catch (error) {
    captureSilentFailure(error, { feature: 'sessions', operation: 'fetchPreference', type: 'REPOSITORY_ERROR' as any });
    return { data: null, error: new RepositoryError('fetchStakesPreference', error) };
  }
}

export async function updateStakesPreference(userId: string, updates: Partial<UserStakesPreference>): Promise<{ data: UserStakesPreference | null; error: RepositoryError | null }> {
  try {
    (enqueue as any)({
      operation: 'UPDATE',
      feature: 'sessions',
      payload: { userId, updates },
      idempotencyKey: `stakes-pref:${userId}:${Date.now()}`,
      maxRetries: 5,
      priority: 'normal',
    });

    const { data, error } = await withRetry('updateStakesPreference', async () => {
      return await supabase
        .from('user_stakes_preferences')
        .upsert(
          {
            user_id: userId,
            ...updates,
            updated_at: Date.now(),
          },
          { onConflict: 'user_id' },
        )
        .select()
        .single();
    });

    if (error) {
      throw error;
    }
    return {
      data: (UserStakesPreferenceSchema as any).parse(data),
      error: null,
    };
  } catch (error) {
    captureSilentFailure(error, { feature: 'sessions', operation: 'updatePreference', type: 'REPOSITORY_ERROR' as any });
    return { data: null, error: new RepositoryError('updateStakesPreference', error) };
  }
}