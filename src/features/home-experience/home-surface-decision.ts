import type { HomeSurfaceDecision, HomeSurfaceKey, HomeSurfaceMap } from './surface-decision-schemas';
import {
  HomeSurfaceDecisionSchema,
  HomeSurfaceMapSchema,
  SurfaceDecisionInputSchema,
} from './surface-decision-schemas';
import { enforceDay0SurfacePolicy } from './day0-surface-policy';
import { createEmptyHomeSurfaceMap, selectSpotlight, setupDay0Surfaces } from './surface-helpers';
import { applyLaneSurfaces } from './lane-surface-helpers';
import type { z } from 'zod';

type SurfaceDecisionInput = z.infer<typeof SurfaceDecisionInputSchema>;

export function decideHomeSurfaces(input: SurfaceDecisionInput): HomeSurfaceMap {
  const parsed = SurfaceDecisionInputSchema.parse(input);
  const { personalizationProfile: p, behaviorStats: b } = parsed;
  const isDayZero = b.totalCompletedSessions === 0;
  const isNew = b.totalCompletedSessions < 3;
  const isEngaged = b.totalCompletedSessions >= 3;

  const fwProvided = parsed.firstWeekPhase !== undefined;
  const fw = parsed.firstWeekPhase ?? {};
  const fwAllowedSurfaces = (fw.allowedHomeSurfaces ?? []) as string[];
  const fwPremiumMoment = fw.premiumMoment ?? 'none';
  const fwBossIntensity = fw.bossIntensity ?? 'hidden';

  if (fwProvided && fw.studyLayerLabel && parsed.featureAvailability.study) {
    p.studyLayerName = fw.studyLayerLabel;
  }

  if (isDayZero) {
    const raw = setupDay0Surfaces(parsed, p, b, fwProvided, fw);
    const { corrected } = enforceDay0SurfacePolicy(raw);
    return HomeSurfaceMapSchema.parse(corrected);
  }

  const map: Record<HomeSurfaceKey, HomeSurfaceDecision> = createEmptyHomeSurfaceMap();

  map.coach_presence = b.coachInteractions > 0 ? 'secondary' : 'tiny_tease';
  map.progress_proof = 'secondary';
  map.focus_score = isNew ? 'tiny_tease' : 'secondary';
  map.memory_insight = b.totalCompletedSessions >= 3 ? 'secondary' : 'hidden';
  if (!isNew) {
    map.progress_detail = isEngaged ? 'secondary' : 'secondary';
  }
  map.unlock_strip = isNew ? 'secondary' : 'hidden';
  applyLaneSurfaces(map, parsed, p, b, isNew, isEngaged);

  selectSpotlight(map, parsed, p, b, isNew, isEngaged, fwProvided, fw);

  // Boss rules
  if (!parsed.featureAvailability.boss) {
    map.boss_teaser = 'hidden';
    map.boss_compact = 'hidden';
    map.boss_full_cta = 'hidden';
  }

  const studyLane = parsed.laneProfile?.primaryLane;
  const isCalmUser = studyLane === 'minimal_normal' || (studyLane === undefined && p.motivationStyle === 'calm');
  if (isCalmUser) {
    map.boss_compact = 'hidden';
    map.boss_full_cta = 'blocked';
    map.boss_teaser = 'hidden';
  }

  const bossIgnored = b.ignoredFeatures.includes('boss_compact')
    || b.ignoredFeatures.includes('boss_tab')
    || b.ignoredFeatures.includes('boss_full_cta');

  if (bossIgnored && b.bossChallengeEngagement !== 'high') {
    map.boss_compact = 'hidden';
    map.boss_teaser = 'hidden';
    map.boss_full_cta = 'blocked';
  }

  if (b.bossChallengeEngagement === 'none' && !isCalmUser && !bossIgnored) {
    map.boss_teaser = map.boss_teaser === 'hidden' ? 'tiny_tease' : map.boss_teaser;
  }

  if (b.bossChallengeEngagement === 'high' && !isCalmUser && isEngaged && !bossIgnored) {
    if (map.boss_compact !== 'spotlight') {
      map.boss_compact = parsed.featureAvailability.boss ? 'secondary' : 'hidden';
    }
  }

  // Premium rules
  const premiumIgnored = b.ignoredFeatures.includes('premium_tease')
    || b.ignoredFeatures.includes('premium_paywall');
  if (premiumIgnored) {
    map.premium_tease = 'hidden';
  } else if (!parsed.featureAvailability.premium) {
    map.premium_tease = 'hidden';
  } else if (b.totalCompletedSessions < 5 && b.premiumFeatureAttempts.length === 0) {
    map.premium_tease = 'hidden';
  } else if (b.premiumFeatureAttempts.length > 0 && b.totalCompletedSessions >= 5) {
    map.premium_tease = 'tiny_tease';
  }

  // Challenge/weekly quest
  const isMinimalUser = studyLane === 'minimal_normal'
    || (studyLane === undefined && (p.motivationStyle === 'calm' || p.gamificationIntensity === 'minimal'));
  if (parsed.featureAvailability.challenges && isEngaged && !isMinimalUser) {
    map.challenge_teaser = map.challenge_teaser === 'hidden' ? 'tiny_tease' : map.challenge_teaser;
    map.weekly_quest = b.totalCompletedSessions >= 10 ? 'secondary' : 'hidden';
  }

  // Primary CTA
  const isStudyUser = studyLane === 'student'
    || (!studyLane && (
      p.motivationStyle === 'study_focused'
      || p.motivationStyle === 'student'
      || p.primaryGoal === 'study'
      || p.primaryGoal === 'learning'
      || b.studyUsageRatio >= 0.35
    ));
  map.start_session = parsed.hasActiveStudyPlan && isStudyUser ? 'secondary' : 'primary';

  // Coach/study spotlight conflict
  const coachIsSpotlight = (map as Record<string, string>).coach_presence === 'spotlight';
  const studyIsSpotlight = (map as Record<string, string>).study_layer === 'spotlight';
  if (coachIsSpotlight && studyIsSpotlight) {
    map.study_layer = 'secondary';
  }

  // Companion thread
  if (studyLane === undefined && p.motivationStyle === 'friendly' && isEngaged) {
    map.companion_thread = map.companion_thread === 'hidden' ? 'tiny_tease' : map.companion_thread;
  }
  if (isCalmUser) {
    map.companion_thread = isEngaged ? 'tiny_tease' : 'hidden';
    map.focus_score = 'hidden';
    map.progress_detail = 'hidden';
  }

  // First-week final constraint pass
  if (fwProvided) {
    if (fwBossIntensity === 'hidden') {
      map.boss_teaser = 'hidden';
      map.boss_compact = 'hidden';
      map.boss_full_cta = 'blocked';
    }
    if (fwPremiumMoment === 'none' || fwPremiumMoment === 'hidden') {
      map.premium_tease = 'hidden';
    } else if (fwPremiumMoment === 'soft_tease') {
      map.premium_tease = map.premium_tease === 'hidden' ? 'tiny_tease' : map.premium_tease;
    }
    if (fwAllowedSurfaces.length > 0) {
      if (!fwAllowedSurfaces.includes('companion_continuity')) {
        map.companion_thread = 'hidden';
      }
      if (
        !fwAllowedSurfaces.includes('progress_proof')
        && !fwAllowedSurfaces.includes('weekly_insight')
      ) {
        map.progress_detail = 'hidden';
      }
    }
  }

  // Degraded feature blocks
  const degradedFeatures = parsed.degradedFeatures ?? [];
  if (degradedFeatures.includes('content_study')) {
    const currentStudy = map.study_layer;
    map.study_layer = currentStudy !== 'hidden' ? 'blocked' : 'hidden';
  }
  if (degradedFeatures.includes('ai_coach_advanced')) {
    const coachVal = (map as Record<string, string>).coach_presence ?? 'hidden';
    if (coachVal !== 'hidden') {
      map.coach_presence = coachVal === 'spotlight' ? 'secondary' : (coachVal as HomeSurfaceDecision);
    }
  }
  if (degradedFeatures.includes('premium_paywall')) {
    map.premium_tease = 'hidden';
  }
  if (degradedFeatures.includes('boss_tab')) {
    map.boss_full_cta = 'blocked';
    const currentBossCompact = map.boss_compact;
    if (currentBossCompact !== 'hidden') {
      map.boss_compact = currentBossCompact === 'spotlight' ? 'secondary' : currentBossCompact;
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
