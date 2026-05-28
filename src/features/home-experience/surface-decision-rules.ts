import type {
  HomeSurfaceDecision,
  HomeSurfaceKey,
} from "./surface-decision-schemas";
import { SurfaceDecisionInputSchema } from "./surface-decision-schemas";
import type { z } from "zod";

type SurfaceDecisionInput = z.infer<typeof SurfaceDecisionInputSchema>;

export function applyPostPlacementRules(
  map: Record<HomeSurfaceKey, HomeSurfaceDecision>,
  parsed: SurfaceDecisionInput,
  p: SurfaceDecisionInput["personalizationProfile"],
  b: SurfaceDecisionInput["behaviorStats"],
  isNew: boolean,
  isEngaged: boolean,
  fwProvided: boolean,
  fwAllowedSurfaces: string[],
  fwPremiumMoment: string,
  fwBossIntensity: string,
): void {
  // Boss rules
  if (!parsed.featureAvailability.boss) {
    map.boss_teaser = "hidden";
    map.boss_compact = "hidden";
    map.boss_full_cta = "hidden";
  }

  const studyLane = parsed.laneProfile?.primaryLane;
  const isCalmUser =
    studyLane === "minimal_normal" ||
    (studyLane === undefined && p.motivationStyle === "calm");
  if (isCalmUser) {
    map.boss_compact = "hidden";
    map.boss_full_cta = "blocked";
    map.boss_teaser = "hidden";
  }

  const bossIgnored =
    b.ignoredFeatures.includes("boss_compact") ||
    b.ignoredFeatures.includes("boss_tab") ||
    b.ignoredFeatures.includes("boss_full_cta");

  if (bossIgnored && b.bossChallengeEngagement !== "high") {
    map.boss_compact = "hidden";
    map.boss_teaser = "hidden";
    map.boss_full_cta = "blocked";
  }

  if (b.bossChallengeEngagement === "none" && !isCalmUser && !bossIgnored) {
    map.boss_teaser =
      map.boss_teaser === "hidden" ? "tiny_tease" : map.boss_teaser;
  }

  if (
    b.bossChallengeEngagement === "high" &&
    !isCalmUser &&
    isEngaged &&
    !bossIgnored
  ) {
    if (map.boss_compact !== "spotlight") {
      map.boss_compact = parsed.featureAvailability.boss
        ? "secondary"
        : "hidden";
    }
  }

  // Premium rules
  const premiumIgnored =
    b.ignoredFeatures.includes("premium_tease") ||
    b.ignoredFeatures.includes("premium_paywall");
  if (premiumIgnored) {
    map.premium_tease = "hidden";
  } else if (!parsed.featureAvailability.premium) {
    map.premium_tease = "hidden";
  } else if (
    b.totalCompletedSessions < 5 &&
    b.premiumFeatureAttempts.length === 0
  ) {
    map.premium_tease = "hidden";
  } else if (
    b.premiumFeatureAttempts.length > 0 &&
    b.totalCompletedSessions >= 5
  ) {
    map.premium_tease = "tiny_tease";
  }

  // Challenge/weekly quest
  const isMinimalUser =
    studyLane === "minimal_normal" ||
    (studyLane === undefined &&
      (p.motivationStyle === "calm" || p.gamificationIntensity === "minimal"));
  if (parsed.featureAvailability.challenges && isEngaged && !isMinimalUser) {
    map.challenge_teaser =
      map.challenge_teaser === "hidden" ? "tiny_tease" : map.challenge_teaser;
    map.weekly_quest = b.totalCompletedSessions >= 10 ? "secondary" : "hidden";
  }

  // Primary CTA
  const isStudyUser =
    studyLane === "student" ||
    (!studyLane &&
      (p.motivationStyle === "study_focused" ||
        p.motivationStyle === "student" ||
        p.primaryGoal === "study" ||
        p.primaryGoal === "learning" ||
        b.studyUsageRatio >= 0.35));
  map.start_session =
    parsed.hasActiveStudyPlan && isStudyUser ? "secondary" : "primary";

  // Coach/study spotlight conflict
  const coachIsSpotlight =
    (map as Record<string, string>).coach_presence === "spotlight";
  const studyIsSpotlight =
    (map as Record<string, string>).study_layer === "spotlight";
  if (coachIsSpotlight && studyIsSpotlight) {
    map.study_layer = "secondary";
  }

  // Companion thread
  if (
    studyLane === undefined &&
    p.motivationStyle === "friendly" &&
    isEngaged
  ) {
    map.companion_thread =
      map.companion_thread === "hidden" ? "tiny_tease" : map.companion_thread;
  }
  if (isCalmUser) {
    map.companion_thread = isEngaged ? "tiny_tease" : "hidden";
    map.focus_score = "hidden";
    map.progress_detail = "hidden";
  }

  // First-week final constraint pass
  if (fwProvided) {
    if (fwBossIntensity === "hidden") {
      map.boss_teaser = "hidden";
      map.boss_compact = "hidden";
      map.boss_full_cta = "blocked";
    }
    if (fwPremiumMoment === "none" || fwPremiumMoment === "hidden") {
      map.premium_tease = "hidden";
    } else if (fwPremiumMoment === "soft_tease") {
      map.premium_tease =
        map.premium_tease === "hidden" ? "tiny_tease" : map.premium_tease;
    }
    if (fwAllowedSurfaces.length > 0) {
      if (!fwAllowedSurfaces.includes("companion_continuity")) {
        map.companion_thread = "hidden";
      }
      if (
        !fwAllowedSurfaces.includes("progress_proof") &&
        !fwAllowedSurfaces.includes("weekly_insight")
      ) {
        map.progress_detail = "hidden";
      }
    }
  }

  // Degraded feature blocks
  const degradedFeatures = parsed.degradedFeatures ?? [];
  if (degradedFeatures.includes("content_study")) {
    const currentStudy = map.study_layer;
    map.study_layer = currentStudy !== "hidden" ? "blocked" : "hidden";
  }
  if (degradedFeatures.includes("ai_coach_advanced")) {
    const coachVal = (map as Record<string, string>).coach_presence ?? "hidden";
    if (coachVal !== "hidden") {
      map.coach_presence =
        coachVal === "spotlight"
          ? "secondary"
          : (coachVal as HomeSurfaceDecision);
    }
  }
  if (degradedFeatures.includes("premium_paywall")) {
    map.premium_tease = "hidden";
  }
  if (degradedFeatures.includes("boss_tab")) {
    map.boss_full_cta = "blocked";
    const currentBossCompact = map.boss_compact;
    if (currentBossCompact !== "hidden") {
      map.boss_compact =
        currentBossCompact === "spotlight" ? "secondary" : currentBossCompact;
    }
  }
}
