import { z } from 'zod';
export const RewardTypeSchema = z.enum(['XP', 'COINS', 'GEMS']);
export const RewardTriggerSchema = z.enum([
  'SESSION', 'STREAK', 'ACHIEVEMENT', 'COMEBACK', 'ACHIEVEMENT_UNLOCK',
  'SESSION_COMPLETE', 'COMEBACK_BONUS', 'CHALLENGE_COMPLETE',
]);
export type RewardType = z.infer<typeof RewardTypeSchema>;
export type RewardTrigger = z.infer<typeof RewardTriggerSchema>;
