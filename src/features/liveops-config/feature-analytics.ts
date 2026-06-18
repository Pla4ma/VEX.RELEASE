import { useMemo } from 'react';
import * as Sentry from '@sentry/react-native';
import type { FeatureKey, UserExperienceStage } from './feature-access';
import { hashUserId } from '../../utils/sentry-privacy';


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
          data: { source, userId: hashUserId(userId ?? '') },
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
          data: { count, userId: hashUserId(userId) },
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
          data: { userId: hashUserId(userId) },
          level: 'info',
          message: 'Onboarding started',
        });
      },
      trackOnboardingFirstSessionCompleted(userId) {
        Sentry.addBreadcrumb({
          category: 'onboarding',
          data: { userId: hashUserId(userId) },
          level: 'info',
          message: 'First session completed during onboarding',
        });
      },
      trackOnboardingCompleted(userId) {
        Sentry.addBreadcrumb({
          category: 'onboarding',
          data: { userId: hashUserId(userId) },
          level: 'info',
          message: 'Onboarding completed',
        });
      },
      trackOnboardingGoalSet(userId, goal) {
        Sentry.addBreadcrumb({
          category: 'onboarding',
          data: { goal, userId: hashUserId(userId) },
          level: 'info',
          message: 'Onboarding goal set',
        });
      },
    }),
    [],
  );
}
