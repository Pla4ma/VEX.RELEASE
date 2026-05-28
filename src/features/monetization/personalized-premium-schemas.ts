import { z } from "zod";
import { LaneProfileSchema } from "../lane-engine/schemas";

export const PremiumPersonalizationInputSchema = z
  .object({
    billingConfigured: z.boolean(),
    completedSessions: z.number().int().min(0),
    lane: z
      .enum(["student", "game_like", "deep_creative", "minimal_normal"])
      .optional(),
    laneProfile: LaneProfileSchema.optional(),
    primaryGoal: z.enum([
      "focus",
      "study",
      "work",
      "creative",
      "personal",
      "learning",
    ]),
    motivationStyle: z.enum([
      "calm",
      "friendly",
      "coach_led",
      "game_like",
      "intense",
      "study_focused",
    ]),
    studyUsageRatio: z.number().min(0).max(1),
    hasTriedAdvancedStudy: z.boolean(),
    hasTriedWeeklyReport: z.boolean(),
    hasTriedVisualIdentity: z.boolean(),
    currentStreakDays: z.number().int().min(0),
    daysSinceOnboarding: z.number().int().min(0),
    paywallDismissals: z.number().int().min(0).default(0),
  })
  .strict();

export const PremiumPersonalizationOutputSchema = z.object({
  canShowPaywall: z.boolean(),
  triggerMoment: z.enum([
    "hidden_billing_unavailable",
    "none",
    "session_value",
    "advanced_study",
    "weekly_intelligence",
    "custom_identity",
    "deep_coach_memory",
    "deep_work_plan_personalized",
  ]),
  freeVsProMatrix: z.array(
    z.object({ free: z.string().min(1), pro: z.string().min(1) }).strict(),
  ),
  premiumHeadline: z.string().min(1),
  premiumBody: z.string().min(1),
  freeFeatures: z.array(z.string().min(1)),
  premiumFeatures: z.array(z.string().min(1)),
  noFakeBillingChecklist: z.array(z.string().min(1)),
});

export type PremiumPersonalizationInput = z.input<
  typeof PremiumPersonalizationInputSchema
>;
export type PremiumPersonalizationOutput = z.infer<
  typeof PremiumPersonalizationOutputSchema
>;

export const NO_FAKE_BILLING = [
  "Do not render purchasable plans without RevenueCat packages.",
  "Do not mark premium active without an active entitlement.",
  "Do not paywall the basic focus loop.",
  "Do not sell streak saves, coins, gems, shop power, or paid failure recovery.",
  "Show unavailable or coming-soon state instead of fake premium.",
];
