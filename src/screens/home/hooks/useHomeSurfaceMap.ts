/**
 * useHomeSurfaceMap — wires decideHomeSurfaces into Home rendering.
 *
 * Consumed by Home containers to drive surface visibility.
 * Accepts canonical personalizationProfile and behaviorStats from
 * useHomeResolvedExperience — never derives profiles from guesses.
 */
import { useMemo } from "react";
import { decideHomeSurfaces } from "../../../features/home-experience/home-surface-decision";
import type { HomeSurfaceMap } from "../../../features/home-experience/surface-decision-schemas";
import type { FirstWeekExperience } from "../../../features/personalization/first-week-schemas";
import type { FeatureAccessResult } from "../../../features/liveops-config";
import type { LaneProfile } from "../../../features/lane-engine/types";

interface UseHomeSurfaceMapInput {
  personalizationProfile: {
    motivationStyle: string;
    primaryGoal: string;
    gamificationIntensity: "minimal" | "medium" | "strong";
    studyLayerName: string;
    userStage: "new" | "activating" | "engaged" | "power";
  };
  behaviorStats: {
    totalCompletedSessions: number;
    studyUsageRatio: number;
    bossChallengeEngagement: "none" | "low" | "medium" | "high";
    coachInteractions: number;
    comebackSessions: number;
    ignoredFeatures: string[];
    premiumFeatureAttempts: string[];
    completionStreak: number;
  };
  hasActiveStudyPlan: boolean;
  hasActiveRecommendation: boolean;
  hasActiveBoss: boolean;
  isFirstSession: boolean;
  featureAccess: FeatureAccessResult;
  firstWeek?: FirstWeekExperience;
  laneProfile?: LaneProfile;
}

export function useHomeSurfaceMap(
  input: UseHomeSurfaceMapInput,
): HomeSurfaceMap {
  const {
    personalizationProfile: p,
    behaviorStats: b,
    hasActiveStudyPlan,
    hasActiveRecommendation,
    hasActiveBoss,
    isFirstSession,
    featureAccess,
  } = input;

  const safeStyle = p.motivationStyle;

  return useMemo(() => {
    const fa = featureAccess.features;

    const degradedFeatures: Array<
      "content_study" | "ai_coach_advanced" | "premium_paywall" | "boss_tab"
    > = [];
    if (fa.content_study?.isDegraded) degradedFeatures.push("content_study");
    if (fa.ai_coach_advanced?.isDegraded)
      degradedFeatures.push("ai_coach_advanced");
    if (fa.premium_paywall?.isDegraded)
      degradedFeatures.push("premium_paywall");
    if (fa.boss_tab?.isDegraded) degradedFeatures.push("boss_tab");

    return decideHomeSurfaces({
      featureAvailability: {
        boss: Boolean(fa.boss_tab?.isUnlocked),
        challenges: Boolean(fa.challenges?.isUnlocked),
        premium: Boolean(fa.premium_paywall?.isUnlocked),
        study: Boolean(fa.content_study?.isUnlocked),
      },
      personalizationProfile: {
        motivationStyle:
          safeStyle === "calm" ||
          safeStyle === "friendly" ||
          safeStyle === "coach_led" ||
          safeStyle === "game_like" ||
          safeStyle === "intense" ||
          safeStyle === "study_focused" ||
          safeStyle === "student"
            ? (safeStyle as
                | "calm"
                | "friendly"
                | "coach_led"
                | "game_like"
                | "intense"
                | "study_focused"
                | "student")
            : "friendly",
        primaryGoal:
          p.primaryGoal === "focus" ||
          p.primaryGoal === "study" ||
          p.primaryGoal === "work" ||
          p.primaryGoal === "creative" ||
          p.primaryGoal === "personal" ||
          p.primaryGoal === "learning"
            ? (p.primaryGoal as
                | "focus"
                | "study"
                | "work"
                | "creative"
                | "personal"
                | "learning")
            : "focus",
        gamificationIntensity: p.gamificationIntensity,
        studyLayerName: input.firstWeek?.studyLayerLabel ?? p.studyLayerName,
        userStage: p.userStage,
      },
      behaviorStats: {
        totalCompletedSessions: b.totalCompletedSessions,
        studyUsageRatio: b.studyUsageRatio,
        deepWorkUsageRatio:
          ((b as Record<string, unknown>).deepWorkUsageRatio as number) ?? 0,
        learningUsageRatio:
          ((b as Record<string, unknown>).learningUsageRatio as number) ?? 0,
        projectFocusUsageRatio:
          ((b as Record<string, unknown>).projectFocusUsageRatio as number) ??
          0,
        structuredExecutionUsageRatio:
          ((b as Record<string, unknown>)
            .structuredExecutionUsageRatio as number) ?? 0,
        bossChallengeEngagement: b.bossChallengeEngagement,
        coachInteractions: b.coachInteractions,
        comebackSessions: b.comebackSessions,
        ignoredFeatures: b.ignoredFeatures,
        premiumFeatureAttempts: b.premiumFeatureAttempts,
        completionStreak: b.completionStreak,
      },
      hasActiveStudyPlan,
      hasActiveRecommendation,
      hasActiveBoss,
      isFirstSession,
      firstWeekPhase: input.firstWeek,
      degradedFeatures,
    laneProfile: input.laneProfile,
    });
  }, [
    b.totalCompletedSessions,
    safeStyle,
    p.primaryGoal,
    b.bossChallengeEngagement,
    b.studyUsageRatio,
    b.coachInteractions,
    hasActiveStudyPlan,
    hasActiveRecommendation,
    hasActiveBoss,
    isFirstSession,
    b.completionStreak,
    featureAccess.features,
    input.firstWeek,
    p.gamificationIntensity,
    p.studyLayerName,
    p.userStage,
    input.laneProfile?.primaryLane,
  ]);
}
