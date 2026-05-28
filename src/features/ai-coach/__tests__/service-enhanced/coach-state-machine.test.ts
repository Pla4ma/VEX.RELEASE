import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import {
  determineOptimalState,
  transitionState,
  checkAutoTransitions,
  StateTransitionError,
} from "../../services/coach-state-machine";
import * as repository from "../../repository";
import {
  createMockCoachState,
  createMockBehaviorProfile,
  mockUserId,
} from "./helpers";

jest.mock("../../repository");

describe("Coach State Machine", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("determineOptimalState", () => {
    it("returns COLD_START for new users with no data", async () => {
      (repository.fetchCoachState as jest.Mock).mockResolvedValue(null);
      (repository.fetchActiveComebackPlan as jest.Mock).mockResolvedValue(null);
      const profile = createMockBehaviorProfile({
        confidenceLevel: "LOW",
        coldStart: true,
        dataPoints: 0,
      });
      const state = await determineOptimalState(mockUserId, profile);
      expect(state).toBe("COLD_START");
    });

    it("returns COMEBACK_MODE when comeback is active", async () => {
      (repository.fetchActiveComebackPlan as jest.Mock).mockResolvedValue({
        id: "comeback-1",
        userId: mockUserId,
        status: "ACTIVE",
      });
      const profile = createMockBehaviorProfile({
        confidenceLevel: "HIGH",
        coldStart: false,
        dataPoints: 50,
      });
      const state = await determineOptimalState(mockUserId, profile);
      expect(state).toBe("COMEBACK_MODE");
    });

    it("returns STREAK_AT_RISK when streak is at risk", async () => {
      (repository.fetchActiveComebackPlan as jest.Mock).mockResolvedValue(null);
      (repository.fetchCoachState as jest.Mock).mockResolvedValue(
        createMockCoachState({ currentState: "STREAK_AT_RISK" }),
      );
      const profile = createMockBehaviorProfile({
        confidenceLevel: "HIGH",
        coldStart: false,
        dataPoints: 50,
      });
      const state = await determineOptimalState(mockUserId, profile);
      expect(state).toBe("STREAK_AT_RISK");
    });

    it("returns LOW_CONFIDENCE for users with 5-19 data points", async () => {
      (repository.fetchActiveComebackPlan as jest.Mock).mockResolvedValue(null);
      const profile = createMockBehaviorProfile({
        confidenceLevel: "LOW",
        coldStart: false,
        dataPoints: 10,
      });
      const state = await determineOptimalState(mockUserId, profile);
      expect(state).toBe("LOW_CONFIDENCE");
    });

    it("returns HIGH_CONFIDENCE for users with 20+ data points", async () => {
      (repository.fetchActiveComebackPlan as jest.Mock).mockResolvedValue(null);
      const profile = createMockBehaviorProfile({
        confidenceLevel: "HIGH",
        coldStart: false,
        dataPoints: 25,
      });
      const state = await determineOptimalState(mockUserId, profile);
      expect(state).toBe("HIGH_CONFIDENCE");
    });
  });

  describe("transitionState", () => {
    it("successfully transitions between valid states", async () => {
      const currentState = createMockCoachState({
        currentState: "COLD_START",
      });
      (repository.fetchCoachState as jest.Mock).mockResolvedValue(currentState);
      (repository.upsertCoachState as jest.Mock).mockImplementation((s) => s);
      const newState = await transitionState(mockUserId, "LOW_CONFIDENCE");
      expect(newState.currentState).toBe("LOW_CONFIDENCE");
      expect(newState.previousState).toBe("COLD_START");
    });

    it("throws StateTransitionError for invalid transitions", async () => {
      const currentState = createMockCoachState({
        currentState: "HIGH_CONFIDENCE",
      });
      (repository.fetchCoachState as jest.Mock).mockResolvedValue(currentState);
      await expect(
        transitionState(mockUserId, "COLD_START"),
      ).rejects.toThrow(StateTransitionError);
    });

    it("allows forced transitions when bypassing validation", async () => {
      const currentState = createMockCoachState({
        currentState: "HIGH_CONFIDENCE",
      });
      (repository.fetchCoachState as jest.Mock).mockResolvedValue(currentState);
      (repository.upsertCoachState as jest.Mock).mockImplementation((s) => s);
      const newState = await transitionState(
        mockUserId,
        "COLD_START",
        {},
        true,
      );
      expect(newState.currentState).toBe("COLD_START");
    });

    it("executes entry and exit actions", async () => {
      const currentState = createMockCoachState({
        currentState: "HIGH_CONFIDENCE",
      });
      (repository.fetchCoachState as jest.Mock).mockResolvedValue(currentState);
      (repository.upsertCoachState as jest.Mock).mockImplementation((s) => s);
      const newState = await transitionState(mockUserId, "MUTED_MODE");
      expect(newState.currentState).toBe("MUTED_MODE");
      expect(repository.upsertCoachState).toHaveBeenCalled();
    });
  });

  describe("checkAutoTransitions", () => {
    it("auto-transitions when max duration exceeded", async () => {
      const oldState = createMockCoachState({
        currentState: "STREAK_AT_RISK",
        stateEnteredAt: Date.now() - 49 * 60 * 60 * 1000,
      });
      (repository.fetchCoachState as jest.Mock).mockResolvedValue(oldState);
      (repository.upsertCoachState as jest.Mock).mockImplementation((s) => s);
      (repository.fetchBehaviorProfile as jest.Mock).mockResolvedValue(
        createMockBehaviorProfile({
          confidenceLevel: "HIGH",
          coldStart: false,
          dataPoints: 25,
        }),
      );
      const newState = await checkAutoTransitions(mockUserId);
      expect(newState).not.toBeNull();
      expect(newState?.currentState).not.toBe("STREAK_AT_RISK");
    });

    it("does not auto-transition when within duration", async () => {
      const currentState = createMockCoachState({
        currentState: "STREAK_AT_RISK",
        stateEnteredAt: Date.now() - 24 * 60 * 60 * 1000,
      });
      (repository.fetchCoachState as jest.Mock).mockResolvedValue(currentState);
      const newState = await checkAutoTransitions(mockUserId);
      expect(newState).toBeNull();
    });
  });
});
