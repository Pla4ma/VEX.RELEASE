import { z } from 'zod';
import { getSupabaseClient } from '../../../config/supabase';
import { createDebugger } from '../../../utils/debug';

const debug = createDebugger('rewards:delivery');
const RewardDeliveryRowSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  reward_type: z.enum(['XP', 'COINS', 'GEMS', 'ITEM', 'BADGE', 'STREAK_SHIELD']),
  amount: z.number(),
  source: z.string(),
  source_id: z.string(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'DELIVERED', 'FAILED', 'RETRYING', 'PERMANENTLY_FAILED']),
  attempt_count: z.number(),
  max_attempts: z.number(),
  last_attempt_at: z.number().nullable(),
  delivered_at: z.number().nullable(),
  failed_at: z.number().nullable(),
  error_message: z.string().nullable(),
  retry_after: z.number().nullable(),
});

function mapRowToDelivery(row: z.infer<typeof RewardDeliveryRowSchema>): RewardDelivery {
  return RewardDeliverySchema.parse({
    id: row.id,
    userId: row.user_id,
    rewardType: row.reward_type,
    amount: row.amount,
    source: row.source,
    sourceId: row.source_id,
    status: row.status,
    attemptCount: row.attempt_count,
    maxAttempts: row.max_attempts,
    lastAttemptAt: row.last_attempt_at,
    deliveredAt: row.delivered_at,
    failedAt: row.failed_at,
    errorMessage: row.error_message,
    retryAfter: row.retry_after,
  });
}

export * from "./delivery-tracking.types";
export * from "./delivery-tracking.part1";
export * from "./delivery-tracking.part2";
