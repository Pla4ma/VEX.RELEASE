import { getSupabaseClient } from '../../../config/supabase';
import {
  StreakRiskStatusSchema,
  type StreakRiskStatus,
} from '../schemas-risk-repair';
import { executeWithFallback, type RepositoryResult } from './streak-repository';
import { tableColumns } from '../../../lib/repository/tableColumns';

const supabase = getSupabaseClient();

export async function saveRiskStatusEnhanced(
  status: StreakRiskStatus,
): Promise<RepositoryResult<StreakRiskStatus>> {
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
      .select(tableColumns('streak_risk_status'))
      .single();
    if (error) {
      throw error;
    }
    return StreakRiskStatusSchema.parse(data);
  });
}

export async function fetchRiskStatusEnhanced(
  userId: string,
): Promise<RepositoryResult<StreakRiskStatus | null>> {
  return executeWithFallback('fetchRiskStatus', async () => {
    const { data, error } = await supabase
      .from('streak_risk_status')
      .select('user_id,current_days,hours_remaining,minutes_remaining,risk_level,flame_health_percent,is_at_risk,is_critical,notifications_sent,last_updated')
      .eq('user_id', userId)
      .single();
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

export async function fetchUsersWithActiveStreaksEnhanced(): Promise<
  RepositoryResult<string[]>
> {
  return executeWithFallback('fetchUsersWithActiveStreaks', async () => {
    const { data, error } = await supabase
      .from('streaks')
      .select('user_id')
      .gt('current_days', 0);
    if (error) {
      throw error;
    }
    return (data || []).map((row: { user_id: string }) => row.user_id);
  });
}
