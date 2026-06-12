/**
 * Session Service — ViewModel Builder Tests
 */

import { SessionMode } from '../../../session/modes';
import { buildSessionViewModel } from '../service';

function makeInput(overrides: Partial<{
  sessionId: string;
  userId: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ABANDONED';
  phase: 'FOCUSING' | 'SHORT_BREAK' | 'LONG_BREAK' | 'COMPLETED' | 'ABANDONED';
  mode: SessionMode;
  elapsedSeconds: number;
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  purityScore: number;
  pauseCount: number;
  totalPauseSeconds: number;
  backgroundTimeSeconds: number;
  focusInterruptions: number;
  startedAt: number;
  isOffline: boolean;
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
    purityScore: 85,
    pauseCount: 0,
    totalPauseSeconds: 0,
    backgroundTimeSeconds: 0,
    focusInterruptions: 0,
    startedAt: 1700000000000,
    isOffline: false,
    ...overrides,
  };
}

describe('buildSessionViewModel', () => {
  it('builds complete view model from input', () => {
    const input = makeInput({
      sessionId: 'sess-123',
      userId: 'user-456',
      mode: SessionMode.DEEP_WORK,
    });
    const vm = buildSessionViewModel(input);
    expect(vm.id).toBe('sess-123');
    expect(vm.userId).toBe('user-456');
    expect(vm.status).toBe('ACTIVE');
    expect(vm.phase).toBe('FOCUSING');
    expect(vm.mode).toBe(SessionMode.DEEP_WORK);
  });

  it('sets isOffline correctly', () => {
    expect(buildSessionViewModel(makeInput({ isOffline: true })).isOffline).toBe(true);
    expect(buildSessionViewModel(makeInput({ isOffline: false })).isOffline).toBe(false);
  });

  it('preserves startedAt timestamp', () => {
    const vm = buildSessionViewModel(makeInput({ startedAt: 1700000000000 }));
    expect(vm.startedAt).toBe(1700000000000);
  });

  it('preserves expected duration', () => {
    const vm = buildSessionViewModel(makeInput({ totalSeconds: 3600 }));
    expect(vm.expectedDurationSeconds).toBe(3600);
  });
});

describe('buildSessionViewModel timer', () => {
  it('includes timer state', () => {
    const input = makeInput({
      elapsedSeconds: 900,
      remainingSeconds: 900,
      totalSeconds: 1800,
      isRunning: false,
    });
    const vm = buildSessionViewModel(input);
    expect(vm.timer.elapsedSeconds).toBe(900);
    expect(vm.timer.remainingSeconds).toBe(900);
    expect(vm.timer.totalSeconds).toBe(1800);
    expect(vm.timer.isRunning).toBe(false);
  });

  it('omits lastTickAt when not running', () => {
    const vm = buildSessionViewModel(makeInput({ isRunning: false }));
    expect(vm.timer.lastTickAt).toBeUndefined();
  });

  it('includes lastTickAt when running', () => {
    const vm = buildSessionViewModel(makeInput({ isRunning: true }));
    expect(vm.timer.lastTickAt).toBeDefined();
    expect(typeof vm.timer.lastTickAt).toBe('number');
  });
});

describe('buildSessionViewModel capabilities', () => {
  it('allows pause when conditions met', () => {
    const vm = buildSessionViewModel(makeInput({
      mode: SessionMode.LIGHT_FOCUS,
      elapsedSeconds: 120,
      pauseCount: 0,
    }));
    expect(vm.canPause).toBe(true);
  });

  it('disallows pause when not allowed by mode', () => {
    const vm = buildSessionViewModel(makeInput({
      mode: SessionMode.SPRINT,
      elapsedSeconds: 900,
    }));
    expect(vm.canPause).toBe(false);
  });

  it('allows complete after 60 seconds', () => {
    const vm = buildSessionViewModel(makeInput()));
    expect(vm.canComplete).toBe(true);
  });

  it('allows abandon for active sessions', () => {
    const vm = buildSessionViewModel(makeInput({ status: 'ACTIVE' as const }));
    expect(vm.canAbandon).toBe(true);
  });

  it('allows abandon for paused sessions', () => {
    const vm = buildSessionViewModel(makeInput({ status: 'PAUSED' as const }));
    expect(vm.canAbandon).toBe(true);
  });

  it('disallows abandon for completed sessions', () => {
    const vm = buildSessionViewModel(makeInput({ status: 'COMPLETED' as const }));
    expect(vm.canAbandon).toBe(false);
  });

  it('disallows abandon for abandoned sessions', () => {
    const vm = buildSessionViewModel(makeInput({ status: 'ABANDONED' as const }));
    expect(vm.canAbandon).toBe(false);
  });
});

describe('buildSessionViewModel purity', () => {
  it('derives purity from score', () => {
    const vm = buildSessionViewModel(makeInput({ purityScore: 85 }));
    expect(vm.purity.label).toBe('GOOD');
    expect(vm.purity.score).toBe(85);
  });

  it('includes interruption data in purity', () => {
    const vm = buildSessionViewModel(makeInput({
      purityScore: 80,
      pauseCount: 2,
      totalPauseSeconds: 60,
    }));
    expect(vm.purity.pauseCount).toBe(2);
    expect(vm.purity.totalPauseSeconds).toBe(60);
  });
});
