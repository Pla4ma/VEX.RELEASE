import { z } from "zod";
import { RecommendationEvidenceSchema } from "../focus-memory/schemas";

export const CoachRecommendationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum([
    "session",
    "duration",
    "difficulty",
    "time",
    "social",
    "break",
  ]),
  title: z.string(),
  description: z.string(),
  reasoning: z.string(),
  confidence: z.number().min(0).max(1),
  evidence: RecommendationEvidenceSchema.optional(),
  priority: z.enum(["critical", "high", "medium", "low"]),
  actionType: z.enum([
    "start_session",
    "adjust_duration",
    "join_squad",
    "take_break",
    "view_progress",
  ]),
  suggestedDuration: z.number().optional(),
  suggestedDifficulty: z
    .enum(["easy", "normal", "challenging", "push"])
    .optional(),
  suggestedTime: z.number().optional(),
  expiresAt: z.number(),
});

export type CoachRecommendation = z.infer<typeof CoachRecommendationSchema>;
