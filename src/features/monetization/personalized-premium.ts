import type { z } from "zod";
import { FREE_FEATURE_STRS, PREMIUM_FEATURE_STRS } from "./tier-definitions";
import {
  PremiumPersonalizationInputSchema,
  PremiumPersonalizationOutputSchema,
  NO_FAKE_BILLING,
} from "./personalized-premium-schemas";
import type {
  PremiumPersonalizationInput,
  PremiumPersonalizationOutput,
  SessionEvidence,
} from "./personalized-premium-schemas";
import { buildFreeVsProMatrix } from "./personalized-premium-matrix";
import {
  getPersonalizedHeadline,
  getPersonalizedBody,
} from "./personalized-premium-copy";

export {
  PremiumPersonalizationInputSchema,
  PremiumPersonalizationOutputSchema,
  NO_FAKE_BILLING,
};
export type {
  PremiumPersonalizationInput,
  PremiumPersonalizationOutput,
  SessionEvidence,
};

type InputParsed = z.infer<typeof PremiumPersonalizationInputSchema>;

function resolveTriggerMoment(
  input: InputParsed,
): PremiumPersonalizationOutput["triggerMoment"] {
  if (!input.billingConfigured) return "hidden_billing_unavailable";
  if (
    input.completedSessions === 0 ||
    input.daysSinceOnboarding === 0 ||
    input.paywallDismissals >= 2
  )
    return "none";
  if (input.hasTriedAdvancedStudy) return "advanced_study";
  if (input.hasTriedWeeklyReport) return "weekly_intelligence";
  if (input.hasTriedVisualIdentity) return "custom_identity";
  if (input.completedSessions < 40) return "none";
  if (input.currentStreakDays >= 10 && input.studyUsageRatio >= 0.3)
    return "deep_coach_memory";
  if (input.studyUsageRatio >= 0.5) return "deep_work_plan_personalized";
  return "session_value";
}

export function resolvePersonalizedPremium(
  rawInput: PremiumPersonalizationInput,
): PremiumPersonalizationOutput {
  const input = PremiumPersonalizationInputSchema.parse(rawInput);
  const triggerMoment = resolveTriggerMoment(input);
  const canShowPaywall =
    triggerMoment !== "hidden_billing_unavailable" && triggerMoment !== "none";
  return PremiumPersonalizationOutputSchema.parse({
    canShowPaywall,
    triggerMoment,
    freeVsProMatrix: buildFreeVsProMatrix(input),
    premiumHeadline: getPersonalizedHeadline(input),
    premiumBody: getPersonalizedBody(input),
    freeFeatures: FREE_FEATURE_STRS,
    premiumFeatures: PREMIUM_FEATURE_STRS,
    noFakeBillingChecklist: NO_FAKE_BILLING,
  });
}
