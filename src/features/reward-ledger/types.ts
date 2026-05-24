import type { z } from 'zod';
import type { RewardLedgerRecordSchema, CreateRewardLedgerInputSchema, RewardLedgerStatusSchema } from './schemas';

export type RewardLedgerRecord = z.infer<typeof RewardLedgerRecordSchema>;
export type CreateRewardLedgerInput = z.infer<typeof CreateRewardLedgerInputSchema>;
export type RewardLedgerStatus = z.infer<typeof RewardLedgerStatusSchema>;
