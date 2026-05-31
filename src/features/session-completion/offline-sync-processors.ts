import * as Sentry from '@sentry/react-native';
import { z } from 'zod';
import type { OfflineQueueEntry, QueueProcessor } from '../../lib/offline/queue';
import { registerProcessor } from '../../lib/offline/queue';
import { AddXpInputSchema } from '../progression/schemas';
import { RewardTriggerSchema, RewardTypeSchema } from '../rewards/schemas';
import { RecordSessionInputSchema } from '../streaks/schemas';
import { getProgressionService } from '../../progression/ProgressionService';
import { getRewardService } from '../../rewards/RewardService';
import { getStreakService } from '../../streaks/StreakService';

const XpPayloadSchema = AddXpInputSchema.pick({
  userId: true,
  amount: true,
  sessionId: true,
}).extend({
  metadata: z.record(z.unknown()).optional(),
});
const StreakPayloadSchema = RecordSessionInputSchema.pick({
  userId: true,
  sessionId: true,
  completedAt: true,
}).extend({
  duration: z.number().min(0).optional(),
  qualityScore: z.number().min(0).max(100).optional(),
});
const RewardPayloadSchema = z.object({
  userId: z.string().uuid(),
  sessionId: z.string().uuid().optional(),
  type: RewardTypeSchema.default('XP'),
  triggerType: RewardTriggerSchema.default('SESSION_COMPLETE'),
  amount: z.number().positive(),
});

export class OfflineProcessorPayloadError extends Error {
  readonly cause: unknown;

  constructor(operation: string, cause: unknown) {
    super(`Invalid offline payload for ${operation}`);
    this.name = 'OfflineProcessorPayloadError';
    this.cause = cause;
  }
}

function parsePayload<T>(
  schema: z.ZodType<T>,
  entry: OfflineQueueEntry,
): T {
  const result = schema.safeParse(entry.payload);
  if (result.success) {return result.data;}
  throw new OfflineProcessorPayloadError(entry.operation, result.error);
}

function captureProcessorError(error: unknown, entry: OfflineQueueEntry): void {
  if (error instanceof OfflineProcessorPayloadError) {throw error;}
  Sentry.captureException(error, {
    tags: {
      feature: 'session-completion',
      operation: `offline-${entry.feature}-${entry.operation}`,
    },
    extra: { entryId: entry.id, idempotencyKey: entry.idempotencyKey },
  });
}

export function createXpAddProcessor(): QueueProcessor {
  return async (entry: OfflineQueueEntry): Promise<void> => {
    try {
      const payload = parsePayload(XpPayloadSchema, entry);
      await getProgressionService(payload.userId).addXP(
        payload.amount,
        'SESSION_COMPLETE',
        {
          metadata: payload.metadata,
          sessionId: payload.sessionId,
          idempotencyKey: entry.idempotencyKey,
        },
      );
    } catch (error) {
      captureProcessorError(error, entry);
      throw error;
    }
  };
}

export function createStreakRecordProcessor(): QueueProcessor {
  return async (entry: OfflineQueueEntry): Promise<void> => {
    try {
      const payload = parsePayload(StreakPayloadSchema, entry);
      await getStreakService(payload.userId).recordSession({
        sessionId: payload.sessionId,
        completedAt: payload.completedAt,
        duration: payload.duration,
        qualityScore: payload.qualityScore,
        idempotencyKey: entry.idempotencyKey,
      });
    } catch (error) {
      captureProcessorError(error, entry);
      throw error;
    }
  };
}

export function createRewardClaimProcessor(): QueueProcessor {
  return async (entry: OfflineQueueEntry): Promise<void> => {
    try {
      const payload = parsePayload(RewardPayloadSchema, entry);
      await getRewardService(payload.userId).grantReward(
        payload.type ?? 'XP',
        payload.triggerType ?? 'SESSION_COMPLETE',
        { baseAmount: payload.amount },
        {
          exactAmount: payload.amount,
          sessionId: payload.sessionId,
          idempotencyKey: entry.idempotencyKey,
        },
      );
    } catch (error) {
      captureProcessorError(error, entry);
      throw error;
    }
  };
}

export function registerSessionCompletionProcessors(
  sessionProcessor: QueueProcessor,
): void {
  registerProcessor('sessions', 'SESSION_COMPLETE', sessionProcessor);
  registerProcessor('progression', 'XP_ADD', createXpAddProcessor());
  registerProcessor('streaks', 'STREAK_RECORD', createStreakRecordProcessor());
  registerProcessor('rewards', 'REWARD_CLAIM', createRewardClaimProcessor());
}
