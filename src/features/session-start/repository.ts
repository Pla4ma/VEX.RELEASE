/**
 * Session Start Repository
 *
 * Database persistence for session start features including
 * adaptive difficulty preferences.
 */

import * as Sentry from '@sentry/react-native';
import { getSupabaseClient } from '../../config/supabase';
import { RepositoryError } from '../../lib/repository/error-handling';
import type { DifficultyPreference, SessionDifficulty } from './schemas';

// ============================================================================
// DIFFICULTY PREFERENCES
// ============================================================================

/**
 * Get difficulty preference for user
 */
export async function getDifficultyPreference(
  userId: string,
): Promise<DifficultyPreference | null> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('difficulty_preferences')
      .select('user_id,current_difficulty,suggested_difficulty,last_suggestion_at,suggestion_dismissed_at,times_shown,times_accepted,updated_at')      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No preference found
      }
      throw new RepositoryError('getDifficultyPreference', error);
    }

    return {
      userId: data.user_id,
      currentDifficulty: data.current_difficulty,
      suggestedDifficulty: data.suggested_difficulty,
      lastSuggestionAt: data.last_suggestion_at,
      suggestionDismissedAt: data.suggestion_dismissed_at,
      timesShown: data.times_shown,
      timesAccepted: data.times_accepted,
    };
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        feature: 'session-start',
        operation: 'get-difficulty-preference',
      },
    });
    return null;
  }
}

/**
 * Save difficulty preference
 */
export async function saveDifficultyPreference(
  preference: DifficultyPreference,
): Promise<void> {
  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase.from('difficulty_preferences').upsert({
      user_id: preference.userId,
      current_difficulty: preference.currentDifficulty,
      suggested_difficulty: preference.suggestedDifficulty,
      last_suggestion_at: preference.lastSuggestionAt,
      suggestion_dismissed_at: preference.suggestionDismissedAt,
      times_shown: preference.timesShown,
      times_accepted: preference.timesAccepted,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      throw new RepositoryError('saveDifficultyPreference', error);
    }
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        feature: 'session-start',
        operation: 'save-difficulty-preference',
      },
    });
    throw error;
  }
}

/**
 * Update current difficulty for user
 */
export async function updateCurrentDifficulty(
  userId: string,
  difficulty: SessionDifficulty,
): Promise<void> {
  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase.from('difficulty_preferences').upsert({
      user_id: userId,
      current_difficulty: difficulty,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      throw new RepositoryError('updateCurrentDifficulty', error);
    }
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        feature: 'session-start',
        operation: 'update-current-difficulty',
      },
    });
    throw error;
  }
}

// ============================================================================
// RETRY WRAPPER
// ============================================================================

async function _withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) {
        throw error;
      }
      // Exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)),
      );
    }
  }

  throw lastError;
}
