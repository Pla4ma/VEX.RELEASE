import { FREE_FEATURE_STRS, PREMIUM_FEATURE_STRS } from "./tier-definitions";
import {
  PremiumPersonalizationInputSchema,
  PremiumPersonalizationOutputSchema,
  NO_FAKE_BILLING,
  type SessionEvidence,
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
export type {
  PremiumPersonalizationInput,
  PremiumPersonalizationOutput,
  SessionEvidence,
};

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
    return "Your Study Intelligence gets deeper — reviews, deadlines, smarter blocks";
  if (lane === "game_like") return "Your Run Intelligence gets sharper — bosses, modifiers, recaps";
  if (lane === "deep_creative")
    return "Your Project Memory keeps more context — flow, next moves, continuity";
  if (lane === "minimal_normal") return "Your Focus Intelligence works quietly — patterns, windows, planning";
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

function formatWindow(window: string): string {
  const lower = window.toLowerCase();
  if (lower.includes("morning")) return "mornings";
  if (lower.includes("afternoon")) return "afternoons";
  if (lower.includes("evening")) return "evenings";
  if (lower.includes("night")) return "late nights";
  return window + "s";
}

function formatDay(day: string): string {
  const lower = day.toLowerCase();
  if (lower.includes("weekday")) return "weekdays";
  if (lower.includes("weekend")) return "weekends";
  return day + "s";
}

function buildEvidenceClause(
  evidence: SessionEvidence,
  lane: ReturnType<typeof laneFor>,
): string | null {
  const count = evidence.completedSessions;
  const hours = evidence.focusHours;
  const rate = evidence.consistencyRate;

  if (count < 5 || hours < 1) return null;

  // Trust: only build evidence if enough sessions to be meaningful
  if (lane === "student" || lane === "game_like") {
    if (evidence.bestWindow && evidence.bestDay) {
      return `Based on ${count} sessions and ${Math.round(hours)}h of work, your strongest rhythm is ${formatWindow(evidence.bestWindow)} on ${formatDay(evidence.bestDay)}.`;
    }
    if (evidence.bestWindow) {
      return `Across ${count} sessions and ${Math.round(hours)}h of focus, ${formatWindow(evidence.bestWindow)} is when you are most consistent.`;
    }
  }

  if (lane === "deep_creative") {
    if (evidence.completedSessionsInLane && evidence.completedSessionsInLane >= 3) {
      return `Over ${count} total sessions, VEX has mapped ${evidence.completedSessionsInLane} project sessions at ${Math.round(rate * 100)}% completion rate.`;
    }
    return `Across ${count} sessions, VEX is starting to learn when your flow windows open.`;
  }

  if (lane === "minimal_normal") {
    if (evidence.bestWindow) {
      return `Your ${Math.round(hours)}h of focus shows ${formatWindow(evidence.bestWindow)} is your quietest window.`;
    }
    if (evidence.longestStreak && evidence.longestStreak >= 3) {
      return `Your longest streak of ${evidence.longestStreak} days shows real consistency. Premium helps this quiet system stay on track.`;
    }
  }

  return `Across ${count} sessions and ${Math.round(hours)}h of focus, your rhythm is forming. Premium builds on this.`;
}

function getPersonalizedBody(input: InputParsed): string {
  const lane = laneFor(input);
  const evidence = input.sessionEvidence;

  if (!input.billingConfigured) {
    return "Premium appears when live billing and real premium value are ready. Keep building your rhythm.";
  }

  if (lane === "student") {
    if (evidence) {
      const clause = buildEvidenceClause(evidence, lane);
      if (clause) {
        return `${clause} Premium adds review plans, weak-topic tracking, and deadline-aware study blocks — all built from your material.`;
      }
    }
    return "VEX Premium builds from your material with deeper review loops, deadline intelligence, and smart next actions. Your memory gets smarter from real sessions.";
  }

  if (lane === "game_like") {
    if (evidence) {
      const clause = buildEvidenceClause(evidence, lane);
      if (clause) {
        return `${clause} Premium adds personal boss depth, advanced modifiers, and weekly run recaps — without coins, gems, or shop power.`;
      }
    }
    return "Premium expands run history, personal boss arcs, advanced modifiers, and recap archives without coins, gems, shop power, or paid recovery.";
  }

  if (lane === "deep_creative") {
    if (evidence) {
      const clause = buildEvidenceClause(evidence, lane);
      if (clause) {
        return `${clause} Premium adds longer project memory, context restoration, and creative continuity support.`;
      }
    }
    return "Premium keeps more project threads alive with deeper continuity memory, flow reports, and recovery planning when context goes stale.";
  }

  if (lane === "minimal_normal") {
    if (evidence) {
      const clause = buildEvidenceClause(evidence, lane);
      if (clause) {
        return `${clause} Premium adds weekly intelligence reports, calendar planning, and quiet automation without adding noise.`;
      }
    }
    return "Premium adds calendar intelligence, editable memory, weekly clean planning, and advanced quiet automation without adding noise.";
  }

  if (input.hasTriedAdvancedStudy) {
    if (evidence) {
      const clause = buildEvidenceClause(evidence, lane);
      if (clause) {
        return `${clause} Premium builds from your material with deeper review loops, deadline intelligence, and smart next actions.`;
      }
    }
    return "VEX Premium builds from your material with deeper review loops, deadline intelligence, and smart next actions. Your memory gets smarter from real sessions.";
  }
  if (input.primaryGoal === "study" || input.primaryGoal === "learning") {
    return "Your study rhythm is taking shape. VEX Premium adds content generation, review scheduling, smart quizzes, and deadline-aware weekly planning.";
  }
  if (input.motivationStyle === "calm") {
    return "VEX Premium quietly learns your focus patterns, remembers when you work best, and keeps the system simple but smarter.";
  }
  if (evidence) {
    const clause = buildEvidenceClause(evidence, undefined);
    if (clause) {
      return `${clause} Premium adds deeper memory, weekly intelligence, and lane-matched planning.`;
    }
  }
  return "VEX Premium adds deeper memory, weekly intelligence, and lane-matched planning — all built from your actual session patterns, not generic templates.";
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
