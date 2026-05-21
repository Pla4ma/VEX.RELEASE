import { useMemo } from 'react';

import { useOnboardingStore } from '../onboarding/store';
import { buildHomeExperienceModel } from './service';
import type { ExplicitMotivationStyle, HomeExperienceModel } from './schemas';

function toExplicitStyle(style: string | null): ExplicitMotivationStyle | null {
  if (
    style === 'calm' ||
    style === 'student' ||
    style === 'game_like' ||
    style === 'coach_led' ||
    style === 'intense'
  ) {
    return style;
  }
  return null;
}

export function useHomeExperienceModel(totalCompletedSessions: number): HomeExperienceModel {
  const explicitStyle = useOnboardingStore((state) => state.explicitMotivationStyle);
  return useMemo(
    () => buildHomeExperienceModel({
      explicitMotivationStyle: toExplicitStyle(explicitStyle),
      totalCompletedSessions,
    }),
    [explicitStyle, totalCompletedSessions],
  );
}
