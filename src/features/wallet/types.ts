import type { z } from 'zod';
import type {
  WalletRowSchema,
  WalletTransactionSchema,
  CreateTransactionInputSchema,
  EarnCoinsInputSchema,
  SpendCoinsInputSchema,
  WalletStateSchema,
} from './schemas';

export type WalletRow = z.infer<typeof WalletRowSchema>;
export type WalletTransaction = z.infer<typeof WalletTransactionSchema>;
export type CreateTransactionInput = z.infer<typeof CreateTransactionInputSchema>;
export type EarnCoinsInput = z.infer<typeof EarnCoinsInputSchema>;
export type SpendCoinsInput = z.infer<typeof SpendCoinsInputSchema>;
export type WalletState = z.infer<typeof WalletStateSchema>;
