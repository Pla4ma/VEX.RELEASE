// Deep Session-Start Tests – hero-builder
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
import { buildSessionStartHero } from '../hero-builder';

describe('hero-builder', () => {
  describe('buildSessionStartHero', () => {
    it('returns rescue hero for rescue source', () => {
      const result = buildSessionStartHero({
        durationMinutes: 10,
        params: { source: 'rescue', rescueTaskDescription: 'Just 5 minutes' },
        presetName: 'Recovery',
        smartSuggestionDescription: null,
      });
      expect(result.eyebrow).toBe('Rescue Block');
      expect(result.body).toContain('Just 5 minutes');
    });

    it('returns first session hero for onboarding source', () => {
      const result = buildSessionStartHero({
        durationMinutes: 15,
        params: { source: 'onboarding_first_session' },
        presetName: 'Sprint',
        smartSuggestionDescription: null,
      });
      expect(result.eyebrow).toBe('First Session');
      expect(result.title).toContain('15');
    });

    it('returns content-study hero for study source', () => {
      const result = buildSessionStartHero({
        durationMinutes: 25,
        params: { source: 'content-study' },
        presetName: 'Study',
        smartSuggestionDescription: null,
      });
      expect(result.title).toContain('focused block');
    });

    it('returns comeback hero when comebackMultiplier > 1', () => {
      const result = buildSessionStartHero({
        durationMinutes: 15,
        params: { comebackMultiplier: 2.0, comebackMessage: 'Back again!' },
        presetName: 'Sprint',
        smartSuggestionDescription: null,
      });
      expect(result.eyebrow).toBe('Comeback Session');
      expect(result.title).toBe('Back again!');
    });

    it('returns smart suggestion hero when description provided', () => {
      const result = buildSessionStartHero({
        durationMinutes: 25,
        params: {},
        presetName: 'Study',
        smartSuggestionDescription: 'Perfect for your morning focus.',
      });
      expect(result.eyebrow).toBe('Recommended For Today');
    });

    it('returns default fast start hero', () => {
      const result = buildSessionStartHero({
        durationMinutes: 25,
        params: {},
        presetName: 'Focus',
        smartSuggestionDescription: null,
      });
      expect(result.eyebrow).toBe('Fast Start');
    });
  });
});
