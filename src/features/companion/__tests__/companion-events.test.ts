/**
 * Companion Feature — Events Module Tests
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

import { emitCompanionStateChanged, emitCompanionEvolution, emitCompanionMilestone, subscribeToCompanionEvents } from "../events";
import { eventBus } from "../../../events/EventBus";
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

describe("companion events module", () => {
  it("emitCompanionStateChanged publishes event", () => {
    const publishSpy = jest.spyOn(eventBus, "publish");
    const oldState = makeState({ currentMood: "SLEEPY" });
    const newState = makeState({ currentMood: "FOCUSED" });
    emitCompanionStateChanged("u1", "c1", oldState, newState, "session_completed");
    expect(publishSpy).toHaveBeenCalledWith(
      "companion:state_changed",
      expect.objectContaining({ userId: "u1", companionId: "c1", reason: "session_completed" }),
    );
    publishSpy.mockRestore();
  });

  it("emitCompanionEvolution publishes evolution event", () => {
    const publishSpy = jest.spyOn(eventBus, "publish");
    emitCompanionEvolution("u1", "c1", "EGG", "HATCHING", 60, true);
    expect(publishSpy).toHaveBeenCalledWith(
      "companion:evolution",
      expect.objectContaining({ previousPhase: "EGG", newPhase: "HATCHING" }),
    );
    publishSpy.mockRestore();
  });

  it("emitCompanionMilestone publishes milestone event", () => {
    const publishSpy = jest.spyOn(eventBus, "publish");
    emitCompanionMilestone("u1", "c1", "level", 5, 4);
    expect(publishSpy).toHaveBeenCalledWith(
      "companion:milestone_reached",
      expect.objectContaining({ milestoneType: "level", value: 5, previousValue: 4 }),
    );
    publishSpy.mockRestore();
  });

  it("subscribeToCompanionEvents returns subscriber functions", () => {
    const subscribers = subscribeToCompanionEvents();
    expect(subscribers.onStateChanged).toBeDefined();
    expect(subscribers.onEvolution).toBeDefined();
    expect(subscribers.onMilestone).toBeDefined();
    expect(typeof subscribers.onStateChanged).toBe("function");
  });
});
