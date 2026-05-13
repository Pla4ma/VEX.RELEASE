import { z } from "zod";


export const SpendCurrencyInputSchema = z
  .object({
    userId: z.string().uuid(),
    currency: CurrencyTypeSchema,
    amount: z.number().int().positive(),
    sink: z.enum(['SHOP', 'CRAFTING', 'UPGRADE', 'GIFT', 'CONVERT', 'STREAK_INSURANCE', 'STREAK_WAGER', 'BOSS_BOUNTY']),
    description: z.string().min(1).max(500),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();

export const GetBalanceInputSchema = z
  .object({
    userId: z.string().uuid(),
    currency: CurrencyTypeSchema.optional(),
  })
  .strict();

export const GetTransactionHistoryInputSchema = z
  .object({
    userId: z.string().uuid(),
    currency: CurrencyTypeSchema.optional(),
    source: TransactionSourceSchema.optional(),
    startDate: z.number().int().optional(),
    endDate: z.number().int().optional(),
    limit: z.number().int().min(1).max(100).default(50),
    offset: z.number().int().min(0).default(0),
  })
  .strict();