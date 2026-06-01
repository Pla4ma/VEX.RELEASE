import type { z } from 'zod';
import type {
  HomeSurfaceDecision,
  HomeSurfaceKey,
} from './surface-decision-schemas';
import type { SurfaceDecisionInputSchema } from './surface-decision-schemas';

type SurfaceDecisionInput = z.infer<typeof SurfaceDecisionInputSchema>;
type PersonalizationProfile = SurfaceDecisionInput['personalizationProfile'];
type BehaviorStats = SurfaceDecisionInput['behaviorStats'];
type SurfaceMap = Record<HomeSurfaceKey, HomeSurfaceDecision>;

function isStudyCueUser(
  parsed: SurfaceDecisionInput,
  p: PersonalizationProfile,
  b: BehaviorStats,
): boolean {
  return (
    p.motivationStyle === 'study_focused' ||
    p.motivationStyle === 'student' ||
    p.primaryGoal === 'study' ||
    p.primaryGoal === 'learning' ||
    parsed.hasActiveStudyPlan ||
    b.studyUsageRatio >= 0.35 ||
    b.learningUsageRatio >= 0.35
  );
}

export function applyLaneSurfaces(
  map: SurfaceMap,
  parsed: SurfaceDecisionInput,
  p: PersonalizationProfile,
  b: BehaviorStats,
  isNew: boolean,
  isEngaged: boolean,
): void {
  const ignored = b.ignoredFeatures;
  const canonicalLane = parsed.laneProfile?.primaryLane;

  const isStudent = canonicalLane
    ? canonicalLane === 'student'
    : isStudyCueUser(parsed, p, b);
  const isGameLike = canonicalLane
    ? canonicalLane === 'game_like'
    : p.motivationStyle === 'game_like' ||
      p.motivationStyle === 'intense' ||
      p.gamificationIntensity === 'strong';
  const isDeepCreative = canonicalLane
    ? canonicalLane === 'deep_creative'
    : p.primaryGoal === 'creative' ||
      b.deepWorkUsageRatio >= 0.35 ||
      b.projectFocusUsageRatio >= 0.35;
  const isMinimal = canonicalLane
    ? canonicalLane === 'minimal_normal'
    : p.motivationStyle === 'calm' || p.gamificationIntensity === 'minimal';

  if (
    isStudent &&
    parsed.featureAvailability.study &&
    !ignored.includes('study_os')
  ) {
    map.study_os = parsed.hasActiveStudyPlan ? 'secondary' : 'tiny_tease';
  }
  if (
    isGameLike &&
    parsed.featureAvailability.boss &&
    !ignored.includes('run_board')
  ) {
    map.run_board = isEngaged ? 'secondary' : 'tiny_tease';
  }
  if (isDeepCreative && !ignored.includes('project_thread')) {
    map.project_thread = isEngaged ? 'secondary' : 'tiny_tease';
    map.focus_window = isEngaged ? 'secondary' : 'hidden';
  }
  if (isMinimal && !ignored.includes('today_strip')) {
    map.today_strip = isNew ? 'tiny_tease' : 'secondary';
  }
  if (!ignored.includes('rescue_cta')) {
    const isColdDay0WithNoSignal = isNew && b.totalCompletedSessions === 0;
    map.rescue_cta = isColdDay0WithNoSignal
      ? 'hidden'
      : isNew
        ? 'tiny_tease'
        : 'secondary';
  }
  if (
    b.totalCompletedSessions >= 3 &&
    b.coachInteractions > 0 &&
    !ignored.includes('memory_insight')
  )
    {map.memory_insight = 'tiny_tease';}
  if (
    b.premiumFeatureAttempts.includes('weekly_intelligence') &&
    b.totalCompletedSessions >= 5
  ) {
    map.weekly_intelligence = parsed.featureAvailability.premium
      ? 'tiny_tease'
      : 'hidden';
  }
}
