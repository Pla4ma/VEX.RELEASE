// Deep Session-Start Tests – event-validators
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
import { validateSessionStartEvent } from '../event-validators';

// ============================================================================

describe('event-validators', () => {
  const baseEvent = {
    id: 'evt-1',
    userId: 'user-1',
    sessionId: 'sess-1',
    timestamp: new Date(),
    metadata: { source: 'test', version: '1.0.0', platform: 'test' },
  };

  describe('validateSessionStartEvent', () => {
    it('rejects event missing id', () => {
      const event = {
        ...baseEvent,
        id: '',
        type: 'session_initiated' as const,
        data: {},
      };
      expect(validateSessionStartEvent(event as unknown)).toBe(false);
    });

    it('rejects event missing userId', () => {
      const event = {
        ...baseEvent,
        userId: '',
        type: 'session_initiated' as const,
        data: {},
      };
      expect(validateSessionStartEvent(event as unknown)).toBe(false);
    });

    it('rejects event missing data', () => {
      const event = {
        ...baseEvent,
        type: 'session_initiated' as const,
        data: null,
      };
      expect(validateSessionStartEvent(event as unknown)).toBe(false);
    });

    it('validates session_initiated with complete data', () => {
      const event = {
        ...baseEvent,
        type: 'session_initiated' as const,
        data: {
          initiationType: 'user_initiated' as const,
          initiatedAt: new Date(),
          trigger: 'button_tap' as const,
          intent: 'focus' as const,
          context: { source: 'home' },
        },
      };
      expect(validateSessionStartEvent(event as unknown)).toBe(true);
    });

    it('validates session_preparation_started with complete data', () => {
      const event = {
        ...baseEvent,
        type: 'session_preparation_started' as const,
        data: {
          preparationType: 'full' as const,
          preparationSteps: ['check_env'],
          environment: { noise: 'quiet' },
          user: { mood: 'focused' },
        },
      };
      expect(validateSessionStartEvent(event as unknown)).toBe(true);
    });

    it('validates session_readiness_assessed with complete data', () => {
      const event = {
        ...baseEvent,
        type: 'session_readiness_assessed' as const,
        data: {
          assessmentType: 'initial' as const,
          readinessScore: 85,
          readinessLevel: 'high' as const,
          factors: [],
          trends: [],
          recommendations: [],
        },
      };
      expect(validateSessionStartEvent(event as unknown)).toBe(true);
    });

    it('validates session_goals_set with complete data', () => {
      const event = {
        ...baseEvent,
        type: 'session_goals_set' as const,
        data: {
          goalType: 'task' as const,
          goals: [],
          alignment: {},
          planning: {},
        },
      };
      expect(validateSessionStartEvent(event as unknown)).toBe(true);
    });

    it('validates session_mood_assessed with complete data', () => {
      const event = {
        ...baseEvent,
        type: 'session_mood_assessed' as const,
        data: {
          assessmentType: 'initial' as const,
          moodProfile: {},
          moodState: 'neutral' as const,
          influences: [],
          recommendations: [],
        },
      };
      expect(validateSessionStartEvent(event as unknown)).toBe(true);
    });

    it('validates session_context_established with complete data', () => {
      const event = {
        ...baseEvent,
        type: 'session_context_established' as const,
        data: {
          contextType: 'environment' as const,
          contextData: {},
          adaptations: [],
        },
      };
      expect(validateSessionStartEvent(event as unknown)).toBe(true);
    });

    it('returns true for unknown event types (default case)', () => {
      const event = {
        ...baseEvent,
        type: 'unknown_event' as unknown,
        data: { anything: true },
      };
      expect(validateSessionStartEvent(event as unknown)).toBe(true);
    });
  });
});
