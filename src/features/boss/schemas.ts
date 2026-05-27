import { z } from 'zod';

export const BossRewardTypeSchema = z.enum(['XP']);
export const BossEncounterStatusSchema = z.enum(['ACTIVE']);
export const BossTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  tier: z.number(),
}).partial();
export const BossEncounterSummarySchema = z.object({}).partial();

export type BossEncounterSummary = z.infer<typeof BossEncounterSummarySchema> | null;
export type BossTemplate = z.infer<typeof BossTemplateSchema> | undefined;
