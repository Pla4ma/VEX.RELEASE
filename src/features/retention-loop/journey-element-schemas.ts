import { z } from 'zod';

// ── Journey Day ────────────────────────────────────────────────────────
export const JourneyDaySchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
]);

// ── Journey Phase ──────────────────────────────────────────────────────
export const JourneyPhaseSchema = z.enum([
  'onboarding',
  'return',
  'proof',
  'insight',
  'rescue',
  'lane_forming',
  'weekly_prep',
  'weekly_intelligence',
]);

// ── Emotional state ────────────────────────────────────────────────────
export const EmotionalStateSchema = z.enum([
  'curious',
  'familiar',
  'validated',
  'trusting',
  'struggling',
  'forming',
  'ready',
  'valuable',
]);

// ── Home message ───────────────────────────────────────────────────────
export const JourneyHomeMessageSchema = z
  .object({
    headline: z.string().min(1).max(120),
    subtext: z.string().min(1).max(200),
    tone: z.enum(['warm', 'direct', 'humble', 'encouraging', 'proof']),
  })
  .strict();

// ── Session suggestion ─────────────────────────────────────────────────
export const JourneySessionSuggestionSchema = z
  .object({
    durationMinutes: z.number().int().min(5).max(60),
    type: z.enum(['STUDY', 'DEEP_WORK', 'SPRINT', 'LIGHT_FOCUS', 'RECOVERY']),
    taskPrompt: z.string().min(1).max(200),
  })
  .strict();

// ── Completion payoff ──────────────────────────────────────────────────
export const JourneyCompletionPayoffSchema = z
  .object({
    headline: z.string().min(1).max(120),
    body: z.string().min(1).max(300),
    nextActionCta: z.string().min(1).max(120),
    nextActionRoute: z.string().min(1).max(120),
  })
  .strict();

// ── Memory / learning moment ───────────────────────────────────────────
export const JourneyMomentSchema = z
  .object({
    type: z.enum(['none', 'what_vex_learned', 'proof_signal', 'weekly_insight']),
    requiresSessions: z.number().int().min(0),
    canHide: z.boolean(),
  })
  .strict();

// ── Return reason ──────────────────────────────────────────────────────
export const JourneyReturnReasonSchema = z
  .object({
    day1: z.string().min(1).max(200),
    day2: z.string().min(1).max(200),
    day3: z.string().min(1).max(200),
    day4: z.string().min(1).max(200),
    day5: z.string().min(1).max(200),
    day6: z.string().min(1).max(200),
    day7: z.string().min(1).max(200),
  })
  .strict();

// ── Premium moment ─────────────────────────────────────────────────────
export const JourneyPremiumMomentSchema = z
  .object({
    day: JourneyDaySchema,
    trigger: z.enum([
      'after_weekly_insight',
      'deep_insight_tap',
      'advanced_action',
      'none',
    ]),
    copyKey: z.enum(['study', 'run', 'project', 'clean', 'none']),
  })
  .strict();

// ── Nudge policy (per day) ─────────────────────────────────────────────
export const JourneyNudgePolicySchema = z
  .object({
    canSend: z.boolean(),
    type: z
      .enum([
        'none',
        'gentle_return',
        'proof_nudge',
        'memory_nudge',
        'rescue',
        'weekly_insight',
      ])
      .nullable(),
    condition: z.string().min(1).max(200),
  })
  .strict();
