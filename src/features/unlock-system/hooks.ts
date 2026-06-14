import { useQuery, useQueryClient } from '@tanstack/react-query';
import { computeCompositeScore, checkFeatureUnlock, getEffectiveThreshold } from './service';
import type { UnlockSignal, CompositeScore, FeatureUnlockState } from './types';

export function useUnlockSignals(userId: string | null) {
  return useQuery({
    queryKey: ['unlock', 'signals', userId],
    queryFn: () => {
      // In production, this would fetch from a persistent store
      return Promise.resolve([] as UnlockSignal[]);
    },
    enabled: !!userId,
  });
}

export function useCompositeScore(userId: string | null) {
  return useQuery({
    queryKey: ['unlock', 'score', userId],
    queryFn: () => {
      // In production, fetch signals and compute
      return Promise.resolve({
        total: 0,
        sessionScore: 0,
        planScore: 0,
        captureScore: 0,
        coachScore: 0,
        streakScore: 0,
        signalsUsed: 0,
      } as CompositeScore);
    },
    enabled: !!userId,
  });
}

export function useFeatureUnlockState(
  userId: string | null,
  featureId: string,
  lane: string | null,
) {
  return useQuery({
    queryKey: ['unlock', 'feature', userId, featureId, lane],
    queryFn: () => {
      const score: CompositeScore = {
        total: 0,
        sessionScore: 0,
        planScore: 0,
        captureScore: 0,
        coachScore: 0,
        streakScore: 0,
        signalsUsed: 0,
      };
      return checkFeatureUnlock(featureId, score, lane);
    },
    enabled: !!userId,
  });
}

export function useInvalidateUnlockQueries() {
  const queryClient = useQueryClient();
  return {
    invalidate: () => {
      queryClient.invalidateQueries({ queryKey: ['unlock'] });
    },
  };
}
