import { z } from 'zod';
import { SessionSummarySchema } from '../../session/types/schemas';
import { LaneSchema } from '../lane-engine/schemas';

export const CompletionMemoryCandidateSchema = z
  .object({
    confidence: z.number().min(0).max(1).default(0.5),
    key: z.string().min(1),
    source: z.string().optional(),
    text: z.string().min(1),
  })
  .passthrough();

export const CompletionUnlockDecisionSchema = z
  .object({
    hidden: z.boolean().optional(),
    isUnlocked: z.boolean().default(false),
    key: z.string().min(1),
    reason: z.string().min(1),
    status: z.string().optional(),
  })
  .passthrough();

export const CompletionPersonalizationInputSchema = z
  .object({
    deletedMemoryIds: z.array(z.string()).default([]),
    hiddenFeatureKeys: z.array(z.string()).default([]),
    isComeback: z.boolean().default(false),
    lane: LaneSchema,
    reflectionAnswer: z.string().nullable().default(null),
    summary: SessionSummarySchema,
  })
  .strict();

export const CompletionPersonalizationSchema = z
  .object({
    lane: LaneSchema,
    memoryCandidates: z.array(CompletionMemoryCandidateSchema),
    reflectionQuestion: z.string().min(1),
    unlockDecision: CompletionUnlockDecisionSchema,
  })
  .passthrough();

export type CompletionMemoryCandidate = z.infer<
  typeof CompletionMemoryCandidateSchema
>;
export type CompletionUnlockDecision = z.infer<
  typeof CompletionUnlockDecisionSchema
>;
export type CompletionPersonalizationInput = z.infer<
  typeof CompletionPersonalizationInputSchema
>;
export type CompletionPersonalization = z.infer<
  typeof CompletionPersonalizationSchema
>;
