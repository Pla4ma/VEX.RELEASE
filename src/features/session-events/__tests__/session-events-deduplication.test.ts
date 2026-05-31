/**
 * Tests for session-events feature: evaluateMidSessionEvent deduplication.
 */

import { evaluateMidSessionEvent } from '../service';
import type { EvaluateMidSessionEventInput } from '../schemas';

describe('evaluateMidSessionEvent – deduplication', () => {
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

  it('suppresses duplicate event keys', () => {
    const event = evaluateMidSessionEvent({
      ...baseInput,
      bossHealthPercent: null,
      purityScore: 95,
    });
    expect(event).not.toBeNull();

    const duplicate = evaluateMidSessionEvent({
      ...baseInput,
      bossHealthPercent: null,
      purityScore: 95,
      lastEventKey: event!.key,
    });
    expect(duplicate).toBeNull();
  });

  it('emits a different event when key changes', () => {
    const event1 = evaluateMidSessionEvent({
      ...baseInput,
      bossHealthPercent: null,
      purityScore: 95,
      elapsedSeconds: 300,
    });
    expect(event1).not.toBeNull();

    // Different elapsed time → different bucket → different key
    const event2 = evaluateMidSessionEvent({
      ...baseInput,
      bossHealthPercent: null,
      purityScore: 45,
      elapsedSeconds: 600,
      lastEventKey: event1!.key,
    });
    expect(event2).not.toBeNull();
    expect(event2!.key).not.toBe(event1!.key);
  });
});
