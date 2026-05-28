import { claimMasteryChallenge } from "../service";
import { loadStoredMasteryState, persistMasteryState } from "../repository";
import { TEST_USER_ID, setupMasteryMocks, makeBaseState } from "./testHelpers";

jest.mock("../repository");

const mockedLoadStoredMasteryState = jest.mocked(loadStoredMasteryState);

describe("Mastery Service > claimMasteryChallenge", () => {
  beforeEach(() => {
    setupMasteryMocks();
  });

  it("should claim completed challenge and award points", async () => {
    const state = makeBaseState({
      totalMasteryPoints: 100,
      techniques: {
        durationMastery: 5,
        purityMastery: 5,
        consistencyMastery: 5,
        comebackMastery: 2,
        bossMastery: 2,
      },
      activeChallenges: [
        {
          id: "challenge-1",
          title: "Deep Focus",
          description: "Complete a 60-minute session",
          technique: "durationMastery",
          target: 100,
          current: 100,
          status: "COMPLETED",
          completedAt: Date.now(),
        },
      ],
    });
    mockedLoadStoredMasteryState.mockReturnValue(state);
    const result = await claimMasteryChallenge(TEST_USER_ID, "challenge-1");
    expect(result.success).toBe(true);
    expect(result.pointsAwarded).toBeGreaterThan(0);
    expect(persistMasteryState).toHaveBeenCalled();
  });

  it("should throw error for incomplete challenge", async () => {
    const state = makeBaseState({
      totalMasteryPoints: 100,
      techniques: {
        durationMastery: 5,
        purityMastery: 5,
        consistencyMastery: 5,
        comebackMastery: 2,
        bossMastery: 2,
      },
      activeChallenges: [
        {
          id: "challenge-1",
          title: "Deep Focus",
          description: "Complete a 60-minute session",
          technique: "durationMastery",
          target: 100,
          current: 50,
          status: "ACTIVE",
        },
      ],
    });
    mockedLoadStoredMasteryState.mockReturnValue(state);
    await expect(
      claimMasteryChallenge(TEST_USER_ID, "challenge-1"),
    ).rejects.toThrow("Challenge not completed");
  });

  it("should throw error for non-existent challenge", async () => {
    const state = makeBaseState({
      totalMasteryPoints: 100,
      techniques: {
        durationMastery: 5,
        purityMastery: 5,
        consistencyMastery: 5,
        comebackMastery: 2,
        bossMastery: 2,
      },
    });
    mockedLoadStoredMasteryState.mockReturnValue(state);
    await expect(
      claimMasteryChallenge(TEST_USER_ID, "non-existent"),
    ).rejects.toThrow("Challenge not found");
  });
});
