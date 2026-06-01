/**
 * Tests for session-events feature: evaluateMidSessionEvent timed events.
 */

import { evaluateMidSessionEvent } from '../service';
import type { EvaluateMidSessionEventInput } from '../schemas';

describe('evaluateMidSessionEvent – timed events', () => {
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

  it('emits BOSS_RAGE when health <= 35 and bucket % 3 === 0', () => {
    // At 200s (< 300): bucket = 0, 0 % 3 === 0
    const event = evaluateMidSessionEvent({
      ...baseInput,
      bossHealthPercent: 30,
      elapsedSeconds: 200,
      purityScore: 75,
    });
    expect(event?.type).toBe('BOSS_RAGE');
    expect(event?.title).toBe('Rage window');
  });

  it('emits DISTRACTION_WAVE when bucket % 5 === 0', () => {
    // At 1500s, bucket = Math.floor(1500 / 300) = 5, 5 % 5 === 0
    const event = evaluateMidSessionEvent({
      ...baseInput,
      bossHealthPercent: 60,
      elapsedSeconds: 1500,
      purityScore: 75,
    });
    expect(event?.type).toBe('DISTRACTION_WAVE');
    expect(event?.title).toBe('Distraction wave');
  });

  it('emits FOCUS_ZONE when purity >= 80 and bucket % 2 === 0', () => {
    // At 600s, bucket = Math.floor(600 / 300) = 2, 2 % 2 === 0
    const event = evaluateMidSessionEvent({
      ...baseInput,
      bossHealthPercent: null,
      elapsedSeconds: 600,
      purityScore: 85,
    });
    expect(event?.type).toBe('FOCUS_ZONE');
    expect(event?.title).toBe('Focus zone');
  });
});
