import { useQuery } from '@tanstack/react-query';

import {
  buildDayZeroStudyPreview,
  computeStudyOsPremiumGate,
  computeStudyOsUnlockGate,
  getManualStudyFallbackMessage,
  isContentStudyBackendAvailable,
} from './service';
import { listStoredStudyPlans } from './repository';
import type { StudyOsPremiumGate, StudyOsUnlockGate } from './schemas';

export function useStudyOsPlans(userId: string | null, enabled = true) {
  const query = useQuery({
    enabled: Boolean(userId) && enabled,
    queryFn: () => listStoredStudyPlans(userId ?? ''),
    queryKey: ['study-os', userId],
  });

  return {
    data: query.data ?? [],
    error: query.error,
    isError: query.isError,
    isPending: query.isPending,
    refetch: query.refetch,
  };
}

export function useStudyOsUnlockGate(input: {
  completedSessions: number;
  studyUsageRatio: number;
  firstWeekPhase?: number;
}): StudyOsUnlockGate {
  return computeStudyOsUnlockGate(input);
}

export function useStudyOsPremiumGate(input: {
  hasPremiumEntitlement: boolean;
  revenueCatHealthy: boolean;
}): StudyOsPremiumGate {
  return computeStudyOsPremiumGate(input);
}

export function useStudyOsBackendAvailable(input: {
  featureHealth: 'healthy' | 'degraded' | 'unavailable';
  aiConfigured: boolean;
  storageConfigured: boolean;
}): boolean {
  return isContentStudyBackendAvailable(input);
}

export function useDayZeroStudyPreview() {
  return buildDayZeroStudyPreview();
}

export function useManualStudyFallback(isOffline: boolean): string {
  return getManualStudyFallbackMessage(isOffline);
}
