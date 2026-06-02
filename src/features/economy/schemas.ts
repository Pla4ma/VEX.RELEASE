import { z } from 'zod';

export const CurrencyRpcResultSchema = z.object({
  success: z.boolean(),
  new_balance: z.number().optional(),
});
export type CurrencyRpcResult = z.infer<typeof CurrencyRpcResultSchema>;

export const WalletSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  coins: z.number().int().min(0).default(0),
  gems: z.number().int().min(0).default(0),
  created_at: z.number(),
  updated_at: z.number(),
});

export type Wallet = z.infer<typeof WalletSchema>;

export const CurrencyTypeSchema = z.enum(['COINS', 'GEMS', 'XP', 'SEASONAL', 'FOCUS_POINTS']);
export type CurrencyType = z.infer<typeof CurrencyTypeSchema>;

export const SpendInputSchema = z.object({
  userId: z.string().uuid(),
  currency: CurrencyTypeSchema,
  amount: z.number().int().positive(),
  sink: z.string().min(1),
  description: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type SpendInput = z.infer<typeof SpendInputSchema>;

export const CurrencyGrantSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().int().positive(),
  currency: CurrencyTypeSchema,
  source: z.string().min(1),
  sourceId: z.string().nullable().optional(),
  description: z.string().optional(),
  skipEvents: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type CurrencyGrant = z.infer<typeof CurrencyGrantSchema>;

export const SpendCurrencyRpcInputSchema = z.object({
  userId: z.string().uuid(),
  currency: CurrencyTypeSchema,
  amount: z.number().int().positive().max(1_000_000),
  sink: z.string().min(1),
});
export type SpendCurrencyRpcInput = z.infer<typeof SpendCurrencyRpcInputSchema>;

export const GrantCurrencyRpcInputSchema = z.object({
  userId: z.string().uuid(),
  currency: CurrencyTypeSchema,
  amount: z.number().int().positive().max(1_000_000),
  source: z.string().min(1),
  sourceId: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});
export type GrantCurrencyRpcInput = z.infer<typeof GrantCurrencyRpcInputSchema>;
