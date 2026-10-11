import * as Sentry from '@sentry/react-native';
import type { AddXpInput } from './schemas';
import { createProgressionError } from './service-errors';
import {
  calculateLevelThreshold,
  calculateTotalXpToLevel,
} from './service-xp-calculations';
import type { AddXpOperationResult } from './types';
import { tryAtomicAddXp } from './operation-atomic';
import { publishProgressionEvents } from './operation-events';

type RetryOnConflict = () => Promise<AddXpOperationResult>;

export async function runAddXpOperation(
  userId: string,
  input: AddXpInput,
  breakdown: AddXpOperationResult['breakdown'],
  _startTime: number,
  skipEvents: boolean | undefined,
  _retryOnConflict: RetryOnConflict,
  requestedIdempotencyKey?: string,
): Promise<AddXpOperationResult> {
  const idempotencyKey =
    requestedIdempotencyKey ??
    `${userId}:addXp:${input.sessionId || 'direct'}`;

  const atomicResult = await tryAtomicAddXp(userId, breakdown.total, input, idempotencyKey);
  if (atomicResult) {
    publishProgressionEvents(
      skipEvents || atomicResult.duplicate, userId, input, breakdown,
      atomicResult.new_total_xp, atomicResult.new_level,
      atomicResult.new_total_xp - calculateTotalXpToLevel(atomicResult.new_level),
      atomicResult.previous_level,
      calculateLevelThreshold(atomicResult.new_level),
      atomicResult.level_up, atomicResult.rewards,
    );

    Sentry.addBreadcrumb({
      category: 'progression',
      message: 'XP added (atomic RPC)',
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

  // A lost RPC response may follow a committed award. Never perform a second,
  // non-atomic balance write: retry the same server idempotency key instead.
  return {
    success: false,
    progression: null,
    xpAdded: 0,
    levelUpOccurred: false,
    previousLevel: 0,
    newLevel: 0,
    breakdown,
    rewards: [],
    error: createProgressionError('NETWORK', 'XP is waiting for sync. Retry this reward.', true),
    offlineQueued: false,
  };
}
