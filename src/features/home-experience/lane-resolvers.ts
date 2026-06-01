import type {
  SurfaceDecisionInput,
  PersonalizationProfile,
  BehaviorStats,
} from './surface-helper-types';

export function resolveLaneStudy(
  input: SurfaceDecisionInput,
  p: PersonalizationProfile,
  b: BehaviorStats,
): boolean {
  const lane = input.laneProfile?.primaryLane;
  if (lane === 'student') {return true;}
  if (lane !== undefined) {return false;}
  // Fallback — only when no lane profile present
  return (
    p.motivationStyle === 'study_focused' ||
    p.motivationStyle === 'student' ||
    p.primaryGoal === 'study' ||
    p.primaryGoal === 'learning' ||
    input.hasActiveStudyPlan ||
    b.studyUsageRatio >= 0.35 ||
    b.learningUsageRatio >= 0.35
  );
}

export function resolveLaneGameLike(
  input: SurfaceDecisionInput,
  p: PersonalizationProfile,
): boolean {
  const lane = input.laneProfile?.primaryLane;
  if (lane === 'game_like') {return true;}
  if (lane !== undefined) {return false;}
  return (
    p.motivationStyle === 'game_like' ||
    p.motivationStyle === 'intense' ||
    p.gamificationIntensity === 'strong'
  );
}

export function resolveLaneCalm(
  input: SurfaceDecisionInput,
  p: PersonalizationProfile,
): boolean {
  const lane = input.laneProfile?.primaryLane;
  if (lane === 'minimal_normal') {return true;}
  if (lane !== undefined) {return false;}
  return p.motivationStyle === 'calm';
}

export function resolveLaneFriendly(
  input: SurfaceDecisionInput,
  p: PersonalizationProfile,
): boolean {
  const lane = input.laneProfile?.primaryLane;
  if (lane !== undefined) {return false;} // friendly is not a lane, it's a style
  return p.motivationStyle === 'friendly';
}

export function resolveLaneCoachLed(
  input: SurfaceDecisionInput,
  p: PersonalizationProfile,
): boolean {
  const lane = input.laneProfile?.primaryLane;
  if (lane !== undefined) {return false;} // coach-led is a style, not a lane
  return p.motivationStyle === 'coach_led';
}
