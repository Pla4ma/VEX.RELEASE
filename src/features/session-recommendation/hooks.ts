/**
 * Session Recommendation Hooks
 *
 * Provides hooks for consuming the session recommendation system in React components.
 */

import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store';
import {
  generateSessionRecommendation,
  isRecommendationValid,
  getFallbackRecommendation,
  type SessionRecommendation,
  type SessionRecommendationInput,
} from './service';
import { triggerHaptic } from '../../utils/haptics';

/**
 * Hook for getting the current session recommendation
 */
export function useSessionRecommendation(
  input: Partial<SessionRecommendationInput>,
) {
  const userId = useAuthStore((state) => state.user?.id);

  const recommendationInput: SessionRecommendationInput = useMemo(
    () => ({
      userGoal: input.userGoal,
      recentSessionLength: input.recentSessionLength,
      recentGrade: input.recentGrade,
      timeOfDay: input.timeOfDay ?? new Date().getHours(),
      streakUrgency: input.streakUrgency ?? 'none',
      recoveryStatus: input.recoveryStatus ?? 'none',
      dailyMissionType: input.dailyMissionType,
      isFirstSession: input.isFirstSession ?? false,
      hasActiveSession: input.hasActiveSession ?? false,
      userId: userId ?? '',
    }),
    [input, userId],
  );

  const recommendation = useMemo(() => {
    if (!userId) {
      return null;
    }

    try {
      const rec = generateSessionRecommendation(recommendationInput);

      // If recommendation is invalid, use fallback
      if (!isRecommendationValid(rec)) {
        return getFallbackRecommendation(recommendationInput);
      }

      return rec;
    } catch (error) {
      // Error generating recommendation, use fallback
      return getFallbackRecommendation(recommendationInput);
    }
  }, [recommendationInput, userId]);

  return {
    recommendation,
    isValid: recommendation ? isRecommendationValid(recommendation) : false,
    isBlocked: recommendation?.isBlocked ?? false,
    blockReason: recommendation?.blockReason,
    duration: recommendation?.duration,
    mode: recommendation?.mode,
    reason: recommendation?.reason,
    confidence: recommendation?.confidence,
    isFallback: recommendation?.fallback ?? false,
  };
}

/**
 * Hook for handling session recommendation actions
 */
export function useSessionRecommendationActions() {
  const startRecommendedSession = useCallback(
    (
      recommendation: SessionRecommendation,
      onStartSession: (duration: number, mode: string) => void,
    ) => {
      // Trigger haptic feedback
      triggerHaptic('impactLight');

      // Start the session with recommended parameters
      onStartSession(recommendation.duration, recommendation.mode);
    },
    [],
  );

  const dismissRecommendation = useCallback(
    (recommendation: SessionRecommendation, onDismiss: () => void) => {
      // Trigger haptic feedback
      triggerHaptic('impactLight');

      // Dismiss the recommendation
      onDismiss();
    },
    [],
  );

  return {
    startRecommendedSession,
    dismissRecommendation,
  };
}

/**
 * Hook for getting recommendation analytics data
 */
export function useSessionRecommendationAnalytics(
  recommendation: SessionRecommendation | null,
) {
  return useMemo(() => {
    if (!recommendation) {
      return null;
    }

    return {
      duration: recommendation.duration,
      mode: recommendation.mode,
      reason: recommendation.reason,
      confidence: recommendation.confidence,
      isFallback: recommendation.fallback,
      isBlocked: recommendation.isBlocked,
      blockReason: recommendation.blockReason,
      inputs: recommendation.inputs,
      timestamp: Date.now(),
    };
  }, [recommendation]);
}

/**
 * Query key factory for session recommendation queries
 */
export const sessionRecommendationKeys = {
  all: ['session-recommendation'] as const,
  current: (userId: string) =>
    [...sessionRecommendationKeys.all, 'current', userId] as const,
  analytics: (userId: string) =>
    [...sessionRecommendationKeys.all, 'analytics', userId] as const,
};

/**
 * Hook for fetching recommendation history (for analytics and debugging)
 */
export function useRecommendationHistory(userId: string | null) {
  return useQuery({
    queryKey: sessionRecommendationKeys.analytics(userId ?? ''),
    queryFn: async () => {
      if (!userId) {
        return [];
      }

      // This would typically fetch from a repository
      // For now, return empty array as recommendation history is not persisted
      return [];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 1000 * 60 * 30,
  });
}
