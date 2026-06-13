import { buildHomeUnlockPathModel } from '../home-unlock-path-service';

describe('buildHomeUnlockPathModel', () => {
  it('shows first session as the Day 0 unlock target', () => {
    const model = buildHomeUnlockPathModel({
      completedSessions: 0,
      currentStreak: 0,
      todayFocusMinutes: 0,
    });

    expect(model.nextItem.reward).toBe('Session recap');
    expect(model.nextItem.current).toBe(0);
    expect(model.progressLabel).toBe('Complete 1 session to wake the app.');
  });

  it('advances to pattern read after the first session', () => {
    const model = buildHomeUnlockPathModel({
      completedSessions: 1,
      currentStreak: 1,
      todayFocusMinutes: 30,
    });

    expect(model.items[0]?.isUnlocked).toBe(true);
    expect(model.nextItem.reward).toBe('Early pattern read');
    expect(model.nextItem.current).toBe(1);
  });
});
