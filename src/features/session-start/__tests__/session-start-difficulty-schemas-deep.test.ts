// Deep Session-Start Tests – difficulty-schemas
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
  SessionDifficultySchema,
  DifficultySuggestionStatsSchema,
  DifficultyPreferenceSchema,
} from '../difficulty-schemas';

// ============================================================================

describe('difficulty-schemas', () => {
  describe('SessionDifficultySchema', () => {
    it('accepts CASUAL', () => {
      expect(SessionDifficultySchema.parse('CASUAL')).toBe('CASUAL');
    });

    it('accepts FOCUSED', () => {
      expect(SessionDifficultySchema.parse('FOCUSED')).toBe('FOCUSED');
    });

    it('accepts INTENSE', () => {
      expect(SessionDifficultySchema.parse('INTENSE')).toBe('INTENSE');
    });

    it('rejects invalid value', () => {
      expect(() => SessionDifficultySchema.parse('EASY')).toThrow();
    });
  });

  describe('DifficultySuggestionStatsSchema', () => {
    it('parses valid stats', () => {
      const result = DifficultySuggestionStatsSchema.parse({
        sessionsAnalyzed: 5,
        averageGrade: 4.0,
        averagePurity: 80,
      });
      expect(result.sessionsAnalyzed).toBe(5);
    });

    it('rejects negative sessionsAnalyzed', () => {
      expect(() =>
        DifficultySuggestionStatsSchema.parse({
          sessionsAnalyzed: -1,
          averageGrade: 4.0,
          averagePurity: 80,
        }),
      ).toThrow();
    });
  });

  describe('DifficultyPreferenceSchema', () => {
    it('parses valid preference with defaults', () => {
      const result = DifficultyPreferenceSchema.parse({
        userId: '550e8400-e29b-41d4-a716-446655440000',
        currentDifficulty: 'CASUAL',
        suggestedDifficulty: null,
      });
      expect(result.timesShown).toBe(0);
      expect(result.timesAccepted).toBe(0);
    });
  });
});
