import { useMemo } from 'react';
import { useFeatureAccess } from '../liveops-config/hooks/useFeatureAccess';
import type { FeatureKey } from '../liveops-config/feature-access';

interface FeatureVerificationResult {
  feature: FeatureKey;
  isHidden: boolean;
}

const PHASE3_DISABLED_FEATURES: FeatureKey[] = [
  'rivals',
  'rankings',
  'squads',
  'wagers',
  'gems_prominent',
];

export function useFeatureVisibilityGates(): FeatureVerificationResult[] {
  const { features } = useFeatureAccess();

  return useMemo(
    () =>
      PHASE3_DISABLED_FEATURES.map((feature) => ({
        feature,
        isHidden: !features[feature].isVisible,
      })),
    [features],
  );
}

export function getPhase3VerificationSummary(
  results: FeatureVerificationResult[],
): {
  passed: boolean;
  results: FeatureVerificationResult[];
  failedFeatures: string[];
} {
  const failedFeatures = results
    .filter((r) => !r.isHidden)
    .map((r) => r.feature);

  return { passed: failedFeatures.length === 0, results, failedFeatures };
}
