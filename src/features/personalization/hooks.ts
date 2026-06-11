import { useMemo } from 'react';

import { useOnboardingStore } from '../onboarding/store';
import { resolveVexExperience } from './service';
import {
  BehaviorStatsSchema,
  FeatureAvailabilitySnapshotSchema,
  StudyLayerNameSchema,
} from './schemas';
import type {
  BehaviorStats,
  FeatureAvailabilitySnapshot,
  MotivationStyle,
  PreferredTone,
  StudyLayerName,
  VexExperience,
  VexPersonalizationProfile,
} from './schemas';

interface UseVexExperienceInput {
  behaviorStats: BehaviorStats;
  featureAvailability: FeatureAvailabilitySnapshot;
}

export interface VexExperienceRuntimeInput {
  behaviorStats: BehaviorStats;
  featureAvailability: FeatureAvailabilitySnapshot;
  overrideStudyLayerLabel?: StudyLayerName;
  overridePremiumAvailable?: boolean;
  overrideBossEngagement?: BehaviorStats['bossChallengeEngagement'];
}

function normalizeMotivationStyle(style: string | null): MotivationStyle {
  switch (style) {
    case 'calm':
    case 'friendly':
    case 'coach_led':
    case 'game_like':
    case 'intense':
    case 'study_focused':
      return style;
    case 'worker':
      return 'coach_led';
    default:
      return 'calm';
  }
}

function resolveTone(style: MotivationStyle): PreferredTone {
  switch (style) {
    case 'intense':
      return 'direct';
    case 'coach_led':
      return 'strategic';
    case 'friendly':
      return 'warm';
    case 'game_like':
      return 'direct';
    case 'study_focused':
      return 'strategic';
    case 'calm':
    default:
      return 'soft';
  }
}

function resolveStudyLayerName(
  goal: string | null,
  motivationStyle: MotivationStyle,
): StudyLayerName {
  if (goal === 'STUDY' || motivationStyle === 'study_focused')
    {return 'Study OS';}
  if (goal === 'WORK' || motivationStyle === 'intense') {return 'Deep Work Plan';}
  if (goal === 'CREATIVE') {return 'Project Focus Path';}
  if (goal === 'LEARNING') {return 'Learning OS';}
  if (goal === 'PERSONAL' || motivationStyle === 'calm') {return 'Growth Path';}
  if (motivationStyle === 'coach_led') {return 'Deep Work Plan';}
  if (motivationStyle === 'game_like') {return 'Deep Work Plan';}
  return 'Deep Work Plan';
}

function buildProfileFromOnboarding(input: {
  duration: number | null;
  goal: string | null;
  style: MotivationStyle;
}): VexPersonalizationProfile {
  const isStudy = input.goal === 'STUDY';
  const isCreative = input.goal === 'CREATIVE';
  const isLearning = input.goal === 'LEARNING';
  const isPersonal = input.goal === 'PERSONAL';
  const primaryGoal = isStudy
    ? ('study' as const)
    : isCreative
      ? ('creative' as const)
      : isLearning
        ? ('learning' as const)
        : isPersonal
          ? ('personal' as const)
          : ('work' as const);

  return {
    primaryGoal,
    motivationStyle: input.style,
    preferredTone: resolveTone(input.style),
    gamificationIntensity:
      input.style === 'game_like'
        ? 'strong'
        : input.style === 'intense'
          ? 'strong'
          : input.style === 'calm'
            ? 'minimal'
            : 'medium',
    coachMode:
      input.style === 'study_focused'
        ? 'study_tutor'
        : input.style === 'intense'
          ? 'tactical'
          : input.style === 'game_like'
            ? 'game_guide'
            : input.style === 'coach_led'
              ? 'mentor'
              : 'reflection',
    studyLayerName: StudyLayerNameSchema.parse(
      resolveStudyLayerName(input.goal, input.style),
    ),
    defaultSessionDuration: input.duration ?? 25,
    defaultSessionMode: isStudy
      ? 'STUDY'
      : isCreative
        ? 'CREATIVE'
        : input.style === 'intense'
          ? 'SPRINT'
          : 'FOCUS',
    userStage: 'new',
  };
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
      profile.studyLayerName = input.overrideStudyLayerLabel;
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
