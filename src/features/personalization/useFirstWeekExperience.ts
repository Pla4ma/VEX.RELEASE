/**
 * useFirstWeekExperience — runtime hook for the first-week retention arc.
 *
 * Also exports computeFirstWeekExperience for pure-function testing without React.
 */
import { useMemo } from 'react';
import { resolveFirstWeekExperience } from './first-week-service';
import type {
  FirstWeekExperience,
  FirstWeekResolverInput,
} from './first-week-schemas';
import type { MotivationProfileType } from '../liveops-config/feature-access';
import type { LaneProfile } from '../lane-engine/types';

export interface UseFirstWeekInput {
  completedSessions: number;
  daysSinceOnboarding: number;
  daysSinceLastSession: number | null;
  motivationStyle?: MotivationProfileType;
  primaryGoal?: string;
  bossEngagement: 'none' | 'low' | 'medium' | 'high';
  studyUsageRatio: number;
  isPremium: boolean;
  laneProfile?: LaneProfile;
  featureAvailable: {
    boss: boolean;
    premium: boolean;
    social: boolean;
    study: boolean;
  };
}

const VALID_STYLES = ['calm', 'friendly', 'coach_led', 'study_focused', 'game_like', 'intense'] as const;
const VALID_GOALS = ['focus', 'study', 'work', 'creative', 'personal', 'personal_growth', 'learning'] as const;

export function computeFirstWeekExperience(input: UseFirstWeekInput): FirstWeekExperience {
  const {
    completedSessions,
    daysSinceOnboarding,
    daysSinceLastSession,
    motivationStyle,
    primaryGoal,
    bossEngagement,
    studyUsageRatio,
    isPremium,
    laneProfile,
    featureAvailable,
  } = input;

  const style: FirstWeekResolverInput['motivationStyle'] =
    motivationStyle && (VALID_STYLES as readonly string[]).includes(motivationStyle)
      ? motivationStyle as FirstWeekResolverInput['motivationStyle']
      : 'friendly';

  const goal: FirstWeekResolverInput['primaryGoal'] =
    primaryGoal && (VALID_GOALS as readonly string[]).includes(primaryGoal)
      ? primaryGoal as FirstWeekResolverInput['primaryGoal']
      : 'focus';

  const resolverInput: FirstWeekResolverInput = {
    behaviorStats: { bossEngagement, studyUsageRatio },
    completedSessions,
    daysSinceLastSession,
    daysSinceOnboarding,
    featureAvailability: {
      boss: featureAvailable.boss,
      premium: featureAvailable.premium,
      social: featureAvailable.social,
      study: featureAvailable.study,
    },
    laneProfile,
    motivationStyle: style,
    premiumState: isPremium ? 'active' : featureAvailable.premium ? 'configured' : 'unavailable',
    primaryGoal: goal,
  };

  return resolveFirstWeekExperience(resolverInput);
}

export function useFirstWeekExperience(input: UseFirstWeekInput): FirstWeekExperience {
  return useMemo(() => computeFirstWeekExperience(input), [
    input.completedSessions,
    input.daysSinceOnboarding,
    input.daysSinceLastSession,
    input.motivationStyle,
    input.primaryGoal,
    input.bossEngagement,
    input.studyUsageRatio,
    input.isPremium,
    input.laneProfile,
    input.featureAvailable.boss,
    input.featureAvailable.premium,
    input.featureAvailable.social,
    input.featureAvailable.study,
  ]);
}
