import { deriveLanePath } from '../first-week-engines';
import { resolveFirstWeekExperience } from '../first-week-service';
import { baseProfile, baseInput } from './first-week-engines-test-helpers';

describe('deriveLanePath', () => {
  it('student: consistent streak forms path', () => {
    const path = deriveLanePath(
      'student',
      baseProfile({ consistencyScore: 0.7, longestStreak: 4 }),
      0,
    ).pathDescription;
    expect(path).toContain('Study OS');
    expect(path).toContain('consistent');
  });

  it('student: study usage drives path', () => {
    const path = deriveLanePath(
      'student',
      baseProfile({ consistencyScore: 0.3 }),
      0.5,
    ).pathDescription;
    expect(path).toContain('Study OS');
  });

  it('game_like: streak confirms run board', () => {
    const path = deriveLanePath(
      'game_like',
      baseProfile({ longestStreak: 4 }),
      0,
    ).pathDescription;
    expect(path).toContain('Run Board');
  });

  it('deep_creative: saved next moves open project focus path', () => {
    const path = deriveLanePath(
      'deep_creative',
      baseProfile({ savedNextMoves: 3 }),
      0,
    ).pathDescription;
    expect(path).toContain('Project Focus Path');
  });

  it('minimal_normal: consistent opens today strip', () => {
    const path = deriveLanePath(
      'minimal_normal',
      baseProfile({ consistencyScore: 0.8 }),
      0,
    ).pathDescription;
    expect(path).toContain('Today Strip');
  });

  it('path descriptions differ across lanes', () => {
    const sp = baseProfile();
    const paths = [
      'student',
      'game_like',
      'deep_creative',
      'minimal_normal',
    ].map(
      (l) =>
        deriveLanePath(
          l as 'student' | 'game_like' | 'deep_creative' | 'minimal_normal',
          sp,
          0,
        ).pathDescription,
    );
    expect(new Set(paths).size).toBe(4);
  });
});

describe('engine integration with resolveFirstWeekExperience', () => {
  it('engines override static copy when sessionProfile provided', () => {
    const d3 = resolveFirstWeekExperience({
      ...baseInput({
        completedSessions: 3,
        primaryGoal: 'study',
        motivationStyle: 'study_focused',
      }),
      sessionProfile: baseProfile({
        averageDurationMinutes: 42,
        completions: 3,
        consistencyScore: 0.8,
        longestStreak: 4,
      }),
    });
    expect(d3.unlockExplanation).toContain('42');

    const d7 = resolveFirstWeekExperience({
      ...baseInput({
        completedSessions: 7,
        primaryGoal: 'work',
        motivationStyle: 'game_like',
      }),
      behaviorStats: { bossEngagement: 'high', studyUsageRatio: 0 },
      sessionProfile: baseProfile({ longestStreak: 5 }),
    });
    expect(d7.primaryMessage).toContain('streak');

    const d5 = resolveFirstWeekExperience({
      ...baseInput({
        completedSessions: 5,
        primaryGoal: 'creative',
        motivationStyle: 'coach_led',
      }),
      sessionProfile: baseProfile({ savedNextMoves: 3 }),
    });
    expect(d5.unlockExplanation).toContain('Project Focus Path');
  });

  it('static fallback without sessionProfile and comeback suppresses engine', () => {
    const result = resolveFirstWeekExperience(
      baseInput({
        completedSessions: 3,
        primaryGoal: 'study',
        motivationStyle: 'study_focused',
      }),
    );
    expect(result.unlockExplanation).toContain('real session data');

    const comeback = resolveFirstWeekExperience({
      ...baseInput({
        completedSessions: 3,
        daysSinceLastSession: 3,
        primaryGoal: 'study',
        motivationStyle: 'study_focused',
      }),
      sessionProfile: baseProfile(),
    });
    expect(comeback.comebackState).toBe('missed_2_3_days');
    expect(comeback.unlockExplanation).toMatch(/Study OS|path/i);
  });
});
