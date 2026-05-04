import { evaluateMidSessionEvent } from '../service';

describe('evaluateMidSessionEvent', () => {
  const baseInput = {
    bossHealthPercent: 80,
    elapsedSeconds: 300,
    isPaused: false,
    lastEventKey: null,
    purityScore: 75,
    sessionDurationSeconds: 1500,
  };

  it('does not emit before the first event window', () => {
    expect(evaluateMidSessionEvent({ ...baseInput, elapsedSeconds: 60 })).toBeNull();
  });

  it('does not emit while paused', () => {
    expect(evaluateMidSessionEvent({ ...baseInput, isPaused: true })).toBeNull();
  });

  it('prioritizes boss near-death taunts', () => {
    const event = evaluateMidSessionEvent({
      ...baseInput,
      bossHealthPercent: 20,
      bossTaunts: {
        nearDeath: 'No. Not like this.',
      },
    });

    expect(event?.type).toBe('BOSS_TAUNT');
    expect(event?.message).toBe('No. Not like this.');
  });

  it('emits a combo window for elite purity', () => {
    const event = evaluateMidSessionEvent({ ...baseInput, bossHealthPercent: null, purityScore: 94 });

    expect(event?.type).toBe('COMBO_WINDOW');
    expect(event?.toastType).toBe('success');
  });

  it('suppresses duplicate event keys', () => {
    const event = evaluateMidSessionEvent({ ...baseInput, bossHealthPercent: null, purityScore: 94 });
    const duplicate = evaluateMidSessionEvent({
      ...baseInput,
      bossHealthPercent: null,
      lastEventKey: event?.key ?? null,
      purityScore: 94,
    });

    expect(duplicate).toBeNull();
  });
});
