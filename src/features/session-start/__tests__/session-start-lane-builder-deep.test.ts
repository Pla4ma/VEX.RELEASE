// Deep Session-Start Tests – lane-builder
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
import { buildLaneSessionBrief, buildFocusModeCards } from '../lane-builder';

describe('lane-builder', () => {
  describe('buildLaneSessionBrief', () => {
    it('builds brief for student lane', () => {
      const brief = buildLaneSessionBrief({
        lane: 'student',
        durationSeconds: 25 * 60,
      });
      expect(brief.lane).toBe('student');
      expect(brief.userFacingModeName).toBe('Study');
    });

    it('builds brief for game_like lane', () => {
      const brief = buildLaneSessionBrief({
        lane: 'game_like',
        durationSeconds: 15 * 60,
      });
      expect(brief.lane).toBe('game_like');
      expect(brief.userFacingModeName).toBe('Run');
    });

    it('builds brief for deep_creative lane', () => {
      const brief = buildLaneSessionBrief({
        lane: 'deep_creative',
        durationSeconds: 45 * 60,
      });
      expect(brief.lane).toBe('deep_creative');
      expect(brief.userFacingModeName).toBe('Project');
    });

    it('builds brief for minimal_normal lane', () => {
      const brief = buildLaneSessionBrief({
        lane: 'minimal_normal',
        durationSeconds: 15 * 60,
      });
      expect(brief.lane).toBe('minimal_normal');
      expect(brief.userFacingModeName).toBe('Clean');
    });

    it('uses rescue duration when isRescue is true', () => {
      const brief = buildLaneSessionBrief({
        lane: 'student',
        isRescue: true,
        durationSeconds: 5 * 60,
      });
      expect(brief.friction).not.toBeNull();
      expect(brief.friction!.level).toBe('soft');
    });

    it('includes offline message when offline', () => {
      const brief = buildLaneSessionBrief({
        lane: 'student',
        isOffline: true,
      });
      expect(brief.offlineMessage).toBeTruthy();
    });

    it('offline message is null when online', () => {
      const brief = buildLaneSessionBrief({
        lane: 'student',
        isOffline: false,
      });
      expect(brief.offlineMessage).toBeNull();
    });
  });

  describe('buildFocusModeCards', () => {
    it('returns 4 cards', () => {
      const cards = buildFocusModeCards({ streakDays: 0 });
      expect(cards).toHaveLength(4);
    });

    it('each card has required fields', () => {
      const cards = buildFocusModeCards({ streakDays: 5 });
      for (const card of cards) {
        expect(card.id).toBeTruthy();
        expect(card.title).toBeTruthy();
        expect(card.body).toBeTruthy();
        expect(card.ctaLabel).toBeTruthy();
        expect(card.durationSeconds).toBeGreaterThanOrEqual(60);
        expect(card.accessibilityHint).toBeTruthy();
        expect(card.accessibilityLabel).toBeTruthy();
      }
    });

    it('includes streak-specific copy when streak active', () => {
      const cards = buildFocusModeCards({ streakDays: 5 });
      const lightFocus = cards.find((c) => c.mode === 'LIGHT_FOCUS');
      expect(lightFocus!.body).toContain('Protect day 5');
    });

    it('uses default copy when no streak', () => {
      const cards = buildFocusModeCards({ streakDays: 0 });
      const lightFocus = cards.find((c) => c.mode === 'LIGHT_FOCUS');
      expect(lightFocus!.body).toContain('first real proof');
    });
  });
});
