import type { FirstWeekProgress, FirstWeekSession, SessionUnlock } from "./schemas";
import { FIRST_WEEK_CONFIG } from "./config";

/**
 * Calculate level progress based on total XP
 */
export function calculateLevelProgress(totalXp: number): number {
  // Simple level calculation for first week
  // Level 1: 0-100 XP
  // Level 2: 101-250 XP
  // Level 3: 251-500 XP
  // Level 4: 501-1000 XP

  if (totalXp <= 100) {
    return 1;
  }
  if (totalXp <= 250) {
    return 2;
  }
  if (totalXp <= 500) {
    return 3;
  }
  if (totalXp <= 1000) {
    return 4;
  }
  return Math.min(5, Math.floor(totalXp / 250) + 1);
}

/**
 * Get session unlocks for a given session
 */
export function getSessionUnlocks(session: FirstWeekSession): SessionUnlock[] {
  return FIRST_WEEK_CONFIG.sessionUnlocks[session] || [];
}

/**
 * Get XP reward for a given session
 */
export function getSessionXpReward(session: FirstWeekSession): number {
  return FIRST_WEEK_CONFIG.xpRewards[session] || 0;
}

/**
 * Get companion reaction for a given session
 */
export function getCompanionReaction(session: FirstWeekSession): string {
  return FIRST_WEEK_CONFIG.companionReactions[session] || "";
}

/**
 * Get tutorial steps for a given session
 */
export function getTutorialSteps(session: FirstWeekSession): string[] {
  return FIRST_WEEK_CONFIG.tutorialSteps[session] || [];
}

/**
 * Check if user is in first week
 */
export function isInFirstWeek(progress: FirstWeekProgress): boolean {
  return progress.currentSession !== "COMPLETED";
}

/**
 * Get first week completion percentage
 */
export function getFirstWeekCompletion(progress: FirstWeekProgress): number {
  const totalSessions = 7;
  return (progress.sessionsCompleted / totalSessions) * 100;
}
