/**
 * Session Service — Purity State Tests
 */

import { SessionMode } from '../../../session/modes';
import { buildPurityState } from '../service';

function makePurityInput(overrides: Partial<{
  purityScore: number;
  pauseCount: number;
  totalPauseSeconds: number;
  backgroundTimeSeconds: number;
  focusInterruptions: number;
}> = {}) {
  return {
    sessionId: 'test-session',
    userId: 'test-user',
    status: 'ACTIVE' as const,
    phase: 'FOCUSING' as const,
    mode: SessionMode.LIGHT_FOCUS,
    elapsedSeconds: 300,
    remainingSeconds: 1500,
    totalSeconds: 1800,
    isRunning: true,
    startedAt: 1700000000000,
    isOffline: false,
    purityScore: 85,
    pauseCount: 0,
    totalPauseSeconds: 0,
    backgroundTimeSeconds: 0,
    focusInterruptions: 0,
    ...overrides,
  };
}

describe('buildPurityState', () => {
  describe('purity labels', () => {
    it('returns EXCELLENT for score 100', () => {
      expect(buildPurityState(makePurityInput({ purityScore: 100 })).label).toBe('EXCELLENT');
    });

    it('returns EXCELLENT for score 90', () => {
      expect(buildPurityState(makePurityInput({ purityScore: 90 })).label).toBe('EXCELLENT');
    });

    it('returns GOOD for score 89', () => {
      expect(buildPurityState(makePurityInput({ purityScore: 89 })).label).toBe('GOOD');
    });

    it('returns GOOD for score 75', () => {
      expect(buildPurityState(makePurityInput({ purityScore: 75 })).label).toBe('GOOD');
    });

    it('returns FAIR for score 74', () => {
      expect(buildPurityState(makePurityInput({ purityScore: 74 })).label).toBe('FAIR');
    });

    it('returns FAIR for score 50', () => {
      expect(buildPurityState(makePurityInput({ purityScore: 50 })).label).toBe('FAIR');
    });

    it('returns POOR for score 49', () => {
      expect(buildPurityState(makePurityInput({ purityScore: 49 })).label).toBe('POOR');
    });

    it('returns POOR for score 25', () => {
      expect(buildPurityState(makePurityInput({ purityScore: 25 })).label).toBe('POOR');
    });

    it('returns CRITICAL for score 24', () => {
      expect(buildPurityState(makePurityInput({ purityScore: 24 })).label).toBe('CRITICAL');
    });

    it('returns CRITICAL for score 0', () => {
      expect(buildPurityState(makePurityInput({ purityScore: 0 })).label).toBe('CRITICAL');
    });
  });

  describe('score clamping', () => {
    it('clamps negative score to 0', () => {
      const purity = buildPurityState(makePurityInput({ purityScore: -10 }));
      expect(purity.score).toBe(0);
      expect(purity.label).toBe('CRITICAL');
    });

    it('clamps score above 100 to 100', () => {
      const purity = buildPurityState(makePurityInput({ purityScore: 150 }));
      expect(purity.score).toBe(100);
      expect(purity.label).toBe('EXCELLENT');
    });
  });

  describe('interruption data', () => {
    it('includes pause count and interruption data', () => {
      const purity = buildPurityState(makePurityInput({
        purityScore: 80,
        pauseCount: 3,
        totalPauseSeconds: 120,
        backgroundTimeSeconds: 45,
        focusInterruptions: 2,
      }));
      expect(purity.pauseCount).toBe(3);
      expect(purity.totalPauseSeconds).toBe(120);
      expect(purity.backgroundTimeSeconds).toBe(45);
      expect(purity.focusInterruptions).toBe(2);
    });
  });
});
