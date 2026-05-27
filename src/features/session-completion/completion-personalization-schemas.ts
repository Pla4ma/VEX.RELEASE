import { z } from "zod";

import { LaneSchema } from "../lane-engine/schemas";
import { SessionSummarySchema } from "../../session/types";

export const CompletionMemoryCandidateSchema = z
  .object({
    confidence: z.number().min(0).max(1),
    id: z.string().min(1),
    source: z.enum(["session_completion", "reflection", "lane_signal"]),
    text: z.string().min(1),
  })
  .strict();

export const CompletionUnlockDecisionSchema = z
  .object({
    hidden: z.boolean(),
    key: z.enum([
      "study_os",
      "run_board",
      "project_thread",
      "today_strip",
      "weekly_intelligence",
    ]),
    reason: z.string().min(1),
    status: z.enum(["available", "teased", "blocked"]),
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

export type CompletionMemoryCandidate = z.infer<
  typeof CompletionMemoryCandidateSchema
>;
export type CompletionPersonalization = z.infer<
  typeof CompletionPersonalizationSchema
>;
export type CompletionPersonalizationInput = z.infer<
  typeof CompletionPersonalizationInputSchema
>;
export type CompletionUnlockDecision = z.infer<
  typeof CompletionUnlockDecisionSchema
>;
