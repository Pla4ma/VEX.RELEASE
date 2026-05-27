import * as Sentry from "@sentry/react-native";
import { eventBus } from "../../events/EventBus";
import type { AddXpInput } from "./schemas";
import {
  fetchProgressionEnhanced,
  recordLevelUpEnhanced,
  recordXpEntryEnhanced,
  updateProgressionEnhanced,
} from "./repository/enhanced";
import { createProgressionError } from "./service-enhanced-errors";
import { handleFetchFailure } from "./service-enhanced-failures";
import {
  calculateLevelFromTotalXp,
  calculateLevelThreshold,
  calculateProgressPercent,
  calculateTotalXpToLevel,
} from "./service-enhanced-math";
import { getLevelUpRewards } from "./service-enhanced-rewards";
import type { AddXpOperationResult } from "./service-enhanced-types";

type RetryOnConflict = () => Promise<AddXpOperationResult>;

export async function runAddXpOperation(
  userId: string,
  input: AddXpInput,
  breakdown: AddXpOperationResult["breakdown"],
  startTime: number,
  skipEvents: boolean | undefined,
  retryOnConflict: RetryOnConflict,
): Promise<AddXpOperationResult> {
  const fetchResult = await fetchProgressionEnhanced(userId);
  if (fetchResult.error || !fetchResult.data) {
    return handleFetchFailure(fetchResult.error, userId, breakdown);
  }

  const progression = fetchResult.data;
  const previousLevel = progression.level;
  const newTotalXp = progression.totalXp + breakdown.total;
  const newLevel = calculateLevelFromTotalXp(newTotalXp);
  const levelUpOccurred = newLevel > previousLevel;
  const totalXpToNewLevel = calculateTotalXpToLevel(newLevel);
  const newXpInLevel = newTotalXp - totalXpToNewLevel;
  const newThreshold = calculateLevelThreshold(newLevel);
  const updateResult = await updateProgressionEnhanced(userId, {
    xp: newXpInLevel,
    totalXp: newTotalXp,
    level: newLevel,
    nextLevelThreshold: newThreshold,
    lastLevelUpAt: levelUpOccurred ? Date.now() : progression.lastLevelUpAt,
  });

  if (updateResult.error) {
    if (updateResult.error.code === "CONFLICT") {
      return retryOnConflict();
    }
    return {
      success: false,
      progression: null,
      xpAdded: 0,
      levelUpOccurred: false,
      previousLevel,
      newLevel,
      breakdown,
      rewards: [],
      error: createProgressionError(
        "CONFLICT",
        updateResult.error.message,
        updateResult.error.isRetryable,
      ),
      offlineQueued: false,
    };
  }

  await recordXpEntryEnhanced(
    userId,
    {
      amount: breakdown.total,
      source: input.source,
      sessionId: input.sessionId || null,
      metadata: input.metadata ?? null,
      createdAt: Date.now(),
    },
    { queueIfOffline: true },
  );

  let rewards: string[] = [];
  if (levelUpOccurred) {
    await recordLevelUpEnhanced(userId, {
      level: newLevel,
      achievedAt: Date.now(),
      xpAtLevel: newTotalXp,
      metadata: null,
    });
    rewards = getLevelUpRewards(newLevel);
  }

  publishProgressionEvents(
    skipEvents,
    userId,
    input,
    breakdown,
    newTotalXp,
    newLevel,
    newXpInLevel,
    previousLevel,
    newThreshold,
    levelUpOccurred,
    rewards,
  );

  Sentry.addBreadcrumb({
    category: "progression",
    message: "XP added successfully",
    data: {
      userId,
      amount: breakdown.total,
      duration: Date.now() - startTime,
      levelUp: levelUpOccurred,
    },
  });

  return {
    success: true,
    progression: updateResult.data,
    xpAdded: breakdown.total,
    levelUpOccurred,
    previousLevel,
    newLevel,
    breakdown,
    rewards,
    error: null,
    offlineQueued: false,
  };
}

function publishProgressionEvents(
  skipEvents: boolean | undefined,
  userId: string,
  input: AddXpInput,
  breakdown: AddXpOperationResult["breakdown"],
  newTotalXp: number,
  newLevel: number,
  newXpInLevel: number,
  previousLevel: number,
  newThreshold: number,
  levelUpOccurred: boolean,
  rewards: string[],
): void {
  if (skipEvents) {
    return;
  }
  eventBus.publish("progression:xp_added", {
    userId,
    amount: breakdown.total,
    source: input.source,
    totalXP: newTotalXp,
    currentLevel: newLevel,
    progressPercent: calculateProgressPercent(newXpInLevel, newLevel),
    streakBonus: breakdown.streakBonus,
    boostBonus: breakdown.comebackBonus,
  });
  if (levelUpOccurred) {
    eventBus.publish("progression:level_up", {
      userId,
      newLevel,
      previousLevel,
      totalXP: newTotalXp,
      xpToNextLevel: newThreshold,
      prestige: 0,
      source: input.source,
      rewards,
    });
  }
}
