import { recordSessionMastery } from "../service";
import { loadStoredMasteryState, persistMasteryState } from "../repository";
import {
  TEST_USER_ID,
  setupMasteryMocks,
  makeBaseState,
  MASTERY_RANK_THRESHOLDS,
} from "./testHelpers";

jest.mock("../repository");

const mockedLoadStoredMasteryState = jest.mocked(loadStoredMasteryState);

describe("Mastery Service > recordSessionMastery", () => {
  beforeEach(() => {
    setupMasteryMocks();
  });

  it("should award XP for duration mastery", async () => {
    mockedLoadStoredMasteryState.mockReturnValue(makeBaseState());
    const result = await recordSessionMastery(TEST_USER_ID, {
      duration: 60,
      purity: 0.9,
      usedComeback: false,
      defeatedBoss: false,
    });
    expect(result.techniqueGains.durationMastery).toBeGreaterThan(0);
    expect(result.totalPointsGained).toBeGreaterThan(0);
    expect(persistMasteryState).toHaveBeenCalled();
  });

  it("should award bonus XP for purity mastery", async () => {
    const state = makeBaseState({
      techniques: {
        durationMastery: 5,
        purityMastery: 5,
        consistencyMastery: 5,
        comebackMastery: 0,
        bossMastery: 0,
      },
    });
    mockedLoadStoredMasteryState.mockReturnValue(state);
    const result = await recordSessionMastery(TEST_USER_ID, {
      duration: 25,
      purity: 0.95,
      usedComeback: false,
      defeatedBoss: false,
    });
    expect(result.techniqueGains.purityMastery).toBeGreaterThan(0);
  });

  it("should award comeback mastery when comeback used", async () => {
    mockedLoadStoredMasteryState.mockReturnValue(makeBaseState());
    const result = await recordSessionMastery(TEST_USER_ID, {
      duration: 25,
      purity: 0.8,
      usedComeback: true,
      defeatedBoss: false,
    });
    expect(result.techniqueGains.comebackMastery).toBeGreaterThan(0);
  });

  it("should award boss mastery when boss defeated", async () => {
    mockedLoadStoredMasteryState.mockReturnValue(makeBaseState());
    const result = await recordSessionMastery(TEST_USER_ID, {
      duration: 45,
      purity: 0.85,
      usedComeback: false,
      defeatedBoss: true,
    });
    expect(result.techniqueGains.bossMastery).toBeGreaterThan(0);
  });

  it("should rank up when threshold crossed", async () => {
    const nearRankUpState = makeBaseState({
      totalMasteryPoints: MASTERY_RANK_THRESHOLDS.ADEPT - 10,
      techniques: {
        durationMastery: 8,
        purityMastery: 8,
        consistencyMastery: 8,
        comebackMastery: 3,
        bossMastery: 3,
      },
    });
    mockedLoadStoredMasteryState.mockReturnValue(nearRankUpState);
    const result = await recordSessionMastery(TEST_USER_ID, {
      duration: 60,
      purity: 0.95,
      usedComeback: false,
      defeatedBoss: false,
    });
    expect(result.newRank).toBe("ADEPT");
    expect(result.rankUpOccurred).toBe(true);
  });

  it("should cap technique values at 25", async () => {
    const nearCapState = makeBaseState({
      totalMasteryPoints: 2000,
      rank: "EXPERT",
      techniques: {
        durationMastery: 24,
        purityMastery: 24,
        consistencyMastery: 24,
        comebackMastery: 20,
        bossMastery: 20,
      },
      unlockedFeatures: ["advanced_analytics"],
    });
    mockedLoadStoredMasteryState.mockReturnValue(nearCapState);
    const result = await recordSessionMastery(TEST_USER_ID, {
      duration: 90,
      purity: 1.0,
      usedComeback: false,
      defeatedBoss: true,
    });
    expect(result.techniqueGains.durationMastery).toBe(1);
  });
});
