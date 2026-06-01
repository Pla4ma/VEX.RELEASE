import type { PersistedSessionState } from './persistence';

export function isSessionStale(
  persistedAt: number,
  maxAgeMs: number = 24 * 60 * 60 * 1000,
): boolean {
  return Date.now() - persistedAt > maxAgeMs;
}

export function canResumeSession(state: PersistedSessionState): {
  canResume: boolean;
  reason?: string;
  risk: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
} {
  const age = Date.now() - state.lastUpdatedAt;
  if (age > 24 * 60 * 60 * 1000) {
    return {
      canResume: false,
      reason: 'Session is too old (over 24 hours)',
      risk: 'HIGH',
    };
  }
  if (!['ACTIVE', 'PAUSED', 'BACKGROUNDED'].includes(state.status)) {
    return {
      canResume: false,
      reason: `Session is in ${state.status} state`,
      risk: 'NONE',
    };
  }
  if (state.interruptions > 10) {
    return {
      canResume: true,
      reason: `Session has ${state.interruptions} interruptions - quality may be affected`,
      risk: 'MEDIUM',
    };
  }
  if (state.backgroundTime > 30 * 60 * 1000) {
    return {
      canResume: true,
      reason: 'Session was backgrounded for extended period',
      risk: 'MEDIUM',
    };
  }
  return { canResume: true, risk: 'NONE' };
}
