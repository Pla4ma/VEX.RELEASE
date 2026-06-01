import { describe, expect, it } from '@jest/globals';
import {
  shouldShowDay3Memory,
  shouldOfferRescue,
  shouldShowPremiumAfterValue,
} from '../retention-guards';

describe('shouldShowDay3Memory', () => {
  it('returns true when day >= 3, sessions >= 3, and not seen', () => {
    expect(
      shouldShowDay3Memory({ daysSinceOnboarding: 3, completedSessions: 3, hasSeenMemoryInsight: false }),
    ).toBe(true);
  });

  it('returns true on later days too', () => {
    expect(
      shouldShowDay3Memory({ daysSinceOnboarding: 5, completedSessions: 10, hasSeenMemoryInsight: false }),
    ).toBe(true);
  });

  it('returns false when already seen', () => {
    expect(
      shouldShowDay3Memory({ daysSinceOnboarding: 3, completedSessions: 3, hasSeenMemoryInsight: true }),
    ).toBe(false);
  });

  it('returns false when sessions < 3', () => {
    expect(
      shouldShowDay3Memory({ daysSinceOnboarding: 3, completedSessions: 2, hasSeenMemoryInsight: false }),
    ).toBe(false);
  });

  it('returns false when days < 3', () => {
    expect(
      shouldShowDay3Memory({ daysSinceOnboarding: 2, completedSessions: 5, hasSeenMemoryInsight: false }),
    ).toBe(false);
  });
});

describe('shouldOfferRescue', () => {
  const baseRescue = {
    daysSinceOnboarding: 4,
    completedSessions: 3,
    hasCompletedToday: false,
    inactivityDays: 0,
    abandonedSessionExists: false,
    openedAppNoStart: false,
    sessionStartedQuitEarly: false,
    recentDismissals: 0,
    homeCtaDismissals: 0,
    userTooBig: false,
  };

  it('returns true with inactivity', () => {
    expect(shouldOfferRescue({ ...baseRescue, inactivityDays: 1 })).toBe(true);
  });

  it('returns true with abandoned session', () => {
    expect(shouldOfferRescue({ ...baseRescue, abandonedSessionExists: true })).toBe(true);
  });

  it('returns true with session started and quit early', () => {
    expect(shouldOfferRescue({ ...baseRescue, sessionStartedQuitEarly: true })).toBe(true);
  });

  it('returns true with opened app no start', () => {
    expect(shouldOfferRescue({ ...baseRescue, openedAppNoStart: true })).toBe(true);
  });

  it('returns true with recentDismissals >= 2', () => {
    expect(shouldOfferRescue({ ...baseRescue, recentDismissals: 2 })).toBe(true);
  });

  it('returns true with homeCtaDismissals >= 2', () => {
    expect(shouldOfferRescue({ ...baseRescue, homeCtaDismissals: 2 })).toBe(true);
  });

  it('returns true with userTooBig', () => {
    expect(shouldOfferRescue({ ...baseRescue, userTooBig: true })).toBe(true);
  });

  it('returns false when completedSessions is 0', () => {
    expect(shouldOfferRescue({ ...baseRescue, completedSessions: 0, inactivityDays: 1 })).toBe(false);
  });

  it('returns false when completed today', () => {
    expect(shouldOfferRescue({ ...baseRescue, hasCompletedToday: true, inactivityDays: 1 })).toBe(false);
  });

  it('returns false when no friction signals present', () => {
    expect(shouldOfferRescue(baseRescue)).toBe(false);
  });
});

describe('shouldShowPremiumAfterValue', () => {
  it('returns true on day 7+ with weekly insight seen', () => {
    expect(shouldShowPremiumAfterValue({ daysSinceOnboarding: 7, hasSeenWeeklyInsight: true })).toBe(true);
  });

  it('returns true on day 10 with weekly insight seen', () => {
    expect(shouldShowPremiumAfterValue({ daysSinceOnboarding: 10, hasSeenWeeklyInsight: true })).toBe(true);
  });

  it('returns false when insight not seen', () => {
    expect(shouldShowPremiumAfterValue({ daysSinceOnboarding: 7, hasSeenWeeklyInsight: false })).toBe(false);
  });

  it('returns false when day < 7', () => {
    expect(shouldShowPremiumAfterValue({ daysSinceOnboarding: 6, hasSeenWeeklyInsight: true })).toBe(false);
  });
});
