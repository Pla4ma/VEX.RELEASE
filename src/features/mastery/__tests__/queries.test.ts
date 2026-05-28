import {
  getActiveChallenges,
  getTechniqueStats,
  getUnlockedFeatures,
} from "../service";
import { loadStoredMasteryState } from "../repository";
import {
  TEST_USER_ID,
  setupMasteryMocks,
  makeBaseState,
  MASTERY_RANK_THRESHOLDS,
} from "./testHelpers";

jest.mock("../repository");

const mockedLoadStoredMasteryState = jest.mocked(loadStoredMasteryState);

describe("Mastery Service > getActiveChallenges", () => {
  beforeEach(() => {
    setupMasteryMocks();
  });

  it("should return all active challenges", async () => {
    const state = makeBaseState({
      totalMasteryPoints: 500,
      rank: "ADEPT",
      techniques: {
        durationMastery: 10,
        purityMastery: 8,
        consistencyMastery: 12,
        comebackMastery: 5,
        bossMastery: 5,
      },
      activeChallenges: [
        { id: "c1", title: "Challenge 1", status: "ACTIVE" },
        { id: "c2", title: "Challenge 2", status: "ACTIVE" },
        { id: "c3", title: "Challenge 3", status: "COMPLETED" },
      ],
    });
    mockedLoadStoredMasteryState.mockReturnValue(state);
    const challenges = await getActiveChallenges(TEST_USER_ID);
    expect(challenges.length).toBe(2);
    expect(challenges.every((c) => c.status === "ACTIVE")).toBe(true);
  });
});

describe("Mastery Service > getTechniqueStats", () => {
  beforeEach(() => {
    setupMasteryMocks();
  });

  it("should return technique levels and next milestones", async () => {
    const state = makeBaseState({
      totalMasteryPoints: 1000,
      rank: "EXPERT",
      techniques: {
        durationMastery: 15,
        purityMastery: 12,
        consistencyMastery: 18,
        comebackMastery: 8,
        bossMastery: 10,
      },
    });
    mockedLoadStoredMasteryState.mockReturnValue(state);
    const stats = await getTechniqueStats(TEST_USER_ID);
    expect(stats.durationMastery.current).toBe(15);
    expect(stats.durationMastery.max).toBe(25);
    expect(stats.durationMastery.nextMilestone).toBe(20);
    expect(stats.consistencyMastery.isPrimary).toBe(true);
  });
});

describe("Mastery Service > getUnlockedFeatures", () => {
  beforeEach(() => {
    setupMasteryMocks();
  });

  it("should return unlocked features for rank", async () => {
    const state = makeBaseState({
      totalMasteryPoints: MASTERY_RANK_THRESHOLDS.EXPERT,
      rank: "EXPERT",
      techniques: {
        durationMastery: 15,
        purityMastery: 15,
        consistencyMastery: 15,
        comebackMastery: 10,
        bossMastery: 10,
      },
      unlockedFeatures: ["advanced_analytics", "custom_themes"],
    });
    mockedLoadStoredMasteryState.mockReturnValue(state);
    const features = await getUnlockedFeatures(TEST_USER_ID);
    expect(features).toContain("advanced_analytics");
    expect(features).toContain("custom_themes");
  });

  it("should unlock new features on rank up", async () => {
    mockedLoadStoredMasteryState.mockReturnValue(makeBaseState());
    const features = await getUnlockedFeatures(TEST_USER_ID);
    expect(features).toEqual(expect.arrayContaining(["basic_stats"]));
  });
});
