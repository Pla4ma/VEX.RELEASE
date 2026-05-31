import { SessionMode } from '../../../session/modes';
import { buildCompletionLedger } from '../ledger-service';
import { createSessionSummary, USER_ID } from './ledger-test-utils';

describe('buildCompletionLedger grading paths', () => {
  it('calculates S grade for perfect session', () => {
    const ledger = buildCompletionLedger({
      sessionId: '550e8400-e29b-41d4-a716-446655440004',
      strictMode: true,
      summary: createSessionSummary({
        actualDuration: 1800,
        completionPercentage: 100,
        effectiveDuration: 1800,
        focusQuality: 98,
        interruptions: 0,
        pauses: 0,
        plannedDuration: 1800,
      }),
      userId: USER_ID,
    });

    expect(ledger.grade).toBe('S');
    expect(ledger.gradeScore).toBeGreaterThanOrEqual(93);
    expect(ledger.focusScoreDelta).toBeGreaterThan(0);
  });

  it('calculates D grade for poor session and abandoned session', () => {
    const poor = buildCompletionLedger({
      sessionId: '550e8400-e29b-41d4-a716-446655440005',
      summary: createSessionSummary({
        actualDuration: 300,
        completionPercentage: 20,
        effectiveDuration: 200,
        focusQuality: 40,
        interruptions: 5,
        pauses: 8,
      }),
      userId: USER_ID,
    });
    const abandoned = buildCompletionLedger({
      isAbandoned: true,
      sessionId: '550e8400-e29b-41d4-a716-446655440006',
      summary: createSessionSummary({
        actualDuration: 200,
        completionPercentage: 15,
        status: 'ABANDONED',
      }),
      userId: USER_ID,
    });

    expect(poor.grade).toBe('D');
    expect(poor.gradeScore).toBeLessThan(60);
    expect(abandoned.grade).toBe('D');
    expect(abandoned.focusScoreDelta).toBeLessThan(0);
  });

  it('handles recovery session and strict mode scoring', () => {
    const recovery = buildCompletionLedger({
      isRecoverySession: true,
      sessionId: '550e8400-e29b-41d4-a716-446655440007',
      summary: createSessionSummary({
        actualDuration: 600,
        completionPercentage: 75,
        effectiveDuration: 550,
        plannedDuration: 800,
        sessionMode: SessionMode.RECOVERY,
      }),
      userId: USER_ID,
    });
    const strict = buildCompletionLedger({
      sessionId: '550e8400-e29b-41d4-a716-446655440008',
      strictMode: true,
      summary: createSessionSummary(),
      userId: USER_ID,
    });
    const normal = buildCompletionLedger({
      sessionId: '550e8400-e29b-41d4-a716-446655440009',
      strictMode: false,
      summary: createSessionSummary(),
      userId: USER_ID,
    });

    expect(recovery.mode).toBe('RECOVERY');
    expect(strict.focusScoreDelta).toBeGreaterThan(normal.focusScoreDelta);
  });
});
