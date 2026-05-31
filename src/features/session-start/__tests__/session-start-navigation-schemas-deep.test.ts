// Deep Session-Start Tests – navigation-schemas
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
  SessionSetupNavigationParamsSchema,
  SessionStartSummarySchema,
  SessionStartHeroSchema,
  FocusModeCardSchema,
  SESSION_SETUP_SOURCE_ONBOARDING,
} from '../navigation-schemas';

// ============================================================================

describe('navigation-schemas', () => {
  describe('SessionSetupNavigationParamsSchema', () => {
    it('parses empty object', () => {
      const result = SessionSetupNavigationParamsSchema.parse({});
      expect(result).toEqual({});
    });

    it('parses presetId and presetDuration', () => {
      const result = SessionSetupNavigationParamsSchema.parse({
        presetId: 'sprint-15',
        presetDuration: 900,
      });
      expect(result.presetId).toBe('sprint-15');
      expect(result.presetDuration).toBe(900);
    });

    it('accepts valid presetMode', () => {
      const result = SessionSetupNavigationParamsSchema.parse({
        presetMode: 'SPRINT',
      });
      expect(result.presetMode).toBe('SPRINT');
    });

    it('rejects invalid presetMode', () => {
      expect(() =>
        SessionSetupNavigationParamsSchema.parse({
          presetMode: 'INVALID',
        }),
      ).toThrow();
    });

    it('accepts comeback fields', () => {
      const result = SessionSetupNavigationParamsSchema.parse({
        comebackMultiplier: 2.0,
        comebackMessage: 'Welcome back!',
      });
      expect(result.comebackMultiplier).toBe(2.0);
    });

    it('accepts source field', () => {
      const result = SessionSetupNavigationParamsSchema.parse({
        source: 'rescue',
      });
      expect(result.source).toBe('rescue');
    });
  });

  describe('SESSION_SETUP_SOURCE_ONBOARDING', () => {
    it('equals onboarding_first_session', () => {
      expect(SESSION_SETUP_SOURCE_ONBOARDING).toBe('onboarding_first_session');
    });
  });

  describe('SessionStartSummarySchema', () => {
    it('parses valid summary', () => {
      const result = SessionStartSummarySchema.parse({
        ctaLabel: 'Start 25 Min Session',
        customizationLabel: 'Tune session',
        subtitle: '25 min focus - calm theme',
      });
      expect(result.ctaLabel).toContain('25');
    });
  });

  describe('SessionStartHeroSchema', () => {
    it('parses valid hero', () => {
      const result = SessionStartHeroSchema.parse({
        eyebrow: 'Fast Start',
        title: 'Focus ready to launch',
        body: 'Start a 25-minute session.',
      });
      expect(result.eyebrow).toBe('Fast Start');
    });
  });

  describe('FocusModeCardSchema', () => {
    it('parses valid card', () => {
      const result = FocusModeCardSchema.parse({
        accessibilityHint: 'Opens sprint preset',
        accessibilityLabel: 'Start 15 minute sprint session',
        body: 'Fastest path to a completion.',
        ctaLabel: 'Start sprint',
        durationSeconds: 900,
        id: 'sprint-15',
        mode: 'SPRINT',
        title: 'Sprint',
      });
      expect(result.durationSeconds).toBe(900);
    });

    it('rejects duration below 60s', () => {
      expect(() =>
        FocusModeCardSchema.parse({
          accessibilityHint: 'hint',
          accessibilityLabel: 'label',
          body: 'body text',
          ctaLabel: 'cta',
          durationSeconds: 30,
          id: 'id',
          mode: 'SPRINT',
          title: 'title',
        }),
      ).toThrow();
    });
  });
});
