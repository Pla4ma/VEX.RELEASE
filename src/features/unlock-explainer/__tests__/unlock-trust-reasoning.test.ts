import { createUnlockDecision, NOW } from "./unlock-trust-layer-helpers";

describe("Unlock Explainer Trust Layer — reasoning & evidence", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("unlock has user-facing reason (non-generic, evidence-based)", () => {
    const result = createUnlockDecision({
      featureKey: "study_os",
      laneProfile: "student",
      sessionCount: 1,
    });
    expect(result.userFacingReason).toBeTruthy();
    expect(result.userFacingReason.length).toBeGreaterThan(30);
    expect(result.userFacingReason).not.toBe(
      "Unlocked because of your progress.",
    );
    expect(result.userFacingReason).not.toBe(
      "Available after 1 completed sessions.",
    );
    expect(result.userFacingReason).toMatch(/study|student|block/i);
  });

  it("unlock cites evidence in decision", () => {
    const result = createUnlockDecision({
      featureKey: "project_thread",
      laneProfile: "deep_creative",
      sessionCount: 5,
    });
    expect(result.evidence.length).toBeGreaterThanOrEqual(1);
    const hasSessionEvidence = result.evidence.some(
      (e) => e.source === "session_count",
    );
    expect(hasSessionEvidence).toBe(true);
  });

  it("user can hide unlock (canHide=true for unlocked features)", () => {
    const result = createUnlockDecision({
      featureKey: "study_os",
      laneProfile: "student",
      sessionCount: 3,
    });
    expect(result.canHide).toBe(true);
  });

  it("Study OS unlock reason uses study evidence", () => {
    const result = createUnlockDecision({
      featureKey: "study_os",
      laneProfile: "student",
      sessionCount: 3,
    });
    expect(result.userFacingReason).toMatch(/study|block/i);
    expect(result.userFacingReason).toBe(
      "Because you completed 3 study blocks, VEX opened Study tools.",
    );
  });

  it("Run unlock reason uses game/momentum evidence", () => {
    const result = createUnlockDecision({
      featureKey: "run_board",
      laneProfile: "game_like",
      sessionCount: 3,
    });
    expect(result.userFacingReason).toMatch(/momentum|Run|encounter/i);
    expect(result.userFacingReason).toBe(
      "Because you respond well to momentum, VEX opened Run Mode.",
    );
  });

  describe("reason code map", () => {
    it("uses unlocked_after_sessions for feature after unlock threshold", () => {
      const result = createUnlockDecision({
        featureKey: "boss_tab",
        laneProfile: "game_like",
        sessionCount: 1,
      });
      expect(result.reasonCode).toBe("unlocked_after_sessions");
    });

    it("uses teased_before_sessions for feature before unlock threshold", () => {
      const result = createUnlockDecision({
        featureKey: "boss_tab",
        laneProfile: "deep_creative",
        sessionCount: 2,
      });
      expect(result.reasonCode).toBe("teased_before_sessions");
    });

    it("uses final_release_deactivated for never-unlock features", () => {
      const result = createUnlockDecision({
        featureKey: "battle_pass",
        sessionCount: 10,
      });
      expect(result.reasonCode).toBe("final_release_deactivated");
    });

    it("lanes blocked features use lane_blocked", () => {
      const result = createUnlockDecision({
        featureKey: "run_board",
        laneProfile: "minimal_normal",
        sessionCount: 10,
      });
      expect(result.reasonCode).toBe("lane_blocked");
    });
  });
});
