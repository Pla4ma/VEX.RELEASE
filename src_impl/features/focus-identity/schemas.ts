import { z } from 'zod';

export const MIN_FOCUS_SCORE = 300;
export const MAX_FOCUS_SCORE = 850;

export const FocusScoreBandLabelSchema = z.enum([
  'Legendary',
  'Elite',
  'Exceptional',
  'Strong',
  'Good',
  'Fair',
  'Building',
]);

export const FocusScoreFactorKeySchema = z.enum([
  'consistency',
  'streakStability',
  'sessionQuality',
  'intentionalDifficulty',
  'recency',
]);

const FocusScoreFactorSchema = (weightPercent: 35 | 25 | 20 | 10) =>
  z
    .object({
      weightPercent: z.literal(weightPercent),
      score: z.number().min(0).max(100),
      delta: z.number(),
      explanation: z.string().min(1),
    })
    .strict();

export const FocusScoreFactorsSchema = z
  .object({
    consistency: FocusScoreFactorSchema(35),
    streakStability: FocusScoreFactorSchema(25),
    sessionQuality: FocusScoreFactorSchema(20),
    intentionalDifficulty: FocusScoreFactorSchema(10),
    recency: FocusScoreFactorSchema(10),
  })
  .strict()
  .superRefine((value, ctx) => {
    const totalWeight = getFocusScoreFactorsWeightTotal(value);
    if (totalWeight !== 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Focus score factor weights must total 100. Received ${totalWeight}.`,
      });
    }
  });

export const FocusScoreHistoryPointSchema = z
  .object({
    timestamp: z.string().datetime(),
    score: z.number().min(MIN_FOCUS_SCORE).max(MAX_FOCUS_SCORE),
    delta: z.number(),
    reason: z.string().min(1),
  })
  .strict();

export const FocusScoreRecordSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    currentScore: z.number().min(MIN_FOCUS_SCORE).max(MAX_FOCUS_SCORE),
    previousScore: z.number().min(MIN_FOCUS_SCORE).max(MAX_FOCUS_SCORE),
    band: FocusScoreBandLabelSchema,
    factors: FocusScoreFactorsSchema,
    updatedAt: z.string().datetime(),
    createdAt: z.string().datetime(),
    lastChangeReason: z.string().min(1),
    topPositiveFactor: FocusScoreFactorKeySchema.optional(), // Add this
    topNegativeFactor: FocusScoreFactorKeySchema.optional(), // Add this
  })
  .strict();

export const FocusScoreUpdateInputSchema = z
  .object({
    userId: z.string().uuid(),
    previousScore: z.number().min(MIN_FOCUS_SCORE).max(MAX_FOCUS_SCORE),
    eventType: z.enum(['session:completed', 'session:abandoned', 'streak:updated', 'comeback:completed', 'recovery:session']),
    grade: z.enum(['S', 'A', 'B', 'C', 'D']).optional(),
    sessionMode: z.enum(['deep_work', 'recovery', 'starter', 'standard']).optional(),
    occurredAt: z.string().datetime(),
    signals: z
      .object({
        consistency: z.number().min(0).max(100),
        streakStability: z.number().min(0).max(100),
        sessionQuality: z.number().min(0).max(100),
        intentionalDifficulty: z.number().min(0).max(100),
        recency: z.number().min(0).max(100),
      })
      .strict(),
  })
  .strict();

export const FocusScoreUpdateResultSchema = z
  .object({
    userId: z.string().uuid(),
    previousScore: z.number().min(MIN_FOCUS_SCORE).max(MAX_FOCUS_SCORE),
    newScore: z.number().min(MIN_FOCUS_SCORE).max(MAX_FOCUS_SCORE),
    delta: z.number(),
    band: FocusScoreBandLabelSchema,
    factors: FocusScoreFactorsSchema,
    topPositiveFactor: FocusScoreFactorKeySchema,
    topNegativeFactor: FocusScoreFactorKeySchema,
    focusScoreImpactRecommendation: z.string().min(1),
    xpQualityMultiplier: z.number().min(0.5).max(2),
    userFacingReason: z.string().min(1),
    explanations: z.array(z.string().min(1)).min(1),
    historyPoint: FocusScoreHistoryPointSchema,
    updatedAt: z.string().datetime(),
  })
  .strict();

export const MonthlyFocusReportSummarySchema = z
  .object({
    userId: z.string().uuid(),
    month: z.string().regex(/^\d{4}-\d{2}$/),
    startScore: z.number().min(MIN_FOCUS_SCORE).max(MAX_FOCUS_SCORE),
    endScore: z.number().min(MIN_FOCUS_SCORE).max(MAX_FOCUS_SCORE),
    delta: z.number(),
    strongestPattern: z.string().min(1),
    weakestPattern: z.string().min(1),
    sessionsCompleted: z.number().int().nonnegative(),
    totalFocusedMinutes: z.number().int().nonnegative(),
    bestGrade: z.enum(['S', 'A', 'B', 'C', 'D']),
    nextTargetScore: z.number().min(MIN_FOCUS_SCORE).max(MAX_FOCUS_SCORE),
    factorAverages: z
      .object({
        consistency: z.number().min(0).max(100),
        streakStability: z.number().min(0).max(100),
        sessionQuality: z.number().min(0).max(100),
        intentionalDifficulty: z.number().min(0).max(100),
        recency: z.number().min(0).max(100),
      })
      .strict(),
    generatedAt: z.string().datetime(),
  })
  .strict();

export function getFocusScoreFactorsWeightTotal(factors: z.infer<typeof FocusScoreFactorsSchema>): number {
  return (
    factors.consistency.weightPercent +
    factors.streakStability.weightPercent +
    factors.sessionQuality.weightPercent +
    factors.intentionalDifficulty.weightPercent +
    factors.recency.weightPercent
  );
}
