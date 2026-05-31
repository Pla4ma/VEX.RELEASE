/**
 * Tests for session-events feature: evaluateMidSessionEvent guard clauses.
 */

import { evaluateMidSessionEvent } from '../service';
import type { EvaluateMidSessionEventInput } from '../schemas';

describe('evaluateMidSessionEvent – guard clauses', () => {
  const baseInput: EvaluateMidSessionEventInput = {
    bossHealthPercent: 80,
    elapsedSeconds: 300,
    isPaused: false,
    lastEventKey: null,
    purityScore: 75,
    sessionDurationSeconds: 1500,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when paused', () => {
    expect(
      evaluateMidSessionEvent({ ...baseInput, isPaused: true }),
    ).toBeNull();
  });

  it('returns null before FIRST_EVENT_SECONDS (90s)', () => {
    expect(
      evaluateMidSessionEvent({ ...baseInput, elapsedSeconds: 89 }),
    ).toBeNull();
  });

  it('returns null at exactly 0 seconds', () => {
    expect(
      evaluateMidSessionEvent({ ...baseInput, elapsedSeconds: 0 }),
    ).toBeNull();
  });

  it('emits event at exactly FIRST_EVENT_SECONDS (90s)', () => {
    const event = evaluateMidSessionEvent({
      ...baseInput,
      elapsedSeconds: 90,
      bossHealthPercent: null,
    });
    expect(event).not.toBeNull();
  });
});
