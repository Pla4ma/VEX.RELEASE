import { createMockSession, createEngines } from './CompletionEngine.helpers';

describe('CompletionEngine — abandonSession', () => {
  let completionEngine: ReturnType<typeof createEngines>['completionEngine'];

  beforeEach(() => {
    completionEngine = createEngines().completionEngine;
  });

  it('should handle session abandonment', () => {
    const session = createMockSession({ completionPercentage: 30 });
    const result = completionEngine.abandonSession(session);
    expect(result.sessionId).toBe('test-session');
    expect(result.canRecover).toBeDefined();
  });

  it('should set session status to ABANDONED', () => {
    const session = createMockSession();
    completionEngine.abandonSession(session);
    expect(session.status).toBe('ABANDONED');
  });

  it('should set endedAt timestamp', () => {
    const session = createMockSession();
    completionEngine.abandonSession(session);
    expect(session.endedAt).toBeDefined();
    expect(session.endedAt).toBeGreaterThan(0);
  });

  it('should calculate damage for abandonment', () => {
    const session = createMockSession({ baseScore: 250 });
    const result = completionEngine.abandonSession(session);
    expect(result.damage).toBeDefined();
    expect(result.damage.baseDamage).toBeGreaterThan(0);
  });

  it('should indicate streak is broken on abandon', () => {
    const session = createMockSession();
    const result = completionEngine.abandonSession(session);
    expect(result.streakBroken).toBe(true);
  });

  it('should provide partial credit based on effective time', () => {
    const highEffective = createMockSession({ effectiveTime: 500000 });
    const lowEffective = createMockSession({ effectiveTime: 100 });
    const highResult = completionEngine.abandonSession(highEffective);
    const lowResult = completionEngine.abandonSession(lowEffective);
    expect(highResult.partialCredit).toBe(true);
    expect(lowResult.partialCredit).toBe(false);
  });

  it('should allow recovery when recovery attempts remain', () => {
    const session = createMockSession({
      recoveryAttempts: 0,
      maxRecoveryAttempts: 3,
    });
    const result = completionEngine.abandonSession(session);
    expect(result.canRecover).toBe(true);
  });

  it('should not allow recovery when max attempts exhausted', () => {
    const session = createMockSession({
      recoveryAttempts: 3,
      maxRecoveryAttempts: 3,
    });
    const result = completionEngine.abandonSession(session);
    expect(result.canRecover).toBe(false);
  });
});
