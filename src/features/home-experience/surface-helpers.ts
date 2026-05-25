import type { HomeSurfaceDecision, HomeSurfaceKey } from './surface-decision-schemas';
import type { SurfaceDecisionInputSchema } from './surface-decision-schemas';
import type { z } from 'zod';

type SurfaceDecisionInput = z.infer<typeof SurfaceDecisionInputSchema>;
type PersonalizationProfile = SurfaceDecisionInput['personalizationProfile'];
type BehaviorStats = SurfaceDecisionInput['behaviorStats'];
type FirstWeekPhase = SurfaceDecisionInput['firstWeekPhase'];

type SurfaceMap = Record<HomeSurfaceKey, HomeSurfaceDecision>;

function isStudyCueUser(
  parsed: SurfaceDecisionInput,
  p: PersonalizationProfile,
  b: BehaviorStats,
): boolean {
  return p.motivationStyle === 'study_focused'
    || p.primaryGoal === 'study'
    || p.primaryGoal === 'learning'
    || parsed.hasActiveStudyPlan
    || b.studyUsageRatio >= 0.35
    || b.learningUsageRatio >= 0.35;
}

function emptyMap(): SurfaceMap {
  return {
    start_session: 'primary',
    coach_presence: 'hidden',
    progress_proof: 'hidden',
    focus_score: 'hidden',
    progress_detail: 'hidden',
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
}

export function setupDay0Surfaces(
  parsed: SurfaceDecisionInput,
  p: PersonalizationProfile,
  b: BehaviorStats,
  fwProvided: boolean,
  fw: NonNullable<SurfaceDecisionInput['firstWeekPhase']>,
): SurfaceMap {
  const map = emptyMap();

  map.coach_presence = 'tiny_tease';
  map.unlock_strip = 'tiny_tease';

  const isStudyUser = isStudyCueUser(parsed, p, b);

  // On Day 0, only study-focused users get study_layer as tiny_tease (not spotlight)
  if (isStudyUser && parsed.featureAvailability.study) {
    map.study_layer = 'tiny_tease';
  }

  const isGameLikeUser = p.motivationStyle === 'game_like'
    || p.motivationStyle === 'intense'
    || p.gamificationIntensity === 'strong';

  if (isGameLikeUser && parsed.featureAvailability.boss && b.bossChallengeEngagement !== 'none') {
    map.boss_teaser = 'tiny_tease';
  }

  // First-week boss
  if (fwProvided && fw.bossIntensity !== 'hidden') {
    map.boss_teaser = 'tiny_tease';
  }

  const isCalmUser = p.motivationStyle === 'calm';
  if (isCalmUser) {
    map.boss_teaser = 'hidden';
    map.boss_compact = 'hidden';
    map.boss_full_cta = 'blocked';
  }

  // First-week premium
  if (fwProvided && fw.premiumMoment !== 'none' && fw.premiumMoment !== 'hidden') {
    map.premium_tease = 'hidden';
  }

  // Boss gating
  if (!parsed.featureAvailability.boss) {
    map.boss_teaser = 'hidden';
    map.boss_compact = 'hidden';
    if (!isCalmUser) {
      map.boss_full_cta = 'hidden';
    }
  }

  // Companions: friendly users get companion_thread as tiny_tease on Day 0
  if (p.motivationStyle === 'friendly') {
    map.companion_thread = 'tiny_tease';
  }

  map.start_session = 'primary';

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
  fw: NonNullable<SurfaceDecisionInput['firstWeekPhase']>,
): void {
  const isStudyUser = isStudyCueUser(parsed, p, b);

  const isGameLikeUser = p.motivationStyle === 'game_like'
    || p.motivationStyle === 'intense'
    || p.gamificationIntensity === 'strong';

  const isCalmUser = p.motivationStyle === 'calm';
  const fwSpotlight = fw.spotlightSurface ?? 'none';

  const candidates: { key: HomeSurfaceKey; priority: number }[] = [];

  if (isStudyUser && parsed.featureAvailability.study) {
    if (!b.ignoredFeatures.includes('study_layer')) {
      candidates.push({ key: 'study_layer', priority: 10 });
    } else {
      map.study_layer = 'tiny_tease';
    }
  }

  if (isGameLikeUser && parsed.featureAvailability.boss && b.bossChallengeEngagement !== 'none' && b.totalCompletedSessions > 0) {
    candidates.push({ key: 'boss_compact', priority: 8 });
  }

  if (p.motivationStyle === 'coach_led' && parsed.hasActiveRecommendation && parsed.featureAvailability.challenges) {
    candidates.push({ key: 'coach_presence', priority: 7 });
  }

  if (p.motivationStyle === 'friendly' && isEngaged && parsed.featureAvailability.challenges) {
    candidates.push({ key: 'companion_thread', priority: 6 });
  }

  if (isCalmUser && b.completionStreak >= 3) {
    candidates.push({ key: 'progress_proof', priority: 5 });
  }

  if (fwProvided && fwSpotlight !== 'none') {
    if (fwSpotlight === 'study_deep_work_path') {
      candidates.push({ key: 'study_layer', priority: 100 });
    } else if (fwSpotlight === 'tiny_boss_teaser' && !isCalmUser) {
      candidates.push({ key: 'boss_teaser', priority: 100 });
    } else if (fwSpotlight === 'progress_proof') {
      candidates.push({ key: 'progress_proof', priority: 100 });
    }
  }

  candidates.sort((a, b) => b.priority - a.priority);
  const spotlight = candidates[0];

  if (spotlight) {
    for (const candidate of candidates) {
      if (candidate.key !== spotlight.key) {
        map[candidate.key] = map[candidate.key] === 'hidden' ? 'hidden' : 'tiny_tease';
      }
    }
    map[spotlight.key] = 'spotlight';
  }
}
