import { z } from 'zod';
import { LaneSchema } from '../lane-engine/schemas';
import { SessionModeSchema } from '../../session/modes';
import { SessionSummarySchema } from '../../session/types';

export const SessionCompletionGradeSchema = z.enum(['S', 'A', 'B', 'C', 'D']);
export type SessionCompletionGrade = z.infer<typeof SessionCompletionGradeSchema>;

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
export type CompletionStreakResult = z.infer<typeof CompletionStreakResultSchema>;

export const CompletionDailyMissionResultSchema = z
  .object({
    missionId: z.string().nullable(),
    progressDelta: z.number(),
    status: z.enum(['completed', 'progressed', 'unchanged', 'pending_sync', 'failed']),
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
        presetMode: z.enum(['LIGHT_FOCUS', 'DEEP_WORK', 'SPRINT', 'CREATIVE', 'STUDY']),
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

export const CompletionMemoryCandidateSchema = z
  .object({
    confidence: z.number().min(0).max(1),
    id: z.string().min(1),
    source: z.enum(['session_completion', 'reflection', 'lane_signal']),
    text: z.string().min(1),
  })
  .strict();

export const CompletionUnlockDecisionSchema = z
  .object({
    hidden: z.boolean(),
    key: z.enum(['study_os', 'run_board', 'project_thread', 'today_strip', 'weekly_intelligence']),
    reason: z.string().min(1),
    status: z.enum(['available', 'teased', 'blocked']),
  })
  .strict();

export const CompletionPersonalizationInputSchema = z
  .object({
    deletedMemoryIds: z.array(z.string().min(1)).default([]),
    hiddenFeatureKeys: z.array(z.string().min(1)).default([]),
    isComeback: z.boolean().optional().default(false),
    lane: LaneSchema,
    reflectionAnswer: z.string().nullable().optional().default(null),
    summary: SessionSummarySchema,
  })
  .strict();

export const CompletionPersonalizationSchema = z
  .object({
    displayBody: z.string().min(1),
    displayTitle: z.string().min(1),
    lane: LaneSchema,
    memoryCandidates: z.array(CompletionMemoryCandidateSchema),
    nextActionLabel: z.string().min(1),
    reflectionQuestion: z.string().min(1),
    unlockDecision: CompletionUnlockDecisionSchema,
  })
  .strict();

export type CompletionMemoryCandidate = z.infer<typeof CompletionMemoryCandidateSchema>;
export type CompletionPersonalization = z.infer<typeof CompletionPersonalizationSchema>;
export type CompletionPersonalizationInput = z.infer<typeof CompletionPersonalizationInputSchema>;
export type CompletionUnlockDecision = z.infer<typeof CompletionUnlockDecisionSchema>;

export {
  CompletionPersonalizationResultSchema,
  CompletionProgressProofSchema,
  CompletionUserFacingSummarySchema,
} from "./completion-personalization-result-schemas";
export type {
  CompletionPersonalizationResult,
  CompletionProgressProof,
  CompletionUserFacingSummary,
} from "./completion-personalization-result-schemas";
