import { z } from "zod";

export const HomePriorityTypeSchema = z.enum([
  "STREAK_CRITICAL",
  "COMPANION_PROMISE",
  "PROMISE_RECOVERY",
  "STREAK_AT_RISK",
  "RECOMMENDED_SESSION",
  "CHALLENGE_NEAR_DONE",
  "BOSS_ACTIVE",
  "DEFAULT_SESSION",
]);

export type HomePriorityType = z.infer<typeof HomePriorityTypeSchema>;

export const HomePriorityCTAActionSchema = z.enum([
  "OPEN_BOSS",
  "OPEN_CHALLENGES",
  "OPEN_SESSION_SETUP",
]);

export type HomePriorityCTAAction = z.infer<typeof HomePriorityCTAActionSchema>;

export const HomePriorityCTASchema = z
  .object({
    action: HomePriorityCTAActionSchema,
    params: z.record(z.unknown()).optional(),
    text: z.string(),
  })
  .strict();

export type HomePriorityCTA = z.infer<typeof HomePriorityCTASchema>;

export const HomePrimaryPrioritySchema = z
  .object({
    cta: HomePriorityCTASchema,
    reason: z.string(),
    type: HomePriorityTypeSchema,
    urgency: z.number().min(0).max(100),
  })
  .strict();

export type HomePrimaryPriority = z.infer<typeof HomePrimaryPrioritySchema>;

export const HomeStakesSchema = z
  .object({
    atRisk: z.string().optional(),
    potentialGain: z.string().optional(),
    what: z.string(),
  })
  .strict();

export type HomeStakes = z.infer<typeof HomeStakesSchema>;

export const HomeProgressSchema = z
  .object({
    dailyGoalMinutes: z.number(),
    streakDays: z.number(),
    todayMinutes: z.number(),
  })
  .strict();

export type HomeProgress = z.infer<typeof HomeProgressSchema>;

export const HomeSecondaryActionSchema = z
  .object({
    onPress: z.function(),
    title: z.string(),
    type: z.string(),
  })
  .strict();

export type HomeSecondaryAction = z.infer<typeof HomeSecondaryActionSchema>;

export const HomePrioritySchema = z
  .object({
    primary: HomePrimaryPrioritySchema,
    progress: HomeProgressSchema,
    secondary: z.array(HomeSecondaryActionSchema).max(3),
    stakes: HomeStakesSchema,
  })
  .strict();

export type HomePriority = z.infer<typeof HomePrioritySchema>;
