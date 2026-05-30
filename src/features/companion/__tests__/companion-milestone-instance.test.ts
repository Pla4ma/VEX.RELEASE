/**
 * Companion Feature — Milestone Tracker + Service Instance Tests
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

import { getCompanionService, clearCompanionService } from "../service-instance";
import { checkMilestones } from "../milestone-tracker";
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

describe("checkMilestones", () => {
  it("emits level milestone when level increases", () => {
    const publishSpy = jest.spyOn(eventBus, "publish");
    const state = makeState({ level: 5, id: "c1" });
    checkMilestones(state, "u1", 4, 0, 0, 0);
    expect(publishSpy).toHaveBeenCalledWith(
      "companion:milestone_reached",
      expect.objectContaining({ milestoneType: "level", value: 5, previousValue: 4 }),
    );
    publishSpy.mockRestore();
  });

  it("emits session milestone at every 10 sessions", () => {
    const publishSpy = jest.spyOn(eventBus, "publish");
    const state = makeState({ sessionCount: 10 });
    checkMilestones(state, "u1", 1, 9, 0, 0);
    expect(publishSpy).toHaveBeenCalledWith(
      "companion:milestone_reached",
      expect.objectContaining({ milestoneType: "sessions", value: 10 }),
    );
    publishSpy.mockRestore();
  });

  it("emits focus minutes milestone at every 100 minutes", () => {
    const publishSpy = jest.spyOn(eventBus, "publish");
    const state = makeState({ totalFocusMinutes: 200 });
    checkMilestones(state, "u1", 1, 0, 199, 0);
    expect(publishSpy).toHaveBeenCalledWith(
      "companion:milestone_reached",
      expect.objectContaining({ milestoneType: "focus_minutes", value: 200 }),
    );
    publishSpy.mockRestore();
  });

  it("emits perfect sessions milestone at every 5", () => {
    const publishSpy = jest.spyOn(eventBus, "publish");
    const state = makeState({ perfectSessions: 5 });
    checkMilestones(state, "u1", 1, 0, 0, 4);
    expect(publishSpy).toHaveBeenCalledWith(
      "companion:milestone_reached",
      expect.objectContaining({ milestoneType: "perfect_sessions", value: 5 }),
    );
    publishSpy.mockRestore();
  });

  it("does not emit level milestone when level unchanged", () => {
    const publishSpy = jest.spyOn(eventBus, "publish");
    checkMilestones(makeState({ level: 5 }), "u1", 5, 0, 0, 0);
    const milestoneCalls = publishSpy.mock.calls.filter(
      ([event]) => event === "companion:milestone_reached",
    );
    expect(milestoneCalls).toHaveLength(0);
    publishSpy.mockRestore();
  });
});

describe("service-instance", () => {
  beforeEach(() => {
    clearCompanionService();
  });

  it("getCompanionService creates singleton", () => {
    const s1 = getCompanionService(makeState());
    const s2 = getCompanionService();
    expect(s1).toBe(s2);
  });

  it("clearCompanionService resets singleton", () => {
    const s1 = getCompanionService(makeState());
    clearCompanionService();
    const s2 = getCompanionService(makeState());
    expect(s1).not.toBe(s2);
  });

  it("creates new service when state provided even if exists", () => {
    const s1 = getCompanionService(makeState());
    const s2 = getCompanionService(makeState({ level: 50 }));
    expect(s1).not.toBe(s2);
  });
});
