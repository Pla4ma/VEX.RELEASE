/**
 * Daily Mission Hooks
 *
 * Provides hooks for consuming the daily mission system in React components.
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store';
import {
  determineMissionType,
  createDailyMission,
  updateMissionProgress,
  isMissionExpired,
  getMissionRemainingHours,
  type DailyMission,
  type MissionPriorityInput,
} from './service';

/**
 * Hook for determining the user's primary daily mission
 */
export function useDailyMission(input: Partial<MissionPriorityInput>) {
  const userId = useAuthStore((state) => state.user?.id);

  const missionInput: MissionPriorityInput = useMemo(() => ({
    isFirstSession: input.isFirstSession ?? false,
    hasPendingSyncRepair: input.hasPendingSyncRepair ?? false,
    isStreakCritical: input.isStreakCritical ?? false,
    hasComebackQuest: input.hasComebackQuest ?? false,
    hasActiveDailyChallenge: input.hasActiveDailyChallenge ?? false,
    isBossNearDefeat: input.isBossNearDefeat ?? false,
    isBossEnabled: input.isBossEnabled ?? false,
    needsCompanionCare: input.needsCompanionCare ?? false,
    hasCoachAction: input.hasCoachAction ?? false,
    hasSquadWeeklyGoal: input.hasSquadWeeklyGoal ?? false,
    isSquadsEnabled: input.isSquadsEnabled ?? false,
    userId: userId ?? '',
  }), [input.isFirstSession, input.hasPendingSyncRepair, input.isStreakCritical, input.hasComebackQuest, input.hasActiveDailyChallenge, input.isBossNearDefeat, input.isBossEnabled, input.needsCompanionCare, input.hasCoachAction, input.hasSquadWeeklyGoal, input.isSquadsEnabled, userId]);

  const mission = useMemo(() => {
    if (!userId) return null;

    try {
      const missionType = determineMissionType(missionInput);
      const dailyMission = createDailyMission(missionType, userId);

      // Check if mission is expired
      if (isMissionExpired(dailyMission)) {
        return null;
      }

      return dailyMission;
    } catch (error) {
      // Error creating daily mission, returning null
      return null;
    }
  }, [missionInput, userId]);

  return {
    mission,
    missionType: mission?.type ?? null,
    priority: mission?.priority ?? null,
    remainingHours: mission ? getMissionRemainingHours(mission) : null,
    isExpired: mission ? isMissionExpired(mission) : false,
  };
}

/**
 * Hook for getting mission analytics data
 */
export function useDailyMissionAnalytics(mission: DailyMission | null) {
  return useMemo(() => {
    if (!mission) return null;

    return {
      missionType: mission.type,
      priority: mission.priority,
      targetSystem: mission.targetSystem,
      progress: mission.progress,
      isCompleted: mission.isCompleted,
      remainingHours: getMissionRemainingHours(mission),
      analyticsPayload: mission.analyticsPayload,
    };
  }, [mission]);
}

/**
 * Hook for updating mission progress (typically called after session completion)
 */
export function useMissionProgress() {
  const updateProgress = (mission: DailyMission, progressDelta: number) => {
    const newProgress = Math.min(1, mission.progress + progressDelta);
    const isCompleted = newProgress >= 1;

    return updateMissionProgress(mission, newProgress, isCompleted);
  };

  return { updateProgress };
}

/**
 * Query key factory for daily mission queries
 */
export const dailyMissionKeys = {
  all: ['daily-mission'] as const,
  primary: (userId: string) => [...dailyMissionKeys.all, 'primary', userId] as const,
  analytics: (userId: string) => [...dailyMissionKeys.all, 'analytics', userId] as const,
};

/**
 * Hook for fetching mission history (for analytics and debugging)
 */
export function useMissionHistory(userId: string | null) {
  return useQuery({
    queryKey: dailyMissionKeys.analytics(userId ?? ''),
    queryFn: async () => {
      if (!userId) return [];

      // This would typically fetch from a repository
      // For now, return empty array as mission history is not persisted
      return [];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
