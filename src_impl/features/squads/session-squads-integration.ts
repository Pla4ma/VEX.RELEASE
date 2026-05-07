/**
 * Session Squads Integration
 * 
 * Integrates session completion with basic squads accountability progress.
 * Listens for session completion events and updates squad weekly goals.
 */

import { eventBus } from "../../../events";
import { useBasicSquadsStatus, useUpdateBasicSquadWeeklyProgress } from "../squads/hooks/basic-squads-hooks";
import { useEffect } from "react";

// ============================================================================
// Session to Squads Progress Integration
// ============================================================================

export function useSessionSquadsIntegration() {
  const statusQuery = useBasicSquadsStatus();
  const progressMutation = useUpdateBasicSquadWeeklyProgress();

  useEffect(() => {
    // Listen for session completion events
    const unsubscribe = eventBus.subscribe('session:completed', async (event) => {
      const { sessionId, duration, userId } = event;

      // Only update squad progress if user is in a squad
      if (statusQuery.data?.hasSquad && statusQuery.data.squad) {
        try {
          // Update squad weekly progress based on session completion
          const result = await progressMutation.mutateAsync({
            squadId: statusQuery.data.squad.id,
            sessionMinutes: Math.floor(duration / 60), // Convert seconds to minutes
          });

          console.log(`Updated squad weekly progress from session ${sessionId}:`, {
            squadId: statusQuery.data.squad.id,
            goalUpdated: result.goalUpdated,
            goalCompleted: result.goalCompleted,
            squadProgress: result.squadProgress,
            squadGoal: result.squadGoal,
          });
        } catch (error) {
          console.error('Failed to update squad progress from session:', error);
          // Don't throw - squad progress failure shouldn't break session completion
        }
      }
    });

    return unsubscribe;
  }, [statusQuery.data?.hasSquad, statusQuery.data?.squad, progressMutation]);
}

// ============================================================================
// Squad Status for Session Setup
// ============================================================================

export function useSquadStatusForSession() {
  const statusQuery = useBasicSquadStatus();

  return {
    hasSquad: statusQuery.data?.hasSquad ?? false,
    squadName: statusQuery.data?.squad?.name ?? '',
    squadId: statusQuery.data?.squad?.id ?? '',
    isFounder: statusQuery.data?.isFounder ?? false,
    isAdmin: statusQuery.data?.isAdmin ?? false,
    memberCount: statusQuery.data?.memberCount ?? 0,
    weeklyProgress: statusQuery.data?.weeklyProgress,
    canContributeToGoal: statusQuery.data?.hasSquad && !!(statusQuery.data?.weeklyProgress?.completed),
  };
}

// ============================================================================
// Squad Progress Calculation Helper
// ============================================================================

export function calculateSquadContribution(sessionData: {
  durationSeconds: number;
  qualityScore: number;
}): {
  contributionMinutes: number;
  helpsWeeklyGoal: boolean;
  weeklyGoalMinutes: number;
  weeklyProgressPercentage: number;
} {
  const contributionMinutes = Math.floor(sessionData.durationSeconds / 60);
  
  // Get weekly goal from status or use default
  const weeklyGoalMinutes = 300; // Default 5 hours per week
  
  return {
    contributionMinutes,
    helpsWeeklyGoal: contributionMinutes > 0,
    weeklyGoalMinutes,
    weeklyProgressPercentage: Math.min(100, Math.round((contributionMinutes / weeklyGoalMinutes) * 100)),
  };
}

// ============================================================================
// Squad CTA (Call to Action) Helper
// ============================================================================

export function getSquadCTA(squadStatus: {
  hasSquad: boolean;
  squadName: string;
  isFounder: boolean;
  isAdmin: boolean;
  memberCount: number;
  weeklyProgress?: {
    current: number;
    goal: number;
    completed: boolean;
    percentage: number;
  };
}): {
  primaryCTA: string;
  secondaryCTA: string | null;
  motivationMessage: string;
} {
  const { hasSquad, squadName, isFounder, isAdmin, memberCount, weeklyProgress } = squadStatus;

  if (!hasSquad) {
    return {
      primaryCTA: "Create Squad",
      secondaryCTA: null,
      motivationMessage: "Start a private accountability group with friends.",
    };
  }

  if (weeklyProgress?.completed) {
    return {
      primaryCTA: "View Squad Progress",
      secondaryCTA: null,
      motivationMessage: `Great job! ${squadName} completed the weekly goal!`,
    };
  }

  const remainingMinutes = weeklyProgress ? weeklyProgress.goal - weeklyProgress.current : 300;
  const remainingSessions = Math.ceil(remainingMinutes / 30); // Assuming 30-minute sessions

  let primaryCTA = "Start Focus Session";
  let secondaryCTA = null;

  if (isFounder || isAdmin) {
    secondaryCTA = "Invite Members";
  }

  return {
    primaryCTA,
    secondaryCTA,
    motivationMessage: `${remainingMinutes} minutes (${remainingSessions} sessions) to weekly goal.`,
  };
}