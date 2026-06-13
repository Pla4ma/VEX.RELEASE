import { getSessionsUntilStudyUnlock } from '../progress-unlock-helpers';
import type { MotivationProfile } from '../../../../features/liveops-config/feature-access-types';

describe('getSessionsUntilStudyUnlock', () => {
  it('returns base threshold minus completed sessions', () => {
    expect(getSessionsUntilStudyUnlock(0)).toBe(12);
    expect(getSessionsUntilStudyUnlock(5)).toBe(7);
    expect(getSessionsUntilStudyUnlock(12)).toBe(0);
    expect(getSessionsUntilStudyUnlock(20)).toBe(0);
  });

  it('applies student acceleration', () => {
    const profile: MotivationProfile = {
      primary: 'student',
      secondary: [],
    };
    expect(getSessionsUntilStudyUnlock(0, profile)).toBe(5);
  });

  it('applies calm restriction', () => {
    const profile: MotivationProfile = {
      primary: 'calm',
      secondary: [],
    };
    expect(getSessionsUntilStudyUnlock(0, profile)).toBe(18);
  });
});
