import {
  buildFeatureAccess,
  getFeatureAvailability,
  type FeatureAvailability,
  type MotivationProfile,
} from '../../feature-access';
import { buildRootExposureFlags } from '../../../../navigation/feature-exposure';
import { buildHomeFeatureRuntime } from '../../../../screens/home/hooks/home-feature-runtime';

export const allFlagsOn = (): boolean => true;

export function availabilityFor(
  sessions: number,
  feature: string,
  profile?: MotivationProfile,
): FeatureAvailability {
  const { features } = buildFeatureAccess({
    totalCompletedSessions: sessions,
    motivationProfile: profile,
  });
  const key = feature as keyof typeof features;
  return getFeatureAvailability(features[key]);
}

export const STUDENT_PROFILE: MotivationProfile = {
  primary: 'student',
  secondary: ['calm', 'creator'],
};

export const GAMER_PROFILE: MotivationProfile = {
  primary: 'game_like',
  secondary: ['intense', 'competitive'],
};

export const CALM_PROFILE: MotivationProfile = {
  primary: 'calm',
  secondary: ['friendly'],
};

export const WORKER_PROFILE: MotivationProfile = {
  primary: 'worker',
  secondary: ['calm', 'student'],
};

export const INTENSE_PROFILE: MotivationProfile = {
  primary: 'intense',
  secondary: ['competitive', 'game_like'],
};

export {
  buildFeatureAccess,
  getFeatureAvailability,
  buildRootExposureFlags,
  buildHomeFeatureRuntime,
};
