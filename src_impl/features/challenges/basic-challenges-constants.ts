/**
 * Basic Challenges Constants
 *
 * Configuration and templates for the simplified challenges system.
 */

import { type Challenge } from "./schemas";

export interface BasicChallengeConfig {
  dailyChallengeId: string;
  weeklyChallengeId: string;
  dailyRewardXp: number;
  dailyRewardCoins: number;
  weeklyRewardXp: number;
  weeklyRewardCoins: number;
}

export const BASIC_CHALLENGE_CONFIG: BasicChallengeConfig = {
  dailyChallengeId: "basic-daily-001",
  weeklyChallengeId: "basic-weekly-001",
  dailyRewardXp: 25,
  dailyRewardCoins: 10,
  weeklyRewardXp: 100,
  weeklyRewardCoins: 50,
};

export const BASIC_DAILY_CHALLENGE: Challenge = {
  id: BASIC_CHALLENGE_CONFIG.dailyChallengeId,
  seasonId: "basic-season",
  type: "DAILY",
  category: "SESSIONS",
  title: "Daily Focus Session",
  description: "Complete one focus session today",
  iconUrl: null,
  targetValue: 1,
  targetType: "SESSIONS",
  rewardType: "XP",
  rewardAmount: BASIC_CHALLENGE_CONFIG.dailyRewardXp,
  rewardItemId: null,
  startAt: null,
  endAt: null,
  isActive: true,
  difficulty: "EASY",
  xpBonus: 0,
  createdAt: Date.now(),
};

export const BASIC_WEEKLY_CHALLENGE: Challenge = {
  id: BASIC_CHALLENGE_CONFIG.weeklyChallengeId,
  seasonId: "basic-season",
  type: "WEEKLY",
  category: "SESSIONS",
  title: "Weekly Focus Goal",
  description: "Complete 5 focus sessions this week",
  iconUrl: null,
  targetValue: 5,
  targetType: "SESSIONS",
  rewardType: "XP",
  rewardAmount: BASIC_CHALLENGE_CONFIG.weeklyRewardXp,
  rewardItemId: null,
  startAt: null,
  endAt: null,
  isActive: true,
  difficulty: "MEDIUM",
  xpBonus: 0,
  createdAt: Date.now(),
};
