/**
 * Session Service — Purity and ViewModel Tests
 *
 * Tests for buildPurityState and buildSessionViewModel.
 */

import { SessionMode } from '../../../session/modes';
import {
  buildPurityState,
  buildSessionViewModel,
} from '../service';

describe('Session Service — Purity and ViewModel', () => {
  const baseInput = {
    sessionId: 'test-session',
    userId: 'test-user',
    status: 'ACTIVE' as const,
    phase: 'FOCUSING' as const,
    mode: SessionMode.LIGHT_FOCUS,
    elapsedSeconds: 300,
    remainingSeconds: 1500,
    totalSeconds: 1800,
    isRunning: true,
    purityScore: 85,
    pauseCount: 1,
    totalPauseSeconds: 30,
    backgroundTimeSeconds: 0,
    focusInterruptions: 0,
    startedAt: Date.now(),
    isOffline: false,
  };

  describe('buildPurityState', () => {
    it('returns EXCELLENT for score >= 90', () => {
      const result = buildPurityState({ ...baseInput, purityScore: 95 });
      expect(result.label).toBe('EXCELLENT');
      expect(result.score).toBe(95);
    });

    it('returns GOOD for score >= 75', () => {
      const result = buildPurityState({ ...baseInput, purityScore: 80 });
      expect(result.label).toBe('GOOD');
    });

    it('returns FAIR for score >= 50', () => {
      const result = buildPurityState({ ...baseInput, purityScore: 60 });
      expect(result.label).toBe('FAIR');
    });

    it('returns POOR for score >= 25', () => {
      const result = buildPurityState({ ...baseInput, purityScore: 30 });
      expect(result.label).toBe('POOR');
    });

    it('returns CRITICAL for score < 25', () => {
      const result = buildPurityState({ ...baseInput, purityScore: 10 });
      expect(result.label).toBe('CRITICAL');
    });

    it('clamps score to 0-100 range', () => {
      const highResult = buildPurityState({ ...baseInput, purityScore: 150 });
      expect(highResult.score).toBe(100);
      const lowResult = buildPurityState({ ...baseInput, purityScore: -10 });
      expect(lowResult.score).toBe(0);
    });

    it('includes pause and interruption data', () => {
      const result = buildPurityState({
        ...baseInput,
        purityScore: 85,
        pauseCount: 3,
        totalPauseSeconds: 120,
        backgroundTimeSeconds: 60,
        focusInterruptions: 2,
      });
      expect(result.pauseCount).toBe(3);
      expect(result.totalPauseSeconds).toBe(120);
      expect(result.backgroundTimeSeconds).toBe(60);
      expect(result.focusInterruptions).toBe(2);
    });

    it('handles exact boundary scores', () => {
      expect(buildPurityState({ ...baseInput, purityScore: 90 }).label).toBe('EXCELLENT');
      expect(buildPurityState({ ...baseInput, purityScore: 75 }).label).toBe('GOOD');
      expect(buildPurityState({ ...baseInput, purityScore: 50 }).label).toBe('FAIR');
      expect(buildPurityState({ ...baseInput, purityScore: 25 }).label).toBe('POOR');
      expect(buildPurityState({ ...baseInput, purityScore: 24 }).label).toBe('CRITICAL');
    });
  });

  describe('buildSessionViewModel', () => {
    it('builds complete view model', () => {
      const result = buildSessionViewModel(baseInput);
      expect(result.id).toBe('test-session');
      expect(result.userId).toBe('test-user');
      expect(result.status).toBe('ACTIVE');
      expect(result.phase).toBe('FOCUSING');
      expect(result.mode).toBe(SessionMode.LIGHT_FOCUS);
    });

    it('includes timer state', () => {
      const result = buildSessionViewModel(baseInput);
      expect(result.timer.elapsedSeconds).toBe(300);
      expect(result.timer.remainingSeconds).toBe(1500);
      expect(result.timer.totalSeconds).toBe(1800);
      expect(result.timer.isRunning).toBe(true);
    });

    it('includes purity state', () => {
      const result = buildSessionViewModel(baseInput);
      expect(result.purity.score).toBe(85);
      expect(result.purity.label).toBe('GOOD');
    });

    it('includes capabilities', () => {
      const result = buildSessionViewModel(baseInput);
      expect(result.canPause).toBeDefined();
      expect(result.canComplete).toBeDefined();
      expect(result.canAbandon).toBeDefined();
    });

    it('includes offline status', () => {
      const result = buildSessionViewModel({ ...baseInput, isOffline: true });
      expect(result.isOffline).toBe(true);
    });

    it('includes expected duration', () => {
      const result = buildSessionViewModel(baseInput);
      expect(result.expectedDurationSeconds).toBe(1800);
    });

    it('includes startedAt timestamp', () => {
      const startedAt = Date.now();
      const result = buildSessionViewModel({ ...baseInput, startedAt });
      expect(result.startedAt).toBe(startedAt);
    });
  });
});
