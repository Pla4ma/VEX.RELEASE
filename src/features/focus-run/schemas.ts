import { z } from 'zod';

export const FocusRunEventTypeSchema = z.enum([
  'run_started',
  'encounter_completed',
  'rescue_win',
  'clean_start',
  'abandoned_encounter',
  'reflection_upgrade',
  'boss_revealed',
  'run_completed',
]);

export const BossArchetypeSchema = z.enum([
  'doomscroll_hydra',
  'late_start_shade',
  'fog_of_unclear_work',
  'perfectionism_wall',
  'switch_swarm',
  'deadline_wraith',
  'cold_start_shadow',
]);

export const FocusRunEventSchema = z.object({
  id: z.string().min(1),
  type: FocusRunEventTypeSchema,
  occurredAt: z.number().int().min(0),
  signal: z.string().min(1).nullable(),
}).strict();

export const FocusRunSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  weekStartsAt: z.number().int().min(0),
  status: z.enum(['active', 'completed']),
  events: z.array(FocusRunEventSchema),
}).strict();

export const PersonalBossSchema = z.object({
  archetype: BossArchetypeSchema,
  name: z.string().min(1),
  evidenceCount: z.number().int().min(0),
  isTeaser: z.boolean(),
  recoveryPrompt: z.string().min(1),
}).strict();

export const FocusRunDisplaySchema = z.object({
  laneAllowed: z.boolean(),
  title: z.string().min(1),
  body: z.string().min(1),
  boss: PersonalBossSchema,
  nextAction: z.string().min(1),
  modifiers: z.array(z.string().min(1)),
}).strict();

export type FocusRun = z.infer<typeof FocusRunSchema>;
export type FocusRunDisplay = z.infer<typeof FocusRunDisplaySchema>;
export type FocusRunEvent = z.infer<typeof FocusRunEventSchema>;
export type FocusRunEventType = z.infer<typeof FocusRunEventTypeSchema>;
export type PersonalBoss = z.infer<typeof PersonalBossSchema>;
