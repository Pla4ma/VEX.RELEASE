import { useMemo } from 'react';
import * as Sentry from '@sentry/react-native';

import { useSessionStats } from '../../session/hooks/useSession';
import { useAuthStore } from '../../store';
import {
  buildFeatureAccess,
  type FeatureAccessMap,
  type FeatureKey,
  type ProductTier,
  type UserExperienceStage,
} from './feature-access';

export type {
  FeatureAccess,
  FeatureAvailability,
  FeatureAvailabilityState,
  FeatureAccessInputs,
  FeatureAccessMap,
  FeatureKey,
  ProductTier,
  UserExperienceStage,
} from './feature-access';
export { getFeatureAvailability } from './feature-access';

export interface FeatureAccessResult {
  error: Error | null;
  features: FeatureAccessMap;
  inputs: { totalCompletedSessions: number };
  isLoading: boolean;
  productTier: ProductTier;
  refetchAll: () => Promise<unknown>;
  stage: UserExperienceStage;
}

export function useFeatureAccess(): FeatureAccessResult {
  const userId = useAuthStore((state) => state.user?.id ?? '');
  const stats = useSessionStats(userId);
  const completedSessions = stats.stats?.completedSessions ?? 0;
  const access = useMemo(
    () => buildFeatureAccess({ totalCompletedSessions: completedSessions }),
    [completedSessions],
  );

  return {
    error: null,
    features: access.features,
    inputs: { totalCompletedSessions: completedSessions },
    isLoading: stats.isLoading,
    productTier: access.productTier,
    refetchAll: stats.refresh,
    stage: access.stage,
  };
}

export function useDisclosureAnalytics(): {
  trackFeatureUnlocked: (
    feature: FeatureKey,
    stage: UserExperienceStage,
  ) => void;
  trackFeatureTeaserViewed: (
    feature: FeatureKey,
    stage: UserExperienceStage,
  ) => void;
  trackFirstSessionStarted: (userId: string | null, source: string) => void;
  trackLockedFeatureScreenViewed: (
    feature: FeatureKey,
    stage: UserExperienceStage,
  ) => void;
  trackNextBestActionPressed: (
    stage: UserExperienceStage,
    completedSessions: number,
  ) => void;
  trackSessionMilestone: (userId: string, count: number) => void;
  trackSocialEmptyStateViewed: (
    surface: string,
    stage: UserExperienceStage,
  ) => void;
  trackTeaserCtaPressed: (
    feature: FeatureKey,
    label: string,
    stage: UserExperienceStage,
  ) => void;
  // Onboarding tracking
  trackOnboardingStarted: (userId: string) => void;
  trackOnboardingFirstSessionCompleted: (userId: string) => void;
  trackOnboardingCompleted: (userId: string) => void;
  trackOnboardingGoalSet: (userId: string, goal: unknown) => void;
} {
  return useMemo(
    () => ({
      trackFeatureUnlocked(feature, stage) {
        Sentry.addBreadcrumb({
          category: 'liveops-config',
          data: { feature, stage },
          level: 'info',
          message: 'Feature unlocked',
        });
      },
      trackFeatureTeaserViewed(feature, stage) {
        Sentry.addBreadcrumb({
          category: 'liveops-config',
          data: { feature, stage },
          level: 'info',
          message: 'Feature teaser viewed',
        });
      },
      trackFirstSessionStarted(userId, source) {
        Sentry.addBreadcrumb({
          category: 'home',
          data: { source, userId },
          level: 'info',
          message: 'First session started',
        });
      },
      trackLockedFeatureScreenViewed(feature, stage) {
        Sentry.addBreadcrumb({
          category: 'liveops-config',
          data: { feature, stage },
          level: 'info',
          message: 'Locked feature screen viewed',
        });
      },
      trackNextBestActionPressed(stage, completedSessions) {
        Sentry.addBreadcrumb({
          category: 'home',
          data: { completedSessions, stage },
          level: 'info',
          message: 'Next best action pressed',
        });
      },
      trackSessionMilestone(userId, count) {
        Sentry.addBreadcrumb({
          category: 'home',
          data: { count, userId },
          level: 'info',
          message: 'Session milestone reached',
        });
      },
      trackSocialEmptyStateViewed(surface, stage) {
        Sentry.addBreadcrumb({
          category: 'liveops-config',
          data: { stage, surface },
          level: 'info',
          message: 'Social empty state viewed',
        });
      },
      trackTeaserCtaPressed(feature, label, stage) {
        Sentry.addBreadcrumb({
          category: 'liveops-config',
          data: { feature, label, stage },
          level: 'info',
          message: 'Feature teaser CTA pressed',
        });
      },
      trackOnboardingStarted(userId) {
        Sentry.addBreadcrumb({
          category: 'onboarding',
          data: { userId },
          level: 'info',
          message: 'Onboarding started',
        });
      },
      trackOnboardingFirstSessionCompleted(userId) {
        Sentry.addBreadcrumb({
          category: 'onboarding',
          data: { userId },
          level: 'info',
          message: 'First session completed during onboarding',
        });
      },
      trackOnboardingCompleted(userId) {
        Sentry.addBreadcrumb({
          category: 'onboarding',
          data: { userId },
          level: 'info',
          message: 'Onboarding completed',
        });
      },
      trackOnboardingGoalSet(userId, goal) {
        Sentry.addBreadcrumb({
          category: 'onboarding',
          data: { goal, userId },
          level: 'info',
          message: 'Onboarding goal set',
        });
      },
    }),
    [],
  );
}
