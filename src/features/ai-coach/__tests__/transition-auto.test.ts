import { jest, beforeEach } from "@jest/globals";
import {
  transitionState,
  checkAutoTransitions,
  StateTransitionError,
  makeCoachState,
  makeProfile,
  mockUserId,
  repository,
} from "./helpers";

describe("transitionState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("transitions from COLD_START to LOW_CONFIDENCE", async () => {
    const currentState = makeCoachState();
    (repository.fetchCoachState as jest.Mock).mockResolvedValue(currentState);
    (repository.upsertCoachState as jest.Mock).mockImplementation((s) => s);

    const newState = await transitionState(mockUserId, "LOW_CONFIDENCE");
    expect(newState.currentState).toBe("LOW_CONFIDENCE");
    expect(newState.previousState).toBe("COLD_START");
  });

  it("throws on invalid transition", async () => {
    const currentState = makeCoachState({ currentState: "HIGH_CONFIDENCE" });
    (repository.fetchCoachState as jest.Mock).mockResolvedValue(currentState);

    await expect(transitionState(mockUserId, "COLD_START")).rejects.toThrow(
      StateTransitionError,
    );
  });

  it("allows forced transitions bypassing validation", async () => {
    const currentState = makeCoachState({ currentState: "HIGH_CONFIDENCE" });
    (repository.fetchCoachState as jest.Mock).mockResolvedValue(currentState);
    (repository.upsertCoachState as jest.Mock).mockImplementation((s) => s);

    const newState = await transitionState(mockUserId, "COLD_START", {}, true);
    expect(newState.currentState).toBe("COLD_START");
  });
});

describe("checkAutoTransitions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("auto-transitions after max duration exceeded", async () => {
    const oldState = makeCoachState({
      currentState: "STREAK_AT_RISK",
      stateEnteredAt: Date.now() - 49 * 60 * 60 * 1000,
    });
    (repository.fetchCoachState as jest.Mock).mockResolvedValue(oldState);
    (repository.upsertCoachState as jest.Mock).mockImplementation((s) => s);
    (repository.fetchBehaviorProfile as jest.Mock).mockResolvedValue(
      makeProfile({
        coldStart: false,
        dataPoints: 25,
        confidenceLevel: "HIGH",
      }),
    );

    const result = await checkAutoTransitions(mockUserId);
    expect(result).not.toBeNull();
    expect(result?.currentState).not.toBe("STREAK_AT_RISK");
  });

  it("does not auto-transition within duration", async () => {
    const state = makeCoachState({
      currentState: "STREAK_AT_RISK",
      stateEnteredAt: Date.now() - 24 * 60 * 60 * 1000,
    });
    (repository.fetchCoachState as jest.Mock).mockResolvedValue(state);

    const result = await checkAutoTransitions(mockUserId);
    expect(result).toBeNull();
  });
});
