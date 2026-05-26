import { deriveCompanionObservation, deriveWeeklyRecommendation, deriveLanePath } from '../first-week-engines';
import type { SessionProfile, FirstWeekResolverInput } from '../first-week-schemas';
import { resolveFirstWeekExperience } from '../first-week-service';

function baseProfile(overrides: Partial<SessionProfile> = {}): SessionProfile {
  return {
    averageDurationMinutes: 35, completions: 3, abandonments: 0,
    preferredStartHour: 9, consistencyScore: 0.5, savedNextMoves: 0,
    longestStreak: 2, ...overrides,
  };
}

function baseInput(overrides: Partial<FirstWeekResolverInput> = {}): FirstWeekResolverInput {
  return {
    behaviorStats: { bossEngagement: 'none', studyUsageRatio: 0 },
    completedSessions: 3, daysSinceLastSession: null, daysSinceOnboarding: 3,
    featureAvailability: { boss: true, premium: false, social: false, study: true },
    motivationStyle: 'calm', premiumState: 'unavailable', primaryGoal: 'focus',
    ...overrides,
  };
}

describe('deriveCompanionObservation', () => {
  it('student: consistent rhythm produces timing observation', () => {
    const sp = baseProfile({ consistencyScore: 0.8, longestStreak: 4, completions: 3, averageDurationMinutes: 40 });
    const obs = deriveCompanionObservation('student', sp).observation;
    expect(obs).toContain('40');
    expect(obs).toContain('consistent');
  });

  it('student: preferred hour produces time-window observation', () => {
    const sp = baseProfile({ consistencyScore: 0.3, preferredStartHour: 15, completions: 2 });
    const obs = deriveCompanionObservation('student', sp).observation;
    expect(obs).toContain('15:00');
  });

  it('game_like: more completions than abandonments', () => {
    const sp = baseProfile({ completions: 4, abandonments: 1, longestStreak: 3 });
    const obs = deriveCompanionObservation('game_like', sp).observation;
    expect(obs).toContain('4 completed');
    expect(obs).toContain('1 abandoned');
  });

  it('deep_creative: saved next moves', () => {
    const sp = baseProfile({ savedNextMoves: 3 });
    const obs = deriveCompanionObservation('deep_creative', sp).observation;
    expect(obs).toContain('3 next moves');
  });

  it('minimal_normal: uses preferred start hour when available', () => {
    const sp = baseProfile({ preferredStartHour: 7 });
    const obs = deriveCompanionObservation('minimal_normal', sp).observation;
    expect(obs).toContain('7:00');
  });

  it('minimal_normal: falls back to general tempo observation', () => {
    const sp = baseProfile({ preferredStartHour: null, consistencyScore: 0.3 });
    const obs = deriveCompanionObservation('minimal_normal', sp).observation;
    expect(obs).toContain('35 minutes');
  });

  it('all lanes produce non-empty observation', () => {
    for (const lane of ['student', 'game_like', 'deep_creative', 'minimal_normal'] as const) {
      expect(deriveCompanionObservation(lane, baseProfile()).observation.length).toBeGreaterThan(20);
    }
  });

  it('observations vary with different profile inputs', () => {
    const sp1 = baseProfile({ preferredStartHour: 8, consistencyScore: 0.3 });
    const sp2 = baseProfile({ preferredStartHour: 16, consistencyScore: 0.3 });
    expect(deriveCompanionObservation('student', sp1).observation).toContain('8:00');
    expect(deriveCompanionObservation('student', sp2).observation).toContain('16:00');
    expect(deriveCompanionObservation('student', sp1).observation).not.toBe(
      deriveCompanionObservation('student', sp2).observation,
    );
  });
});

