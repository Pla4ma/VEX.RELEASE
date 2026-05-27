import { buildFeatureAccess } from "../feature-access";

describe("buildFeatureAccess", () => {
  it("spreads unlocks across the first fifteen sessions", () => {
    const afterOne = buildFeatureAccess({ totalCompletedSessions: 1 }).features;
    const afterThree = buildFeatureAccess({
      totalCompletedSessions: 3,
    }).features;
    const afterFive = buildFeatureAccess({
      totalCompletedSessions: 5,
    }).features;
    const afterSeven = buildFeatureAccess({
      totalCompletedSessions: 7,
    }).features;
    const afterFifteen = buildFeatureAccess({
      totalCompletedSessions: 15,
    }).features;

    // Challenges now unlock at 5 (was 1)
    expect(afterOne.challenges.isUnlocked).toBe(false);
    expect(afterThree.companion_detail.isUnlocked).toBe(true);
    expect(afterFive.economy_basic.isUnlocked).toBe(false);
    expect(afterFive.challenges.isUnlocked).toBe(true);
    expect(afterSeven.boss_tab.isUnlocked).toBe(true);
    expect(afterFifteen.ai_coach_advanced.isUnlocked).toBe(true);
  });

  it("keeps disabled social competition features invisible and locked", () => {
    const features = buildFeatureAccess({
      totalCompletedSessions: 100,
    }).features;

    expect(features.rankings.isVisible).toBe(false);
    expect(features.rankings.isUnlocked).toBe(false);
    expect(features.squads.isVisible).toBe(false);
    expect(features.rivals.isVisible).toBe(false);
    expect(features.wagers.isUnlocked).toBe(false);
    expect(features.shop.isUnlocked).toBe(false);
    expect(features.inventory.isUnlocked).toBe(false);
    expect(features.battle_pass.isUnlocked).toBe(false);
  });

  it("uses specific locked copy for major gated features", () => {
    const features = buildFeatureAccess({ totalCompletedSessions: 0 }).features;

    expect(features.boss_tab.recommendedUnlockMoment).toBe("After session 7");
    expect(features.challenges.lockedDescription).toContain("few sessions");
    expect(features.companion_detail.unlockReason).toContain("3 sessions");
  });
});
