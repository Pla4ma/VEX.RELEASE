/**
 * Session Feature — Recovery Analysis Tests
 */

import {
  evaluateRecovery,
  calculatePenalties,
  canProtectStreak,
  calculatePartialCredit,
  attemptSessionRecovery,
  canAutoRecoverForInterruption,
} from '../recovery/recovery-analysis';

function makeSession(overrides: Record<string, unknown> = {}) {
  return {
    id: 'session-1',
    config: { duration: 1500 },
    baseScore: 100,
    completionPercentage: 60,
    effectiveTime: 1200,
    recoveryAttempts: 0,
    lastRecoveryAt: 0,
    damagePoints: 0,
    ...overrides,
  } as Parameters<typeof evaluateRecovery>[0];
}

describe('recovery-analysis', () => {
  test('evaluateRecovery: AUTO_RESUME succeeds with low penalties', () => {
    expect(evaluateRecovery(makeSession(), 'AUTO_RESUME', [{ amount: 1 }], 0.3)).toBe(true);
  });

  test('evaluateRecovery: AUTO_RESUME fails with high penalties', () => {
    expect(evaluateRecovery(makeSession(), 'AUTO_RESUME', [{ amount: 20 }], 0.3)).toBe(false);
  });

  test('evaluateRecovery: FULL_RESET always succeeds', () => {
    expect(evaluateRecovery(makeSession(), 'FULL_RESET', [], 0.3)).toBe(true);
  });

  test('evaluateRecovery: STREAK_SAVE succeeds with sufficient completion', () => {
    expect(
      evaluateRecovery(makeSession({ completionPercentage: 50 }), 'STREAK_SAVE', [], 0.3),
    ).toBe(true);
  });

  test('calculatePenalties returns correct penalties per recovery type', () => {
    const session = makeSession();
    expect(calculatePenalties(session, 'AUTO_RESUME')).toHaveLength(1);
    expect(calculatePenalties(session, 'USER_RESUME')).toHaveLength(1);
    expect(calculatePenalties(session, 'STREAK_SAVE')).toHaveLength(2);
    expect(calculatePenalties(session, 'FULL_RESET')).toHaveLength(1);
    expect(calculatePenalties(session, 'PARTIAL_CREDIT')).toHaveLength(2);
  });

  test('calculatePenalties adds recovery streak penalty for multiple attempts', () => {
    const session = makeSession({ recoveryAttempts: 2 });
    const penalties = calculatePenalties(session, 'AUTO_RESUME');
    expect(penalties.length).toBeGreaterThan(1);
    expect(penalties.some((p) => p.type === 'RECOVERY_STREAK_PENALTY')).toBe(true);
  });

  test('canProtectStreak returns STREAK_FREEZE for >= 50% completion', () => {
    const result = canProtectStreak(makeSession({ completionPercentage: 60 }), true, 0.3);
    expect(result.canProtect).toBe(true);
    expect(result.protectionType).toBe('STREAK_FREEZE');
  });

  test('canProtectStreak returns false when disabled', () => {
    expect(canProtectStreak(makeSession(), false, 0.3).canProtect).toBe(false);
  });

  test('calculatePartialCredit returns eligible with multiplier for >= 50% completion', () => {
    const result = calculatePartialCredit(makeSession({ completionPercentage: 70 }), 0.3);
    expect(result.eligible).toBe(true);
    expect(result.scoreMultiplier).toBe(0.5);
  });

  test('calculatePartialCredit returns not eligible for very low completion', () => {
    const result = calculatePartialCredit(makeSession({ completionPercentage: 5 }), 0.3);
    expect(result.eligible).toBe(false);
  });

  test('attemptSessionRecovery builds a valid RecoveryRecord', () => {
    const session = makeSession();
    const recovery = attemptSessionRecovery(session, 'USER_RESUME', 0.3);
    expect(recovery.type).toBe('USER_RESUME');
    expect(recovery.sessionId).toBe('session-1');
    expect(recovery.penalties.length).toBeGreaterThan(0);
  });

  test('canAutoRecoverForInterruption allows MINOR always', () => {
    expect(canAutoRecoverForInterruption(0, 3, 'MINOR')).toBe(true);
  });

  test('canAutoRecoverForInterruption blocks SEVERE always', () => {
    expect(canAutoRecoverForInterruption(0, 3, 'SEVERE')).toBe(false);
  });

  test('canAutoRecoverForInterruption respects max recoveries for MODERATE', () => {
    expect(canAutoRecoverForInterruption(3, 3, 'MODERATE')).toBe(false);
    expect(canAutoRecoverForInterruption(1, 3, 'MODERATE')).toBe(true);
  });
});
