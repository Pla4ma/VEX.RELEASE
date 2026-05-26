import { z } from 'zod';

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

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

export const FocusRunStatusSchema = z.enum(['active', 'completed', 'abandoned']);

export const BossArchetypeSchema = z.enum([
  'doomscroll_hydra',
  'late_start_shade',
  'fog_of_unclear_work',
  'perfectionism_wall',
  'switch_swarm',
  'deadline_wraith',
  'cold_start_shadow',
  'task_avoidance',
]);

export const FocusRunGradeSchema = z.enum(['S', 'A', 'B', 'C', 'D']);

// ---------------------------------------------------------------------------
// Focus Run
// ---------------------------------------------------------------------------

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
  status: FocusRunStatusSchema,
  bossId: z.string().min(1).nullable(),
  modifiers: z.array(z.string().min(1)),
  completedEncounters: z.number().int().min(0),
  cleanStarts: z.number().int().min(0),
  recoveryWins: z.number().int().min(0),
  reflectionUpgrades: z.number().int().min(0),
  finalGrade: FocusRunGradeSchema.nullable(),
  events: z.array(FocusRunEventSchema),
}).strict();

// ---------------------------------------------------------------------------
// Personal Boss
// ---------------------------------------------------------------------------

export const PersonalBossEvidenceSchema = z.object({
  archetype: BossArchetypeSchema,
  signals: z.array(z.string().min(1)),
  firstObservedDay: z.number().int().min(0),
  lastObservedDay: z.number().int().min(0),
}).strict();

export const PersonalBossSchema = z.object({
  archetype: BossArchetypeSchema,
  name: z.string().min(1),
  evidenceCount: z.number().int().min(0),
  isTeaser: z.boolean(),
  isEvidenceBased: z.boolean(),
  recoveryPrompt: z.string().min(1),
  observedDays: z.number().int().min(0),
}).strict();

// ---------------------------------------------------------------------------
// Display
// ---------------------------------------------------------------------------

export const FocusRunDisplaySchema = z.object({
  laneAllowed: z.boolean(),
  title: z.string().min(1),
  body: z.string().min(1),
  boss: PersonalBossSchema,
  nextAction: z.string().min(1),
  modifiers: z.array(z.string().min(1)),
  completedEncounters: z.number().int().min(0),
  cleanStarts: z.number().int().min(0),
  recoveryWins: z.number().int().min(0),
  reflectionUpgrades: z.number().int().min(0),
  finalGrade: FocusRunGradeSchema.nullable(),
  weekSummary: z.string().min(1),
}).strict();

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type BossArchetype = z.infer<typeof BossArchetypeSchema>;
export type FocusRun = z.infer<typeof FocusRunSchema>;
export type FocusRunDisplay = z.infer<typeof FocusRunDisplaySchema>;
export type FocusRunEvent = z.infer<typeof FocusRunEventSchema>;
export type FocusRunEventType = z.infer<typeof FocusRunEventTypeSchema>;
export type FocusRunStatus = z.infer<typeof FocusRunStatusSchema>;
export type FocusRunGrade = z.infer<typeof FocusRunGradeSchema>;
export type PersonalBoss = z.infer<typeof PersonalBossSchema>;
export type PersonalBossEvidence = z.infer<typeof PersonalBossEvidenceSchema>;
