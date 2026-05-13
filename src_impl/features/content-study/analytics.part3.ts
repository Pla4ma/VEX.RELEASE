import { captureSilentFailure } from "../../utils/silent-failure";
import type { ContentStudyAnalyticsEvent, ContentStudyAnalyticsEventName, ContentStudyMetrics, ContentSourceType, ContentStudyErrorCode } from "./types";
import { CONTENT_STUDY_CONSTANTS } from "./types";
import { getDefaultStorageAdapter } from "../../persistence";
import { createDebugger } from "../../utils/debug";
import { useCallback, useRef } from "react";


export async function calculateMetrics(userId: string): Promise<Partial<ContentStudyMetrics>> {
  // This would aggregate data from various sources
  // For now, return placeholder metrics structure
  return {
    totalContentsSubmitted: 0,
    bySourceType: {
      PASTE: 0,
      PDF: 0,
      YOUTUBE: 0,
      URL: 0,
    },
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
  const trackRef = useRef(analytics);
  trackRef.current = analytics;

  const trackEvent = useCallback(<K extends keyof typeof analytics>(event: K, ...args: Parameters<(typeof analytics)[K]>) => {
    const tracker = trackRef.current[event];
    if (tracker) {
      (tracker as (...args: unknown[]) => void)(...args);
    }
  }, []);

  return {
    track: trackEvent,
    analytics: trackRef.current,
    initialize: useCallback(
      (
        userId: string,
        provider?: {
          track: (event: string, properties: Record<string, unknown>) => void;
          identify: (userId: string, traits?: Record<string, unknown>) => void;
        },
      ) => {
        contentStudyAnalytics.initialize(userId, provider);
      },
      [],
    ),
  };
}