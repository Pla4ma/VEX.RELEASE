/**
 * useAdaptiveDifficulty Hook
 *
 * React hook for accessing adaptive difficulty suggestions.
 * Fetches recent session history and generates personalized
 * difficulty recommendations.
 */

import { useEffect, useState, useMemo, useCallback } from 'react';
import * as Sentry from '@sentry/react-native';
import {
  getAdaptiveDifficultySuggestion,
  shouldShowSuggestion,
} from '../service/adaptiveDifficulty';
import {
  getDifficultyPreference,
  saveDifficultyPreference,
  updateCurrentDifficulty,
} from '../repository';
import {
  trackDifficultySuggestionShown,
  trackDifficultySuggestionAccepted,
  trackDifficultySuggestionDismissed,
} from '../analytics';
import type { DifficultySuggestion, SessionDifficulty } from '../schemas';
import { MMKVStorageAdapter } from '../../../persistence/MMKVStorageAdapter';

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
const dismissStorage = new MMKVStorageAdapter('adaptive-difficulty');

export function useAdaptiveDifficulty(
  userId: string | null,
  currentDifficulty: SessionDifficulty,
  recentSessions: SessionData[],
): UseAdaptiveDifficultyReturn {
  const [dismissedAt, setDismissedAt] = useState<number | null>(null);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // SAFETY: async I/O to load persisted dismissal timestamp; must run as effect
  useEffect(() => {
    if (!userId) {
      return;
    }
    const stored = dismissStorage.getItemSync(STORAGE_KEY_PREFIX + userId);
    if (stored) {
      setDismissedAt(parseInt(stored, 10));
    }
  }, [userId]);

  // Compute suggestion with useMemo instead of storing in separate effect+useState
  const suggestion = useMemo(() => {
    if (!recentSessions || recentSessions.length === 0) {
      return null;
    }
    return getAdaptiveDifficultySuggestion(recentSessions, currentDifficulty);
  }, [recentSessions, currentDifficulty]);

  // Compute visibility from suggestion, dismissal state, and acceptance — no separate state needed
  const showSuggestion = useMemo(() => {
    if (!suggestion || !suggestion.suggestion) {
      return false;
    }
    if (hasAccepted) {
      return false;
    }
    return shouldShowSuggestion(dismissedAt);
  }, [suggestion, dismissedAt, hasAccepted]);

  // SAFETY: analytics tracking for visibility is a fire-and-forget side effect
  useEffect(() => {
    if (showSuggestion && suggestion?.suggestion && userId) {
      trackDifficultySuggestionShown(
        userId,
        currentDifficulty,
        suggestion.suggestion,
        suggestion.confidence,
      );
    }
  }, [showSuggestion, suggestion, userId, currentDifficulty]);

  const dismissSuggestion = useCallback(() => {
    const now = Date.now();
    setDismissedAt(now);

    if (!userId || !suggestion?.suggestion) {
      return;
    }

    // SAFETY: analytics + persistence are fire-and-forget side effects in callback
    trackDifficultySuggestionDismissed(userId, suggestion.suggestion);

    (async () => {
      try {
        const preference = await getDifficultyPreference(userId);
        if (preference) {
          await saveDifficultyPreference({
            ...preference,
            suggestionDismissedAt: now,
          });
        }
        dismissStorage.setItemSync(STORAGE_KEY_PREFIX + userId, now.toString());
      } catch (error) {
        Sentry.captureException(error, {
          tags: {
            feature: 'session-start',
            operation: 'persist-difficulty-dismissal',
          },
        });
      }
    })();
  }, [userId, suggestion]);

  const acceptSuggestion = useCallback(() => {
    if (!suggestion?.suggestion || !userId) {
      return;
    }

    setHasAccepted(true);
    setIsLoading(true);

    // SAFETY: analytics + persistence are fire-and-forget side effects in callback
    trackDifficultySuggestionAccepted(
      userId,
      currentDifficulty,
      suggestion.suggestion,
      suggestion.stats,
    );

    (async () => {
      try {
        await updateCurrentDifficulty(userId, suggestion.suggestion!);
        const preference = await getDifficultyPreference(userId);
        if (preference) {
          await saveDifficultyPreference({
            ...preference,
            currentDifficulty: suggestion.suggestion!,
            timesAccepted: preference.timesAccepted + 1,
          });
        }
      } catch (error) {
        Sentry.captureException(error, {
          tags: {
            feature: 'session-start',
            operation: 'accept-difficulty-suggestion',
          },
        });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [suggestion, userId, currentDifficulty]);

  return {
    suggestion,
    showSuggestion,
    dismissSuggestion,
    acceptSuggestion,
    isLoading,
  };
}
