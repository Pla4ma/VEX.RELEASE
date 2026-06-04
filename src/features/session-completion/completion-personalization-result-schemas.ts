import { z } from 'zod';

export const CompletionProgressProofSchema = z
  .object({
    headline: z.string().min(1),
    items: z.array(z.string()).default([]),
  })
  .passthrough();

export const CompletionUserFacingSummarySchema = z
  .object({
    body: z.string().min(1),
    title: z.string().min(1),
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
