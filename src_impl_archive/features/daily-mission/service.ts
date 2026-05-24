/**
 * Daily Mission Service
 *
 * Implements the mission priority engine that determines the single most important
 * mission to show the user based on their current state.
 */

import {
  MissionPriorityInputSchema,
  type MissionPriorityInput,
  type MissionType,
} from './schemas';
export type { DailyMission, MissionPriorityInput } from './schemas';
import { createDailyMission } from './mission-factory';
import { updateMissionProgress, isMissionExpired, getMissionRemainingHours } from './mission-utils';

/**
 * Determines the primary mission type based on user state
 */
export function determineMissionType(input: MissionPriorityInput): MissionType {
  const parsed = MissionPriorityInputSchema.parse(input);

  // Priority 1: first session for new user
  if (parsed.isFirstSession) {
    return 'first-session';
  }

  // Priority 2: pending sync repair
  if (parsed.hasPendingSyncRepair) {
    return 'sync-repair';
  }

  // Priority 3: streak critical
  if (parsed.isStreakCritical) {
    return 'streak-critical';
  }

  // Priority 4: comeback quest
  if (parsed.hasComebackQuest) {
    return 'comeback-quest';
  }

  // Priority 5: active daily challenge
  if (parsed.hasActiveDailyChallenge) {
    return 'daily-challenge';
  }

  // Priority 6: boss near defeat (if boss enabled)
  if (parsed.isBossEnabled && parsed.isBossNearDefeat) {
    return 'boss-fight';
  }

  // Priority 7: companion care
  if (parsed.needsCompanionCare) {
    return 'companion-care';
  }

  // Priority 8: AI coach next action
  if (parsed.hasCoachAction) {
    return 'coach-action';
  }

  // Priority 9: squad weekly goal (if squads enabled)
  if (parsed.isSquadsEnabled && parsed.hasSquadWeeklyGoal) {
    return 'squad-goal';
  }

  // Priority 10: default recommended focus session
  return 'default-focus';
}

// Re-export utilities from the split files
export { createDailyMission, updateMissionProgress, isMissionExpired, getMissionRemainingHours };
