import { buildFeatureAccess } from '../feature-access';

describe('buildFeatureAccess', () => {
  it('spreads unlocks across the first fifteen sessions', () => {
    const afterOne = buildFeatureAccess({ totalCompletedSessions: 1 }).features;
    const afterFive = buildFeatureAccess({ totalCompletedSessions: 5 }).features;
    const afterSeven = buildFeatureAccess({ totalCompletedSessions: 7 }).features;
    const afterTen = buildFeatureAccess({ totalCompletedSessions: 10 }).features;
    const afterFifteen = buildFeatureAccess({ totalCompletedSessions: 15 }).features;

    expect(afterOne.challenges.isUnlocked).toBe(true);
    expect(afterFive.economy_basic.isUnlocked).toBe(true);
    expect(afterSeven.boss_tab.isUnlocked).toBe(true);
    expect(afterTen.shop.isUnlocked).toBe(true);
    expect(afterTen.inventory.isUnlocked).toBe(true);
    expect(afterFifteen.battle_pass.isUnlocked).toBe(true);
  });

  it('keeps disabled social competition features invisible and locked', () => {
    const features = buildFeatureAccess({ totalCompletedSessions: 100 }).features;

    expect(features.rankings.isVisible).toBe(false);
    expect(features.rankings.isUnlocked).toBe(false);
    expect(features.squads.isVisible).toBe(false);
    expect(features.rivals.isVisible).toBe(false);
    expect(features.wagers.isUnlocked).toBe(false);
  });

  it('uses specific locked copy for major gated features', () => {
    const features = buildFeatureAccess({ totalCompletedSessions: 0 }).features;

    expect(features.battle_pass.lockedDescription).toContain('full season');
    expect(features.boss_tab.recommendedUnlockMoment).toBe('After session 7');
    expect(features.shop.unlockReason).toContain('10 sessions');
  });
});
