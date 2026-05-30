/**
 * Companion Feature — CompanionGrowthServiceCore Tests
 */

jest.mock("../../../events/EventBus", () => ({
  eventBus: {
    publish: jest.fn(),
    subscribe: jest.fn(() => jest.fn()),
  },
}));

jest.mock("../../../shared/analytics/analytics-service", () => ({
  capture: jest.fn(),
}));

import { CompanionGrowthServiceCore } from "../growth-service-core";
import type { CompanionState } from "../types";

function makeState(overrides?: Partial<CompanionState>): CompanionState {
  return {
    id: "companion_test-user",
    userId: "test-user",
    phase: "EGG",
    level: 1,
    totalFocusMinutes: 0,
    element: "FLAME",
    elementAffinity: 75,
    currentMood: "SLEEPY",
    sessionProgress: 0,
    purityScore: 85,
    energyLevel: 50,
    visualSeed: 42,
    colorHue: 15,
    particleDensity: 0.8,
    sessionCount: 0,
    perfectSessions: 0,
    longestFocusStreak: 0,
    nextEvolutionAt: 0,
    updatedAt: Date.now(),
    ...overrides,
  };
}

describe("CompanionGrowthServiceCore", () => {
  it("initializes with state", () => {
    const state = makeState();
    const core = new CompanionGrowthServiceCore(state);
    expect(core.getState()).toMatchObject({ id: state.id });
  });

  it("initializes with null when no state given", () => {
    const core = new CompanionGrowthServiceCore();
    expect(core.getState()).toBeNull();
  });

  it("updateState replaces internal state", () => {
    const core = new CompanionGrowthServiceCore(makeState());
    const updated = makeState({ level: 50 });
    core.updateState(updated);
    expect(core.getState()?.level).toBe(50);
  });

  describe("processSessionCompletion", () => {
    it("returns false/false when no state", () => {
      const core = new CompanionGrowthServiceCore();
      expect(core.processSessionCompletion(30, 80)).toEqual({ leveledUp: false, evolved: false });
    });

    it("increments session count and focus minutes", () => {
      const core = new CompanionGrowthServiceCore(makeState());
      core.processSessionCompletion(30, 80);
      const s = core.getState();
      expect(s?.sessionCount).toBe(1);
      expect(s?.totalFocusMinutes).toBe(30);
    });

    it("increments perfectSessions when purity > 90", () => {
      const core = new CompanionGrowthServiceCore(makeState());
      core.processSessionCompletion(30, 95);
      expect(core.getState()?.perfectSessions).toBe(1);
    });

    it("does not increment perfectSessions when purity <= 90", () => {
      const core = new CompanionGrowthServiceCore(makeState());
      core.processSessionCompletion(30, 80);
      expect(core.getState()?.perfectSessions).toBe(0);
    });

    it("evolves when focus minutes exceed threshold", () => {
      // EGG threshold is 0, so any session should evolve EGG -> HATCHING
      const core = new CompanionGrowthServiceCore(makeState({ phase: "EGG", totalFocusMinutes: 0 }));
      const result = core.processSessionCompletion(61, 95);
      expect(result.evolved).toBe(true);
      expect(result.newPhase).toBe("HATCHING");
    });

    it("does not evolve TRANSCENDENT phase", () => {
      const core = new CompanionGrowthServiceCore(
        makeState({ phase: "TRANSCENDENT", totalFocusMinutes: 99999 }),
      );
      const result = core.processSessionCompletion(30, 95);
      expect(result.evolved).toBe(false);
    });
  });
});
