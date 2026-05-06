import { buildCompletionLedger, type BuildCompletionLedgerInput } from '../ledger-service';
import { SessionMode } from '../../../session/modes';
import type { SessionSummary } from '../../../session/types';

const baseSummary: SessionSummary = {
  actualDuration: 1500,
  baseScore: 100,
  bonuses: [],
  coinsEarned: 50,
  completionPercentage: 100,
  createdAt: Date.now(),
  damageTaken: 0,
  effectiveDuration: 1400,
  finalScore: 120,
  focusPurityScore: 95,
  focusQuality: 95,
  gemsEarned: 0,
  interruptions: 0,
  modeBonus: 0,
  pausedDuration: 0,
  pausedTime: 0,
  pauses: 0,
  penaltiesApplied: [],
  plannedDuration: 1500,
  sessionId: '550e8400-e29b-41d4-a716-446655440000',
  sessionMode: SessionMode.FLOW,
  status: 'COMPLETED',
  streakBonus: 10,
  streakDays: 4,
  streakIncreased: true,
  streakMaintained: true,
  timeBonus: 10,
  userId: 'user-123',
  userLevel: 2,
  vsAverage: 0,
  vsBest: 0,
  xpEarned: 120,
};

describe('buildCompletionLedger', () => {
  it('creates a valid ledger for a normal completed session', () => {
    const input: BuildCompletionLedgerInput = {
      sessionId: '550e8400-e29b-41d4-a716-446655440000',
      summary: baseSummary,
      userId: 'user-123',
    };

    const ledger = buildCompletionLedger(input);

    expect(ledger.ledgerId).toBeDefined();
    expect(ledger.sessionId).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(ledger.userId).toBe('user-123');
    expect(ledger.grade).toMatch(/^[SABCD]$/);
    expect(ledger.gradeScore).toBeGreaterThanOrEqual(0);
    expect(ledger.gradeScore).toBeLessThanOrEqual(100);
    expect(ledger.qualityScore).toBeGreaterThanOrEqual(0);
    expect(ledger.qualityScore).toBeLessThanOrEqual(100);
    expect(ledger.xpDelta).toBeGreaterThan(0);
    expect(ledger.idempotencyKey).toBeDefined();
    expect(ledger.offlineSyncStatus).toBe('synced');
    expect(ledger.timezone).toBe('UTC');
    expect(ledger.companionReactionId).toBeNull();
    expect(ledger.rewardIds).toEqual([]);
    expect(ledger.degradedSystems).toEqual([]);
  });

  it('creates a valid pending ledger for offline mode', () => {
    const input: BuildCompletionLedgerInput = {
      offlineSyncStatus: 'pending_sync',
      sessionId: '550e8400-e29b-41d4-a716-446655440001',
      summary: baseSummary,
      userId: 'user-123',
    };

    const ledger = buildCompletionLedger(input);

    expect(ledger.offlineSyncStatus).toBe('pending_sync');
    expect(ledger.grade).toBeDefined();
    expect(ledger.idempotencyKey).toBeDefined();
  });

  it('uses provided idempotency key', () => {
    const input: BuildCompletionLedgerInput = {
      idempotencyKey: 'custom-key-123',
      sessionId: '550e8400-e29b-41d4-a716-446655440002',
      summary: baseSummary,
      userId: 'user-123',
    };

    const ledger = buildCompletionLedger(input);

    expect(ledger.idempotencyKey).toBe('custom-key-123');
  });

  it('generates unique idempotency key when not provided', () => {
    const input1: BuildCompletionLedgerInput = {
      completedAt: 1000000,
      sessionId: '550e8400-e29b-41d4-a716-446655440003',
      summary: baseSummary,
      userId: 'user-123',
    };
    const input2: BuildCompletionLedgerInput = {
      completedAt: 2000000,
      sessionId: '550e8400-e29b-41d4-a716-446655440003',
      summary: baseSummary,
      userId: 'user-123',
    };

    const ledger1 = buildCompletionLedger(input1);
    const ledger2 = buildCompletionLedger(input2);

    expect(ledger1.idempotencyKey).not.toBe(ledger2.idempotencyKey);
  });

  it('calculates S grade for perfect session', () => {
    const perfectSummary: SessionSummary = {
      ...baseSummary,
      actualDuration: 1800,
      completionPercentage: 100,
      effectiveDuration: 1800,
      focusQuality: 98,
      interruptions: 0,
      pauses: 0,
      plannedDuration: 1800,
    };

    const input: BuildCompletionLedgerInput = {
      sessionId: '550e8400-e29b-41d4-a716-446655440004',
      strictMode: true,
      summary: perfectSummary,
      userId: 'user-123',
    };

    const ledger = buildCompletionLedger(input);

    expect(ledger.grade).toBe('S');
    expect(ledger.gradeScore).toBeGreaterThanOrEqual(93);
    expect(ledger.focusScoreDelta).toBeGreaterThan(0);
  });

  it('calculates D grade for poor session', () => {
    const poorSummary: SessionSummary = {
      ...baseSummary,
      actualDuration: 300,
      completionPercentage: 20,
      effectiveDuration: 200,
      focusQuality: 40,
      interruptions: 5,
      pauses: 8,
      plannedDuration: 1500,
    };

    const input: BuildCompletionLedgerInput = {
      sessionId: '550e8400-e29b-41d4-a716-446655440005',
      summary: poorSummary,
      userId: 'user-123',
    };

    const ledger = buildCompletionLedger(input);

    expect(ledger.grade).toBe('D');
    expect(ledger.gradeScore).toBeLessThan(60);
  });

  it('handles abandoned session', () => {
    const abandonedSummary: SessionSummary = {
      ...baseSummary,
      actualDuration: 200,
      completionPercentage: 15,
      status: 'ABANDONED',
    };

    const input: BuildCompletionLedgerInput = {
      isAbandoned: true,
      sessionId: '550e8400-e29b-41d4-a716-446655440006',
      summary: abandonedSummary,
      userId: 'user-123',
    };

    const ledger = buildCompletionLedger(input);

    expect(ledger.grade).toBe('D');
    expect(ledger.focusScoreDelta).toBeLessThan(0);
  });

  it('handles recovery session with adjusted scoring', () => {
    const recoverySummary: SessionSummary = {
      ...baseSummary,
      actualDuration: 600,
      completionPercentage: 75,
      effectiveDuration: 550,
      plannedDuration: 800,
      sessionMode: SessionMode.RECOVERY,
    };

    const input: BuildCompletionLedgerInput = {
      isRecoverySession: true,
      sessionId: '550e8400-e29b-41d4-a716-446655440007',
      summary: recoverySummary,
      userId: 'user-123',
    };

    const ledger = buildCompletionLedger(input);

    expect(ledger.grade).toBeDefined();
    expect(ledger.mode).toBe('RECOVERY');
  });

  it('handles strict mode with bonus', () => {
    const input: BuildCompletionLedgerInput = {
      sessionId: '550e8400-e29b-41d4-a716-446655440008',
      strictMode: true,
      summary: baseSummary,
      userId: 'user-123',
    };

    const ledgerStrict = buildCompletionLedger(input);
    const ledgerNormal = buildCompletionLedger({
      sessionId: '550e8400-e29b-41d4-a716-446655440009',
      strictMode: false,
      summary: baseSummary,
      userId: 'user-123',
    });

    expect(ledgerStrict.focusScoreDelta).toBeGreaterThan(ledgerNormal.focusScoreDelta);
  });

  it('uses custom timezone', () => {
    const input: BuildCompletionLedgerInput = {
      sessionId: '550e8400-e29b-41d4-a716-446655440010',
      summary: baseSummary,
      timezone: 'America/New_York',
      userId: 'user-123',
    };

    const ledger = buildCompletionLedger(input);

    expect(ledger.timezone).toBe('America/New_York');
  });

  it('includes companion reaction id when provided', () => {
    const input: BuildCompletionLedgerInput = {
      companionReactionId: 'reaction-happy-123',
      sessionId: '550e8400-e29b-41d4-a716-446655440011',
      summary: baseSummary,
      userId: 'user-123',
    };

    const ledger = buildCompletionLedger(input);

    expect(ledger.companionReactionId).toBe('reaction-happy-123');
  });

  it('includes reward ids when provided', () => {
    const input: BuildCompletionLedgerInput = {
      rewardIds: ['reward-1', 'reward-2'],
      sessionId: '550e8400-e29b-41d4-a716-446655440012',
      summary: baseSummary,
      userId: 'user-123',
    };

    const ledger = buildCompletionLedger(input);

    expect(ledger.rewardIds).toEqual(['reward-1', 'reward-2']);
  });

  it('includes daily mission result when provided', () => {
    const missionResult = {
      missionId: 'mission-daily-1',
      progressDelta: 25,
      status: 'progressed' as const,
    };

    const input: BuildCompletionLedgerInput = {
      dailyMissionResult: missionResult,
      sessionId: '550e8400-e29b-41d4-a716-446655440013',
      summary: baseSummary,
      userId: 'user-123',
    };

    const ledger = buildCompletionLedger(input);

    expect(ledger.dailyMissionResult).toEqual(missionResult);
  });

  it('includes degraded systems when provided', () => {
    const input: BuildCompletionLedgerInput = {
      degradedSystems: ['rewards', 'focus-identity'],
      sessionId: '550e8400-e29b-41d4-a716-446655440014',
      summary: baseSummary,
      userId: 'user-123',
    };

    const ledger = buildCompletionLedger(input);

    expect(ledger.degradedSystems).toEqual(['rewards', 'focus-identity']);
  });

  it('rejects invalid session id', () => {
    const input = {
      sessionId: 'not-a-uuid',
      summary: baseSummary,
      userId: 'user-123',
    };

    expect(() => buildCompletionLedger(input as BuildCompletionLedgerInput)).toThrow();
  });

  it('rejects missing user id', () => {
    const input = {
      sessionId: '550e8400-e29b-41d4-a716-446655440015',
      summary: baseSummary,
    };

    expect(() => buildCompletionLedger(input as BuildCompletionLedgerInput)).toThrow();
  });

  it('rejects negative completed duration', () => {
    const invalidSummary = {
      ...baseSummary,
      actualDuration: -100,
    };

    const input: BuildCompletionLedgerInput = {
      sessionId: '550e8400-e29b-41d4-a716-446655440016',
      summary: invalidSummary,
      userId: 'user-123',
    };

    expect(() => buildCompletionLedger(input)).toThrow();
  });

  it('rejects grade outside valid range', () => {
    const invalidSummary = {
      ...baseSummary,
      sessionMode: 'INVALID_MODE',
    };

    const input: BuildCompletionLedgerInput = {
      sessionId: '550e8400-e29b-41d4-a716-446655440017',
      summary: invalidSummary as SessionSummary,
      userId: 'user-123',
    };

    expect(() => buildCompletionLedger(input)).toThrow();
  });
});
