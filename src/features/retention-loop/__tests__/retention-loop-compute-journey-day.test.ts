import { describe, expect, it } from '@jest/globals';
import { computeJourneyDay } from '../service';

const baseInput = {
  userId: 'u1',
  completedSessions: 0,
  hasCompletedToday: false,
  hasSeenMemoryInsight: false,
  rescueCompleted: 0,
  recentDismissals: 0,
  inactivityDays: 0,
  hasInsightReady: false,
};

describe('computeJourneyDay', () => {
  it('returns 0 for day 0 (negative clamped)', () => {
    expect(computeJourneyDay({ ...baseInput, daysSinceOnboarding: -1, lane: 'student' })).toBe(0);
  });

  it('returns 0 for day 0', () => {
    expect(computeJourneyDay({ ...baseInput, daysSinceOnboarding: 0, lane: 'student' })).toBe(0);
  });

  it('returns the exact day for days 1–6', () => {
    for (let d = 1; d <= 6; d++) {
      expect(computeJourneyDay({ ...baseInput, daysSinceOnboarding: d, lane: 'student' })).toBe(d);
    }
  });

  it('returns 7 for day 7', () => {
    expect(computeJourneyDay({ ...baseInput, daysSinceOnboarding: 7, lane: 'student' })).toBe(7);
  });

  it('clamps to 7 for days beyond 7', () => {
    expect(computeJourneyDay({ ...baseInput, daysSinceOnboarding: 30, lane: 'student' })).toBe(7);
    expect(computeJourneyDay({ ...baseInput, daysSinceOnboarding: 999, lane: 'student' })).toBe(7);
  });
});
