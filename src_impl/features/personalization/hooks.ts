import { useMemo } from 'react';

import { useOnboardingStore } from '../onboarding/store';
import { resolveVexExperience } from './service';
import type {
  BehaviorStats,
  FeatureAvailabilitySnapshot,
  MotivationStyle,
  VexExperience,
  VexPersonalizationProfile,
} from './types';

interface UseVexExperienceInput {
  behaviorStats: BehaviorStats;
  featureAvailability: FeatureAvailabilitySnapshot;
}

function normalizeMotivationStyle(style: string | null): MotivationStyle {
  switch (style) {
    case 'student':
      return 'student';
    case 'game_like':
      return 'game_like';
    case 'coach_led':
      return 'coach_led';
    case 'intense':
      return 'intense';
    case 'calm':
    default:
      return 'calm';
  }
}

function buildProfileFromOnboarding(input: {
  duration: number | null;
  goal: string | null;
  style: MotivationStyle;
}): VexPersonalizationProfile {
  return {
    coachMode: input.style === 'student' ? 'study' : input.style === 'intense' ? 'performance' : 'reflective',
    defaultSessionDuration: input.duration ?? 25,
    defaultSessionMode: input.style === 'student' ? 'STUDY' : 'FOCUS',
    featureIntensityMap: {},
    gamificationIntensity: input.style === 'game_like'
      ? 'game-like'
      : input.style === 'intense' ? 'intense' : 'subtle',
    motivationStyle: input.style,
    preferredTone: input.style === 'intense' ? 'direct' : input.style === 'coach_led' ? 'strategic' : 'calm',
    primaryGoal: input.goal === 'STUDY' ? 'STUDY' : input.goal === 'CREATIVE' ? 'CREATIVE' : 'WORK',
    studyLayerName: input.goal === 'STUDY' ? 'Study OS' : 'Deep Work OS',
    userStage: 'new',
  };
}

export function useResolvedVexExperience(input: UseVexExperienceInput): VexExperience {
  const duration = useOnboardingStore((state) => state.focusDuration);
  const goal = useOnboardingStore((state) => state.goal);
  const explicitStyle = useOnboardingStore((state) => state.explicitMotivationStyle);
  const style = normalizeMotivationStyle(explicitStyle);

  return useMemo(
    () => resolveVexExperience(
      buildProfileFromOnboarding({ duration, goal, style }),
      input.behaviorStats,
      input.featureAvailability,
    ),
    [duration, goal, input.behaviorStats, input.featureAvailability, style],
  );
}
