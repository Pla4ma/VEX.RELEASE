/**
 * Basic Challenges Service
 * 
 * Simplified challenges system for PHASE 8 launch scope.
 * Focuses on daily and weekly challenges only.
 */

import { eventBus } from "../../events";
import { getRewardService } from "../../rewards/RewardService";
import * as repository from "./repository";
import { 
  ChallengeSchema, 
  UserChallengeSchema, 
  type Challenge, 
  type UserChallenge, 
  type ChallengeProgress 
} from "./schemas";

// ============================================================================
// Basic Challenge Configuration
// ============================================================================

interface BasicChallengeConfig {
  dailyChallengeId: string;
  weeklyChallengeId: string;
  dailyRewardXp: number;
  dailyRewardCoins: number;
  weeklyRewardXp: number;
  weeklyRewardCoins: number;
}

const BASIC_CHALLENGE_CONFIG: BasicChallengeConfig = {
  dailyChallengeId: "basic-daily-001",
  weeklyChallengeId: "basic-weekly-001",
  dailyRewardXp: 25,
  dailyRewardCoins: 10,
  weeklyRewardXp: 100,
  weeklyRewardCoins: 50,
};

// ============================================================================
// Basic Challenge Templates
// ============================================================================

const BASIC_DAILY_CHALLENGE: Challenge = {
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

const BASIC_WEEKLY_CHALLENGE: Challenge = {
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

// ============================================================================
// Basic Challenge Management
// ============================================================================

export async function getOrCreateBasicDailyChallenge(userId: string): Promise<UserChallenge | null> {
  // Check for existing daily challenges
  const existingChallenges = await repository.fetchUserActiveChallenges(userId);
  const existing = existingChallenges.find(c => c.challengeId === BASIC_CHALLENGE_CONFIG.dailyChallengeId);
  
  if (existing) {
    // Check if expired (end of day)
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    if (existing.expiresAt < endOfDay.getTime()) {
      await repository.updateUserChallenge(existing.id, existing.challengeId, { status: "EXPIRED" });
      return await createBasicDailyChallenge(userId);
    }
    return existing;
  }

  return await createBasicDailyChallenge(userId);
}

async function createBasicDailyChallenge(userId: string): Promise<UserChallenge> {
  const now = new Date();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);

  const userChallenge = await repository.createUserChallenge(userId, BASIC_CHALLENGE_CONFIG.dailyChallengeId, endOfDay.getTime());
  
  return {
    ...userChallenge,
    requiredCount: BASIC_DAILY_CHALLENGE.targetValue,
    progressHistory: [],
  };
}

export async function getOrCreateBasicWeeklyChallenge(userId: string): Promise<UserChallenge | null> {
  // Check for existing weekly challenges
  const existingChallenges = await repository.fetchUserActiveChallenges(userId);
  const existing = existingChallenges.find(c => c.challengeId === BASIC_CHALLENGE_CONFIG.weeklyChallengeId);
  
  if (existing) {
    // Check if expired (end of week - Sunday)
    const now = new Date();
    const endOfWeek = new Date(now);
    const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
    endOfWeek.setDate(now.getDate() + daysUntilSunday);
    endOfWeek.setHours(23, 59, 59, 999);
    
    if (existing.expiresAt < endOfWeek.getTime()) {
      await repository.updateUserChallenge(existing.id, existing.challengeId, { status: "EXPIRED" });
      return await createBasicWeeklyChallenge(userId);
    }
    return existing;
  }

  return await createBasicWeeklyChallenge(userId);
}

async function createBasicWeeklyChallenge(userId: string): Promise<UserChallenge> {
  const now = new Date();
  const endOfWeek = new Date(now);
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
  endOfWeek.setDate(now.getDate() + daysUntilSunday);
  endOfWeek.setHours(23, 59, 59, 999);

  const userChallenge = await repository.createUserChallenge(userId, BASIC_CHALLENGE_CONFIG.weeklyChallengeId, endOfWeek.getTime());
  
  return {
    ...userChallenge,
    requiredCount: BASIC_WEEKLY_CHALLENGE.targetValue,
    progressHistory: [],
  };
}

// ============================================================================
// Challenge Progress from Sessions
// ============================================================================

export async function updateBasicChallengeProgressFromSession(
  userId: string,
  sessionId: string,
  sessionDuration: number
): Promise<{
  dailyUpdated: boolean;
  weeklyUpdated: boolean;
  dailyCompleted: boolean;
  weeklyCompleted: boolean;
}> {
  const dailyChallenge = await getOrCreateBasicDailyChallenge(userId);
  const weeklyChallenge = await getOrCreateBasicWeeklyChallenge(userId);

  let dailyUpdated = false;
  let weeklyUpdated = false;
  let dailyCompleted = false;
  let weeklyCompleted = false;

  // Update daily challenge
  if (dailyChallenge && dailyChallenge.status === "ACTIVE") {
    const newProgress = Math.min(dailyChallenge.currentValue + 1, dailyChallenge.requiredCount);
    const isCompleted = newProgress >= dailyChallenge.requiredCount;

    await repository.addChallengeProgress(userId, dailyChallenge.challengeId, 1, `session:${sessionId}`);

    dailyUpdated = true;
    dailyCompleted = isCompleted;

    if (isCompleted) {
      // Mark as completed immediately
      await repository.updateUserChallenge(dailyChallenge.id, dailyChallenge.challengeId, {
        status: "COMPLETED",
        completedAt: Date.now(),
      });
      
      await completeBasicChallenge(dailyChallenge, userId);
    }
  }

  // Update weekly challenge
  if (weeklyChallenge && weeklyChallenge.status === "ACTIVE") {
    const newProgress = Math.min(weeklyChallenge.currentValue + 1, weeklyChallenge.requiredCount);
    const isCompleted = newProgress >= weeklyChallenge.requiredCount;

    await repository.addChallengeProgress(userId, weeklyChallenge.challengeId, 1, `session:${sessionId}`);

    weeklyUpdated = true;
    weeklyCompleted = isCompleted;

    if (isCompleted) {
      // Mark as completed immediately
      await repository.updateUserChallenge(weeklyChallenge.id, weeklyChallenge.challengeId, {
        status: "COMPLETED",
        completedAt: Date.now(),
      });
      
      await completeBasicChallenge(weeklyChallenge, userId);
    }
  }

  return {
    dailyUpdated,
    weeklyUpdated,
    dailyCompleted,
    weeklyCompleted,
  };
}

// ============================================================================
// Challenge Completion and Rewards
// ============================================================================

async function completeBasicChallenge(userChallenge: UserChallenge, userId: string): Promise<void> {
  const now = Date.now();
  const challenge = userChallenge.challengeId === BASIC_CHALLENGE_CONFIG.dailyChallengeId 
    ? BASIC_DAILY_CHALLENGE 
    : BASIC_WEEKLY_CHALLENGE;

  // Mark as completed
  await repository.updateUserChallenge(userChallenge.id, userChallenge.challengeId, {
    status: "COMPLETED",
    completedAt: now,
  });

  // Queue rewards through reward ledger
  const rewardService = getRewardService();
  const rewardAmount = challenge.rewardAmount;
  const rewardType = challenge.rewardType;

  if (rewardType === "XP") {
    await rewardService.addXpReward(userId, rewardAmount, {
      source: "challenge_completion",
      challengeId: userChallenge.challengeId,
      challengeType: challenge.type,
    });
  } else if (rewardType === "COINS") {
    await rewardService.addCoinReward(userId, rewardAmount, {
      source: "challenge_completion",
      challengeId: userChallenge.challengeId,
      challengeType: challenge.type,
    });
  }

  // Emit completion event
  eventBus.publish("challenge:completed", {
    userId,
    challengeId: userChallenge.challengeId,
    challengeType: challenge.type,
    completedAt: now,
    rewards: [{
      type: rewardType,
      amount: rewardAmount,
      itemId: null,
    }],
  });
}

// ============================================================================
// Challenge Status and Summary
// ============================================================================

export async function getBasicChallengesStatus(userId: string): Promise<{
  daily: {
    hasActiveChallenge: boolean;
    progress: number;
    required: number;
    isCompleted: boolean;
    canClaim: boolean;
  };
  weekly: {
    hasActiveChallenge: boolean;
    progress: number;
    required: number;
    isCompleted: boolean;
    canClaim: boolean;
  };
}> {
  const dailyChallenge = await getOrCreateBasicDailyChallenge(userId);
  const weeklyChallenge = await getOrCreateBasicWeeklyChallenge(userId);

  return {
    daily: {
      hasActiveChallenge: !!dailyChallenge,
      progress: dailyChallenge?.currentValue ?? 0,
      required: BASIC_DAILY_CHALLENGE.targetValue,
      isCompleted: dailyChallenge?.status === "COMPLETED",
      canClaim: dailyChallenge?.status === "COMPLETED" && !dailyChallenge?.claimedAt,
    },
    weekly: {
      hasActiveChallenge: !!weeklyChallenge,
      progress: weeklyChallenge?.currentValue ?? 0,
      required: BASIC_WEEKLY_CHALLENGE.targetValue,
      isCompleted: weeklyChallenge?.status === "COMPLETED",
      canClaim: weeklyChallenge?.status === "COMPLETED" && !weeklyChallenge?.claimedAt,
    },
  };
}

export async function claimBasicChallengeReward(
  userId: string,
  challengeType: "DAILY" | "WEEKLY"
): Promise<{
  success: boolean;
  rewards?: Array<{ type: string; amount: number }>;
  error?: string;
}> {
  const challenge = challengeType === "DAILY"
    ? await getOrCreateBasicDailyChallenge(userId)
    : await getOrCreateBasicWeeklyChallenge(userId);

  if (!challenge || challenge.status !== "COMPLETED") {
    return { success: false, error: "Challenge not completed" };
  }

  if (challenge.claimedAt) {
    return { success: false, error: "Reward already claimed" };
  }

  const now = Date.now();
  const baseChallenge = challengeType === "DAILY" ? BASIC_DAILY_CHALLENGE : BASIC_WEEKLY_CHALLENGE;

  // Mark as claimed
  await repository.updateUserChallenge(challenge.id, challenge.challengeId, {
    claimedAt: now,
  });

  // Process rewards (already queued during completion)
  const rewards = [
    { type: baseChallenge.rewardType, amount: baseChallenge.rewardAmount },
  ];

  // Emit claim event
  eventBus.publish("challenge:reward_claimed", {
    userId,
    challengeId: challenge.challengeId,
    challengeType,
    claimedAt: now,
    rewards,
  });

  return { success: true, rewards };
}