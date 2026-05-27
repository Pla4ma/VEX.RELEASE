import { z } from "zod";

import { LaneProfileSchema } from "../lane-engine/schemas";
import {
  CompletionMemoryCandidateSchema,
  CompletionUnlockDecisionSchema,
} from "./completion-personalization-schemas";

export const CompletionProgressProofSchema = z
  .object({
    xpDelta: z.number().int(),
    grade: z.string().min(1),
    streakDays: z.number().int().min(0),
    streakAction: z.enum([
      "extended",
      "maintained",
      "broken",
      "saved_by_insurance",
    ]),
    focusScoreDelta: z.number().int(),
    effectiveMinutes: z.number().int().min(0),
    completionPercentage: z.number().min(0).max(100),
    interruptions: z.number().int().min(0),
    isPersonalBest: z.boolean(),
  })
  .strict();
export type CompletionProgressProof = z.infer<
  typeof CompletionProgressProofSchema
>;

export const CompletionUserFacingSummarySchema = z
  .object({
    displayTitle: z.string().min(1),
    displayBody: z.string().min(1),
    nextActionLabel: z.string().min(1),
    tone: z.enum(["celebration", "info", "warning"]),
  })
  .strict();
export type CompletionUserFacingSummary = z.infer<
  typeof CompletionUserFacingSummarySchema
>;

const NextActionRouteParamsSchema = z
  .object({
    presetMode: z.enum([
      "LIGHT_FOCUS",
      "DEEP_WORK",
      "SPRINT",
      "CREATIVE",
      "STUDY",
    ]),
    recommendationId: z.string().min(1),
    suggestedDifficulty: z.enum(["EASY", "NORMAL", "CHALLENGING", "PUSH"]),
    suggestedDurationSeconds: z.number().int().min(60),
  })
  .strict();

const NextActionSchema = z
  .object({
    ctaLabel: z.string().min(1),
    id: z.string().min(1),
    reason: z.string().min(1),
    routeParams: NextActionRouteParamsSchema,
  })
  .strict();

export const CompletionPersonalizationResultSchema = z
  .object({
    laneProfile: LaneProfileSchema,
    progressProof: CompletionProgressProofSchema,
    reflectionQuestion: z.string().min(1),
    memoryCandidates: z.array(CompletionMemoryCandidateSchema),
    unlockDecision: CompletionUnlockDecisionSchema,
    nextAction: NextActionSchema.nullable(),
    userFacingSummary: CompletionUserFacingSummarySchema,
  })
  .strict();
export type CompletionPersonalizationResult = z.infer<
  typeof CompletionPersonalizationResultSchema
>;
