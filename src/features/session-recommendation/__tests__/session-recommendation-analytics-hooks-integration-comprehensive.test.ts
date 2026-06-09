/**
 * Session Recommendation — Comprehensive Tests: Analytics, Hooks & Integration
 *
 * Covers: analytics tracking functions, query key factory, and full pipeline integration.
 */

// ── Mocks (must come before imports that use them) ───────────────────

jest.mock('../../../store', () => ({
  useAuthStore: jest.fn((selector: (s: Record<string, unknown>) => unknown) =>
    selector({ user: { id: 'user-123' } }),
  ),
}));

jest.mock('../../../utils/haptics', () => ({
  triggerHaptic: jest.fn(),
}));

jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
}));

jest.mock('../../../events', () => ({
  eventBus: { emit: jest.fn() },
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({ data: [], isPending: false, isError: false, error: null, refetch: jest.fn() })),
}));

// ── Imports ──────────────────────────────────────────────────────────

import {
  SessionRecommendationInputSchema,
  SessionRecommendationSchema,
} from '../schemas';
import type { SessionRecommendation, SessionRecommendationInput } from '../schemas';
import {
  generateSessionRecommendation,
  isRecommendationValid,
} from '../service';
import {
  trackRecommendationDismissed,
  trackRecommendationBlocked,
  trackRecommendationPerformance,
} from '../analytics';
import { sessionRecommendationKeys } from '../hooks';
import Sentry from '@sentry/react-native';
import { eventBus } from '../../../events';

// ── Helpers ──────────────────────────────────────────────────────────

function makeInput(overrides: Partial<SessionRecommendationInput> = {}): SessionRecommendationInput {
  return SessionRecommendationInputSchema.parse({
    timeOfDay: 10,
    streakUrgency: 'none',
    recoveryStatus: 'none',
    isFirstSession: false,
    hasActiveSession: false,
    userId: '550e8400-e29b-41d4-a716-446655440000',
    ...overrides,
  });
}

function makeRecommendation(overrides: Partial<SessionRecommendation> = {}): SessionRecommendation {
  return SessionRecommendationSchema.parse({
    duration: 25,
    mode: 'FOCUS',
    reason: 'Test recommendation',
    fallback: false,
    inputs: makeInput(),
    confidence: 0.8,
    isBlocked: false,
    ...overrides,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// 9. ANALYTICS — all tracking functions
// ═══════════════════════════════════════════════════════════════════════

describe('Analytics tracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('trackRecommendationPerformance computes correct duration accuracy', () => {
    const rec = makeRecommendation({ duration: 40, mode: 'FOCUS' });
    trackRecommendationPerformance(rec, 20, 'FOCUS', 'B', true);

    const call = (Sentry.addBreadcrumb as jest.Mock).mock.calls[0][0];
    expect(call.data.durationAccuracy).toBe(0.5); // |40-20|/40
    expect(call.data.modeMatch).toBe(true);
  });

  it('trackRecommendationPerformance with exact match has 0 accuracy', () => {
    const rec = makeRecommendation({ duration: 25, mode: 'FOCUS' });
    trackRecommendationPerformance(rec, 25, 'FOCUS', 'A', true);

    const call = (Sentry.addBreadcrumb as jest.Mock).mock.calls[0][0];
    expect(call.data.durationAccuracy).toBe(0);
  });

  it('trackRecommendationBlocked emits at warning level', () => {
    const rec = makeRecommendation({ isBlocked: true, blockReason: 'Test' });
    trackRecommendationBlocked(rec, makeInput());

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({ level: 'warning' }),
    );
  });

  it('trackRecommendationDismissed works with no reason', () => {
    const rec = makeRecommendation();
    trackRecommendationDismissed(rec, makeInput());

    expect(eventBus.emit).toHaveBeenCalledWith(
      'session-recommendation:dismissed',
      expect.objectContaining({ dismissReason: undefined }),
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 10. HOOKS — query key factory
// ═══════════════════════════════════════════════════════════════════════

describe('sessionRecommendationKeys', () => {
  it('current key includes userId', () => {
    const key = sessionRecommendationKeys.current('abc');
    expect(key).toContain('current');
    expect(key).toContain('abc');
  });

  it('analytics key includes userId', () => {
    const key = sessionRecommendationKeys.analytics('xyz');
    expect(key).toContain('analytics');
    expect(key).toContain('xyz');
  });

  it('all keys start with base', () => {
    expect(sessionRecommendationKeys.all).toEqual(['session-recommendation']);
    expect(sessionRecommendationKeys.current('a')[0]).toBe('session-recommendation');
    expect(sessionRecommendationKeys.analytics('a')[0]).toBe('session-recommendation');
  });
});

// ═══════════════════════════════════════════════════════════════════════
// 11. INTEGRATION — full pipeline tests
// ═══════════════════════════════════════════════════════════════════════

describe('Full pipeline integration', () => {
  it('first-session input produces a valid, non-blocked recommendation', () => {
    const rec = generateSessionRecommendation(makeInput({ isFirstSession: true }));
    expect(rec.isBlocked).toBe(false);
    expect(rec.fallback).toBe(false);
    expect(isRecommendationValid(rec)).toBe(true);
    expect(rec.mode).toBe('RECOVERY');
  });

  it('active session input always blocks regardless of other params', () => {
    const rec = generateSessionRecommendation(
      makeInput({ hasActiveSession: true, isFirstSession: true, streakUrgency: 'critical' }),
    );
    expect(rec.isBlocked).toBe(true);
    expect(rec.blockReason).toBe('Active session in progress');
  });

  it('default input with no time match produces a fallback recommendation', () => {
    const rec = generateSessionRecommendation(makeInput({ timeOfDay: 15 }));
    expect(rec.fallback).toBe(true);
    expect(rec.duration).toBe(25);
    expect(rec.mode).toBe('FOCUS');
  });
});
