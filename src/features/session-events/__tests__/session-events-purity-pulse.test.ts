/**
 * Tests for session-events feature: evaluateMidSessionEvent purity pulse.
 */

import { evaluateMidSessionEvent } from '../service';
import type { EvaluateMidSessionEventInput } from '../schemas';

describe('evaluateMidSessionEvent – purity pulse', () => {
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

  it('emits COMBO_WINDOW for purity >= 90', () => {
    const event = evaluateMidSessionEvent({
      ...baseInput,
      bossHealthPercent: null,
      purityScore: 95,
      elapsedSeconds: 300,
    });
    expect(event?.type).toBe('COMBO_WINDOW');
    expect(event?.toastType).toBe('success');
    expect(event?.haptic).toBe('impactMedium');
  });

  it('emits PURITY_PULSE warning for purity < 60', () => {
    const event = evaluateMidSessionEvent({
      ...baseInput,
      bossHealthPercent: null,
      purityScore: 45,
      elapsedSeconds: 300,
    });
    expect(event?.type).toBe('PURITY_PULSE');
    expect(event?.toastType).toBe('warning');
    expect(event?.message).toContain('drift');
  });

  it('emits PURITY_PULSE info for purity 60-89', () => {
    const event = evaluateMidSessionEvent({
      ...baseInput,
      bossHealthPercent: null,
      purityScore: 72,
      elapsedSeconds: 300,
    });
    expect(event?.type).toBe('PURITY_PULSE');
    expect(event?.toastType).toBe('info');
    expect(event?.message).toContain('72%');
  });
});
