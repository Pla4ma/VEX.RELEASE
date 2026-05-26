import { z } from 'zod';

export const CurrencyTypeSchema = z.enum(['COINS', 'GEMS', 'FOCUS_POINTS', 'SEASONAL']);

export const TransactionTypeSchema = z.enum([
  'EARN',
  'SPEND',
  'REFUND',
  'CONVERT',
  'GIFT_RECEIVE',
  'GIFT_SEND',
]);

export const WalletRowSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  balance: z.number().int().min(0),
  currency: CurrencyTypeSchema,
  createdAt: z.string().datetime().nullable(),
  updatedAt: z.string().datetime().nullable(),
});

export const WalletTransactionSchema = z.object({
  id: z.string().uuid(),
  walletId: z.string().uuid(),
  amount: z.number().int(),
  type: TransactionTypeSchema,
  status: z.string(),
  description: z.string().nullable(),
  metadata: z.unknown().nullable(),
  createdAt: z.string().datetime().nullable(),
});

export const WalletStateSchema = z.object({
  userId: z.string().uuid(),
  coins: z.number().int().min(0),
  gems: z.number().int().min(0),
  focusPoints: z.number().int().min(0),
});

export const CreateTransactionInputSchema = z.object({
  walletId: z.string().uuid(),
  amount: z.number().int().positive(),
  type: TransactionTypeSchema,
  description: z.string().max(500),
  metadata: z.record(z.unknown()).optional(),
});

export const EarnCoinsInputSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().int().positive(),
  sourceTransactionType: TransactionTypeSchema.optional(),
  description: z.string().max(500),
  metadata: z.record(z.unknown()).optional(),
});

export const SpendCoinsInputSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().int().positive(),
  description: z.string().max(500),
  metadata: z.record(z.unknown()).optional(),
});

export type CurrencyType = z.infer<typeof CurrencyTypeSchema>;
export type TransactionType = z.infer<typeof TransactionTypeSchema>;
export type WalletRow = z.infer<typeof WalletRowSchema>;
export type WalletTransaction = z.infer<typeof WalletTransactionSchema>;
export type WalletState = z.infer<typeof WalletStateSchema>;
export type CreateTransactionInput = z.infer<typeof CreateTransactionInputSchema>;
export type EarnCoinsInput = z.infer<typeof EarnCoinsInputSchema>;
export type SpendCoinsInput = z.infer<typeof SpendCoinsInputSchema>;
