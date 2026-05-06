import { z } from "zod";
import { getSupabaseClient } from "../../config/supabase";
import { createDebugger } from "../../utils/debug";

const debug = createDebugger("rewards:delivery");

export const RewardDeliveryStatusSchema = z.enum(["PENDING", "IN_PROGRESS", "DELIVERED", "FAILED", "RETRYING", "PERMANENTLY_FAILED"]);

export type RewardDeliveryStatus = z.infer<typeof RewardDeliveryStatusSchema>;

export const RewardDeliverySchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    rewardType: z.enum(["XP", "COINS", "GEMS", "ITEM", "BADGE", "STREAK_SHIELD"]),
    amount: z.number(),
    source: z.string(),
    sourceId: z.string(),
    status: RewardDeliveryStatusSchema,
    attemptCount: z.number(),
    maxAttempts: z.number(),
    lastAttemptAt: z.number().nullable(),
    deliveredAt: z.number().nullable(),
    failedAt: z.number().nullable(),
    errorMessage: z.string().nullable(),
    retryAfter: z.number().nullable(),
  })
  .strict();

export type RewardDelivery = z.infer<typeof RewardDeliverySchema>;

const RewardDeliveryRowSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  reward_type: z.enum(["XP", "COINS", "GEMS", "ITEM", "BADGE", "STREAK_SHIELD"]),
  amount: z.number(),
  source: z.string(),
  source_id: z.string(),
  status: z.enum(["PENDING", "IN_PROGRESS", "DELIVERED", "FAILED", "RETRYING", "PERMANENTLY_FAILED"]),
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

export async function createRewardDelivery(delivery: Omit<RewardDelivery, "id" | "attemptCount" | "lastAttemptAt" | "deliveredAt" | "failedAt" | "errorMessage" | "retryAfter">): Promise<RewardDelivery> {
  const supabase = getSupabaseClient();

  const id = `${delivery.userId}:${delivery.sourceId}:${delivery.rewardType}`;

  const row = {
    id,
    user_id: delivery.userId,
    reward_type: delivery.rewardType,
    amount: delivery.amount,
    source: delivery.source,
    source_id: delivery.sourceId,
    status: delivery.status,
    attempt_count: 0,
    max_attempts: delivery.maxAttempts,
    last_attempt_at: null,
    delivered_at: null,
    failed_at: null,
    error_message: null,
    retry_after: null,
  };

  const { data, error } = await supabase.from("reward_deliveries").upsert(row, { onConflict: "id" }).select().single();

  if (error) {
    debug.error("Failed to create reward delivery", error);
    throw new Error(`Failed to create reward delivery: ${error.message}`);
  }

  const parsed = RewardDeliveryRowSchema.parse(data);
  debug.info("Created reward delivery: %s", parsed.id);

  return mapRowToDelivery(parsed);
}

export async function getPendingDeliveries(userId: string): Promise<RewardDelivery[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.from("reward_deliveries").select("*").eq("user_id", userId).in("status", ["PENDING", "FAILED", "RETRYING"]).order("created_at", { ascending: false });

  if (error) {
    debug.error("Failed to fetch pending deliveries", error);
    throw new Error(`Failed to fetch pending deliveries: ${error.message}`);
  }

  return (data ?? []).map((row) => mapRowToDelivery(RewardDeliveryRowSchema.parse(row)));
}

export async function getFailedDeliveries(userId: string): Promise<RewardDelivery[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.from("reward_deliveries").select("*").eq("user_id", userId).in("status", ["FAILED", "PERMANENTLY_FAILED"]).order("failed_at", { ascending: false });

  if (error) {
    debug.error("Failed to fetch failed deliveries", error);
    throw new Error(`Failed to fetch failed deliveries: ${error.message}`);
  }

  return (data ?? []).map((row) => mapRowToDelivery(RewardDeliveryRowSchema.parse(row)));
}

export async function markDeliveryInProgress(deliveryId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from("reward_deliveries")
    .update({
      status: "IN_PROGRESS",
      last_attempt_at: Date.now(),
    })
    .eq("id", deliveryId);

  if (error) {
    debug.error("Failed to mark delivery in progress", error);
    throw new Error(`Failed to mark delivery in progress: ${error.message}`);
  }
}

export async function markDeliveryDelivered(deliveryId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from("reward_deliveries")
    .update({
      status: "DELIVERED",
      delivered_at: Date.now(),
      error_message: null,
      retry_after: null,
    })
    .eq("id", deliveryId);

  if (error) {
    debug.error("Failed to mark delivery delivered", error);
    throw new Error(`Failed to mark delivery delivered: ${error.message}`);
  }

  debug.info("Marked delivery %s as delivered", deliveryId);
}

export async function markDeliveryFailed(deliveryId: string, errorMessage: string, canRetry: boolean): Promise<void> {
  const supabase = getSupabaseClient();

  const update: Record<string, unknown> = {
    status: canRetry ? "FAILED" : "PERMANENTLY_FAILED",
    failed_at: Date.now(),
    error_message: errorMessage,
    attempt_count: supabase.rpc("increment_attempt_count", { delivery_id: deliveryId }),
  };

  if (canRetry) {
    const retryDelayMs = 5000;
    update.retry_after = Date.now() + retryDelayMs;
  }

  const { error } = await supabase.from("reward_deliveries").update(update).eq("id", deliveryId);

  if (error) {
    debug.error("Failed to mark delivery failed", error);
    throw new Error(`Failed to mark delivery failed: ${error.message}`);
  }

  debug.info("Marked delivery %s as failed (retryable: %s)", deliveryId, canRetry);
}

export async function scheduleRetry(deliveryId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from("reward_deliveries")
    .update({
      status: "RETRYING",
      retry_after: Date.now() + 5000,
    })
    .eq("id", deliveryId);

  if (error) {
    debug.error("Failed to schedule retry", error);
    throw new Error(`Failed to schedule retry: ${error.message}`);
  }
}

export async function getDeliveriesNeedingRetry(): Promise<RewardDelivery[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.from("reward_deliveries").select("*").in("status", ["FAILED", "RETRYING"]).or(`retry_after.lt.${Date.now()},retry_after.is.null`).lt("attempt_count", supabase.rpc("get_max_attempts")).limit(100);

  if (error) {
    debug.error("Failed to fetch deliveries needing retry", error);
    throw new Error(`Failed to fetch deliveries needing retry: ${error.message}`);
  }

  return (data ?? []).map((row) => mapRowToDelivery(RewardDeliveryRowSchema.parse(row)));
}
