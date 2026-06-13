import { z } from 'zod';

export const CompletionProgressProofSchema = z
  .object({
    headline: z.string().min(1),
    items: z.array(z.string()).default([]),
    xpDelta: z.number().optional(),
    grade: z.string().optional(),
    streakDays: z.number().optional(),
    streakAction: z.string().optional(),
    focusScoreDelta: z.number().optional(),
    isPersonalBest: z.boolean().optional(),
    effectiveMinutes: z.number().optional(),
    completionPercentage: z.number().optional(),
  })
  .passthrough();

export const CompletionUserFacingSummarySchema = z
  .object({
    body: z.string().min(1),
    displayTitle: z.string().min(1).optional(),
    title: z.string().min(1),
    tone: z.enum(['calm', 'coach', 'study', 'intense']),
  })
  .passthrough();

export const CompletionPersonalizationResultSchema = z
  .object({
    completionLearning: z.unknown().optional(),
    laneProfile: z.unknown().optional(),
    memoryCandidates: z.array(z.unknown()).default([]),
    nextAction: z.unknown().nullable(),
    progressProof: CompletionProgressProofSchema,
    reflectionQuestion: z.string().min(1),
    unlockDecision: z.unknown().nullable(),
    userFacingSummary: CompletionUserFacingSummarySchema,
  })
  .passthrough();

export type CompletionProgressProof = z.infer<
  typeof CompletionProgressProofSchema
>;
export type CompletionUserFacingSummary = z.infer<
  typeof CompletionUserFacingSummarySchema
>;
export type CompletionPersonalizationResult = z.infer<
  typeof CompletionPersonalizationResultSchema
>;
