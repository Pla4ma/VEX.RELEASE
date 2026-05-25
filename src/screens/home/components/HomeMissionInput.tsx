/**
 * Home Mission Input Component
 *
 * Creates mission priority input data for the Home screen.
 */

import React from 'react';
import type { MissionPriorityInput } from '../../../features/daily-mission/types';
import type { ActiveIntervention } from '../../../features/ai-coach/hooks';
import type { ChallengeItem } from '../../../features/home-spine/components';
import type { HomeController } from '../hooks/home-controller-types';

interface ActiveBossMissionQuery {
  data?: {
    percentHealthRemaining?: number;
  } | null;
}

interface HomeMissionInputProps {
  controller: HomeController;
  todaysChallenges: ChallengeItem[];
  streakHoursRemaining: number | null;
  activeBossQuery: ActiveBossMissionQuery;
  canShowBossBounties: boolean;
  intervention: ActiveIntervention | null;
  interventionLoading: boolean;
  companionMood: string;
  children: (missionInput: Partial<MissionPriorityInput>) => React.ReactNode;
}

export function HomeMissionInput({
  controller,
  todaysChallenges,
  streakHoursRemaining,
  activeBossQuery,
  canShowBossBounties,
  intervention,
  interventionLoading,
  companionMood,
  children,
}: HomeMissionInputProps): JSX.Element {
  const hasOpenDailyChallenge = todaysChallenges.some((challenge) => !challenge.isCompleted);
  const hasSquadWeeklyGoal = controller.disclosure.features.social_tab.isUnlocked;

  const missionInput: Partial<MissionPriorityInput> = {
    isFirstSession: controller.isFirstRun,
    hasPendingSyncRepair: controller.completionSync.status === 'failed_sync',
    isStreakCritical: streakHoursRemaining !== null && streakHoursRemaining <= 4,
    hasComebackQuest: (controller.comebackQuery.data as Record<string, unknown> | undefined)?.streakRestoreEligible as boolean ?? false,
    hasActiveDailyChallenge: todaysChallenges.length > 0 && hasOpenDailyChallenge,
    isBossNearDefeat: (activeBossQuery.data?.percentHealthRemaining ?? 100) <= 25,
    isBossEnabled: canShowBossBounties,
    needsCompanionCare: companionMood === 'tired' || companionMood === 'sad',
    hasCoachAction: !interventionLoading && !!intervention,
    hasSquadWeeklyGoal,
    isSquadsEnabled: hasSquadWeeklyGoal,
  };

  return <>{children(missionInput)}</>;
}
