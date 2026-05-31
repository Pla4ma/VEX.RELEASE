/**
 * Session Recommendation — Analytics Performance Tests (blocked, performance)
 */

// ── Mocks (must come before imports that use them) ───────────────────

jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
}));

jest.mock('../../../events', () => ({
  eventBus: { emit: jest.fn() },
}));

// ── Imports ──────────────────────────────────────────────────────────

import {
  SessionRecommendationSchema,
  SessionRecommendationInputSchema,
} from '../schemas';
import type { SessionRecommendation, SessionRecommendationInput } from '../schemas';
import {
  trackRecommendationBlocked,
  trackRecommendationPerformance,
} from '../analytics';
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
// ANALYTICS: BLOCKED & PERFORMANCE
// ═══════════════════════════════════════════════════════════════════════

describe('trackRecommendationBlocked', () => {
  it('adds Sentry breadcrumb at warning level', () => {
    const rec = makeRecommendation({ isBlocked: true, blockReason: 'Active session' });
    const input = makeInput({ hasActiveSession: true });
    trackRecommendationBlocked(rec, input);

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'session-recommendation',
        level: 'warning',
        data: expect.objectContaining({ blockReason: 'Active session' }),
      }),
    );
  });

  it('emits blocked event', () => {
    const rec = makeRecommendation({ isBlocked: true, blockReason: 'Session active' });
    const input = makeInput();
    trackRecommendationBlocked(rec, input);

    expect(eventBus.emit).toHaveBeenCalledWith(
      'session-recommendation:blocked',
      expect.objectContaining({
        blockReason: 'Session active',
      }),
    );
  });
});

describe('trackRecommendationPerformance', () => {
  it('tracks completed session with matching mode', () => {
    const rec = makeRecommendation({ duration: 25, mode: 'FOCUS' });
    trackRecommendationPerformance(rec, 25, 'FOCUS', 'A', true);

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          recommendedDuration: 25,
          actualDuration: 25,
          modeMatch: true,
          sessionCompleted: true,
          durationAccuracy: 0,
        }),
      }),
    );
  });

  it('tracks incomplete session with mismatched mode', () => {
    const rec = makeRecommendation({ duration: 30, mode: 'FOCUS' });
    trackRecommendationPerformance(rec, 15, 'RECOVERY', 'D', false);

    const call = (Sentry.addBreadcrumb as jest.Mock).mock.calls[0][0];
    expect(call.data.modeMatch).toBe(false);
    expect(call.data.sessionCompleted).toBe(false);
    expect(call.data.durationAccuracy).toBe(0.5); // |30-15|/30
  });

  it('emits performance event with accuracy data', () => {
    const rec = makeRecommendation({ duration: 20, mode: 'RECOVERY' });
    trackRecommendationPerformance(rec, 25, 'RECOVERY', 'B', true);

    expect(eventBus.emit).toHaveBeenCalledWith(
      'session-recommendation:performance',
      expect.objectContaining({
        recommendedDuration: 20,
        actualDuration: 25,
        durationAccuracy: 0.25, // |20-25|/20
        modeMatch: true,
        sessionCompleted: true,
      }),
    );
  });
});
