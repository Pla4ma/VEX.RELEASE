// Deep Session-Start Tests – session-start analytics
// ── Mocks ──────────────────────────────────────────────────────────────────
jest.mock('../../../shared/analytics/analytics-service', () => ({
  capture: jest.fn(),
}));
jest.mock('../../../config/supabase', () => ({
  getSupabaseClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      upsert: jest.fn(() => Promise.resolve({ error: null })),
    })),
  })),
}));
jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
  addBreadcrumb: jest.fn(),
}));
jest.mock('../../boss/repository', () => ({
  fetchBossTemplate: jest.fn(() => Promise.resolve(null)),
  fetchActiveEncounter: jest.fn(() => Promise.resolve(null)),
}));
jest.mock('../../challenges/repository', () => ({
  fetchActiveChallengeDetails: jest.fn(() => Promise.resolve([])),
}));
jest.mock('../../streaks/repository', () => ({
  fetchStreak: jest.fn(() => Promise.resolve(null)),
}));
jest.mock('../../../session/modes', () => {
  const { z } = require('zod');
  return {
    SessionMode: {
      STUDY: 'STUDY',
      SPRINT: 'SPRINT',
      CREATIVE: 'CREATIVE',
      LIGHT_FOCUS: 'LIGHT_FOCUS',
      RECOVERY: 'RECOVERY',
    },
    SessionModeSchema: z.enum(['STUDY', 'SPRINT', 'CREATIVE', 'LIGHT_FOCUS', 'RECOVERY']),
  };
});
jest.mock('../../lane-engine/schemas', () => {
  const { z } = require('zod');
  return {
    LaneSchema: z.enum(['student', 'game_like', 'deep_creative', 'minimal_normal']),
  };
});

// ── Imports ────────────────────────────────────────────────────────────────
import {
  trackDifficultySuggestionShown,
  trackDifficultySuggestionAccepted,
  trackDifficultySuggestionDismissed,
  trackDifficultyChanged,
  trackInsufficientSessionsForSuggestion,
} from '../analytics';

// ============================================================================

describe('session-start analytics', () => {
  it('trackDifficultySuggestionShown calls capture', () => {
    trackDifficultySuggestionShown('u1', 'CASUAL', 'FOCUSED', 'high');
    const { capture } = require('../../../shared/analytics/analytics-service');
    expect(capture).toHaveBeenCalledWith(
      'difficulty_suggestion_shown',
      expect.objectContaining({
        user_id: 'u1',
        current_difficulty: 'CASUAL',
        suggested_difficulty: 'FOCUSED',
      }),
    );
  });

  it('trackDifficultySuggestionAccepted calls capture', () => {
    trackDifficultySuggestionAccepted('u1', 'CASUAL', 'FOCUSED', {
      sessionsAnalyzed: 5,
      averageGrade: 4.5,
      averagePurity: 90,
    });
    const { capture } = require('../../../shared/analytics/analytics-service');
    expect(capture).toHaveBeenCalledWith(
      'difficulty_suggestion_accepted',
      expect.objectContaining({ user_id: 'u1' }),
    );
  });

  it('trackDifficultySuggestionDismissed calls capture', () => {
    trackDifficultySuggestionDismissed('u1', 'FOCUSED');
    const { capture } = require('../../../shared/analytics/analytics-service');
    expect(capture).toHaveBeenCalledWith(
      'difficulty_suggestion_dismissed',
      expect.objectContaining({ user_id: 'u1' }),
    );
  });

  it('trackDifficultyChanged calls capture', () => {
    trackDifficultyChanged('u1', 'CASUAL', 'FOCUSED', 'manual');
    const { capture } = require('../../../shared/analytics/analytics-service');
    expect(capture).toHaveBeenCalledWith(
      'difficulty_changed',
      expect.objectContaining({ source: 'manual' }),
    );
  });

  it('trackInsufficientSessionsForSuggestion calls capture', () => {
    trackInsufficientSessionsForSuggestion('u1', 2, 5);
    const { capture } = require('../../../shared/analytics/analytics-service');
    expect(capture).toHaveBeenCalledWith(
      'difficulty_suggestion_insufficient_sessions',
      expect.objectContaining({ sessions_count: 2, required_count: 5 }),
    );
  });
});
