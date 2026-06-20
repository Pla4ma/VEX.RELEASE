import { SessionMode } from '../../../session/modes';
import {
  buildCompletionLedger,
  type BuildCompletionLedgerInput,
} from '../ledger-service';
import { CompletionLedgerSchema } from '../schemas';
import { createSessionSummary, SESSION_ID, USER_ID } from './ledger-test-utils';

const COMPLETED_AT = 1710001500000;
const DEFAULT_TIMEZONE = 'UTC';

function createValidSummary(overrides: Partial<ReturnType<typeof createSessionSummary>> = {}) {
  return createSessionSummary({
    finalScore: 85, // Must be <= 100 for gradeScore validation
    ...overrides,
  });
}

describe('buildCompletionLedger core contract', () => {
  it('ledger schema rejects missing required fields', () => {
    expect(() =>
      CompletionLedgerSchema.parse({
        ledgerId: '550e8400-e29b-41d4-a716-446655440001',
        sessionId: SESSION_ID,
        userId: USER_ID,
      }),
    ).toThrow();
  });

  it('creates a valid ledger for a normal completed session', () => {
    const ledger = buildCompletionLedger({
      completedAt: COMPLETED_AT,
      offlineSyncStatus: 'synced',
      sessionId: SESSION_ID,
      summary: createValidSummary(),
      timezone: DEFAULT_TIMEZONE,
      userId: USER_ID,
    });

    expect(ledger).toMatchObject({
      sessionId: SESSION_ID,
      userId: USER_ID,
      offlineSyncStatus: 'synced',
      timezone: 'UTC',
      companionReactionId: null,
      rewardIds: [],
      degradedSystems: [],
    });
    expect(ledger.ledgerId).toBeDefined();
    expect(ledger.grade).toMatch(/^[SABCD]$/);
    expect(ledger.gradeScore).toBeGreaterThanOrEqual(0);
    expect(ledger.gradeScore).toBeLessThanOrEqual(100);
    expect(ledger.qualityScore).toBeGreaterThanOrEqual(0);
    expect(ledger.qualityScore).toBeLessThanOrEqual(100);
    expect(ledger.xpDelta).toBeGreaterThan(0);
    expect(ledger.idempotencyKey).toBeDefined();
  });

  it('creates a valid pending ledger for offline mode', () => {
    const ledger = buildCompletionLedger({
      completedAt: COMPLETED_AT,
      offlineSyncStatus: 'pending_sync',
      sessionId: '550e8400-e29b-41d4-a716-446655440001',
      summary: createValidSummary(),
      timezone: DEFAULT_TIMEZONE,
      userId: USER_ID,
    });

    expect(ledger.offlineSyncStatus).toBe('pending_sync');
    expect(ledger.grade).toBeDefined();
  });

  it('uses provided idempotency key and generates session-bound keys', () => {
    const custom = buildCompletionLedger({
      completedAt: COMPLETED_AT,
      idempotencyKey: 'custom-key-123',
      offlineSyncStatus: 'synced',
      sessionId: '550e8400-e29b-41d4-a716-446655440002',
      summary: createValidSummary(),
      timezone: DEFAULT_TIMEZONE,
      userId: USER_ID,
    });
    const first = buildCompletionLedger({
      completedAt: 1000000,
      offlineSyncStatus: 'synced',
      sessionId: '550e8400-e29b-41d4-a716-446655440003',
      summary: createValidSummary(),
      timezone: DEFAULT_TIMEZONE,
      userId: USER_ID,
    });
    const second = buildCompletionLedger({
      completedAt: 2000000,
      offlineSyncStatus: 'synced',
      sessionId: '550e8400-e29b-41d4-a716-446655440003',
      summary: createValidSummary(),
      timezone: DEFAULT_TIMEZONE,
      userId: USER_ID,
    });
    const different = buildCompletionLedger({
      completedAt: COMPLETED_AT,
      offlineSyncStatus: 'synced',
      sessionId: '550e8400-e29b-41d4-a716-446655440004',
      summary: createValidSummary(),
      timezone: DEFAULT_TIMEZONE,
      userId: USER_ID,
    });

    expect(custom.idempotencyKey).toBe('custom-key-123');
    // Same sessionId produces same idempotency key regardless of completedAt
    expect(first.idempotencyKey).toBe(second.idempotencyKey);
    expect(first.idempotencyKey).toContain(USER_ID);
    expect(first.idempotencyKey).toContain('550e8400-e29b-41d4-a716-446655440003');
    // Different sessionId produces different key
    expect(first.idempotencyKey).not.toBe(different.idempotencyKey);
  });

  it('uses custom timezone and optional integration outputs', () => {
    const missionResult = {
      missionId: 'mission-daily-1',
      progressDelta: 25,
      status: 'progressed' as const,
    };
    const ledger = buildCompletionLedger({
      companionReactionId: 'reaction-happy-123',
      completedAt: COMPLETED_AT,
      dailyMissionResult: missionResult,
      degradedSystems: ['rewards', 'focus-identity'],
      offlineSyncStatus: 'synced',
      rewardIds: ['reward-1', 'reward-2'],
      sessionId: '550e8400-e29b-41d4-a716-446655440004',
      summary: createValidSummary(),
      timezone: 'America/New_York',
      userId: USER_ID,
    });

    expect(ledger.timezone).toBe('America/New_York');
    expect(ledger.companionReactionId).toBe('reaction-happy-123');
    expect(ledger.rewardIds).toEqual(['reward-1', 'reward-2']);
    expect(ledger.dailyMissionResult).toEqual(missionResult);
    expect(ledger.degradedSystems).toEqual(['rewards', 'focus-identity']);
  });

  it('rejects invalid ledger inputs before persistence', () => {
    expect(() =>
      buildCompletionLedger({
        sessionId: 'not-a-uuid',
        summary: createSessionSummary(),
        userId: USER_ID,
      } as BuildCompletionLedgerInput),
    ).toThrow();

    expect(() =>
      buildCompletionLedger({
        sessionId: SESSION_ID,
        summary: createSessionSummary(),
      } as BuildCompletionLedgerInput),
    ).toThrow();

    expect(() =>
      buildCompletionLedger({
        sessionId: SESSION_ID,
        summary: createSessionSummary({ actualDuration: -100 }),
        userId: USER_ID,
      }),
    ).toThrow();

    expect(() =>
      buildCompletionLedger({
        sessionId: SESSION_ID,
        summary: createSessionSummary({
          sessionMode: 'INVALID_MODE' as SessionMode,
        }),
        userId: USER_ID,
      }),
    ).toThrow();
  });
});
