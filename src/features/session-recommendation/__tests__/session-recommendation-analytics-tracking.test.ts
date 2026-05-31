/**
 * Session Recommendation — Analytics Tracking Tests (generated, accepted, dismissed)
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
  trackRecommendationGenerated,
  trackRecommendationAccepted,
  trackRecommendationDismissed,
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
// ANALYTICS TRACKING
// ═══════════════════════════════════════════════════════════════════════

describe('trackRecommendationGenerated', () => {
  it('adds Sentry breadcrumb with recommendation data', () => {
    const rec = makeRecommendation();
    const input = makeInput();
    trackRecommendationGenerated(rec, input);

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'session-recommendation',
        level: 'info',
        data: expect.objectContaining({
          duration: 25,
          mode: 'FOCUS',
          confidence: 0.8,
        }),
      }),
    );
  });

  it('emits session-recommendation:generated event', () => {
    const rec = makeRecommendation();
    const input = makeInput();
    trackRecommendationGenerated(rec, input);

    expect(eventBus.emit).toHaveBeenCalledWith(
      'session-recommendation:generated',
      expect.objectContaining({
        duration: 25,
        mode: 'FOCUS',
        confidence: 0.8,
        isFallback: false,
      }),
    );
  });
});

describe('trackRecommendationAccepted', () => {
  it('adds Sentry breadcrumb for accepted recommendation', () => {
    const rec = makeRecommendation();
    const input = makeInput();
    trackRecommendationAccepted(rec, input);

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'session-recommendation',
        message: expect.stringContaining('accepted'),
        level: 'info',
      }),
    );
  });

  it('emits session-recommendation:accepted event', () => {
    const rec = makeRecommendation();
    const input = makeInput();
    trackRecommendationAccepted(rec, input);

    expect(eventBus.emit).toHaveBeenCalledWith(
      'session-recommendation:accepted',
      expect.objectContaining({
        duration: 25,
        mode: 'FOCUS',
      }),
    );
  });
});

describe('trackRecommendationDismissed', () => {
  it('adds Sentry breadcrumb with optional dismiss reason', () => {
    const rec = makeRecommendation();
    const input = makeInput();
    trackRecommendationDismissed(rec, input, 'too long');

    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'session-recommendation',
        message: expect.stringContaining('dismissed'),
        data: expect.objectContaining({ dismissReason: 'too long' }),
      }),
    );
  });

  it('emits dismissed event with reason', () => {
    const rec = makeRecommendation();
    const input = makeInput();
    trackRecommendationDismissed(rec, input, 'not now');

    expect(eventBus.emit).toHaveBeenCalledWith(
      'session-recommendation:dismissed',
      expect.objectContaining({
        dismissReason: 'not now',
        duration: 25,
      }),
    );
  });

  it('works without a dismiss reason', () => {
    const rec = makeRecommendation();
    const input = makeInput();
    trackRecommendationDismissed(rec, input);

    expect(eventBus.emit).toHaveBeenCalledWith(
      'session-recommendation:dismissed',
      expect.objectContaining({
        dismissReason: undefined,
      }),
    );
  });
});
