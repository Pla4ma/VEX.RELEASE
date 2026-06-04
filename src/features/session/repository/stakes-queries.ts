import { getSupabaseClient } from '../../../config/supabase';
import { enqueue } from '../../../lib/offline/queue';
import { withRetry, RepositoryError } from '../../../lib/repository/base';
import { captureSilentFailure } from '../../../utils/silent-failure';
import {
  StakesSessionRecordSchema,
  UserStakesPreferenceSchema,
  type StakesSessionRecord,
  type UserStakesPreference,
} from './stakes-schemas';

const supabase = getSupabaseClient();

export async function saveStakesSession(
  record: StakesSessionRecord,
): Promise<{
  data: StakesSessionRecord | null;
  error: RepositoryError | null;
}> {
  try {
    enqueue({
      operation: 'CREATE',
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
    return { data: StakesSessionRecordSchema.parse(data), error: null };
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'sessions',
      operation: 'save',
      type: 'data',
    });
    return {
      data: null,
      error: new RepositoryError('saveStakesSession', error),
    };
  }
}

export async function fetchUserStakesHistory(
  userId: string,
  limit: number = 50,
): Promise<{ data: StakesSessionRecord[]; error: RepositoryError | null }> {
  try {
    const { data, error } = await withRetry(
      'fetchUserStakesHistory',
      async () => {
        return await supabase
          .from('stakes_sessions')
          .select('id,user_id,session_id,difficulty,xp_multiplier,max_pauses,gem_wager,completed,xp_earned,gems_won,gems_lost,pauses_used,quality_score,win_streak,created_at,completed_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);
      },
    );
    if (error) {
      throw error;
    }
    return {
      data: (data || []).map((row) => StakesSessionRecordSchema.parse(row)),
      error: null,
    };
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'sessions',
      operation: 'fetchHistory',
      type: 'data',
    });
    return {
      data: [],
      error: new RepositoryError('fetchUserStakesHistory', error),
    };
  }
}

export async function fetchStakesPreference(
  userId: string,
): Promise<{
  data: UserStakesPreference | null;
  error: RepositoryError | null;
}> {
  try {
    const { data, error } = await withRetry(
      'fetchStakesPreference',
      async () => {
        return await supabase
          .from('user_stakes_preferences')
          .select('user_id,default_difficulty,total_deep_work_completed,total_gems_wagered,total_gems_won,current_win_streak,best_win_streak,updated_at')
          .eq('user_id', userId)
          .single();
      },
    );
    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: null };
      }
      throw error;
    }
    return {
      data: data ? UserStakesPreferenceSchema.parse(data) : null,
      error: null,
    };
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'sessions',
      operation: 'fetchPreference',
      type: 'data',
    });
    return {
      data: null,
      error: new RepositoryError('fetchStakesPreference', error),
    };
  }
}
