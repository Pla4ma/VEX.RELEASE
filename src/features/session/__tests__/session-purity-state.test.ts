import { SessionMode } from '../../../session/modes';
import { buildPurityState } from '../service';

function makeInput(overrides: {
  purityScore?: number; pauseCount?: number; totalPauseSeconds?: number;
  backgroundTimeSeconds?: number; focusInterruptions?: number;
} = {}) {
  return {
    sessionId: 'test-session', userId: 'test-user', status: 'ACTIVE' as const,
    phase: 'FOCUSING' as const, mode: SessionMode.LIGHT_FOCUS, elapsedSeconds: 300,
    remainingSeconds: 1500, totalSeconds: 1800, isRunning: true, startedAt: 1700000000000,
    isOffline: false, purityScore: 85, pauseCount: 0, totalPauseSeconds: 0,
    backgroundTimeSeconds: 0, focusInterruptions: 0, ...overrides,
  };
}

describe('buildPurityState', () => {
  it('returns EXCELLENT for score >= 90', () => {
    expect(buildPurityState(makeInput({ purityScore: 90 })).label).toBe('EXCELLENT');
  });

  it('returns GOOD for score 75', () => {
    expect(buildPurityState(makeInput({ purityScore: 75 })).label).toBe('GOOD');
  });

  it('returns FAIR for score 50', () => {
    expect(buildPurityState(makeInput({ purityScore: 50 })).label).toBe('FAIR');
  });

  it('returns POOR for score 25', () => {
    expect(buildPurityState(makeInput({ purityScore: 25 })).label).toBe('POOR');
  });

  it('returns CRITICAL for score 0', () => {
    expect(buildPurityState(makeInput({ purityScore: 0 })).label).toBe('CRITICAL');
  });

  it('clamps negative score to 0', () => {
    expect(buildPurityState(makeInput({ purityScore: -10 })).score).toBe(0);
  });

  it('clamps score above 100 to 100', () => {
    expect(buildPurityState(makeInput({ purityScore: 150 })).score).toBe(100);
  });

  it('includes interruption data', () => {
    const p = buildPurityState(makeInput({ pauseCount: 3, totalPauseSeconds: 120, focusInterruptions: 2 }));
    expect(p.pauseCount).toBe(3);
    expect(p.totalPauseSeconds).toBe(120);
    expect(p.focusInterruptions).toBe(2);
  });
});
