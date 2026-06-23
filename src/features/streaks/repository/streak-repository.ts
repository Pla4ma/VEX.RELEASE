import { z } from 'zod';
import {
  enqueue,
  type OfflineQueueEntryInput,
} from '../../../lib/offline/queue';
import { getSupabaseClient } from '../../../config/supabase';
import type { Streak, StreakSummary } from '../schemas';
import { v4 } from '../../../utils/uuid';
import { tableColumns } from '../../../lib/repository/tableColumns';
import { parseStreakRow } from '../repository-helpers';
import {
  executeWithFallback,
  type RepositoryResult,
  StreaksRepositoryError,
} from '../../../lib/repository/fallback';
import { calculateStreakRisk } from '../streak-risk-monitor';

const supabase = getSupabaseClient();

export async function fetchStreakSummary(
  userId: string,
): Promise<RepositoryResult<StreakSummary | null>> {
  return executeWithFallback('fetchStreakSummary', async () => {
    const { data: streakData, error: streakError } = await supabase
      .from('streaks')
      .select(tableColumns('streaks'))
      .single();

    if (streakError) {
      if (streakError.code === 'PGRST116') {
        return null;
      }
      throw streakError;
    }

    if (!streakData) {
      return null;
    }

    const streak = parseStreakRow(streakData);
    const risk = calculateStreakRisk(streak);

    const summary: StreakSummary = {
      id: streak.id,
      userId: streak.userId,
      currentDays: streak.currentDays,
      longestDays: streak.longestDays,
      isAtRisk: risk.isAtRisk,
      riskLevel: risk.riskLevel,
      nextDeadline: risk.nextDeadline !== undefined ? risk.nextDeadline : null,
      frozenUntil: streak.frozenUntil,
      shieldAvailable: streak.shieldsAvailable > 0,
    };

    return summary;
  });
}

export async function fetchStreakEnhanced(
  userId: string,
): Promise<RepositoryResult<Streak>> {
  return executeWithFallback('fetchStreak', async () => {
    const { data, error } = await supabase
      .from('streaks')
      .select('id,user_id,current_days,longest_days,last_qualifying_session_at,current_day_completed_at,frozen_until,shields_available,grace_period_used,timezone,created_at,updated_at')
      .single();
    if (error) {
      throw error;
    }
    if (!data) {
      throw new Error('No data returned');
    }
    return parseStreakRow(data);
  });
}

export async function createStreakEnhanced(
  streak: Streak,
): Promise<RepositoryResult<Streak>> {
  return executeWithFallback('createStreak', async () => {
    const { data, error } = await supabase
      .from('streaks')
      .insert({
        id: streak.id,
        user_id: streak.userId,
        current_days: streak.currentDays,
        longest_days: streak.longestDays,
        last_qualifying_session_at: streak.lastQualifyingSessionAt,
        current_day_completed_at: streak.currentDayCompletedAt,
        shields_available: streak.shieldsAvailable,
        grace_period_used: streak.gracePeriodUsed,
        timezone: streak.timezone,
        created_at: streak.createdAt,
        updated_at: streak.updatedAt,
      })
      .select(tableColumns('streaks'))
      .single();
    if (error) {
      throw error;
    }
    return parseStreakRow(data);
  });
}

export async function updateStreakEnhanced(
  userId: string,
  updates: Partial<Streak>,
): Promise<RepositoryResult<Streak>> {
  const queueEntry: OfflineQueueEntryInput = {
    operation: 'UPDATE',
    feature: 'streaks',
    payload: { userId, updates } as { userId: string; updates: Partial<Streak> },
    idempotencyKey: `streak:update:${userId}`,
    maxRetries: 5,
    priority: 'high',
  };
  enqueue(queueEntry);
  return executeWithFallback('updateStreak', async () => {
    const { data, error } = await supabase
      .from('streaks')
      .update({ ...updates, updated_at: Date.now() })
      .select(tableColumns('streaks'))
      .single();
    if (error) {
      throw error;
    }
    return parseStreakRow(data);
  });
}

export async function recordShieldUsageEnhanced(
  userId: string,
  shieldData: { usedAt: number; reason: string },
): Promise<RepositoryResult<{ id: string }>> {
  const shieldQueueEntry: OfflineQueueEntryInput = {
    operation: 'UPDATE',
    feature: 'streaks',
    payload: { userId, shieldData } as { userId: string; shieldData: { usedAt: number; reason: string } },
    idempotencyKey: `shield:use:${userId}:${shieldData.usedAt}`,
    maxRetries: 5,
    priority: 'high',
  };
  enqueue(shieldQueueEntry);
  return executeWithFallback('recordShieldUsage', async () => {
    const { data, error } = await supabase
      .from('streak_shields')
      .insert({
        id: v4(),
        user_id: userId,
        used_at: shieldData.usedAt,
        reason: shieldData.reason,
        created_at: Date.now(),
      })
      .select('id')
      .single();
    if (error) {
      throw error;
    }
    return data as { id: string };
  });
}

export async function batchUpdateStreaks(
  updates: Array<{ userId: string; streak: Partial<Streak> }>,
): Promise<{
    successful: Streak[];
    failed: Array<{ userId: string; error: StreaksRepositoryError }>;
  }> {
    const settled = await Promise.allSettled(
      updates.map((u) => updateStreakEnhanced(u.userId, u.streak).then((result) => ({ userId: u.userId, result }))),
    );
    const successful: Streak[] = [];
    const failed: Array<{ userId: string; error: StreaksRepositoryError }> = [];
    for (const item of settled) {
      if (item.status === 'fulfilled' && item.value.result.data) {
        successful.push(item.value.result.data);
      } else if (item.status === 'fulfilled' && item.value.result.error) {
        failed.push({ userId: item.value.userId, error: item.value.result.error });
      }
    }
    return { successful, failed };
  }

export {
  executeWithFallback,
  type RepositoryResult,
  StreaksRepositoryError,
} from '../../../lib/repository/fallback';
export {
  fetchActiveRepairQuestEnhanced,
  saveRepairQuestEnhanced,
  updateRepairQuestEnhanced,
  fetchExpiredRepairQuestsEnhanced,
} from './repair-quest';

export {
  saveRiskStatusEnhanced,
  fetchRiskStatusEnhanced,
  fetchUsersWithActiveStreaksEnhanced,
} from './risk-status';
