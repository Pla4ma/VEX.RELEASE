import { z } from 'zod';
import { AIBaseResponseSchema } from './ai-base-schemas';

// Response schemas — each requestType has its own response schema for the discriminated union.

export const GenerateCoachMessageResponseSchema = AIBaseResponseSchema.extend({
  requestType: z.literal('GENERATE_COACH_MESSAGE'),
  content: z.string().max(1000),
  structuredData: z
    .object({
      message: z.string(),
      emoji: z.string().optional(),
      urgency: z.enum(['low', 'medium', 'high']).optional(),
      suggestedAction: z.string().optional(),
    })
    .optional(),
});
export type GenerateCoachMessageResponse = z.infer<
  typeof GenerateCoachMessageResponseSchema
>;

export const GenerateSessionSummaryResponseSchema = AIBaseResponseSchema.extend(
  {
    requestType: z.literal('GENERATE_SESSION_SUMMARY'),
    content: z.string().max(1500),
    structuredData: z.object({
      headline: z.string(),
      highlights: z.array(z.string()),
      encouragement: z.string(),
      nextGoal: z.string().optional(),
    }),
  },
);
export type GenerateSessionSummaryResponse = z.infer<
  typeof GenerateSessionSummaryResponseSchema
>;

export const GenerateComebackPromptResponseSchema = AIBaseResponseSchema.extend(
  {
    requestType: z.literal('GENERATE_COMEBACK_PROMPT'),
    content: z.string().max(800),
    structuredData: z.object({
      message: z.string(),
      progressPercent: z.number(),
      encouragement: z.string(),
    }),
  },
);
export type GenerateComebackPromptResponse = z.infer<
  typeof GenerateComebackPromptResponseSchema
>;

export const GenerateStreakRiskNudgeResponseSchema =
  AIBaseResponseSchema.extend({
    requestType: z.literal('GENERATE_STREAK_RISK_NUDGE'),
    content: z.string().max(600),
    structuredData: z.object({
      urgencyMessage: z.string(),
      streakCount: z.number(),
      suggestedDuration: z.number(),
      emoji: z.string(),
    }),
  });
export type GenerateStreakRiskNudgeResponse = z.infer<
  typeof GenerateStreakRiskNudgeResponseSchema
>;

export const GenerateWeeklyReflectionResponseSchema =
  AIBaseResponseSchema.extend({
    requestType: z.literal('GENERATE_WEEKLY_REFLECTION'),
    content: z.string().max(2000),
    structuredData: z.object({
      headline: z.string(),
      wins: z.array(z.string()),
      reflection: z.string(),
      nextWeekGoal: z.string(),
      encouragement: z.string(),
    }),
  });
export type GenerateWeeklyReflectionResponse = z.infer<
  typeof GenerateWeeklyReflectionResponseSchema
>;
