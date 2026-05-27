import * as Sentry from "@sentry/react-native";
import { AddXpInputSchema, type AddXpInput } from "./schemas";
import {
  deduplicateConcurrent,
  generateIdempotencyKey,
  isDuplicateOperation,
  markOperationProcessed,
} from "./service-enhanced-dedup";
import { createProgressionError } from "./service-enhanced-errors";
import { calculateXpBreakdown } from "./service-enhanced-math";
import { runAddXpOperation } from "./service-enhanced-operation";
import type { AddXpOperationResult } from "./service-enhanced-types";

export type {
  AddXpOperationResult,
  ProgressionError,
} from "./service-enhanced-types";
export { configureProgressionService } from "./service-enhanced-config";
export { getDailyProgress } from "./service-enhanced-daily";
export {
  calculateLevelFromTotalXp,
  calculateLevelThreshold,
  calculateProgressPercent,
  calculateTotalXpToLevel,
  calculateXpBreakdown,
} from "./service-enhanced-math";

const ZERO_BREAKDOWN = {
  base: 0,
  streakBonus: 0,
  squadBonus: 0,
  bossBonus: 0,
  comebackBonus: 0,
  perfectBonus: 0,
  total: 0,
};

export async function addXpEnhanced(
  userId: string,
  input: AddXpInput,
  options?: { idempotencyKey?: string; skipEvents?: boolean },
): Promise<AddXpOperationResult> {
  const startTime = Date.now();
  try {
    AddXpInputSchema.parse(input);
  } catch (error) {
    Sentry.captureException(error, {
      tags: { operation: "addXp", phase: "validation" },
    });
    return {
      success: false,
      progression: null,
      xpAdded: 0,
      levelUpOccurred: false,
      previousLevel: 0,
      newLevel: 0,
      breakdown: ZERO_BREAKDOWN,
      rewards: [],
      error: createProgressionError(
        "VALIDATION",
        `Invalid input: ${error instanceof Error ? error.message : "Unknown"}`,
        false,
      ),
      offlineQueued: false,
    };
  }

  const breakdown = calculateXpBreakdown({
    baseAmount: input.amount,
    streakDays: input.metadata?.streakDays || 0,
    squadMultiplier: input.metadata?.squadMultiplier || 1,
    bossActive: input.metadata?.bossActive || false,
    perfectSession: input.metadata?.perfectSession || false,
    comebackActive: input.metadata?.comebackActive || false,
  });
  const idempotencyKey =
    options?.idempotencyKey ||
    generateIdempotencyKey(userId, "addXp", input.sessionId);

  if (isDuplicateOperation(idempotencyKey)) {
    return {
      success: true,
      progression: null,
      xpAdded: 0,
      levelUpOccurred: false,
      previousLevel: 0,
      newLevel: 0,
      breakdown,
      rewards: [],
      error: null,
      offlineQueued: false,
    };
  }

  const operationKey = `${userId}:addXp:${input.sessionId || Date.now()}`;
  return deduplicateConcurrent(operationKey, async () => {
    const result = await runAddXpOperation(
      userId,
      input,
      breakdown,
      startTime,
      options?.skipEvents,
      () =>
        addXpEnhanced(userId, input, { ...options, idempotencyKey: undefined }),
    );
    if (result.success || result.offlineQueued) {
      markOperationProcessed(idempotencyKey);
    }
    return result;
  });
}

export async function batchAddXp(
  operations: Array<{ userId: string; input: AddXpInput }>,
): Promise<AddXpOperationResult[]> {
  const results: AddXpOperationResult[] = [];
  const chunkSize = 5;
  for (let index = 0; index < operations.length; index += chunkSize) {
    const chunk = operations.slice(index, index + chunkSize);
    const chunkResults = await Promise.all(
      chunk.map((operation) =>
        addXpEnhanced(operation.userId, operation.input).catch(
          (error): AddXpOperationResult => ({
            success: false,
            progression: null,
            xpAdded: 0,
            levelUpOccurred: false,
            previousLevel: 0,
            newLevel: 0,
            breakdown: ZERO_BREAKDOWN,
            rewards: [],
            error: createProgressionError(
              "UNKNOWN",
              error instanceof Error ? error.message : "Unknown",
              false,
            ),
            offlineQueued: false,
          }),
        ),
      ),
    );
    results.push(...chunkResults);
  }
  return results;
}
