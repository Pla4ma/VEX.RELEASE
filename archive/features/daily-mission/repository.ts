/**
 * Daily Mission Repository
 *
 * Supabase queries for daily mission persistence.
 */

import { getSupabaseClient } from '../../config/supabase';
import { RepositoryError } from '../../lib/repository/base';
import { DailyMissionSchema, type DailyMission } from './schemas';

const supabase = getSupabaseClient();

export async function fetchDailyMission(
  userId: string,
): Promise<DailyMission | null> {
  const { data, error } = await supabase
    .from('daily_missions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_completed', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new RepositoryError('fetchDailyMission', error);
  }

  return DailyMissionSchema.parse(data);
}

export async function upsertDailyMission(
  mission: DailyMission,
): Promise<DailyMission> {
  const { data, error } = await supabase
    .from('daily_missions')
    .upsert(
      {
        id: mission.id,
        user_id: (mission as Record<string, unknown>).userId as string,
        type: mission.type,
        priority: mission.priority,
        title: mission.title,
        reason: mission.reason,
        cta_label: mission.ctaLabel,
        cta_route: mission.ctaRoute,
        target_system: mission.targetSystem,
        expires_at: new Date(mission.expiresAt).toISOString(),
        analytics_payload: mission.analyticsPayload,
        is_completed: mission.isCompleted,
        progress: mission.progress,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
    .select()
    .single();

  if (error) throw new RepositoryError('upsertDailyMission', error);
  return DailyMissionSchema.parse(data);
}

export async function markMissionCompleted(
  missionId: string,
): Promise<void> {
  const { error } = await supabase
    .from('daily_missions')
    .update({ is_completed: true, updated_at: new Date().toISOString() })
    .eq('id', missionId);

  if (error) throw new RepositoryError('markMissionCompleted', error);
}
