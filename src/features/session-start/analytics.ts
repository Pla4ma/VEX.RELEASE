/**
 * Session Start Analytics
 *
 * Analytics tracking for session start features including
 * adaptive difficulty suggestions.
 */

import { capture } from '../../shared/analytics/analytics-service';
import type { SessionDifficulty } from './schemas';

/**
 * Track difficulty suggestion shown
 */
export function trackDifficultySuggestionShown(
  userId: string,
  currentDifficulty: SessionDifficulty,
  suggestedDifficulty: SessionDifficulty,
  confidence: string,
): void {
  capture('difficulty_suggestion_shown', {
    user_id: userId,
    current_difficulty: currentDifficulty,
    suggested_difficulty: suggestedDifficulty,
    confidence,
    timestamp: Date.now(),
  });
}

/**
 * Track difficulty suggestion accepted
 */
export function trackDifficultySuggestionAccepted(
  userId: string,
  fromDifficulty: SessionDifficulty,
  toDifficulty: SessionDifficulty,
  stats: {
    sessionsAnalyzed: number;
    averageGrade: number;
    averagePurity: number;
  },
): void {
  capture('difficulty_suggestion_accepted', {
    user_id: userId,
    from_difficulty: fromDifficulty,
    to_difficulty: toDifficulty,
    sessions_analyzed: stats.sessionsAnalyzed,
    average_grade: stats.averageGrade,
    average_purity: stats.averagePurity,
    timestamp: Date.now(),
  });
}

/**
 * Track difficulty suggestion dismissed
 */
export function trackDifficultySuggestionDismissed(
  userId: string,
  suggestedDifficulty: SessionDifficulty,
): void {
  capture('difficulty_suggestion_dismissed', {
    user_id: userId,
    suggested_difficulty: suggestedDifficulty,
    timestamp: Date.now(),
  });
}

/**
 * Track manual difficulty change
 */
export function trackDifficultyChanged(
  userId: string,
  fromDifficulty: SessionDifficulty,
  toDifficulty: SessionDifficulty,
  source: 'suggestion' | 'manual',
): void {
  capture('difficulty_changed', {
    user_id: userId,
    from_difficulty: fromDifficulty,
    to_difficulty: toDifficulty,
    source,
    timestamp: Date.now(),
  });
}

/**
 * Track not enough sessions for suggestion
 */
export function trackInsufficientSessionsForSuggestion(
  userId: string,
  sessionsCount: number,
  requiredCount: number,
): void {
  capture('difficulty_suggestion_insufficient_sessions', {
    user_id: userId,
    sessions_count: sessionsCount,
    required_count: requiredCount,
    timestamp: Date.now(),
  });
}
