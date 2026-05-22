import {
  HomeSurfaceDecisionSchema,
  HomeSurfaceMapSchema,
  SurfaceDecisionInputSchema,
  type HomeSurfaceDecision,
  type HomeSurfaceKey,
  type HomeSurfaceMap,
} from './surface-decision-schemas';
import type { z } from 'zod';

type SurfaceDecisionInput = z.infer<typeof SurfaceDecisionInputSchema>;

function decision(value: string): HomeSurfaceDecision {
  return HomeSurfaceDecisionSchema.parse(value);
}

export function decideHomeSurfaces(input: SurfaceDecisionInput): HomeSurfaceMap {
  const parsed = SurfaceDecisionInputSchema.parse(input);
  const map: Record<HomeSurfaceKey, HomeSurfaceDecision> = {
    start_session: 'primary',
    coach_presence: 'hidden',
    progress_proof: 'hidden',
    focus_score: 'hidden',
    study_layer: 'hidden',
    companion_thread: 'hidden',
    boss_teaser: 'hidden',
    boss_compact: 'hidden',
    boss_full_cta: 'hidden',
    challenge_teaser: 'hidden',
    unlock_strip: 'hidden',
    premium_tease: 'hidden',
    weekly_quest: 'hidden',
  };

  const { personalizationProfile: p, behaviorStats: b } = parsed;
  const isDayZero = b.totalCompletedSessions === 0;
  const isNew = b.totalCompletedSessions < 3;
  const isEngaged = b.totalCompletedSessions >= 3;

  // Cache first-week phase for final pass
  const fwProvided = parsed.firstWeekPhase !== undefined;
  const fw = parsed.firstWeekPhase ?? {};
  const fwAllowedSurfaces = (fw.allowedHomeSurfaces ?? []) as string[];
  const fwPremiumMoment = fw.premiumMoment ?? 'none';
  const fwBossIntensity = fw.bossIntensity ?? 'hidden';
  const fwSpotlight = fw.spotlightSurface ?? 'none';

  // First-week study layer label override (when explicitly provided)
  if (fwProvided && fw.studyLayerLabel && parsed.featureAvailability.study) {
    p.studyLayerName = fw.studyLayerLabel;
  }

  map.coach_presence = isDayZero ? 'tiny_tease' : b.coachInteractions > 0 ? 'secondary' : 'tiny_tease';

  if (!isDayZero) {
    map.progress_proof = 'secondary';
    map.focus_score = isNew ? 'tiny_tease' : isEngaged ? 'secondary' : 'secondary';
  }

  map.unlock_strip = isDayZero ? 'tiny_tease' : isNew ? 'secondary' : 'hidden';

  // --- SPOTLIGHT SELECTION: exactly one spotlight when eligible ---
  const spotlightCandidates: { key: HomeSurfaceKey; priority: number }[] = [];

  const isStudyUser = p.motivationStyle === 'study_focused'
    || p.primaryGoal === 'study'
    || p.primaryGoal === 'learning'
    || b.studyUsageRatio >= 0.35;

  const isGameLikeUser = p.motivationStyle === 'game_like'
    || p.motivationStyle === 'intense'
    || p.gamificationIntensity === 'strong';

  const isCalmUser = p.motivationStyle === 'calm';

  if (isStudyUser && parsed.featureAvailability.study) {
    spotlightCandidates.push({ key: 'study_layer', priority: 10 });
  }

  if (isGameLikeUser && parsed.featureAvailability.boss && b.bossChallengeEngagement !== 'none' && b.totalCompletedSessions > 0) {
    spotlightCandidates.push({ key: 'boss_compact', priority: 8 });
  }

  if (p.motivationStyle === 'coach_led' && parsed.hasActiveRecommendation && parsed.featureAvailability.challenges) {
    spotlightCandidates.push({ key: 'coach_presence', priority: 7 });
  }

  if (p.motivationStyle === 'friendly' && isEngaged && parsed.featureAvailability.challenges) {
    spotlightCandidates.push({ key: 'companion_thread', priority: 6 });
  }

  if (isCalmUser && b.completionStreak >= 3) {
    spotlightCandidates.push({ key: 'progress_proof', priority: 5 });
  }

  // First-week spotlight override: if first-week specifies a focus, use it
  if (fwProvided && fwSpotlight !== 'none' && !isDayZero) {
    if (fwSpotlight === 'study_deep_work_path') {
      spotlightCandidates.push({ key: 'study_layer', priority: 100 });
    } else if (fwSpotlight === 'tiny_boss_teaser' && !isCalmUser) {
      spotlightCandidates.push({ key: 'boss_teaser', priority: 100 });
    } else if (fwSpotlight === 'progress_proof') {
      spotlightCandidates.push({ key: 'progress_proof', priority: 100 });
    }
  }

  spotlightCandidates.sort((a, b) => b.priority - a.priority);
  const spotlight = spotlightCandidates[0];

  if (spotlight && !isDayZero) {
    for (const candidate of spotlightCandidates) {
      if (candidate.key !== spotlight.key) {
        map[candidate.key] = map[candidate.key] === 'hidden' ? 'hidden' : 'tiny_tease';
      }
    }
    map[spotlight.key] = 'spotlight';
  }

  if (isDayZero) {
    for (const candidate of spotlightCandidates) {
      map[candidate.key] = 'tiny_tease';
    }
  }

  // --- Boss rules ---
  if (!parsed.featureAvailability.boss) {
    map.boss_teaser = 'hidden';
    map.boss_compact = 'hidden';
    map.boss_full_cta = 'hidden';
  }

  if (isCalmUser) {
    map.boss_compact = 'hidden';
    map.boss_full_cta = 'blocked';
    map.boss_teaser = 'hidden';
  }

  if (b.bossChallengeEngagement === 'none' && b.totalCompletedSessions > 0 && !isCalmUser) {
    map.boss_teaser = map.boss_teaser === 'hidden' ? 'tiny_tease' : map.boss_teaser;
  }

  if (b.bossChallengeEngagement === 'high' && !isCalmUser && isEngaged) {
    if (map.boss_compact !== 'spotlight') {
      map.boss_compact = parsed.featureAvailability.boss ? 'secondary' : 'hidden';
    }
  }

  // --- Premium rules: cannot be spotlight before value is proven ---
  if (b.totalCompletedSessions < 5 && b.premiumFeatureAttempts.length === 0) {
    map.premium_tease = 'hidden';
  } else if (b.premiumFeatureAttempts.length > 0 && b.totalCompletedSessions >= 5) {
    map.premium_tease = 'tiny_tease';
  }

  // --- Challenge/weekly quest ---
  if (parsed.featureAvailability.challenges && isEngaged) {
    map.challenge_teaser = map.challenge_teaser === 'hidden' ? 'tiny_tease' : map.challenge_teaser;
    map.weekly_quest = b.totalCompletedSessions >= 10 ? 'secondary' : 'hidden';
  }

  // --- Primary CTA: always start session unless actively continuing a study plan ---
  map.start_session = parsed.hasActiveStudyPlan && isStudyUser
    ? 'secondary'
    : 'primary';

  // --- Coach presence second pass: if coach is spotlight, downgrade study_layer ---
  const coachIsSpotlight = (map as Record<string, string>).coach_presence === 'spotlight';
  const studyIsSpotlight = (map as Record<string, string>).study_layer === 'spotlight';
  if (coachIsSpotlight && studyIsSpotlight) {
    map.study_layer = 'secondary';
  }

  // --- Companion thread ---
  if (p.motivationStyle === 'friendly' && isEngaged) {
    map.companion_thread = map.companion_thread === 'hidden' ? 'tiny_tease' : map.companion_thread;
  }

  if (p.motivationStyle === 'calm') {
    map.companion_thread = isEngaged ? 'tiny_tease' : 'hidden';
  }

  // --- FIRST-WEEK FINAL CONSTRAINT PASS: enforce after all other decisions ---
  if (fwProvided) {
    // Boss gating: first-week hidden boss blocks all boss surfaces
    if (fwBossIntensity === 'hidden') {
      map.boss_teaser = 'hidden';
      map.boss_compact = 'hidden';
      map.boss_full_cta = 'blocked';
    }

    // Premium gating: first-week premium moment overrides
    if (fwPremiumMoment === 'none' || fwPremiumMoment === 'hidden') {
      map.premium_tease = 'hidden';
    } else if (fwPremiumMoment === 'soft_tease') {
      map.premium_tease = map.premium_tease === 'hidden' ? 'tiny_tease' : map.premium_tease;
    }

    // Surface gating: non-allowed surfaces get hidden
    if (fwAllowedSurfaces.length > 0) {
      if (!fwAllowedSurfaces.includes('companion_continuity')) {
        map.companion_thread = 'hidden';
      }
    }
  }

  return HomeSurfaceMapSchema.parse(map);
}

export function getPrimarySurface(map: HomeSurfaceMap): HomeSurfaceKey | null {
  const primary = Object.entries(map).find(([, v]) => v === 'primary');
  return primary ? (primary[0] as HomeSurfaceKey) : null;
}

export function getSpotlightSurface(map: HomeSurfaceMap): HomeSurfaceKey | null {
  const spot = Object.entries(map).find(([, v]) => v === 'spotlight');
  return spot ? (spot[0] as HomeSurfaceKey) : null;
}
