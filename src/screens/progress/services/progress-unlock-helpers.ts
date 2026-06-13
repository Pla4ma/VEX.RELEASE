import {
  FEATURE_THRESHOLDS,
  resolveEffectiveThreshold,
} from '../../../features/liveops-config/FeatureFlagService';
import type { MotivationProfile } from '../../../features/liveops-config/feature-access-types';

export function getSessionsUntilStudyUnlock(
  completedSessions: number,
  motivationProfile?: MotivationProfile | null,
): number {
  const baseThreshold = FEATURE_THRESHOLDS.content_study;
  const threshold = resolveEffectiveThreshold(
    'content_study',
    baseThreshold,
    motivationProfile ?? undefined,
  );
  return Math.max(0, threshold - completedSessions);
}
