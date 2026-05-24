import type { FeatureKey, MotivationProfileType } from './feature-access';

export interface MotivationProfileConfig {
  /** Profiles that unlock this feature earlier */
  accelerate: MotivationProfileType[];
  /** Sessions subtracted from threshold for accelerated profiles */
  accelerateOffset: number;
  /** Profiles that delay or hide this feature */
  restrict: MotivationProfileType[];
  /** Sessions added to threshold for restricted profiles */
  restrictOffset: number;
  /** Whether to hide the feature entirely for restricted profiles until a minimum session count */
  restrictVisibility?: boolean;
  /** Minimum sessions before restricted profiles can even see the feature */
  restrictVisibilityMin?: number;
}

export const FEATURE_MOTIVATION_PROFILES: Partial<
  Record<FeatureKey, MotivationProfileConfig>
> = {
  boss_tab: {
    accelerate: ['game_like', 'intense', 'competitive'],
    accelerateOffset: 2,
    restrict: ['calm', 'student'],
    restrictOffset: 8,
    restrictVisibility: true,
    restrictVisibilityMin: 20,
  },
  content_study: {
    accelerate: ['student', 'creator'],
    accelerateOffset: 7,
    restrict: ['calm'],
    restrictOffset: 6,
  },
  content_study_advanced: {
    accelerate: ['student'],
    accelerateOffset: 6,
    restrict: ['calm'],
    restrictOffset: 10,
  },
  challenges: {
    accelerate: ['game_like', 'intense', 'competitive'],
    accelerateOffset: 2,
    restrict: ['calm'],
    restrictOffset: 5,
    restrictVisibility: true,
    restrictVisibilityMin: 8,
  },
  ai_coach_advanced: {
    accelerate: ['student', 'worker', 'coach_led', 'intense'],
    accelerateOffset: 2,
    restrict: ['calm'],
    restrictOffset: 3,
  },
  economy_basic: {
    accelerate: ['game_like', 'competitive'],
    accelerateOffset: 1,
    restrict: ['calm', 'friendly'],
    restrictOffset: 2,
    restrictVisibility: true,
    restrictVisibilityMin: 12,
  },
  companion_detail: {
    accelerate: ['friendly', 'calm', 'student'],
    accelerateOffset: 1,
    restrict: ['intense'],
    restrictOffset: 1,
  },
};
