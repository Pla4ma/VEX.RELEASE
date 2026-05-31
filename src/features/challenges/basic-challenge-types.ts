/**
 * Basic Challenges — Type definitions and configuration
 */

export interface BasicChallengeConfig {
  dailyChallengeId: string;
  weeklyChallengeId: string;
  dailyTarget: number;
  weeklyTarget: number;
  dailyRewardXp: number;
  weeklyRewardXp: number;
}

export const CONFIG: BasicChallengeConfig = {
  dailyChallengeId: 'basic-daily-001',
  weeklyChallengeId: 'basic-weekly-001',
  dailyTarget: 1,
  weeklyTarget: 5,
  dailyRewardXp: 25,
  weeklyRewardXp: 100,
};

export function getRequiredCount(challengeId: string): number {
  return challengeId === CONFIG.dailyChallengeId
    ? CONFIG.dailyTarget
    : CONFIG.weeklyTarget;
}

export interface BasicChallengesStatus {
  daily: {
    progress: number;
    required: number;
    isCompleted: boolean;
    canClaim: boolean;
    hasActiveChallenge: boolean;
  };
  weekly: {
    progress: number;
    required: number;
    isCompleted: boolean;
    canClaim: boolean;
    hasActiveChallenge: boolean;
  };
}

export interface BasicChallengeProgressResult {
  dailyUpdated: boolean;
  weeklyUpdated: boolean;
  dailyCompleted: boolean;
  weeklyCompleted: boolean;
}

export interface BasicChallengeClaimResult {
  success: boolean;
  xpEarned: number;
}
