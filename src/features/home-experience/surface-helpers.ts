import { applyLaneSurfaces } from "./lane-surface-helpers";
import {
  type SurfaceDecisionInput,
  type PersonalizationProfile,
  type BehaviorStats,
  type SurfaceMap,
  createEmptyHomeSurfaceMap,
} from "./surface-helper-types";
import {
  resolveLaneStudy,
  resolveLaneGameLike,
  resolveLaneCalm,
  resolveLaneFriendly,
  resolveLaneCoachLed,
} from "./lane-resolvers";

export { createEmptyHomeSurfaceMap } from "./surface-helper-types";
export type {
  SurfaceDecisionInput,
  PersonalizationProfile,
  BehaviorStats,
  SurfaceMap,
} from "./surface-helper-types";

export {
  resolveLaneStudy,
  resolveLaneGameLike,
  resolveLaneCalm,
  resolveLaneFriendly,
  resolveLaneCoachLed,
} from "./lane-resolvers";

export function setupDay0Surfaces(
  parsed: SurfaceDecisionInput,
  p: PersonalizationProfile,
  b: BehaviorStats,
  fwProvided: boolean,
  fw: NonNullable<SurfaceDecisionInput["firstWeekPhase"]>,
): SurfaceMap {
  const map = createEmptyHomeSurfaceMap();

  map.coach_presence = "tiny_tease";
  map.unlock_strip = "tiny_tease";

  const isStudyUser = resolveLaneStudy(parsed, p, b);
  applyLaneSurfaces(map, parsed, p, b, true, false);

  // On Day 0, only study-focused users get study_layer as tiny_tease (not spotlight)
  if (isStudyUser && parsed.featureAvailability.study) {
    map.study_layer = "tiny_tease";
  }

  const isGameLikeUser = resolveLaneGameLike(parsed, p);

  if (
    isGameLikeUser &&
    parsed.featureAvailability.boss &&
    b.bossChallengeEngagement !== "none"
  ) {
    map.boss_teaser = "tiny_tease";
  }

  // First-week boss
  if (fwProvided && fw.bossIntensity !== "hidden") {
    map.boss_teaser = "tiny_tease";
  }

  const isCalmUser = resolveLaneCalm(parsed, p);
  if (isCalmUser) {
    map.boss_teaser = "hidden";
    map.boss_compact = "hidden";
    map.boss_full_cta = "blocked";
  }

  // First-week premium
  if (
    fwProvided &&
    fw.premiumMoment !== "none" &&
    fw.premiumMoment !== "hidden"
  ) {
    map.premium_tease = "hidden";
  }

  // Boss gating
  if (!parsed.featureAvailability.boss) {
    map.boss_teaser = "hidden";
    map.boss_compact = "hidden";
    if (!isCalmUser) {
      map.boss_full_cta = "hidden";
    }
  }

  // Companions: friendly users get companion_thread as tiny_tease on Day 0
  if (resolveLaneFriendly(parsed, p)) {
    map.companion_thread = "tiny_tease";
  }

  map.start_session = "primary";

  return map;
}

export function selectSpotlight(
  map: SurfaceMap,
  parsed: SurfaceDecisionInput,
  p: PersonalizationProfile,
  b: BehaviorStats,
  isNew: boolean,
  isEngaged: boolean,
  fwProvided: boolean,
  fw: NonNullable<SurfaceDecisionInput["firstWeekPhase"]>,
): void {
  const isStudyUser = resolveLaneStudy(parsed, p, b);

  const isGameLikeUser = resolveLaneGameLike(parsed, p);

  const isCalmUser = resolveLaneCalm(parsed, p);
  const fwSpotlight = fw.spotlightSurface ?? "none";

  const candidates: { key: keyof SurfaceMap; priority: number }[] = [];

  if (isStudyUser && parsed.featureAvailability.study) {
    if (!b.ignoredFeatures.includes("study_layer")) {
      candidates.push({ key: "study_layer", priority: 10 });
    } else {
      map.study_layer = "tiny_tease";
    }
  }

  if (
    isGameLikeUser &&
    parsed.featureAvailability.boss &&
    b.bossChallengeEngagement !== "none" &&
    b.totalCompletedSessions > 0
  ) {
    candidates.push({ key: "boss_compact", priority: 8 });
  }

  if (
    resolveLaneCoachLed(parsed, p) &&
    parsed.hasActiveRecommendation &&
    parsed.featureAvailability.challenges
  ) {
    candidates.push({ key: "coach_presence", priority: 7 });
  }

  if (
    resolveLaneFriendly(parsed, p) &&
    isEngaged &&
    parsed.featureAvailability.challenges
  ) {
    candidates.push({ key: "companion_thread", priority: 6 });
  }

  if (isCalmUser && b.completionStreak >= 3) {
    candidates.push({ key: "progress_proof", priority: 5 });
  }

  if (fwProvided && fwSpotlight !== "none") {
    if (fwSpotlight === "study_deep_work_path") {
      candidates.push({ key: "study_layer", priority: 100 });
    } else if (fwSpotlight === "tiny_boss_teaser" && !isCalmUser) {
      candidates.push({ key: "boss_teaser", priority: 100 });
    } else if (fwSpotlight === "progress_proof") {
      candidates.push({ key: "progress_proof", priority: 100 });
    }
  }

  candidates.sort((a, b) => b.priority - a.priority);
  const spotlight = candidates[0];

  if (spotlight) {
    for (const candidate of candidates) {
      if (candidate.key !== spotlight.key) {
        map[candidate.key] =
          map[candidate.key] === "hidden" ? "hidden" : "tiny_tease";
      }
    }
    map[spotlight.key] = "spotlight";
  }
}
