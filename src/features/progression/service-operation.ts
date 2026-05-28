import * as Sentry from "@sentry/react-native";
import { getSupabaseClient } from "../../config/supabase";
import { eventBus } from "../../events/EventBus";
import type { AddXpInput } from "./schemas";
import {
  fetchProgressionEnhanced,
  recordLevelUpEnhanced,
  recordXpEntryEnhanced,
  updateProgressionEnhanced,
} from "./repository/enhanced";
import { createProgressionError } from "./service-errors";
import { handleFetchFailure } from "./service-failures";
import {
  calculateLevelFromTotalXp,
  calculateLevelThreshold,
  calculateProgressPercent,
  calculateTotalXpToLevel,
} from "./service-xp-calculations";
import { getLevelUpRewards } from "./service-level-rewards";
import type { AddXpOperationResult } from "./service-enhanced-types";

type RetryOnConflict = () => Promise<AddXpOperationResult>;

interface AtomicXpRpcResult {
  success: boolean;
  duplicate: boolean;
  xp_added: number;
  new_total_xp: number;
  new_level: number;
  previous_level: number;
  level_up: boolean;
  rewards: string[];
}

export async function runAddXpOperation(
  userId: string,
  input: AddXpInput,
  breakdown: AddXpOperationResult["breakdown"],
  startTime: number,
  skipEvents: boolean | undefined,
  retryOnConflict: RetryOnConflict,
): Promise<AddXpOperationResult> {
  const idempotencyKey = input.metadata
    ? `${userId}:addXp:${input.sessionId || "direct"}`
    : undefined;

  const atomicResult = await tryAtomicAddXp(userId, breakdown.total, input, idempotencyKey);
  if (atomicResult) {
    publishProgressionEvents(
      skipEvents, userId, input, breakdown,
      atomicResult.new_total_xp, atomicResult.new_level,
      atomicResult.new_total_xp - calculateTotalXpToLevel(atomicResult.new_level),
      atomicResult.previous_level,
      calculateLevelThreshold(atomicResult.new_level),
      atomicResult.level_up, atomicResult.rewards,
    );

    Sentry.addBreadcrumb({
      category: "progression",
      message: "XP added (atomic RPC)",
      data: { userId, amount: breakdown.total, levelUp: atomicResult.level_up, duplicate: atomicResult.duplicate },
    });

    return {
      success: true,
      progression: null,
      xpAdded: atomicResult.duplicate ? 0 : atomicResult.xp_added,
      levelUpOccurred: atomicResult.level_up,
      previousLevel: atomicResult.previous_level,
      newLevel: atomicResult.new_level,
      breakdown,
      rewards: atomicResult.rewards,
      error: null,
      offlineQueued: false,
    };
  }

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

async function tryAtomicAddXp(
  userId: string,
  amount: number,
  input: AddXpInput,
  idempotencyKey: string | undefined,
): Promise<AtomicXpRpcResult | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc("atomic_add_xp", {
      p_user_id: userId,
      p_amount: amount,
      p_source: input.source,
      p_session_id: input.sessionId ?? null,
      p_idempotency_key: idempotencyKey ?? null,
      p_metadata: input.metadata ? JSON.parse(JSON.stringify(input.metadata)) : null,
    });

    if (error) {
      Sentry.captureException(error, {
        tags: { operation: "atomic_add_xp_rpc" },
      });
      return null;
    }

    return data as unknown as AtomicXpRpcResult;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { operation: "tryAtomicAddXp" },
    });
    return null;
  }
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
