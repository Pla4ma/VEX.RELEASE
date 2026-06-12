import { useMemo } from 'react';

import { useOnboardingStore } from '../onboarding/store';
import { resolveVexExperience } from './service';
import {
  BehaviorStatsSchema,
  FeatureAvailabilitySnapshotSchema,
} from './schemas';
import type {
  BehaviorStats,
  FeatureAvailabilitySnapshot,
  VexExperience,
} from './schemas';
import {
  buildProfileFromOnboarding,
  normalizeMotivationStyle,
} from './hooks-helpers';

interface UseVexExperienceInput {
  behaviorStats: BehaviorStats;
  featureAvailability: FeatureAvailabilitySnapshot;
}

export interface VexExperienceRuntimeInput {
  behaviorStats: BehaviorStats;
  featureAvailability: FeatureAvailabilitySnapshot;
  overrideStudyLayerLabel?: string;
  overridePremiumAvailable?: boolean;
  overrideBossEngagement?: BehaviorStats['bossChallengeEngagement'];
}

export function useResolvedVexExperience(
  input: UseVexExperienceInput,
): VexExperience {
  const duration = useOnboardingStore((state) => state.focusDuration);
  const goal = useOnboardingStore((state) => state.goal);
  const explicitStyle = useOnboardingStore(
    (state) => state.explicitMotivationStyle,
  );
  const style = normalizeMotivationStyle(explicitStyle);

  return useMemo(
    () =>
      resolveVexExperience(
        buildProfileFromOnboarding({ duration, goal, style }),
        input.behaviorStats,
        input.featureAvailability,
      ),
    [duration, goal, input.behaviorStats, input.featureAvailability, style],
  );
}

/**
 * Runtime-resolved VEX experience — the single source of truth for all product surfaces.
 * Takes all runtime inputs and returns the canonical VexExperience.
 * Consumers must use this instead of making independent decisions about boss/study/premium visibility.
 */
export function useResolvedVexExperienceRuntime(
  input: VexExperienceRuntimeInput,
): VexExperience {
  const duration = useOnboardingStore((state) => state.focusDuration);
  const goal = useOnboardingStore((state) => state.goal);
  const explicitStyle = useOnboardingStore(
    (state) => state.explicitMotivationStyle,
  );
  const style = normalizeMotivationStyle(explicitStyle);

  return useMemo(() => {
    const profile = buildProfileFromOnboarding({ duration, goal, style });
    if (input.overrideStudyLayerLabel) {
      profile.studyLayerName = input.overrideStudyLayerLabel as typeof profile.studyLayerName;
    }
    const stats = BehaviorStatsSchema.parse({
      ...input.behaviorStats,
      ...(input.overrideBossEngagement
        ? { bossChallengeEngagement: input.overrideBossEngagement }
        : {}),
    });
    const availability = FeatureAvailabilitySnapshotSchema.parse({
      ...input.featureAvailability,
      ...(input.overridePremiumAvailable !== undefined
        ? { premium: input.overridePremiumAvailable }
        : {}),
    });
    return resolveVexExperience(profile, stats, availability);
  }, [
    duration,
    goal,
    style,
    input.behaviorStats,
    input.featureAvailability,
    input.overrideStudyLayerLabel,
    input.overridePremiumAvailable,
    input.overrideBossEngagement,
  ]);
}
