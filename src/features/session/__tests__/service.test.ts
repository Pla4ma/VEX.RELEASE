import { SessionMode } from '../../../session/modes';
import {
  buildSessionCapabilities,
  buildTimerState,
  buildPurityState,
  buildSessionViewModel,
  calculateProgressPercentage,
  formatDuration,
} from '../service';

describe('Active Session Service', () => {
  describe('buildSessionCapabilities', () => {
    const baseInput = {
      sessionId: 'test-session',
      userId: 'test-user',
      status: 'ACTIVE' as const,
      phase: 'FOCUSING' as const,
      mode: SessionMode.LIGHT_FOCUS,
      elapsedSeconds: 120,
      remainingSeconds: 1680,
      totalSeconds: 1800,
      isRunning: true,
      purityScore: 85,
      pauseCount: 0,
      totalPauseSeconds: 0,
      backgroundTimeSeconds: 0,
      focusInterruptions: 0,
      startedAt: Date.now(),
      isOffline: false,
    };
    it('allows pause when conditions are met', () => {
      const capabilities = buildSessionCapabilities(baseInput);
      expect(capabilities.canPause).toBe(true);
    });
    it('disallows pause when elapsed time is insufficient', () => {
      const capabilities = buildSessionCapabilities({
        ...baseInput,
        elapsedSeconds: 30,
      });
      expect(capabilities.canPause).toBe(false);
    });
    it('disallows pause when max pauses reached', () => {
      const capabilities = buildSessionCapabilities({
        ...baseInput,
        pauseCount: 5,
        mode: SessionMode.LIGHT_FOCUS,
      });
      expect(capabilities.canPause).toBe(false);
    });
    it('allows complete after 60 seconds', () => {
      const capabilities = buildSessionCapabilities(baseInput);
      expect(capabilities.canComplete).toBe(true);
    });
    it('disallows complete before 60 seconds', () => {
      const capabilities = buildSessionCapabilities({
        ...baseInput,
        elapsedSeconds: 30,
      });
      expect(capabilities.canComplete).toBe(false);
    });
    it('allows abandon when active or paused', () => {
      const capabilities = buildSessionCapabilities(baseInput);
      expect(capabilities.canAbandon).toBe(true);
    });
    it('controls background based on mode config', () => {
      const sprintCapabilities = buildSessionCapabilities({
        ...baseInput,
        mode: SessionMode.SPRINT,
        backgroundTimeSeconds: 10,
      });
      expect(sprintCapabilities.canBackground).toBe(false);
      const lightCapabilities = buildSessionCapabilities({
        ...baseInput,
        mode: SessionMode.LIGHT_FOCUS,
        backgroundTimeSeconds: 10,
      });
      expect(lightCapabilities.canBackground).toBe(true);
    });
  });
  describe('buildTimerState', () => {
    it('builds correct timer state', () => {
      const input = {
        sessionId: 'test',
        userId: 'user',
        status: 'ACTIVE' as const,
        phase: 'FOCUSING' as const,
        mode: SessionMode.LIGHT_FOCUS,
        elapsedSeconds: 300,
        remainingSeconds: 1500,
        totalSeconds: 1800,
        isRunning: true,
        purityScore: 80,
        pauseCount: 0,
        totalPauseSeconds: 0,
        backgroundTimeSeconds: 0,
        focusInterruptions: 0,
        startedAt: Date.now(),
        isOffline: false,
      };
      const timer = buildTimerState(input);
      expect(timer.elapsedSeconds).toBe(300);
      expect(timer.remainingSeconds).toBe(1500);
      expect(timer.totalSeconds).toBe(1800);
      expect(timer.isRunning).toBe(true);
      expect(timer.lastTickAt).toBeDefined();
    });
    it('does not include lastTickAt when not running', () => {
      const input = {
        sessionId: 'test',
        userId: 'user',
        status: 'PAUSED' as const,
        phase: 'FOCUSING' as const,
        mode: SessionMode.LIGHT_FOCUS,
        elapsedSeconds: 300,
        remainingSeconds: 1500,
        totalSeconds: 1800,
        isRunning: false,
        purityScore: 80,
        pauseCount: 1,
        totalPauseSeconds: 30,
        backgroundTimeSeconds: 0,
        focusInterruptions: 0,
        startedAt: Date.now(),
        isOffline: false,
      };
      const timer = buildTimerState(input);
      expect(timer.lastTickAt).toBeUndefined();
    });
  });
  describe('calculateProgressPercentage', () => {
    it('calculates correct percentage', () => {
      expect(calculateProgressPercentage(900, 1800)).toBe(50);
      expect(calculateProgressPercentage(1800, 1800)).toBe(100);
      expect(calculateProgressPercentage(0, 1800)).toBe(0);
    });
    it('clamps to 0-100 range', () => {
      expect(calculateProgressPercentage(2000, 1800)).toBe(100);
      expect(calculateProgressPercentage(-100, 1800)).toBe(0);
    });
    it('handles zero total seconds', () => {
      expect(calculateProgressPercentage(100, 0)).toBe(0);
    });
  });
  describe('formatDuration', () => {
    it('formats seconds correctly', () => {
      expect(formatDuration(65)).toBe('1:05');
      expect(formatDuration(125)).toBe('2:05');
      expect(formatDuration(3600)).toBe('60:00');
    });
  });
});
