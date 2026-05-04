/**
 * Session Start Repository
 *
 * Database persistence for session start features including
 * adaptive difficulty preferences.
 */

import { z } from 'zod';
import { getSupabaseClient } from '../../config/supabase';
import type { DifficultyPreference, SessionDifficulty } from './schemas';

// ============================================================================
// ERROR HANDLING
// ============================================================================

class RepositoryError extends Error {
  constructor(
    public operation: string,
    public originalError: unknown
  ) {
    super(`Repository error in ${operation}: ${originalError}`);
    this.name = 'RepositoryError';
  }
}

// ============================================================================
// DIFFICULTY PREFERENCES
// ============================================================================

/**
 * Get difficulty preference for user
 */
export async function getDifficultyPreference(
  userId: string
): Promise<DifficultyPreference | null> {
  try {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('difficulty_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

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
    console.error('Failed to get difficulty preference:', error);
    return null;
  }
}

/**
 * Save difficulty preference
 */
export async function saveDifficultyPreference(
  preference: DifficultyPreference
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
    console.error('Failed to save difficulty preference:', error);
    throw error;
  }
}

/**
 * Update current difficulty for user
 */
export async function updateCurrentDifficulty(
  userId: string,
  difficulty: SessionDifficulty
): Promise<void> {
  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('difficulty_preferences')
      .upsert({
        user_id: userId,
        current_difficulty: difficulty,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      throw new RepositoryError('updateCurrentDifficulty', error);
    }
  } catch (error) {
    console.error('Failed to update difficulty:', error);
    throw error;
  }
}

// ============================================================================
// RETRY WRAPPER
// ============================================================================

async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3
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
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }
  }

  throw lastError;
}
