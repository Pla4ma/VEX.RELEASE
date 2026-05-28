import { FREE_FEATURE_STRS, PREMIUM_FEATURE_STRS } from "./tier-definitions";
import {
  PremiumPersonalizationInputSchema,
  PremiumPersonalizationOutputSchema,
  NO_FAKE_BILLING,
} from "./personalized-premium-schemas";
import type {
  PremiumPersonalizationInput,
  PremiumPersonalizationOutput,
} from "./personalized-premium-schemas";
import type { z } from "zod";

export {
  PremiumPersonalizationInputSchema,
  PremiumPersonalizationOutputSchema,
  NO_FAKE_BILLING,
};
export type { PremiumPersonalizationInput, PremiumPersonalizationOutput };

type InputParsed = z.infer<typeof PremiumPersonalizationInputSchema>;

function laneFor(input: InputParsed) {
  return input.laneProfile?.primaryLane ?? input.lane;
}

function buildFreeVsProMatrix(
  input: InputParsed,
): Array<{ free: string; pro: string }> {
  const lane = laneFor(input);
  if (
    lane === "student" ||
    (!lane &&
      (input.primaryGoal === "study" || input.primaryGoal === "learning"))
  ) {
    return [
      {
        free: "Basic study blocks",
        pro: "Deeper imports, deadline intelligence, and weekly study plan",
      },
      {
        free: "Basic review prompts",
        pro: "Advanced review queue with weak-topic tracking",
      },
      {
        free: "Simple progress",
        pro: "Weekly study risk and next-block recommendations",
      },
      {
        free: "Basic memory",
        pro: "Longer study memory with editable sources",
      },
      {
        free: "Rescue mode",
        pro: "Smarter recovery planning around deadlines",
      },
    ];
  }
  if (lane === "deep_creative") {
    return [
      {
        free: "One active project thread",
        pro: "More project threads and deeper continuity memory",
      },
      {
        free: "Basic next move",
        pro: "Flow reports and project recovery planning",
      },
      {
        free: "Simple completion memory",
        pro: "Longer handoff memory across sessions",
      },
      { free: "Rescue mode", pro: "Creative re-entry experiments" },
      { free: "Basic progress", pro: "Weekly project rhythm intelligence" },
    ];
  }
  if (lane === "minimal_normal") {
    return [
      {
        free: "Clean session loop",
        pro: "Calendar intelligence and quiet weekly planning",
      },
      {
        free: "Basic Today Strip",
        pro: "Advanced quiet automation and memory console",
      },
      {
        free: "Basic progress",
        pro: "Weekly clean planning with fewer surfaces",
      },
      { free: "Rescue mode", pro: "Personalized recovery timing" },
      {
        free: "Basic memory",
        pro: "Editable long memory with source and expiry",
      },
    ];
  }
  return [
    {
      free: "Basic run progress",
      pro: "Deeper run history and personal boss arcs",
    },
    {
      free: "Basic modifiers",
      pro: "Advanced behavior modifiers and run recap archive",
    },
    { free: "Basic progress", pro: "Weekly mastery intelligence" },
    { free: "Rescue mode", pro: "Recovery strategy for interrupted runs" },
    {
      free: "Basic memory",
      pro: "Longer blocker memory with source and confidence",
    },
  ];
}

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

function getPersonalizedHeadline(input: InputParsed): string {
  const lane = laneFor(input);
  if (!input.billingConfigured) return "Premium is not available yet";
  if (lane === "student")
    return "Build the study system around your real deadlines";
  if (lane === "game_like") return "Turn the run into durable mastery";
  if (lane === "deep_creative")
    return "Keep project context alive between sessions";
  if (lane === "minimal_normal") return "Make the quiet system smarter";
  if (input.hasTriedAdvancedStudy)
    return "Your study system is ready to go deeper";
  if (input.hasTriedWeeklyReport) return "See the full picture of your rhythm";
  if (input.motivationStyle === "calm")
    return "Let VEX learn what works for you";
  if (input.motivationStyle === "intense")
    return "Turn your momentum into a complete system";
  if (input.motivationStyle === "study_focused")
    return "Turn every study block into deep progress";
  return "Turn your sessions into a full execution system";
}

function getPersonalizedBody(input: InputParsed): string {
  const lane = laneFor(input);
  if (!input.billingConfigured) {
    return "Premium appears when live billing and real premium value are ready. Keep building your rhythm.";
  }
  if (lane === "game_like") {
    return "Premium expands run history, personal boss arcs, advanced modifiers, and recap archives without coins, gems, shop power, or paid recovery.";
  }
  if (lane === "deep_creative") {
    return "Premium keeps more project threads alive with deeper continuity memory, flow reports, and recovery planning when context goes stale.";
  }
  if (lane === "minimal_normal") {
    return "Premium adds calendar intelligence, editable memory, weekly clean planning, and advanced quiet automation without adding noise.";
  }
  if (input.hasTriedAdvancedStudy) {
    return "VEX Pro builds from your material with deeper review loops, deadline intelligence, and smart next actions. Longer memory tracks best times and comeback patterns.";
  }
  if (input.primaryGoal === "study" || input.primaryGoal === "learning") {
    return "Your study rhythm is taking shape. VEX Pro adds content generation, review scheduling, smart quizzes, and deadline-aware weekly planning.";
  }
  if (input.motivationStyle === "calm") {
    return "VEX Pro quietly optimizes around your patterns, remembers when you focus best, and keeps the system simple but smarter.";
  }
  return "VEX Pro turns your sessions into a full execution system. Longer memory, Study OS depth, weekly intelligence, and recovery planning work from real behavior.";
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
