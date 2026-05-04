import { useMemo } from 'react';
import * as Sentry from '@sentry/react-native';

import { useSessionHistory } from '../../session/hooks/useSession';
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
  FeatureAccessInputs,
  FeatureAccessMap,
  FeatureKey,
  ProductTier,
  UserExperienceStage,
} from './feature-access';

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
  const history = useSessionHistory(userId, 25);
  const completedSessions = history.history.length;
  const access = useMemo(
    () => buildFeatureAccess({ totalCompletedSessions: completedSessions }),
    [completedSessions],
  );

  return {
    error: history.error,
    features: access.features,
    inputs: { totalCompletedSessions: completedSessions },
    isLoading: history.isLoading,
    productTier: access.productTier,
    refetchAll: history.refresh,
    stage: access.stage,
  };
}

export function useDisclosureAnalytics(): {
  trackFeatureTeaserViewed: (feature: FeatureKey, stage: UserExperienceStage) => void;
  trackLockedFeatureScreenViewed: (feature: FeatureKey, stage: UserExperienceStage) => void;
  trackSocialEmptyStateViewed: (surface: string, stage: UserExperienceStage) => void;
  trackTeaserCtaPressed: (
    feature: FeatureKey,
    label: string,
    stage: UserExperienceStage,
  ) => void;
} {
  return useMemo(
    () => ({
      trackFeatureTeaserViewed(feature, stage) {
        Sentry.addBreadcrumb({
          category: 'liveops-config',
          data: { feature, stage },
          level: 'info',
          message: 'Feature teaser viewed',
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
    }),
    [],
  );
}
