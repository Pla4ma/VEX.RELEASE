import { captureSilentFailure } from "../../../utils/silent-failure";
import { withRetry, RepositoryError, RepositoryErrorCode } from "../../../lib/repository/base";
import { enqueue, type OfflineQueueEntryInput } from "../../../lib/offline/queue";
import { getSupabaseClient } from "../../../config/supabase";
import { StreakSchema, type Streak } from "../schemas";
import { v4 } from "../../../utils/uuid";
import { StreakRepairQuestSchema, type StreakRepairQuest } from "../schemas-enhanced";
import { StreakRiskStatusSchema, type StreakRiskStatus } from "../schemas-enhanced";


export async function updateRepairQuestEnhanced(questId: string, updates: Partial<StreakRepairQuest>): Promise<RepositoryResult<StreakRepairQuest>> {
  (enqueue as any)({
    operation: 'UPDATE',
    feature: 'streaks',
    payload: { questId, updates },
    idempotencyKey: `repair-quest:update:${questId}:${Date.now()}`,
    maxRetries: 5,
    priority: 'high',
  });

  return executeWithFallback('updateRepairQuest', async () => {
    const { data, error } = await supabase
      .from('streak_repair_quests')
      .update({
        sessions_completed: updates.sessionsCompleted,
        session_ids: updates.sessionIds,
        status: updates.status,
        completed_at: updates.completedAt,
        updated_at: Date.now(),
      })
      .eq('id', questId)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return StreakRepairQuestSchema.parse(data);
  });
}

export async function fetchExpiredRepairQuestsEnhanced(): Promise<
  RepositoryResult<
    Array<{
      id: string;
      userId: string;
      previousStreak: number;
      status: string;
      expiresAt: number;
    }>
  >
> {
  return executeWithFallback('fetchExpiredRepairQuests', async () => {
    const { data, error } = await supabase.from('streak_repair_quests').select('id, user_id, previous_streak, status, expires_at').eq('status', 'ACTIVE').lt('expires_at', Date.now());

    if (error) {
      throw error;
    }

    return (data || []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      userId: row.user_id as string,
      previousStreak: row.previous_streak as number,
      status: row.status as string,
      expiresAt: row.expires_at as number,
    }));
  });
}

export async function saveRiskStatusEnhanced(status: StreakRiskStatus): Promise<RepositoryResult<StreakRiskStatus>> {
  return executeWithFallback('saveRiskStatus', async () => {
    const { data, error } = await supabase
      .from('streak_risk_status')
      .upsert(
        {
          user_id: status.userId,
          current_days: status.currentDays,
          hours_remaining: status.hoursRemaining,
          minutes_remaining: status.minutesRemaining,
          risk_level: status.riskLevel,
          flame_health_percent: status.flameHealthPercent,
          is_at_risk: status.isAtRisk,
          is_critical: status.isCritical,
          notifications_sent: status.notificationsSent,
          last_updated: status.lastUpdated,
        },
        { onConflict: 'user_id' },
      )
      .select()
      .single();

    if (error) {
      throw error;
    }
    return StreakRiskStatusSchema.parse(data);
  });
}

export async function fetchRiskStatusEnhanced(userId: string): Promise<RepositoryResult<StreakRiskStatus | null>> {
  return executeWithFallback('fetchRiskStatus', async () => {
    const { data, error } = await supabase.from('streak_risk_status').select('*').eq('user_id', userId).single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    if (!data) {
      return null;
    }

    return StreakRiskStatusSchema.parse({
      userId: data.user_id,
      currentDays: data.current_days,
      hoursRemaining: data.hours_remaining,
      minutesRemaining: data.minutes_remaining,
      riskLevel: data.risk_level,
      flameHealthPercent: data.flame_health_percent,
      isAtRisk: data.is_at_risk,
      isCritical: data.is_critical,
      notificationsSent: data.notifications_sent,
      lastUpdated: data.last_updated,
    });
  });
}

export async function fetchUsersWithActiveStreaksEnhanced(): Promise<RepositoryResult<string[]>> {
  return executeWithFallback('fetchUsersWithActiveStreaks', async () => {
    const { data, error } = await supabase.from('streaks').select('user_id').gt('current_days', 0);

    if (error) {
      throw error;
    }
    return (data || []).map((row: { user_id: string }) => row.user_id);
  });
}