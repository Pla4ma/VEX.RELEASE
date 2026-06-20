import { z } from 'zod';
import { SessionModeSchema } from '../../session/modes';
import { SessionCompletionGradeSchema } from './schemas';

export const SessionGradingInputSchema = z
  .object({
    backgroundTimeSeconds: z.number().int().min(0).default(0),
    completedDurationSeconds: z.number().int().min(0),
    effectiveFocusedSeconds: z.number().int().min(0),
    interruptionCount: z.number().int().min(0),
    isAbandoned: z.boolean().default(false),
    isRecoverySession: z.boolean().default(false),
    mode: SessionModeSchema,
    pauseCount: z.number().int().min(0),
    strictMode: z.boolean(),
    targetDurationSeconds: z.number().int().min(1),
  })
  .strict();
export type SessionGradingInput = z.infer<typeof SessionGradingInputSchema>;

export const SessionGradeFactorSchema = z
  .object({
    contribution: z.number(),
    id: z.enum([
      'completionRatio',
      'effectiveFocusTime',
      'pauseCount',
      'interruptionCount',
      'strictMode',
      'sessionMode',
      'backgroundTime',
      'recoverySession',
    ]),
    label: z.string(),
    reason: z.string(),
    score: z.number().min(0).max(100),
    weight: z.number().min(0).max(100),
  })
  .strict();
export type SessionGradeFactor = z.infer<typeof SessionGradeFactorSchema>;

export const CompletedSessionGradingResultSchema = z
  .object({
    factorBreakdown: z.array(SessionGradeFactorSchema),
    focusScoreImpactRecommendation: z.number().int(),
    grade: SessionCompletionGradeSchema,
    gradeLabel: z.string(),
    gradeScore: z.number().min(0).max(100),
    kind: z.literal('completed'),
    qualityScore: z.number().min(0).max(100),
    userFacingReason: z.string(),
    xpQualityMultiplier: z.number().min(0.1).max(3),
  })
  .strict();

export const AbandonedSessionGradingResultSchema = z
  .object({
    abandonmentReason: z.string(),
    focusScoreImpactRecommendation: z.number().int(),
    kind: z.literal('abandoned'),
    userFacingReason: z.string(),
    xpQualityMultiplier: z.number().min(0.1).max(3),
  })
  .strict();

export const SessionGradingResultSchema = z.union([
  CompletedSessionGradingResultSchema,
  AbandonedSessionGradingResultSchema,
]);
export type SessionGradingResult = z.infer<typeof SessionGradingResultSchema>;
