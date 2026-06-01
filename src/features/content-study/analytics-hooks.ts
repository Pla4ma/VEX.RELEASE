/**
 * Content Study Analytics Hooks & Helpers
 *
 * React hook for analytics tracking and metrics calculation.
 */

import { useCallback, useRef } from 'react';
import type { ContentStudyMetrics, ContentStudyErrorCode } from './types';
import { inputTrackers } from './analytics-input-trackers';
import { studyTrackers } from './analytics-study-trackers';
import { contentStudyAnalytics } from './analytics-service';

const composedAnalytics = { ...inputTrackers, ...studyTrackers };

export async function calculateMetrics(
  userId: string,
): Promise<Partial<ContentStudyMetrics>> {
  return {
    totalContentsSubmitted: 0,
    bySourceType: { PASTE: 0, PDF: 0, YOUTUBE: 0, URL: 0 },
    averageContentLength: 0,
    averageExtractionTime: 0,
    extractionSuccessRate: 0,
    totalGenerations: 0,
    averageGenerationTime: 0,
    generationSuccessRate: 0,
    averageTasksPerGeneration: 0,
    averageQuizItemsPerGeneration: 0,
    averageSessionDuration: 0,
    taskCompletionRate: 0,
    quizAccuracyRate: 0,
    averageUserRating: 0,
    returnRate: 0,
    errorRateByType: {} as Record<ContentStudyErrorCode, number>,
    retrySuccessRate: 0,
  };
}

export function useContentStudyAnalytics() {
  const trackRef = useRef(composedAnalytics);
  trackRef.current = composedAnalytics;

  const trackEvent = useCallback(
    <K extends keyof typeof composedAnalytics>(
      event: K,
      ...args: Parameters<(typeof composedAnalytics)[K]>
    ) => {
      const tracker = trackRef.current[event];
      if (tracker) {
        (tracker as (...args: unknown[]) => void)(...args);
      }
    },
    [],
  );

  return {
    track: trackEvent,
    analytics: trackRef.current,
    initialize: useCallback(
      (
        userId: string,
        provider?: {
          track: (
            event: string,
            properties: Record<string, unknown>,
          ) => void;
          identify: (
            userId: string,
            traits?: Record<string, unknown>,
          ) => void;
        },
      ) => {
        contentStudyAnalytics.initialize(userId, provider);
      },
      [],
    ),
  };
}
