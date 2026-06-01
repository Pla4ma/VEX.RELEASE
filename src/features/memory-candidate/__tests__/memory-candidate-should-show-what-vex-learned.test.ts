/**
 * Tests for shouldShowWhatVEXLearned service
 */
import { shouldShowWhatVEXLearned } from '../what-vex-learned-service';

describe('shouldShowWhatVEXLearned', () => {
  it('returns false when totalSessions < 3', () => {
    expect(
      shouldShowWhatVEXLearned({ totalSessions: 2, lastShownAt: null }),
    ).toBe(false);
  });

  it('returns true when lastShownAt is null and sessions >= 3', () => {
    expect(
      shouldShowWhatVEXLearned({ totalSessions: 3, lastShownAt: null }),
    ).toBe(true);
  });

  it('returns true when shown more than 24 hours ago', () => {
    const hoursAgo25 = Date.now() - 25 * 60 * 60 * 1000;
    expect(
      shouldShowWhatVEXLearned({
        totalSessions: 5,
        lastShownAt: hoursAgo25,
      }),
    ).toBe(true);
  });

  it('returns false when shown less than 24 hours ago', () => {
    const hoursAgo1 = Date.now() - 1 * 60 * 60 * 1000;
    expect(
      shouldShowWhatVEXLearned({
        totalSessions: 5,
        lastShownAt: hoursAgo1,
      }),
    ).toBe(false);
  });
});
