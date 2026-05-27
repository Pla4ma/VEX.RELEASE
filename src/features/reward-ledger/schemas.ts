import { z } from "zod";

export const RewardLedgerStatusSchema = z.enum([
  "pending",
  "delivered",
  "failed",
  "expired",
]);

export const RewardLedgerRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  idempotencyKey: z.string().min(1),
  rewardType: z.string(),
  amount: z.number().int(),
  currency: z.enum(["XP", "COINS", "GEMS"]),
  status: RewardLedgerStatusSchema,
  sourceEvent: z.string(),
  createdAt: z.string().datetime(),
  deliveredAt: z.string().datetime().nullable(),
  failedReason: z.string().nullable(),
  expiresAt: z.string().datetime().nullable(),
});

export const CreateRewardLedgerInputSchema = z.object({
  userId: z.string().uuid(),
  idempotencyKey: z.string().min(1),
  rewardType: z.string(),
  amount: z.number().int().positive(),
  currency: z.enum(["XP", "COINS", "GEMS"]),
  sourceEvent: z.string(),
  expiresAt: z.string().datetime().optional(),
});

export type RewardLedgerStatus = z.infer<typeof RewardLedgerStatusSchema>;
export type RewardLedgerRecord = z.infer<typeof RewardLedgerRecordSchema>;
export type CreateRewardLedgerInput = z.infer<
  typeof CreateRewardLedgerInputSchema
>;
