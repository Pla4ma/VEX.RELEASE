/**
 * Structured execution usage signal tests.
 *
 * Verifies:
 * - STUDY sessions raise Study OS prominence
 * - DEEP_WORK sessions raise Deep Work Plan prominence
 * - LEARNING goal sessions raise Learning OS prominence
 * - CREATIVE sessions raise Project Focus Path
 * - Non-student work user is not treated as generic focus if they use Deep Work heavily
 */
import { describe, it, expect } from '@jest/globals';
import { resolveUserBehaviorSignals } from '../../../features/personalization/behavior-resolver';

function makeInput(
  sessions: {
    mode: string;
    config?: { sessionMode?: string; studyPlanId?: string };
  }[],
  totalSessions?: number,
) {
  const studySessions = sessions.filter(
    (s) =>
      s.mode === 'STUDY' ||
      s.config?.sessionMode === 'STUDY' ||
      Boolean(s.config?.studyPlanId),
  ).length;
  const deepWorkSessions = sessions.filter(
    (s) => s.mode === 'DEEP_WORK' || s.config?.sessionMode === 'DEEP_WORK',
  ).length;
  const learningSessions = sessions.filter(
    (s) => s.mode === 'LEARNING' || s.config?.sessionMode === 'LEARNING',
  ).length;
  const creativeSessions = sessions.filter(
    (s) => s.mode === 'CREATIVE' || s.config?.sessionMode === 'CREATIVE',
  ).length;

  return {
    recentSignals: [],
    recentSessions: {
      completedSessions: sessions.length,
      studySessions,
      deepWorkSessions,
      learningSessions,
      creativeSessions,
      totalSessions: totalSessions ?? sessions.length,
      preferredMode: null,
      bestTimeOfDay: null,
    },
    firstWeekExperience: {
      stage: 'POST_DAY_7',
      isDayZero: false,
    },
  };
}

describe('structured execution usage signals', () => {
  it('STUDY sessions raise studyUsageRatio', () => {
    const input = makeInput([
      { mode: 'STUDY', config: { studyPlanId: 'plan-1' } },
      { mode: 'STUDY' },
      { mode: 'STUDY' },
      { mode: 'FOCUS' },
    ]);
    const result = resolveUserBehaviorSignals(input);
    expect(result.studyUsageRatio).toBeGreaterThan(0.5);
  });

  it('DEEP_WORK sessions raise deepWorkUsageRatio', () => {
    const input = makeInput([
      { mode: 'DEEP_WORK' },
      { mode: 'DEEP_WORK' },
      { mode: 'FOCUS' },
    ]);
    const result = resolveUserBehaviorSignals(input);
    expect(result.deepWorkUsageRatio).toBeGreaterThan(0.4);
  });

  it('LEARNING sessions raise learningUsageRatio', () => {
    const input = makeInput([
      { mode: 'LEARNING' },
      { mode: 'LEARNING' },
      { mode: 'FOCUS' },
      { mode: 'FOCUS' },
      { mode: 'FOCUS' },
    ]);
    const result = resolveUserBehaviorSignals(input);

    expect(result.learningUsageRatio).toBe(0.4);
  });

  it('CREATIVE sessions raise projectFocusUsageRatio', () => {
    const input = makeInput([
      { mode: 'CREATIVE' },
      { mode: 'CREATIVE' },
      { mode: 'FOCUS' },
    ]);
    const result = resolveUserBehaviorSignals(input);
    expect(result.projectFocusUsageRatio).toBeGreaterThan(0.4);
  });

  it('structuredExecutionUsageRatio aggregates deep work, learning, and creative', () => {
    const input = makeInput([
      { mode: 'DEEP_WORK' },
      { mode: 'LEARNING' },
      { mode: 'CREATIVE' },
      { mode: 'FOCUS' },
    ]);
    const result = resolveUserBehaviorSignals(input);
    expect(result.structuredExecutionUsageRatio).toBe(0.75);
  });

  it('non-student work user with heavy Deep Work use gets high structured ratio', () => {
    const input = makeInput([
      { mode: 'DEEP_WORK' },
      { mode: 'DEEP_WORK' },
      { mode: 'DEEP_WORK' },
      { mode: 'FOCUS' },
    ]);
    const result = resolveUserBehaviorSignals(input);
    expect(result.studyUsageRatio).toBe(0);
    expect(result.deepWorkUsageRatio).toBe(0.75);
    expect(result.structuredExecutionUsageRatio).toBe(0.75);
  });

  it('day zero returns all zero ratios', () => {
    const input = {
      recentSignals: [],
      recentSessions: {
        completedSessions: 1,
        studySessions: 1,
        deepWorkSessions: 1,
        learningSessions: 1,
        creativeSessions: 1,
        totalSessions: 5,
        preferredMode: null,
        bestTimeOfDay: null,
      },
      firstWeekExperience: {
        stage: 'DAY_0_NOT_STARTED',
        isDayZero: true,
      },
    };
    const result = resolveUserBehaviorSignals(input);
    expect(result.studyUsageRatio).toBe(0);
    expect(result.deepWorkUsageRatio).toBe(0);
    expect(result.learningUsageRatio).toBe(0);
    expect(result.projectFocusUsageRatio).toBe(0);
    expect(result.structuredExecutionUsageRatio).toBe(0);
  });
});
