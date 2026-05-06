/**
 * useAdaptiveDifficulty Hook
 *
 * React hook for accessing adaptive difficulty suggestions.
 * Fetches recent session history and generates personalized
 * difficulty recommendations.
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import * as Sentry from '@sentry/react-native';
import { getAdaptiveDifficultySuggestion, shouldShowSuggestion } from '../service/adaptiveDifficulty';
import { getDifficultyPreference, saveDifficultyPreference, updateCurrentDifficulty } from '../repository';
import {
  trackDifficultySuggestionShown,
  trackDifficultySuggestionAccepted,
  trackDifficultySuggestionDismissed,
} from '../analytics';
import type { DifficultySuggestion, SessionDifficulty } from '../schemas';

// Local type definition for session data
interface SessionData {
  id: string;
  grade?: string;
  purityScore?: number;
  duration?: number;
  createdAt?: string;
}

interface UseAdaptiveDifficultyReturn {
  suggestion: DifficultySuggestion | null;
  showSuggestion: boolean;
  dismissSuggestion: () => void;
  acceptSuggestion: () => void;
  isLoading: boolean;
}

const STORAGE_KEY_PREFIX = 'adaptive_difficulty_dismissed_';

export function useAdaptiveDifficulty(
  userId: string | null,
  currentDifficulty: SessionDifficulty,
  recentSessions: SessionData[]
): UseAdaptiveDifficultyReturn {
  const [dismissedAt, setDismissedAt] = useState<number | null>(null);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load dismissed timestamp from storage
  useEffect(() => {
    if (!userId) {
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY_PREFIX + userId);
    if (stored) {
      setDismissedAt(parseInt(stored, 10));
    }
  }, [userId]);

  // Generate suggestion
  const suggestion = useMemo(() => {
    if (!recentSessions || recentSessions.length === 0) {
      return null;
    }

    return getAdaptiveDifficultySuggestion(recentSessions, currentDifficulty);
  }, [recentSessions, currentDifficulty]);

  // Check if suggestion should be shown
  const showSuggestion = useMemo(() => {
    if (!suggestion || !suggestion.suggestion) {
      return false;
    }

    if (hasAccepted) {
      return false;
    }

    return shouldShowSuggestion(dismissedAt);
  }, [suggestion, dismissedAt, hasAccepted]);

  // Track when suggestion becomes visible
  useEffect(() => {
    if (showSuggestion && suggestion?.suggestion && userId) {
      trackDifficultySuggestionShown(
        userId,
        currentDifficulty,
        suggestion.suggestion,
        suggestion.confidence
      );
    }
  }, [showSuggestion, suggestion, userId, currentDifficulty]);

  // Dismiss the suggestion
  const dismissSuggestion = useCallback(async () => {
    const now = Date.now();
    setDismissedAt(now);

    if (!userId || !suggestion?.suggestion) {
      return;
    }

    // Track analytics
    trackDifficultySuggestionDismissed(userId, suggestion.suggestion);

    // Persist dismissal
    try {
      const preference = await getDifficultyPreference(userId);
      if (preference) {
        await saveDifficultyPreference({
          ...preference,
          suggestionDismissedAt: now,
        });
      }

      localStorage.setItem(STORAGE_KEY_PREFIX + userId, now.toString());
    } catch (error) {
      Sentry.captureException(error, {
        tags: { feature: 'session-start', operation: 'persist-difficulty-dismissal' },
      });
    }
  }, [userId, suggestion]);

  // Accept the suggestion
  const acceptSuggestion = useCallback(async () => {
    if (!suggestion?.suggestion || !userId) {
      return;
    }

    setHasAccepted(true);
    setIsLoading(true);

    try {
      // Track analytics
      trackDifficultySuggestionAccepted(
        userId,
        currentDifficulty,
        suggestion.suggestion,
        suggestion.stats
      );

      // Persist the change
      await updateCurrentDifficulty(userId, suggestion.suggestion);

      // Update preference record
      const preference = await getDifficultyPreference(userId);
      if (preference) {
        await saveDifficultyPreference({
          ...preference,
          currentDifficulty: suggestion.suggestion,
          timesAccepted: preference.timesAccepted + 1,
        });
      }
    } catch (error) {
      Sentry.captureException(error, {
        tags: { feature: 'session-start', operation: 'accept-difficulty-suggestion' },
      });
    } finally {
      setIsLoading(false);
    }
  }, [suggestion, userId, currentDifficulty]);

  return {
    suggestion,
    showSuggestion,
    dismissSuggestion,
    acceptSuggestion,
    isLoading,
  };
}
