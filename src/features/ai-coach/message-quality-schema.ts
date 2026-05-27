import { z } from "zod";

export const MessageQualityElements = {
  OBSERVED_BEHAVIOR: "observed_behavior",
  SPECIFIC_RECOMMENDATION: "specific_recommendation",
  TIMING_SUGGESTION: "timing_suggestion",
  REASON: "reason",
  NEXT_ACTION: "next_action",
  CONFIDENCE_LEVEL: "confidence_level",
} as const;

export const MessageQualityElementValues = [
  "observed_behavior",
  "specific_recommendation",
  "timing_suggestion",
  "reason",
  "next_action",
  "confidence_level",
] as const;

export type MessageQualityElement =
  (typeof MessageQualityElementValues)[number];

export const MessageQualityAnalysisSchema = z.object({
  messageId: z.string().min(1),
  content: z.string().max(20000),
  category: z.enum([
    "STREAK_RISK",
    "SESSION_SUGGESTION",
    "MILESTONE_HYPE",
    "COMEBACK_SUPPORT",
    "POST_FAILURE",
    "PROGRESS_REMINDER",
    "DIFFICULTY_ADJUST",
    "CHALLENGE_PROMPT",
    "MOTIVATION_BOOST",
    "BREAK_SUGGESTION",
    "OVERLOAD_WARNING",
  ]),
  qualityElements: z.array(z.enum(MessageQualityElementValues)),
  isGeneric: z.boolean(),
  genericReasons: z.array(z.string()).max(5),
  passesQualityGate: z.boolean(),
  confidence: z.number().min(0).max(1),
  suggestedAction: z.enum(["approve", "reject", "improve"]).optional(),
});

export type MessageQualityAnalysis = z.infer<
  typeof MessageQualityAnalysisSchema
>;
