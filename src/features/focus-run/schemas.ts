import { z } from "zod";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const FocusRunEventTypeSchema = z.enum([
  "run_started",
  "run_milestone",
  "recovery_win",
  "clean_start",
  "abandoned_run",
  "reflection_upgrade",
  "blocker_detected",
  "run_completed",
]);

export const FocusRunStatusSchema = z.enum([
  "active",
  "completed",
  "abandoned",
]);

export const BlockerArchetypeSchema = z.enum([
  "distraction_loop",
  "delayed_start",
  "unclear_scope",
  "over_prep",
  "context_switching",
  "deadline_pressure",
  "blank_start",
  "avoidant_pattern",
]);

export const FocusRunGradeSchema = z.enum(["S", "A", "B", "C", "D"]);

// ---------------------------------------------------------------------------
// Focus Run
// ---------------------------------------------------------------------------

export const FocusRunEventSchema = z
  .object({
    id: z.string().min(1),
    type: FocusRunEventTypeSchema,
    occurredAt: z.number().int().min(0),
    signal: z.string().min(1).nullable(),
  })
  .strict();

export const FocusRunSchema = z
  .object({
    id: z.string().min(1),
    userId: z.string().min(1),
    weekStartsAt: z.number().int().min(0),
    status: FocusRunStatusSchema,
    blockerId: z.string().min(1).nullable(),
    focusModifiers: z.array(z.string().min(1)),
    completedRuns: z.number().int().min(0),
    cleanStarts: z.number().int().min(0),
    recoveryWins: z.number().int().min(0),
    reflectionUpgrades: z.number().int().min(0),
    finalGrade: FocusRunGradeSchema.nullable(),
    events: z.array(FocusRunEventSchema),
  })
  .strict();

// ---------------------------------------------------------------------------
// Personal Blocker (formerly Personal Boss)
// ---------------------------------------------------------------------------

export const PersonalBlockerEvidenceSchema = z
  .object({
    archetype: BlockerArchetypeSchema,
    signals: z.array(z.string().min(1)),
    firstObservedDay: z.number().int().min(0),
    lastObservedDay: z.number().int().min(0),
  })
  .strict();

export const PersonalBlockerSchema = z
  .object({
    archetype: BlockerArchetypeSchema,
    name: z.string().min(1),
    evidenceCount: z.number().int().min(0),
    isTeaser: z.boolean(),
    isEvidenceBased: z.boolean(),
    recoveryPrompt: z.string().min(1),
    observedDays: z.number().int().min(0),
  })
  .strict();

// ---------------------------------------------------------------------------
// Display
// ---------------------------------------------------------------------------

export const FocusRunDisplaySchema = z
  .object({
    laneAllowed: z.boolean(),
    title: z.string().min(1),
    body: z.string().min(1),
    blocker: PersonalBlockerSchema,
    nextAction: z.string().min(1),
    focusModifiers: z.array(z.string().min(1)),
    completedRuns: z.number().int().min(0),
    cleanStarts: z.number().int().min(0),
    recoveryWins: z.number().int().min(0),
    reflectionUpgrades: z.number().int().min(0),
    finalGrade: FocusRunGradeSchema.nullable(),
    weekSummary: z.string().min(1),
  })
  .strict();

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type BlockerArchetype = z.infer<typeof BlockerArchetypeSchema>;
export type FocusRun = z.infer<typeof FocusRunSchema>;
export type FocusRunDisplay = z.infer<typeof FocusRunDisplaySchema>;
export type FocusRunEvent = z.infer<typeof FocusRunEventSchema>;
export type FocusRunEventType = z.infer<typeof FocusRunEventTypeSchema>;
export type FocusRunStatus = z.infer<typeof FocusRunStatusSchema>;
export type FocusRunGrade = z.infer<typeof FocusRunGradeSchema>;
export type PersonalBlocker = z.infer<typeof PersonalBlockerSchema>;
export type PersonalBlockerEvidence = z.infer<typeof PersonalBlockerEvidenceSchema>;
