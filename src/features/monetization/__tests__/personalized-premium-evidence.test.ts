import { resolvePersonalizedPremium } from '../personalized-premium';
import type {
  PremiumPersonalizationInput,
  SessionEvidence,
} from '../personalized-premium';

function makeInput(
  overrides: Partial<PremiumPersonalizationInput> = {},
): PremiumPersonalizationInput {
  return {
    billingConfigured: true,
    completedSessions: 0,
    primaryGoal: 'focus',
    motivationStyle: 'calm',
    studyUsageRatio: 0,
    hasTriedAdvancedStudy: false,
    hasTriedWeeklyReport: false,
    hasTriedVisualIdentity: false,
    currentStreakDays: 0,
    daysSinceOnboarding: 2,
    ...overrides,
  };
}

function makeEvidence(
  overrides: Partial<SessionEvidence> = {},
): SessionEvidence {
  return {
    completedSessions: 12,
    focusHours: 8,
    consistencyRate: 0.75,
    ...overrides,
  };
}

describe('resolvePersonalizedPremium - session evidence body copy', () => {
  it('references session count and focus hours in body', () => {
    const result = resolvePersonalizedPremium(
      makeInput({
        completedSessions: 45,
        lane: 'student',
        sessionEvidence: makeEvidence({
          completedSessions: 42,
          focusHours: 15,
          bestWindow: 'morning',
          bestDay: 'weekday',
        }),
      }),
    );
    expect(result.premiumBody).toMatch(/42 sessions/);
    expect(result.premiumBody).toMatch(/15h/);
    expect(result.premiumBody).toContain('mornings');
    expect(result.premiumBody).toContain('weekdays');
  });

  it('references best windows for game_like lane', () => {
    const result = resolvePersonalizedPremium(
      makeInput({
        completedSessions: 45,
        lane: 'game_like',
        sessionEvidence: makeEvidence({
          completedSessions: 30,
          focusHours: 22,
          bestWindow: 'evening',
        }),
      }),
    );
    expect(result.premiumBody).toMatch(/30 sessions/);
    expect(result.premiumBody).toMatch(/22h/);
    expect(result.premiumBody).toContain('evenings');
  });

  it('references project session counts for deep_creative lane', () => {
    const result = resolvePersonalizedPremium(
      makeInput({
        completedSessions: 50,
        lane: 'deep_creative',
        sessionEvidence: makeEvidence({
          completedSessions: 48,
          focusHours: 30,
          consistencyRate: 0.82,
          completedSessionsInLane: 15,
        }),
      }),
    );
    expect(result.premiumBody).toMatch(/48 total sessions/);
    expect(result.premiumBody).toContain('15 project sessions');
    expect(result.premiumBody).toMatch(/82%/);
  });

  it('falls back to generic when evidence is insufficient', () => {
    const result = resolvePersonalizedPremium(
      makeInput({
        completedSessions: 45,
        lane: 'student',
        sessionEvidence: makeEvidence({
          completedSessions: 3,
          focusHours: 0.5,
        }),
      }),
    );
    expect(result.premiumBody).not.toMatch(/[\d]+ sessions/);
    expect(result.premiumBody).toContain('review loops');
  });

  it('uses generic fallback when no evidence provided', () => {
    const result = resolvePersonalizedPremium(
      makeInput({
        completedSessions: 45,
        lane: 'student',
      }),
    );
    expect(result.premiumBody).not.toMatch(/Based on/);
    expect(result.premiumBody).not.toMatch(/Across \d/);
    expect(result.premiumBody).toContain('review loops');
  });

  it('references quiet window for minimal_normal lane', () => {
    const result = resolvePersonalizedPremium(
      makeInput({
        completedSessions: 45,
        lane: 'minimal_normal',
        sessionEvidence: makeEvidence({
          completedSessions: 20,
          focusHours: 12,
          bestWindow: 'morning',
        }),
      }),
    );
    expect(result.premiumBody).toContain('12h');
    expect(result.premiumBody).toContain('mornings');
    expect(result.premiumBody).toContain('quietest window');
  });

  it('references streak length for minimal_normal lane', () => {
    const result = resolvePersonalizedPremium(
      makeInput({
        completedSessions: 45,
        lane: 'minimal_normal',
        sessionEvidence: makeEvidence({
          completedSessions: 20,
          focusHours: 10,
          longestStreak: 8,
        }),
      }),
    );
    expect(result.premiumBody).toContain('longest streak of 8 days');
  });

  it('does not fabricate evidence — headers stay generic with <5 sessions', () => {
    const result = resolvePersonalizedPremium(
      makeInput({
        completedSessions: 45,
        lane: 'student',
        sessionEvidence: makeEvidence({
          completedSessions: 4,
          focusHours: 2,
          bestWindow: 'morning',
        }),
      }),
    );
    expect(result.premiumBody).not.toMatch(/Based on/);
    expect(result.premiumBody).not.toMatch(/Across \d/);
  });
});
