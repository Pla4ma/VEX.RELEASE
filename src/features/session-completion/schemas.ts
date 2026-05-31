import { z } from 'zod';
import { SessionModeSchema } from '../../session/modes';
import { SessionSummarySchema } from '../../session/types';

export const SessionCompletionGradeSchema = z.enum(['S', 'A', 'B', 'C', 'D']);
export type SessionCompletionGrade = z.infer<
  typeof SessionCompletionGradeSchema
>;

export const CompletionSyncStatusSchema = z.enum([
  'synced',
  'pending_sync',
  'failed_sync',
]);
export type CompletionSyncStatus = z.infer<typeof CompletionSyncStatusSchema>;

export const CompletionStreakResultSchema = z
  .object({
    action: z.enum(['extended', 'maintained', 'broken', 'saved_by_insurance']),
    newDays: z.number().int().min(0),
    previousDays: z.number().int().min(0),
  })
  .strict();
export type CompletionStreakResult = z.infer<
  typeof CompletionStreakResultSchema
>;

export const CompletionDailyMissionResultSchema = z
  .object({
    missionId: z.string().nullable(),
    progressDelta: z.number(),
    status: z.enum([
      'completed',
      'progressed',
      'unchanged',
      'pending_sync',
      'failed',
    ]),
  })
  .strict();
export type CompletionDailyMissionResult = z.infer<
  typeof CompletionDailyMissionResultSchema
>;

export const CompletionLedgerSchema = z
  .object({
    ledgerId: z.string().uuid(),
    idempotencyKey: z.string().min(1),
    sessionId: z.string().uuid(),
    userId: z.string().min(1),
    mode: z.union([SessionModeSchema, z.literal('UNKNOWN')]),
    targetDurationSeconds: z.number().int().min(0),
    completedDurationSeconds: z.number().int().min(0),
    effectiveFocusedSeconds: z.number().int().min(0),
    pauseCount: z.number().int().min(0),
    interruptionCount: z.number().int().min(0),
    strictMode: z.boolean(),
    startedAt: z.number().int().nonnegative(),
    completedAt: z.number().int().nonnegative(),
    timezone: z.string().min(1),
    grade: SessionCompletionGradeSchema,
    gradeScore: z.number().min(0).max(100),
    qualityScore: z.number().min(0).max(100),
    focusScoreDelta: z.number().int(),
    xpDelta: z.number().int(),
    streakResult: CompletionStreakResultSchema,
    companionReactionId: z.string().nullable(),
    rewardIds: z.array(z.string()),
    dailyMissionResult: CompletionDailyMissionResultSchema,
    offlineSyncStatus: CompletionSyncStatusSchema,
    degradedSystems: z.array(z.string()).default([]),
    createdAt: z.number().int().nonnegative(),
  })
  .strict();
export type CompletionLedger = z.infer<typeof CompletionLedgerSchema>;

export const SessionCompletionNavigationParamsSchema = z
  .object({
    sessionId: z.string().uuid(),
    summary: SessionSummarySchema,
  })
  .strict();
export type SessionCompletionNavigationParams = z.infer<
  typeof SessionCompletionNavigationParamsSchema
>;

export const SessionCompletionHeroSchema = z
  .object({
    body: z.string(),
    eyebrow: z.string(),
    title: z.string(),
  })
  .strict();
export type SessionCompletionHero = z.infer<typeof SessionCompletionHeroSchema>;

export const SessionCompletionReturnPlanSchema = z
  .object({
    highlightMessage: z.string(),
    highlightTitle: z.string(),
    highlightTone: z.enum(['celebration', 'info', 'warning']),
    homeCtaLabel: z.string(),
    modeReturnHook: z.string().optional(),
    nextSessionLabel: z.string(),
    returnReasonBody: z.string(),
    returnReasonTitle: z.string(),
  })
  .strict();
export type SessionCompletionReturnPlan = z.infer<
  typeof SessionCompletionReturnPlanSchema
>;

export const PostSessionNextActionSchema = z
  .object({
    ctaLabel: z.string().min(1),
    id: z.string().min(1),
    reason: z.string().min(1),
    routeParams: z
      .object({
        presetMode: z.enum([
          'LIGHT_FOCUS',
          'DEEP_WORK',
          'SPRINT',
          'CREATIVE',
          'STUDY',
        ]),
        recommendationId: z.string().min(1),
        suggestedDifficulty: z.enum(['EASY', 'NORMAL', 'CHALLENGING', 'PUSH']),
        suggestedDurationSeconds: z.number().int().min(60),
      })
      .strict(),
  })
  .strict();
export type PostSessionNextAction = z.infer<typeof PostSessionNextActionSchema>;

export const CompletionReflectionInputSchema = z
  .object({
    bossIntensity: z.enum(['hidden', 'visible', 'high']).nullable().optional(),
    firstWeekStage: z.string().nullable().optional(),
    motivationStyle: z.string().nullable().optional(),
    primaryGoal: z.string().nullable().optional(),
    progressLabel: z.string().nullable().optional(),
    sessionSummary: SessionSummarySchema,
    streakDays: z.number().int().min(0).nullable().optional(),
    studyTarget: z.string().nullable().optional(),
  })
  .strict();
export type CompletionReflectionInput = z.infer<
  typeof CompletionReflectionInputSchema
>;

export const CompletionReflectionSchema = z
  .object({
    adaptivePayoff: z.string().nullable(),
    nextAction: z.string().min(1),
    reflection: z.string().min(1),
    tone: z.enum(['calm', 'coach', 'study', 'intense']),
  })
  .strict();
export type CompletionReflection = z.infer<typeof CompletionReflectionSchema>;

export {
  CompletionMemoryCandidateSchema,
  CompletionPersonalizationInputSchema,
  CompletionPersonalizationSchema,
  CompletionUnlockDecisionSchema,
} from './completion-personalization-schemas';
export type {
  CompletionMemoryCandidate,
  CompletionPersonalization,
  CompletionPersonalizationInput,
  CompletionUnlockDecision,
} from './completion-personalization-schemas';
export {
  CompletionPersonalizationResultSchema,
  CompletionProgressProofSchema,
  CompletionUserFacingSummarySchema,
} from './completion-personalization-result-schemas';
export type {
  CompletionPersonalizationResult,
  CompletionProgressProof,
  CompletionUserFacingSummary,
} from './completion-personalization-result-schemas';
