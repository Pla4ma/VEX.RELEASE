import { eventBus } from "../../events";
import * as Sentry from "@sentry/react-native";
import {
  DIFFICULTY_CONFIG,
  SessionStakesSchema,
  type SessionDifficulty,
  type SessionStakes,
  type StakesSessionResult,
} from "./session-stakes-schemas";

export function getStakesForDifficulty(
  difficulty: SessionDifficulty,
): SessionStakes {
  const config = DIFFICULTY_CONFIG[difficulty];
  return SessionStakesSchema.parse({
    difficulty,
    xpMultiplier: config.xpMultiplier,
    maxPauses: config.maxPauses === Infinity ? 999 : config.maxPauses,
    pausePenaltyPercent: config.pausePenaltyPercent,
    gemWager: config.gemWager,
    strictMode: config.strictMode,
    failureConsequence: config.failureConsequence,
  });
}

export function canSelectDifficulty(
  userLevel: number,
  difficulty: SessionDifficulty,
): { allowed: boolean; reason?: string } {
  if (difficulty === "DEEP_WORK" && userLevel < 3) {
    return { allowed: false, reason: "Deep Work unlocks at level 3" };
  }
  return { allowed: true };
}

export function getRecommendedDifficulty(
  userLevel: number,
  recentCompletionRate: number,
  currentStreak: number,
): SessionDifficulty {
  if (userLevel < 2) {
    return "CASUAL";
  }
  if (recentCompletionRate < 0.6) {
    return "CASUAL";
  }
  if (currentStreak >= 7 && recentCompletionRate > 0.85 && userLevel >= 5) {
    return "DEEP_WORK";
  }
  return "FOCUSED";
}

export function calculateStakesResult(
  sessionId: string,
  userId: string,
  difficulty: SessionDifficulty,
  completed: boolean,
  baseXp: number,
  pausesUsed: number,
  totalDuration: number,
  userWinStreak: number,
): StakesSessionResult {
  const stakes = getStakesForDifficulty(difficulty);
  let xpEarned = 0;
  let gemsWon = 0;
  let gemsLost = 0;
  let newWinStreak = userWinStreak;
  if (completed) {
    xpEarned = Math.floor(baseXp * stakes.xpMultiplier);
    if (difficulty === "DEEP_WORK") {
      gemsWon = stakes.gemWager;
      gemsWon += Math.min(3, Math.floor(totalDuration / 30 / 60));
      newWinStreak = userWinStreak + 1;
    }
  } else {
    if (stakes.failureConsequence === "LOSE_WAGER" && stakes.gemWager > 0) {
      gemsLost = stakes.gemWager;
    }
    newWinStreak = 0;
    if (stakes.failureConsequence === "REDUCED_XP") {
      xpEarned = Math.floor(baseXp * 0.25);
    }
  }
  const pausePenalty = Math.min(pausesUsed * stakes.pausePenaltyPercent, 50);
  const qualityScore = Math.max(0, 100 - pausePenalty);
  return {
    sessionId,
    userId,
    difficulty,
    completed,
    xpEarned,
    baseXp,
    gemWager: stakes.gemWager,
    gemsWon,
    gemsLost,
    pausesUsed,
    qualityScore,
    winStreakUpdated: newWinStreak,
  };
}

export async function recordStakesResult(
  result: StakesSessionResult,
): Promise<void> {
  try {
    eventBus.publish("session:stakes_completed", result);
    if (result.difficulty === "DEEP_WORK" && result.completed) {
      if (result.winStreakUpdated >= 3) {
        eventBus.publish("achievement:unlocked", {
          userId: result.userId,
          achievementId: "deep_work_streak_3",
          unlockedAt: Date.now(),
        });
      }
      if (result.winStreakUpdated >= 7) {
        eventBus.publish("achievement:unlocked", {
          userId: result.userId,
          achievementId: "deep_work_streak_7",
          unlockedAt: Date.now(),
        });
      }
    }
    Sentry.addBreadcrumb({
      category: "session_stakes",
      message: `Session completed with ${result.difficulty}: ${result.completed ? "success" : "abandoned"}`,
      data: {
        difficulty: result.difficulty,
        xpEarned: result.xpEarned,
        gemsWon: result.gemsWon,
        gemsLost: result.gemsLost,
      },
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: "session_stakes", action: "record_result" },
    });
  }
}
