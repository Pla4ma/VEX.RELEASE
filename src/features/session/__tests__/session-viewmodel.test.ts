import { SessionMode } from '../../../session/modes';
import { buildSessionViewModel } from '../service';

function makeInput(overrides: {
  sessionId?: string; userId?: string; status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ABANDONED';
  mode?: SessionMode; elapsedSeconds?: number; remainingSeconds?: number; totalSeconds?: number;
  isRunning?: boolean; purityScore?: number; pauseCount?: number; startedAt?: number; isOffline?: boolean;
} = {}) {
  return {
    sessionId: 'test-session', userId: 'test-user', status: 'ACTIVE' as const,
    phase: 'FOCUSING' as const, mode: SessionMode.LIGHT_FOCUS, elapsedSeconds: 300,
    remainingSeconds: 1500, totalSeconds: 1800, isRunning: true, purityScore: 85,
    pauseCount: 0, totalPauseSeconds: 0, backgroundTimeSeconds: 0, focusInterruptions: 0,
    startedAt: 1700000000000, isOffline: false, ...overrides,
  };
}

describe('buildSessionViewModel', () => {
  it('builds complete view model', () => {
    const vm = buildSessionViewModel(makeInput({ sessionId: 'sess-1', userId: 'user-1', mode: SessionMode.DEEP_WORK }));
    expect(vm.id).toBe('sess-1');
    expect(vm.userId).toBe('user-1');
    expect(vm.mode).toBe(SessionMode.DEEP_WORK);
  });

  it('sets isOffline', () => {
    expect(buildSessionViewModel(makeInput({ isOffline: true })).isOffline).toBe(true);
  });

  it('preserves startedAt', () => {
    expect(buildSessionViewModel(makeInput({ startedAt: 1700000000000 })).startedAt).toBe(1700000000000);
  });

  it('includes timer state', () => {
    const vm = buildSessionViewModel(makeInput({ isRunning: false }));
    expect(vm.timer.isRunning).toBe(false);
    expect(vm.timer.lastTickAt).toBeUndefined();
  });

  it('includes lastTickAt when running', () => {
    const vm = buildSessionViewModel(makeInput({ isRunning: true }));
    expect(vm.timer.lastTickAt).toBeDefined();
  });

  it('allows pause for LIGHT_FOCUS', () => {
    expect(buildSessionViewModel(makeInput({ mode: SessionMode.LIGHT_FOCUS, elapsedSeconds: 120 })).canPause).toBe(true);
  });

  it('disallows pause for SPRINT', () => {
    expect(buildSessionViewModel(makeInput({ mode: SessionMode.SPRINT })).canPause).toBe(false);
  });

  it('allows abandon for ACTIVE', () => {
    expect(buildSessionViewModel(makeInput({ status: 'ACTIVE' as const })).canAbandon).toBe(true);
  });

  it('disallows abandon for COMPLETED', () => {
    expect(buildSessionViewModel(makeInput({ status: 'COMPLETED' as const })).canAbandon).toBe(false);
  });
});
