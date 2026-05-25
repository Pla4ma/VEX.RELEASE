import { useMemo } from 'react';
import type { MissionPriorityInput } from '../../../features/daily-mission/types';
import type { ActiveIntervention } from '../../../features/ai-coach/hooks';
import type { ChallengeItem } from '../../../features/home-spine/components';
import type { HomeController } from './home-controller-types';
import type { HomeSurfaceMap } from '../../../features/home-experience/surface-decision-schemas';

interface BuildMissionInputParams {
  controller: HomeController;
  surfaceMap: HomeSurfaceMap | undefined;
  todaysChallenges: ChallengeItem[];
  streakHoursRemaining: number | null;
  bossPercentHealthRemaining: number | undefined;
  intervention: ActiveIntervention | null;
  interventionLoading: boolean;
  companionMood: string;
}

export interface OptionalMissionInputResult {
  missionInput: Partial<MissionPriorityInput>;
  shouldUse: boolean;
}

export function buildMissionPriorityInput(params: BuildMissionInputParams): Partial<MissionPriorityInput> {
  const {
    controller,
    surfaceMap,
    todaysChallenges,
    streakHoursRemaining,
    bossPercentHealthRemaining,
    intervention,
    interventionLoading,
    companionMood,
  } = params;

  const hasOpenDailyChallenge = todaysChallenges.some((challenge) => !challenge.isCompleted);

  const missionSurfacesAllowed = surfaceMap
    ? surfaceMap.challenge_teaser !== 'hidden' && surfaceMap.challenge_teaser !== 'blocked'
    : false;
  const weeklyQuestAllowed = surfaceMap
    ? surfaceMap.weekly_quest !== 'hidden' && surfaceMap.weekly_quest !== 'blocked'
    : false;
  const bossSurfaceActive = surfaceMap
    ? surfaceMap.boss_compact !== 'hidden' && surfaceMap.boss_compact !== 'blocked'
    : false;

  if (!missionSurfacesAllowed && !weeklyQuestAllowed && !bossSurfaceActive) {
    return {};
  }

  return {
    isFirstSession: controller.isFirstRun,
    hasPendingSyncRepair:
      controller.completionSync.status === 'failed_sync',
    isStreakCritical: streakHoursRemaining !== null && streakHoursRemaining <= 4,
    hasComebackQuest:
      (controller.comebackQuery.data as Record<string, unknown> | undefined)
        ?.streakRestoreEligible === true,
    hasActiveDailyChallenge:
      todaysChallenges.length > 0 && hasOpenDailyChallenge,
    isBossNearDefeat: (bossPercentHealthRemaining ?? 100) <= 25,
    isBossEnabled: bossSurfaceActive,
    needsCompanionCare:
      companionMood === 'tired' || companionMood === 'sad',
    hasCoachAction: !interventionLoading && !!intervention,
    hasSquadWeeklyGoal: false,
    isSquadsEnabled: false,
  };
}

export function shouldComputeMissionInput(
  surfaceMap: HomeSurfaceMap | undefined,
  isDayZero: boolean,
  isActivating: boolean,
): boolean {
  if (isDayZero || isActivating) return false;

  if (!surfaceMap) return false;

  return (
    (surfaceMap.challenge_teaser !== 'hidden' && surfaceMap.challenge_teaser !== 'blocked') ||
    (surfaceMap.weekly_quest !== 'hidden' && surfaceMap.weekly_quest !== 'blocked') ||
    (surfaceMap.boss_compact !== 'hidden' && surfaceMap.boss_compact !== 'blocked')
  );
}

export function useOptionalMissionInput(params: BuildMissionInputParams): OptionalMissionInputResult {
  return useMemo(() => {
    const missionInput = buildMissionPriorityInput(params);
    const hasMissionData = Object.keys(missionInput).length > 0;
    return { missionInput, shouldUse: hasMissionData };
  }, [
    params.controller.isFirstRun,
    params.surfaceMap,
    params.todaysChallenges,
    params.streakHoursRemaining,
    params.bossPercentHealthRemaining,
    params.intervention,
    params.interventionLoading,
    params.companionMood,
  ]);
}
