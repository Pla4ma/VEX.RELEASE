import { z } from 'zod';
import { LaneSchema } from '../lane-engine/schemas';
import {
  JourneyDaySchema,
  JourneyPhaseSchema,
  EmotionalStateSchema,
  JourneyHomeMessageSchema,
  JourneySessionSuggestionSchema,
  JourneyMomentSchema,
  JourneyReturnReasonSchema,
  JourneyPremiumMomentSchema,
  JourneyNudgePolicySchema,
} from './journey-element-schemas';

// ── Lane copy map ──────────────────────────────────────────────────────
export const LaneCopyMapSchema = z
  .object({
    student: z.string().min(1).max(200),
    game_like: z.string().min(1).max(200),
    deep_creative: z.string().min(1).max(200),
    minimal_normal: z.string().min(1).max(200),
  })
  .strict();

// ── Full journey copy per day ──────────────────────────────────────────
export const JourneyDayCopySchema = z
  .object({
    homeMessage: LaneCopyMapSchema,
    primaryCta: LaneCopyMapSchema,
    sessionSuggestion: z.object({
      student: JourneySessionSuggestionSchema,
      game_like: JourneySessionSuggestionSchema,
      deep_creative: JourneySessionSuggestionSchema,
      minimal_normal: JourneySessionSuggestionSchema,
    }),
    completionPayoff: LaneCopyMapSchema,
    nextActionCopy: LaneCopyMapSchema,
    notificationCopy: z
      .object({
        title: LaneCopyMapSchema,
        body: LaneCopyMapSchema,
      })
      .optional(),
    premiumTrigger: JourneyPremiumMomentSchema,
    returnReason: LaneCopyMapSchema,
  })
  .strict();

// ── Retention journey copy (full 0-7 map) ──────────────────────────────
export const RetentionJourneyCopySchema = z.object({
  day0: JourneyDayCopySchema,
  day1: JourneyDayCopySchema,
  day2: JourneyDayCopySchema,
  day3: JourneyDayCopySchema,
  day4: JourneyDayCopySchema,
  day5: JourneyDayCopySchema,
  day6: JourneyDayCopySchema,
  day7: JourneyDayCopySchema,
});

// ── Journey state (computed per user per day) ──────────────────────────
export const JourneyStateInputSchema = z
  .object({
    userId: z.string().min(1),
    daysSinceOnboarding: z.number().int().min(0),
    completedSessions: z.number().int().min(0),
    hasCompletedToday: z.boolean(),
    hasSeenMemoryInsight: z.boolean(),
    lane: LaneSchema,
    rescueCompleted: z.number().int().min(0),
    recentDismissals: z.number().int().min(0),
    inactivityDays: z.number().int().min(0),
    hasInsightReady: z.boolean(),
  })
  .strict();

export const JourneyStateSchema = z
  .object({
    day: JourneyDaySchema,
    phase: JourneyPhaseSchema,
    emotionalState: EmotionalStateSchema,
    homeMessage: JourneyHomeMessageSchema,
    primaryCta: z.string().min(1).max(120),
    sessionSuggestion: JourneySessionSuggestionSchema,
    completionPayoff: z.string().min(1).max(300),
    nextActionCopy: z.string().min(1).max(200),
    returnReason: z.string().min(1).max(200),
    nudgePolicy: JourneyNudgePolicySchema,
    premiumTrigger: JourneyPremiumMomentSchema,
    momentType: JourneyMomentSchema,
  })
  .strict();

// ── Derived types ──────────────────────────────────────────────────────
export type JourneyDay = z.infer<typeof JourneyDaySchema>;
export type JourneyPhase = z.infer<typeof JourneyPhaseSchema>;
export type JourneyState = z.infer<typeof JourneyStateSchema>;
export type JourneyStateInput = z.infer<typeof JourneyStateInputSchema>;
export type JourneyHomeMessage = z.infer<typeof JourneyHomeMessageSchema>;
export type JourneySessionSuggestion = z.infer<
  typeof JourneySessionSuggestionSchema
>;
export type JourneyMoment = z.infer<typeof JourneyMomentSchema>;
export type JourneyReturnReason = z.infer<typeof JourneyReturnReasonSchema>;
export type JourneyPremiumMoment = z.infer<typeof JourneyPremiumMomentSchema>;
export type JourneyNudgePolicy = z.infer<typeof JourneyNudgePolicySchema>;
export type LaneCopyMap = z.infer<typeof LaneCopyMapSchema>;
export type RetentionJourneyCopy = z.infer<typeof RetentionJourneyCopySchema>;
