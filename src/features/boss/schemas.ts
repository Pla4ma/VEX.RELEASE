import { z } from 'zod';

/** Legacy boss schemas — kept for type compatibility. Active blocker schemas are in types.ts */
export const BossRewardTypeSchema = z.enum(['XP']);
/** @deprecated Blocker encounters use BlockerCompletionSignal in types.ts */
export const BossEncounterStatusSchema = z.enum(['ACTIVE']);
/** @deprecated Use PersonalBlockerBlock from types.ts */
export const BossTemplateSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    tier: z.number(),
  })
  .partial();
/** @deprecated */
export const BossEncounterSummarySchema = z.object({}).partial();

/** @deprecated */
export type BossEncounterSummary = z.infer<
  typeof BossEncounterSummarySchema
> | null;
/** @deprecated Use PersonalBlockerBlock */
export type BossTemplate = z.infer<typeof BossTemplateSchema> | undefined;
