import { z } from 'zod';

export const CurrencySchema = z.enum(['COINS', 'GEMS', 'SEASONAL']);
export const TransactionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  type: z.enum(['EARN', 'SPEND', 'CONVERT', 'REFUND']),
  currency: CurrencySchema,
  amount: z.number().positive(),
  description: z.string().max(255).optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z
    .number()
    .optional()
    .default(() => Date.now()),
});
export const WalletSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().min(1),
  coins: z.number().int().min(0).default(0),
  gems: z.number().int().min(0).default(0),
  seasonal: z.record(z.number().int().min(0)).default({}),
});
