/**
 * Companion Feature — CompanionGrowthService Reaction Tests
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

import { CompanionGrowthService } from "../growth-service";
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

describe("CompanionGrowthService", () => {
  let growthService: CompanionGrowthService;
  let state: CompanionState;

  beforeEach(() => {
    state = makeState({ energyLevel: 50, level: 10 });
    growthService = new CompanionGrowthService(state);
  });

  it("reactToStreakMaintained sets ECSTATIC mood and boosts energy/level", () => {
    growthService.reactToStreakMaintained("user");
    const s = growthService.getState();
    expect(s?.currentMood).toBe("ECSTATIC");
    expect(s?.energyLevel).toBe(70);
    expect(s?.level).toBe(12);
  });

  it("reactToStreakMaintained does nothing when no state", () => {
    const empty = new CompanionGrowthService();
    empty.reactToStreakMaintained("user");
    expect(empty.getState()).toBeNull();
  });

  it("reactToComebackCompleted sets DETERMINED mood", () => {
    growthService.reactToComebackCompleted("user");
    const s = growthService.getState();
    expect(s?.currentMood).toBe("DETERMINED");
    expect(s?.energyLevel).toBe(80);
    expect(s?.level).toBe(15);
  });

  it("reactToFocusScoreChanged boosts when score increases", () => {
    growthService.reactToFocusScoreChanged("user", 500, 750);
    const s = growthService.getState();
    expect(s?.currentMood).toBe("ECSTATIC");
    expect(s?.energyLevel).toBe(65);
    expect(s?.level).toBe(11);
  });

  it("reactToFocusScoreChanged penalizes big drops", () => {
    growthService.reactToFocusScoreChanged("user", 800, 600);
    const s = growthService.getState();
    expect(s?.currentMood).toBe("CONTENT");
    expect(s?.energyLevel).toBe(40);
  });

  it("reactToFocusScoreChanged does nothing when no state", () => {
    const empty = new CompanionGrowthService();
    empty.reactToFocusScoreChanged("user", 500, 600);
    expect(empty.getState()).toBeNull();
  });

  it("reactToDailyMissionCompleted sets CONTENT mood", () => {
    growthService.reactToDailyMissionCompleted("user");
    const s = growthService.getState();
    expect(s?.currentMood).toBe("CONTENT");
    expect(s?.energyLevel).toBe(60);
    expect(s?.level).toBe(11);
  });

  it("reactToDailyMissionCompleted does nothing when no state", () => {
    const empty = new CompanionGrowthService();
    empty.reactToDailyMissionCompleted("user");
    expect(empty.getState()).toBeNull();
  });

  it("caps energy at 100", () => {
    const highEnergy = makeState({ energyLevel: 95 });
    const svc = new CompanionGrowthService(highEnergy);
    svc.reactToStreakMaintained("user");
    expect(svc.getState()?.energyLevel).toBe(100);
  });

  it("caps level at 100", () => {
    const highLevel = makeState({ level: 99 });
    const svc = new CompanionGrowthService(highLevel);
    svc.reactToComebackCompleted("user");
    expect(svc.getState()?.level).toBe(100);
  });
});
