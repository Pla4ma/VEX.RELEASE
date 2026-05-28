import { getMasteryState } from "../service";
import { loadStoredMasteryState } from "../repository";
import {
  TEST_USER_ID,
  setupMasteryMocks,
  MASTERY_RANK_THRESHOLDS,
} from "./testHelpers";

jest.mock("../repository");

const mockedLoadStoredMasteryState = jest.mocked(loadStoredMasteryState);

describe("Mastery Service > getMasteryState", () => {
  beforeEach(() => {
    setupMasteryMocks();
  });

  it("should return default state for new user", async () => {
    const state = await getMasteryState(TEST_USER_ID);
    expect(state).toMatchObject({
      userId: TEST_USER_ID,
      totalMasteryPoints: 0,
      rank: "APPRENTICE",
      techniques: {
        durationMastery: 0,
        purityMastery: 0,
        consistencyMastery: 0,
        comebackMastery: 0,
        bossMastery: 0,
      },
      activeChallenges: expect.any(Array),
      unlockedFeatures: [],
    });
    expect(state.activeChallenges.length).toBe(3);
    expect(state.updatedAt).toBeDefined();
  });

  it("should load and hydrate existing state", async () => {
    const existingState = {
      userId: TEST_USER_ID,
      totalMasteryPoints: 1500,
      rank: "ADEPT",
      techniques: {
        durationMastery: 10,
        purityMastery: 8,
        consistencyMastery: 12,
        comebackMastery: 5,
        bossMastery: 3,
      },
      activeChallenges: [
        {
          id: "challenge-1",
          title: "Deep Focus",
          description: "Complete a 60-minute session",
          technique: "durationMastery",
          target: 100,
          current: 80,
          status: "ACTIVE",
        },
      ],
      unlockedFeatures: ["advanced_analytics"],
      updatedAt: Date.now(),
    };
    mockedLoadStoredMasteryState.mockReturnValue(existingState);
    const state = await getMasteryState(TEST_USER_ID);
    expect(state.totalMasteryPoints).toBe(1500);
    expect(state.rank).toBe("ADEPT");
    expect(state.activeChallenges.length).toBe(3);
  });

  it("should correct rank if points threshold crossed", async () => {
    const incorrectRankState = {
      userId: TEST_USER_ID,
      totalMasteryPoints: MASTERY_RANK_THRESHOLDS.MASTER,
      rank: "ADEPT",
      techniques: {
        durationMastery: 15,
        purityMastery: 15,
        consistencyMastery: 15,
        comebackMastery: 10,
        bossMastery: 10,
      },
      activeChallenges: [],
      unlockedFeatures: [],
      updatedAt: Date.now(),
    };
    mockedLoadStoredMasteryState.mockReturnValue(incorrectRankState);
    const state = await getMasteryState(TEST_USER_ID);
    expect(state.rank).toBe("MASTER");
  });
});
