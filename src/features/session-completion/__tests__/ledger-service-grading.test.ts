import { SessionMode } from '../../../session/modes';
import { buildCompletionLedger } from '../ledger-service';
import { createSessionSummary, USER_ID } from './ledger-test-utils';

describe('buildCompletionLedger grading paths', () => {
  it('calculates S grade for perfect session', () => {
    const ledger = buildCompletionLedger({
      completedAt: 1710001800000,
      offlineSyncStatus: 'synced',
      sessionId: '550e8400-e29b-41d4-a716-446655440004',
      strictMode: true,
      summary: createSessionSummary({
        actualDuration: 1800,
        completionPercentage: 100,
        effectiveDuration: 1800,
        focusQuality: 98,
        focusPurityScore: 98,
        interruptions: 0,
        pauses: 0,
        plannedDuration: 1800,
      }),
      timezone: 'UTC',
      userId: USER_ID,
    });

    expect(ledger.grade).toBe('S');
    expect(ledger.gradeScore).toBeGreaterThanOrEqual(93);
    expect(ledger.focusScoreDelta).toBeGreaterThan(0);
  });

  it('calculates D grade for poor session and abandoned session', () => {
    const poor = buildCompletionLedger({
      completedAt: 1710000300000,
      offlineSyncStatus: 'synced',
      sessionId: '550e8400-e29b-41d4-a716-446655440005',
      summary: createSessionSummary({
        actualDuration: 300,
        completionPercentage: 20,
        effectiveDuration: 200,
        finalScore: 25,
        focusPurityScore: 20,
        focusQuality: 40,
        interruptions: 5,
        pauses: 8,
      }),
      timezone: 'UTC',
      userId: USER_ID,
    });
    const abandoned = buildCompletionLedger({
      completedAt: 1710000200000,
      isAbandoned: true,
      offlineSyncStatus: 'synced',
      sessionId: '550e8400-e29b-41d4-a716-446655440006',
      summary: createSessionSummary({
        actualDuration: 200,
        completionPercentage: 15,
        finalScore: 15,
        focusPurityScore: -5,
        status: 'ABANDONED',
      }),
      timezone: 'UTC',
      userId: USER_ID,
    });

    expect(poor.grade).toBe('D');
    expect(poor.gradeScore).toBeLessThan(60);
    expect(abandoned.grade).toBe('D');
    expect(abandoned.focusScoreDelta).toBeLessThan(0);
  });

  it('handles recovery session and strict mode scoring', () => {
    const recovery = buildCompletionLedger({
      completedAt: 1710000600000,
      isRecoverySession: true,
      offlineSyncStatus: 'synced',
      sessionId: '550e8400-e29b-41d4-a716-446655440007',
      summary: createSessionSummary({
        actualDuration: 600,
        completionPercentage: 75,
        effectiveDuration: 550,
        plannedDuration: 800,
        sessionMode: SessionMode.RECOVERY,
      }),
      timezone: 'UTC',
      userId: USER_ID,
    });
    const strict = buildCompletionLedger({
      completedAt: 1710001800000,
      offlineSyncStatus: 'synced',
      sessionId: '550e8400-e29b-41d4-a716-446655440008',
      strictMode: true,
      summary: createSessionSummary({
        focusPurityScore: 98,
      }),
      timezone: 'UTC',
      userId: USER_ID,
    });
    const normal = buildCompletionLedger({
      completedAt: 1710001800000,
      offlineSyncStatus: 'synced',
      sessionId: '550e8400-e29b-41d4-a716-446655440009',
      strictMode: false,
      summary: createSessionSummary(),
      timezone: 'UTC',
      userId: USER_ID,
    });

    expect(recovery.mode).toBe('RECOVERY');
    expect(strict.focusScoreDelta).toBeGreaterThan(normal.focusScoreDelta);
  });
});
