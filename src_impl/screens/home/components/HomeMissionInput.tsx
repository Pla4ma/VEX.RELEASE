/**
 * Home Mission Input Component
 *
 * Creates mission priority input data for the Home screen.
 */

import React from 'react';
import type { MissionPriorityInput } from '../../../features/daily-mission/types';

interface HomeMissionInputProps {
  controller: any;
  todaysChallenges: any[];
  streakHoursRemaining: number | null;
  activeBossQuery: any;
  canShowBossBounties: boolean;
  intervention: any;
  interventionLoading: boolean;
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
  children,
}: HomeMissionInputProps): JSX.Element {
  // Create mission priority input data
  const missionInput: Partial<MissionPriorityInput> = {
    isFirstSession: controller.isFirstRun,
    hasPendingSyncRepair: controller.completionSync.status === 'failed_sync',
    isStreakCritical: streakHoursRemaining !== null && streakHoursRemaining <= 4,
    hasComebackQuest: controller.comebackQuery.data?.streakRestoreEligible ?? false,
    hasActiveDailyChallenge: todaysChallenges.length > 0 && todaysChallenges.some(c => !c.isCompleted),
    isBossNearDefeat: activeBossQuery.data && activeBossQuery.data.percentHealthRemaining <= 25,
    isBossEnabled: canShowBossBounties,
    needsCompanionCare: false, // TODO: Implement companion care logic
    hasCoachAction: !interventionLoading && !!intervention,
    hasSquadWeeklyGoal: false, // TODO: Implement squad weekly goal logic
    isSquadsEnabled: false, // Squads disabled at launch
  };

  return <>{children(missionInput)}</>;
}