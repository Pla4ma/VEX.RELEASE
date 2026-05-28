export {
  resolveCoachMode,
  resolveCompanionIntensity,
  resolveHomeLayoutVariant,
  resolvePremiumMoment,
  resolveBossIntensity,
  resolveBoss,
  resolveCompletion,
} from "./experience-resolvers";

import type {
  BehaviorStats,
  FeatureAvailabilitySnapshot,
  HomeSection,
  VexExperience,
  VexPersonalizationProfile,
} from "./schemas";

const FREE_EXECUTION_LOOP = [
  "start_session",
  "complete_session",
  "basic_xp",
  "basic_streak",
  "basic_progress",
  "basic_coach",
];

export function resolveBehavior(
  profile: VexPersonalizationProfile,
  stats: BehaviorStats,
): {
  adaptations: string[];
  copy: string;
  duration: number;
  sessionSuggestion: string;
} {
  if (stats.completedSessionDurations.length < 3) {
    return {
      adaptations: ["needs_more_signal"],
      copy: "VEX is learning your rhythm. Start with the default.",
      duration: profile.defaultSessionDuration,
      sessionSuggestion:
        "Start with one clean block and let VEX adjust around you.",
    };
  }
  const durationCounts = new Map<number, number>();
  stats.completedSessionDurations.forEach((d) =>
    durationCounts.set(d, (durationCounts.get(d) ?? 0) + 1),
  );
  const best = Array.from(durationCounts.entries()).sort(
    (a, b) => b[1] - a[1],
  )[0];
  const adaptations: string[] = ["duration_pattern"];
  if (stats.mostSuccessfulTimeOfDay) adaptations.push("time_of_day_pattern");
  if (stats.abandonedSessionDurations.length > 0)
    adaptations.push("abandonment_aware");
  if (stats.comebackSessions > 0) adaptations.push("comeback_adaptive");
  if (stats.coachInteractions >= 3) adaptations.push("coach_responsive");
  if (stats.studyUsageRatio >= 0.5) adaptations.push("study_heavy");
  if (stats.ignoredFeatures.includes("boss_tab"))
    adaptations.push("boss_ignored");
  return {
    adaptations,
    copy: "Want to repeat your best rhythm?",
    duration: best?.[0] ?? profile.defaultSessionDuration,
    sessionSuggestion: stats.mostSuccessfulTimeOfDay
      ? `Your best sessions happen around ${stats.mostSuccessfulTimeOfDay}. Ready for another?`
      : "Start with one clean block.",
  };
}

export function resolveHome(input: {
  boss: VexExperience["boss"];
  profile: VexPersonalizationProfile;
  stats: BehaviorStats;
}): VexExperience["home"] {
  const sections: HomeSection[] = ["coach_line", "primary_session"];
  if (input.stats.totalCompletedSessions > 0)
    sections.push("progress_signal", "companion_thread");
  const study =
    input.profile.primaryGoal === "study" ||
    input.profile.primaryGoal === "learning" ||
    input.stats.studyUsageRatio >= 0.35;
  if (study) sections.push("study_layer");
  if (input.boss.isVisible)
    sections.push(
      input.boss.intensity === "subtle" ? "boss_teaser" : "boss_compact",
    );
  if (input.stats.totalCompletedSessions >= 5) sections.push("premium_tease");
  const coachCopy =
    input.profile.preferredTone === "direct"
      ? "Start the block. Keep the target clean."
      : input.profile.preferredTone === "warm"
        ? "One clean block, together. Ready?"
        : "Start with one clean block and let VEX adjust around you.";
  return { coachCopy, sections, studyName: input.profile.studyLayerName };
}

export function resolvePremium(
  availability: FeatureAvailabilitySnapshot,
  stats: BehaviorStats,
): VexExperience["premium"] {
  const attempted = stats.premiumFeatureAttempts;
  const shouldTease =
    availability.premium &&
    stats.totalCompletedSessions >= 5 &&
    attempted.length > 0;
  return {
    copy: shouldTease
      ? "Unlock deeper personalization and let VEX learn your patterns."
      : "Premium appears after VEX has shown real personal value.",
    mustRemainFree: FREE_EXECUTION_LOOP,
    shouldTease,
    trigger: attempted.includes("advanced_study")
      ? "advanced_study"
      : attempted.includes("weekly_intelligence")
        ? "weekly_intelligence"
        : attempted.includes("custom_identity")
          ? "custom_identity"
          : shouldTease
            ? "session_value"
            : "none",
  };
}