describe('deriveWeeklyRecommendation', () => {
  it('student: consistent with streak gets next-step recommendation', () => {
    const rec = deriveWeeklyRecommendation('student', baseProfile({ consistencyScore: 0.8, longestStreak: 5 }), 'none', 0);
    expect(rec.headline).toContain('rhythm');
    expect(rec.recommendation).toContain('minutes');
  });

  it('student: low consistency gets building advice', () => {
    const rec = deriveWeeklyRecommendation('student', baseProfile({ consistencyScore: 0.3 }), 'none', 0.2);
    expect(rec.recommendation).toMatch(/consistency|consistent|two/);
  });

  it('game_like: streak builder with boss engagement', () => {
    const rec = deriveWeeklyRecommendation('game_like', baseProfile({ longestStreak: 4 }), 'high', 0);
    expect(rec.headline).toContain('streak');
  });
  it('game_like: abandonments trigger warmup advice', () => {
    const rec = deriveWeeklyRecommendation('game_like', baseProfile({ abandonments: 3, longestStreak: 1 }), 'low', 0);
    expect(rec.headline).toMatch(/unfinished|abandoned/);
  });

  it('deep_creative: saved next moves recommendation', () => {
    const rec = deriveWeeklyRecommendation('deep_creative', baseProfile({ savedNextMoves: 3 }), 'none', 0);
    expect(rec.recommendation).toContain('90-minute');
  });

  it('minimal_normal: consistent gets steady recommendation', () => {
    const rec = deriveWeeklyRecommendation('minimal_normal', baseProfile({ consistencyScore: 0.9 }), 'none', 0);
    expect(rec.headline).toContain('consistent');
    expect(rec.recommendation.length).toBeGreaterThan(30);
  });

  it('all lanes produce substantively different recommendations', () => {
    const sp = baseProfile();
    const results = ['student', 'game_like', 'deep_creative', 'minimal_normal'].map((l) =>
      deriveWeeklyRecommendation(l as 'student' | 'game_like' | 'deep_creative' | 'minimal_normal', sp, 'none', 0).recommendation,
    );
    expect(new Set(results).size).toBe(4);
  });

  it('recommendation contains actionable suggestion', () => {
    for (const lane of ['student', 'game_like', 'deep_creative', 'minimal_normal'] as const) {
      const rec = deriveWeeklyRecommendation(lane, baseProfile(), 'none', 0).recommendation;
      expect(rec.length).toBeGreaterThan(30);
    }
  });
});

describe('deriveLanePath', () => {
  it('student: consistent streak forms path', () => {
    const path = deriveLanePath('student', baseProfile({ consistencyScore: 0.7, longestStreak: 4 }), 0).pathDescription;
    expect(path).toContain('Study OS');
    expect(path).toContain('consistent');
  });

  it('student: study usage drives path', () => {
    const path = deriveLanePath('student', baseProfile({ consistencyScore: 0.3 }), 0.5).pathDescription;
    expect(path).toContain('Study OS');
  });

  it('game_like: streak confirms run board', () => {
    const path = deriveLanePath('game_like', baseProfile({ longestStreak: 4 }), 0).pathDescription;
    expect(path).toContain('Run Board');
  });

  it('deep_creative: saved next moves open project focus path', () => {
    const path = deriveLanePath('deep_creative', baseProfile({ savedNextMoves: 3 }), 0).pathDescription;
    expect(path).toContain('Project Focus Path');
  });

  it('minimal_normal: consistent opens today strip', () => {
    const path = deriveLanePath('minimal_normal', baseProfile({ consistencyScore: 0.8 }), 0).pathDescription;
    expect(path).toContain('Today Strip');
  });

  it('path descriptions differ across lanes', () => {
    const sp = baseProfile();
    const paths = ['student', 'game_like', 'deep_creative', 'minimal_normal'].map((l) =>
      deriveLanePath(l as 'student' | 'game_like' | 'deep_creative' | 'minimal_normal', sp, 0).pathDescription,
    );
    expect(new Set(paths).size).toBe(4);
  });
});

describe('engine integration with resolveFirstWeekExperience', () => {
  it('engines override static copy when sessionProfile provided', () => {
    const d3 = resolveFirstWeekExperience({
      ...baseInput({ completedSessions: 3, primaryGoal: 'study', motivationStyle: 'study_focused' }),
      sessionProfile: baseProfile({ averageDurationMinutes: 42, completions: 3, consistencyScore: 0.8, longestStreak: 4 }),
    });
    expect(d3.unlockExplanation).toContain('42');

    const d7 = resolveFirstWeekExperience({
      ...baseInput({ completedSessions: 7, primaryGoal: 'work', motivationStyle: 'game_like' }),
      behaviorStats: { bossEngagement: 'high', studyUsageRatio: 0 },
      sessionProfile: baseProfile({ longestStreak: 5 }),
    });
    expect(d7.primaryMessage).toContain('streak');

    const d5 = resolveFirstWeekExperience({
      ...baseInput({ completedSessions: 5, primaryGoal: 'creative', motivationStyle: 'coach_led' }),
      sessionProfile: baseProfile({ savedNextMoves: 3 }),
    });
    expect(d5.unlockExplanation).toContain('Project Focus Path');
  });

  it('static fallback without sessionProfile and comeback suppresses engine', () => {
    const result = resolveFirstWeekExperience(
      baseInput({ completedSessions: 3, primaryGoal: 'study', motivationStyle: 'study_focused' }),
    );
    expect(result.unlockExplanation).toContain('real session data');

    const comeback = resolveFirstWeekExperience({
      ...baseInput({ completedSessions: 3, daysSinceLastSession: 3, primaryGoal: 'study', motivationStyle: 'study_focused' }),
      sessionProfile: baseProfile(),
    });
    expect(comeback.comebackState).toBe('missed_2_3_days');
    expect(comeback.unlockExplanation).toMatch(/Study OS|path/i);
  });
});
