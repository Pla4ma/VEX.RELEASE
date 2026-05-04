import {
  validateDamageCalculation,
  validateFocusQualityMetrics,
  validateSessionConfig,
  validateSessionSummary,
  validateTimerConfig,
} from '../schemas';

const VALID_SESSION_ID = '550e8400-e29b-41d4-a716-446655440000';

function createValidSummaryInput(): unknown {
  return {
    actualDuration: 1_500,
    baseScore: 250,
    coinsEarned: 50,
    completionPercentage: 100,
    createdAt: 1_700_000_000_000,
    damageTaken: 0,
    effectiveDuration: 1_500,
    finalScore: 300,
    focusQuality: 95,
    gemsEarned: 0,
    interruptions: 0,
    pausedDuration: 0,
    pauses: 0,
    penaltiesApplied: [],
    plannedDuration: 1_500,
    sessionId: VALID_SESSION_ID,
    status: 'COMPLETED',
    streakBonus: 25,
    streakDays: 7,
    streakIncreased: true,
    streakMaintained: true,
    timeBonus: 25,
    userId: 'user-1',
    vsAverage: 10,
    vsBest: 0,
    xpEarned: 120,
  };
}

describe('session validation schemas', () => {
  it('applies safe defaults for completion summaries at app boundaries', () => {
    const result = validateSessionSummary(createValidSummaryInput());

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data.focusPurityScore).toBe(100);
    expect(result.data.isPerfect).toBe(false);
    expect(result.data.userLevel).toBe(1);
  });

  it('rejects corrupted completion summaries before rewards or streaks can consume them', () => {
    const result = validateSessionSummary({
      ...createValidSummaryInput(),
      completionPercentage: 101,
      sessionId: 'not-a-session-id',
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.issues.map((issue) => issue.path.join('.'))).toEqual(
      expect.arrayContaining(['completionPercentage', 'sessionId']),
    );
  });

  it('rejects impossible session setup values that would break timer recovery', () => {
    const result = validateSessionConfig({
      autoStartBreaks: false,
      autoStartNextInterval: false,
      breakDuration: 300,
      dndEnabled: false,
      duration: 30,
      intervals: 0,
      longBreakDuration: 900,
      longBreakInterval: 4,
      soundEnabled: true,
      strictMode: false,
      tags: [],
      vibrationEnabled: true,
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.issues.map((issue) => issue.path.join('.'))).toEqual(
      expect.arrayContaining(['duration', 'intervals']),
    );
  });

  it('rejects invalid focus quality and timer recovery metrics', () => {
    const focusResult = validateFocusQualityMetrics({
      calculatedAt: 1_700_000_000_000,
      consistencyScore: 90,
      depthScore: 90,
      focusSegments: [
        {
          duration: -1,
          endAt: 1_700_000_001_000,
          quality: 120,
          startAt: 1_700_000_000_000,
        },
      ],
      overallScore: 90,
      recoveryScore: 90,
      sessionId: VALID_SESSION_ID,
      timeDistracted: 0,
      timeInDeepFocus: 1_000,
      timeInShallowFocus: 500,
    });
    const timerResult = validateTimerConfig({
      backgroundTickInterval: 60_001,
      maxPauseDuration: 60_000,
      pauseThreshold: 5_000,
      tickInterval: 50,
      warningThresholds: [300, 60],
    });

    expect(focusResult.success).toBe(false);
    expect(timerResult.success).toBe(false);
  });

  it('keeps damage mitigation bounded so penalties cannot invert rewards', () => {
    const result = validateDamageCalculation({
      abandonDamage: 0,
      antiCheatDamage: 0,
      baseDamage: 10,
      finalPenalty: 1.2,
      interruptionDamage: 5,
      mitigation: -0.1,
      pauseDamage: 5,
      streakProtection: false,
      totalDamage: 20,
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.issues.map((issue) => issue.path.join('.'))).toEqual(
      expect.arrayContaining(['finalPenalty', 'mitigation']),
    );
  });
});
