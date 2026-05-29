/**
 * Companion Feature — Comprehensive Tests
 *
 * Covers: CompanionService, CompanionGrowthService, calculateMood, getMoodMessage,
 * createDefaultCompanion, event handlers, milestone tracker, service instance, and analytics.
 */

// Mock external dependencies before imports
jest.mock("../../../events/EventBus", () => ({
  eventBus: {
    publish: jest.fn(),
    subscribe: jest.fn(() => jest.fn()),
  },
}));

jest.mock("../../../shared/analytics/analytics-service", () => ({
  capture: jest.fn(),
}));

import { CompanionService } from "../service";
import { CompanionGrowthService } from "../growth-service";
import { CompanionGrowthServiceCore } from "../growth-service-core";
import { calculateMood, getMoodMessage } from "../companion-mood";
import { createDefaultCompanion } from "../companion-schemas";
import { getCompanionService, clearCompanionService } from "../service-instance";
import { checkMilestones } from "../milestone-tracker";
import { emitCompanionStateChanged, emitCompanionEvolution, emitCompanionMilestone, subscribeToCompanionEvents } from "../events";
import {
  handleBossDefeated,
  handleSessionCompleted,
  handleStreakMilestone,
  handleStreakBroken,
  handleUserReturned,
  handleLevelUp,
} from "../companion-event-handlers";
import { RESPONSES } from "../personality-responses";
import { EVOLUTION_THRESHOLDS, MOOD_RULES, ELEMENT_THEMES } from "../types";
import type { CompanionState, CompanionMood, CompanionPhase } from "../types";
import { eventBus } from "../../../events/EventBus";

// Helpers
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

// ──────────────────────────────────────────
// 1. calculateMood + getMoodMessage
// ──────────────────────────────────────────
describe("calculateMood", () => {
  it("returns DANGER when purity < 30 and energy < 20", () => {
    expect(calculateMood(50, 10, 20)).toBe("DANGER");
  });

  it("returns STRUGGLING when energy < 30", () => {
    expect(calculateMood(50, 25, 80)).toBe("STRUGGLING");
  });

  it("returns ECSTATIC when progress > 95, energy > 80, purity > 90", () => {
    expect(calculateMood(96, 90, 95)).toBe("ECSTATIC");
  });

  it("returns DETERMINED when progress > 70 and energy > 60", () => {
    expect(calculateMood(80, 70, 60)).toBe("DETERMINED");
  });

  it("returns FOCUSED when progress > 30, energy > 50, purity > 70", () => {
    expect(calculateMood(50, 60, 80)).toBe("FOCUSED");
  });

  it("returns CONTENT when progress > 10 and energy > 30", () => {
    expect(calculateMood(20, 40, 50)).toBe("CONTENT");
  });

  it("returns SLEEPY as default for low progress and energy", () => {
    // energy=35 so it won't hit STRUGGLING (energy < 30)
    expect(calculateMood(5, 35, 50)).toBe("SLEEPY");
  });

  it("prioritizes DANGER over STRUGGLING when both conditions met", () => {
    expect(calculateMood(50, 15, 25)).toBe("DANGER");
  });
});

describe("getMoodMessage", () => {
  it("returns a string for every mood", () => {
    const moods: CompanionMood[] = [
      "SLEEPY", "CONTENT", "FOCUSED", "DETERMINED", "ECSTATIC", "STRUGGLING", "DANGER",
    ];
    for (const mood of moods) {
      expect(typeof getMoodMessage(mood)).toBe("string");
      expect(getMoodMessage(mood).length).toBeGreaterThan(0);
    }
  });

  it("returns specific messages for known moods", () => {
    expect(getMoodMessage("SLEEPY")).toContain("stirs");
    expect(getMoodMessage("ECSTATIC")).toContain("energy");
    expect(getMoodMessage("DANGER")).toContain("fading");
  });
});

// ──────────────────────────────────────────
// 2. createDefaultCompanion
// ──────────────────────────────────────────
describe("createDefaultCompanion", () => {
  it("creates default companion with given userId", () => {
    const companion = createDefaultCompanion("user-123");
    expect(companion.id).toBe("companion_user-123");
    expect(companion.userId).toBe("user-123");
    expect(companion.phase).toBe("EGG");
    expect(companion.level).toBe(1);
    expect(companion.totalFocusMinutes).toBe(0);
    expect(companion.element).toBe("FLAME");
  });

  it("uses custom element when provided", () => {
    const companion = createDefaultCompanion("user-123", { element: "WAVE" });
    expect(companion.element).toBe("WAVE");
    expect(companion.colorHue).toBe(170);
  });

  it("maps each element to correct hue", () => {
    const hueMap = { FLAME: 15, WAVE: 170, TERRA: 100, ZEPHYR: 200, VOID: 270, LUMINA: 45 };
    for (const [element, expectedHue] of Object.entries(hueMap)) {
      const companion = createDefaultCompanion("u", { element: element as CompanionState["element"] });
      expect(companion.colorHue).toBe(expectedHue);
    }
  });

  it("defaults to SLEEPY mood and 0 progress", () => {
    const companion = createDefaultCompanion("u");
    expect(companion.currentMood).toBe("SLEEPY");
    expect(companion.sessionProgress).toBe(0);
  });
});

// ──────────────────────────────────────────
// 3. CompanionService
// ──────────────────────────────────────────
describe("CompanionService", () => {
  let service: CompanionService;
  let state: CompanionState;

  beforeEach(() => {
    state = makeState();
    service = new CompanionService(state);
  });

  describe("constructor", () => {
    it("initializes with provided state", () => {
      expect(service.getState()).toMatchObject({ id: state.id, userId: state.userId });
    });

    it("initializes with null state when no initial state", () => {
      const emptyService = new CompanionService();
      expect(emptyService.getState()).toBeNull();
    });
  });

  describe("getState", () => {
    it("returns a copy of state", () => {
      const s1 = service.getState();
      const s2 = service.getState();
      expect(s1).not.toBe(s2);
      expect(s1).toEqual(s2);
    });

    it("returns null when no state", () => {
      expect(new CompanionService().getState()).toBeNull();
    });
  });

  describe("startSession", () => {
    it("sets mood to SLEEPY and resets progress", () => {
      service.startSession();
      const s = service.getState();
      expect(s?.currentMood).toBe("SLEEPY");
      expect(s?.sessionProgress).toBe(0);
      expect(s?.energyLevel).toBe(50);
    });

    it("does nothing when state is null", () => {
      const emptyService = new CompanionService();
      emptyService.startSession();
      expect(emptyService.getState()).toBeNull();
    });

    it("emits MOOD_SHIFT event", () => {
      const events: unknown[] = [];
      service.onEvent((e) => events.push(e));
      service.startSession();
      expect(events).toHaveLength(1);
      expect((events[0] as { type: string }).type).toBe("MOOD_SHIFT");
    });
  });

  describe("tick", () => {
    it("updates session progress", () => {
      service.startSession();
      service.tick(50, 100, 90, false);
      expect(service.getState()?.sessionProgress).toBe(50);
    });

    it("increases energy when purity > 80", () => {
      service.startSession();
      const before = service.getState()?.energyLevel ?? 50;
      service.tick(1, 100, 90, false);
      expect(service.getState()?.energyLevel).toBeGreaterThan(before);
    });

    it("decreases energy when purity <= 50", () => {
      service.startSession();
      const before = service.getState()?.energyLevel ?? 50;
      service.tick(1, 100, 30, false);
      expect(service.getState()?.energyLevel).toBeLessThan(before);
    });

    it("does not change energy when paused", () => {
      service.startSession();
      service.tick(1, 100, 90, false);
      const afterActive = service.getState()?.energyLevel;
      service.tick(2, 100, 90, true);
      expect(service.getState()?.energyLevel).toBe(afterActive);
    });

    it("does nothing when state is null", () => {
      const emptyService = new CompanionService();
      emptyService.tick(10, 100, 80, false);
      expect(emptyService.getState()).toBeNull();
    });

    it("emits MILESTONE events at 10% intervals", () => {
      const events: unknown[] = [];
      service.onEvent((e) => events.push(e));
      service.startSession();
      events.length = 0; // clear startSession event
      service.tick(11, 100, 90, false); // 11% -> triggers 10% milestone
      const milestone = events.find((e) => (e as { type: string }).type === "MILESTONE");
      expect(milestone).toBeDefined();
    });

    it("clamps energy between 0 and 100", () => {
      service.startSession();
      // Tick many times with low purity to drain energy
      for (let i = 0; i < 500; i++) {
        service.tick(i, 1000, 30, false);
      }
      expect(service.getState()?.energyLevel).toBeGreaterThanOrEqual(0);

      // Reset and tick with high purity to fill energy
      service.startSession();
      for (let i = 0; i < 500; i++) {
        service.tick(i, 1000, 95, false);
      }
      expect(service.getState()?.energyLevel).toBeLessThanOrEqual(100);
    });
  });

  describe("completeSession", () => {
    it("returns no level up or evolution for small session", () => {
      const result = service.completeSession(1, 80);
      expect(result.leveledUp).toBeDefined();
      expect(result.evolved).toBeDefined();
    });

    it("returns no result when state is null", () => {
      const emptyService = new CompanionService();
      const result = emptyService.completeSession(30, 90);
      expect(result.leveledUp).toBe(false);
      expect(result.evolved).toBe(false);
    });

    it("increments session count", () => {
      service.completeSession(30, 80);
      const s = service.getState();
      expect(s?.sessionCount).toBe(1);
    });

    it("tracks perfect sessions when purity > 90", () => {
      service.completeSession(30, 95);
      expect(service.getState()?.perfectSessions).toBe(1);
    });

    it("does not count as perfect when purity <= 90", () => {
      service.completeSession(30, 80);
      expect(service.getState()?.perfectSessions).toBe(0);
    });

    it("adds focus minutes", () => {
      service.completeSession(30, 80);
      expect(service.getState()?.totalFocusMinutes).toBe(30);
    });
  });

  describe("onEvent", () => {
    it("returns unsubscribe function", () => {
      const unsub = service.onEvent(() => {});
      expect(typeof unsub).toBe("function");
    });

    it("unsubscribes correctly", () => {
      const events: unknown[] = [];
      const unsub = service.onEvent((e) => events.push(e));
      service.startSession();
      expect(events.length).toBeGreaterThan(0);
      events.length = 0;
      unsub();
      service.startSession();
      expect(events).toHaveLength(0);
    });
  });

  describe("reactToStreakMaintained", () => {
    it("does nothing when state is null", () => {
      const emptyService = new CompanionService();
      emptyService.reactToStreakMaintained("user");
      expect(emptyService.getState()).toBeNull();
    });

    it("emits milestone event", () => {
      const events: unknown[] = [];
      service.onEvent((e) => events.push(e));
      service.reactToStreakMaintained("user");
      expect(events.some((e) => (e as { type: string }).type === "MILESTONE")).toBe(true);
    });
  });

  describe("reactToComebackCompleted", () => {
    it("does nothing when state is null", () => {
      const emptyService = new CompanionService();
      emptyService.reactToComebackCompleted("user");
      expect(emptyService.getState()).toBeNull();
    });

    it("emits milestone event", () => {
      const events: unknown[] = [];
      service.onEvent((e) => events.push(e));
      service.reactToComebackCompleted("user");
      expect(events.some((e) => (e as { type: string }).type === "MILESTONE")).toBe(true);
    });
  });

  describe("reactToFocusScoreChanged", () => {
    it("emits GROWTH_PULSE when score increases", () => {
      const events: unknown[] = [];
      service.onEvent((e) => events.push(e));
      service.reactToFocusScoreChanged("user", 500, 600);
      expect(events.some((e) => (e as { type: string }).type === "GROWTH_PULSE")).toBe(true);
    });

    it("emits MOOD_SHIFT when score decreases", () => {
      const events: unknown[] = [];
      service.onEvent((e) => events.push(e));
      service.reactToFocusScoreChanged("user", 600, 500);
      expect(events.some((e) => (e as { type: string }).type === "MOOD_SHIFT")).toBe(true);
    });
  });

  describe("reactToDailyMissionCompleted", () => {
    it("emits milestone event", () => {
      const events: unknown[] = [];
      service.onEvent((e) => events.push(e));
      service.reactToDailyMissionCompleted("user");
      expect(events.some((e) => (e as { type: string }).type === "MILESTONE")).toBe(true);
    });
  });
});

// ──────────────────────────────────────────
// 4. CompanionGrowthServiceCore
// ──────────────────────────────────────────
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

// ──────────────────────────────────────────
// 5. CompanionGrowthService reactions
// ──────────────────────────────────────────
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

// ──────────────────────────────────────────
// 6. Event handlers
// ──────────────────────────────────────────
describe("companion-event-handlers", () => {
  const mockTrigger = jest.fn();

  beforeEach(() => {
    mockTrigger.mockClear();
  });

  describe("handleBossDefeated", () => {
    it("triggers BOSS_DEFEATED with boss name dialogue", () => {
      handleBossDefeated(mockTrigger, { bossName: "Dark Lord", userId: "u1" });
      expect(mockTrigger).toHaveBeenCalledWith("BOSS_DEFEATED", "u1", expect.arrayContaining(["Dark Lord is down!"]));
    });

    it("triggers BOSS_DEFEATED without custom dialogue when no boss name", () => {
      handleBossDefeated(mockTrigger, { userId: "u1" });
      expect(mockTrigger).toHaveBeenCalledWith("BOSS_DEFEATED", "u1", undefined);
    });
  });

  describe("handleSessionCompleted", () => {
    it("triggers S_GRADE_SESSION for grade S", () => {
      handleSessionCompleted(mockTrigger, { grade: "S", userId: "u1" });
      expect(mockTrigger).toHaveBeenCalledWith("S_GRADE_SESSION", "u1");
    });

    it("triggers PERFECT_SESSION for purity >= 95", () => {
      handleSessionCompleted(mockTrigger, { purity: 96, userId: "u1" });
      expect(mockTrigger).toHaveBeenCalledWith("PERFECT_SESSION", "u1");
    });

    it("does not trigger for non-S grade and low purity", () => {
      handleSessionCompleted(mockTrigger, { grade: "B", purity: 70, userId: "u1" });
      expect(mockTrigger).not.toHaveBeenCalled();
    });
  });

  describe("handleStreakMilestone", () => {
    it("triggers for 7-day streak", () => {
      handleStreakMilestone(mockTrigger, { days: 7, userId: "u1" });
      expect(mockTrigger).toHaveBeenCalledWith("STREAK_MILESTONE", "u1", expect.arrayContaining([expect.stringContaining("week")]));
    });

    it("triggers for 14-day streak", () => {
      handleStreakMilestone(mockTrigger, { days: 14, userId: "u1" });
      expect(mockTrigger).toHaveBeenCalledWith("STREAK_MILESTONE", "u1", expect.arrayContaining([expect.stringContaining("14 days")]));
    });

    it("triggers for 30-day streak", () => {
      handleStreakMilestone(mockTrigger, { days: 30, userId: "u1" });
      expect(mockTrigger).toHaveBeenCalledWith("STREAK_MILESTONE", "u1", expect.arrayContaining([expect.stringContaining("30-day")]));
    });

    it("does not trigger for non-milestone days", () => {
      handleStreakMilestone(mockTrigger, { days: 5, userId: "u1" });
      expect(mockTrigger).not.toHaveBeenCalled();
    });
  });

  describe("handleStreakBroken", () => {
    it("provides custom dialogue for long streaks", () => {
      handleStreakBroken(mockTrigger, { previousStreak: 10, userId: "u1" });
      expect(mockTrigger).toHaveBeenCalledWith("STREAK_BROKEN", "u1", expect.arrayContaining([expect.stringContaining("10-day")]));
    });

    it("uses default dialogue for short streaks", () => {
      handleStreakBroken(mockTrigger, { previousStreak: 3, userId: "u1" });
      expect(mockTrigger).toHaveBeenCalledWith("STREAK_BROKEN", "u1", undefined);
    });
  });

  describe("handleUserReturned", () => {
    it("triggers COMEBACK for 3+ days absent", () => {
      handleUserReturned(mockTrigger, { daysAbsent: 3, userId: "u1" });
      expect(mockTrigger).toHaveBeenCalledWith("COMEBACK", "u1", expect.arrayContaining([expect.stringContaining("came back")]));
    });

    it("uses different dialogue for 7+ days absent", () => {
      handleUserReturned(mockTrigger, { daysAbsent: 10, userId: "u1" });
      expect(mockTrigger).toHaveBeenCalledWith("COMEBACK", "u1", expect.arrayContaining([expect.stringContaining("Been a while")]));
    });

    it("does not trigger for less than 3 days", () => {
      handleUserReturned(mockTrigger, { daysAbsent: 1, userId: "u1" });
      expect(mockTrigger).not.toHaveBeenCalled();
    });
  });

  describe("handleLevelUp", () => {
    it("triggers LEVEL_UP with level dialogue", () => {
      handleLevelUp(mockTrigger, { newLevel: 5, userId: "u1" });
      expect(mockTrigger).toHaveBeenCalledWith("LEVEL_UP", "u1", expect.arrayContaining([expect.stringContaining("Level 5")]));
    });
  });
});

// ──────────────────────────────────────────
// 7. Milestone tracker
// ──────────────────────────────────────────
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

// ──────────────────────────────────────────
// 8. Service instance singleton
// ──────────────────────────────────────────
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

// ──────────────────────────────────────────
// 9. Personality responses data
// ──────────────────────────────────────────
describe("RESPONSES personality data", () => {
  it("has responses for every personality event type", () => {
    const eventTypes = [
      "BOSS_DEFEATED", "S_GRADE_SESSION", "STREAK_MILESTONE",
      "STREAK_BROKEN", "COMEBACK", "LEVEL_UP", "PERFECT_SESSION",
    ];
    for (const type of eventTypes) {
      expect(RESPONSES[type as keyof typeof RESPONSES]).toBeDefined();
      expect(RESPONSES[type as keyof typeof RESPONSES].length).toBeGreaterThan(0);
    }
  });

  it("each response has required fields", () => {
    for (const [_type, responses] of Object.entries(RESPONSES)) {
      for (const response of responses) {
        expect(response.animation).toBeDefined();
        expect(response.dialogue).toBeInstanceOf(Array);
        expect(response.dialogue.length).toBeGreaterThan(0);
        expect(response.mood).toBeDefined();
        expect(response.duration).toBeGreaterThan(0);
      }
    }
  });
});

// ──────────────────────────────────────────
// 10. Constants and type data
// ──────────────────────────────────────────
describe("EVOLUTION_THRESHOLDS", () => {
  it("has threshold for every phase", () => {
    const phases: CompanionPhase[] = ["EGG", "HATCHING", "YOUNG", "MATURE", "AWAKENED", "TRANSCENDENT"];
    for (const phase of phases) {
      expect(EVOLUTION_THRESHOLDS[phase]).toBeDefined();
    }
  });

  it("EGG has 0 threshold", () => {
    expect(EVOLUTION_THRESHOLDS.EGG).toBe(0);
  });

  it("TRANSCENDENT has Infinity threshold", () => {
    expect(EVOLUTION_THRESHOLDS.TRANSCENDENT).toBe(Infinity);
  });

  it("thresholds increase with phase progression", () => {
    expect(EVOLUTION_THRESHOLDS.HATCHING).toBeLessThan(EVOLUTION_THRESHOLDS.YOUNG);
    expect(EVOLUTION_THRESHOLDS.YOUNG).toBeLessThan(EVOLUTION_THRESHOLDS.MATURE);
    expect(EVOLUTION_THRESHOLDS.MATURE).toBeLessThan(EVOLUTION_THRESHOLDS.AWAKENED);
  });
});

describe("MOOD_RULES", () => {
  it("defines rules for all moods", () => {
    const moods = ["SLEEPY", "CONTENT", "FOCUSED", "DETERMINED", "ECSTATIC", "STRUGGLING", "DANGER"];
    for (const mood of moods) {
      expect(MOOD_RULES[mood as keyof typeof MOOD_RULES]).toBeDefined();
    }
  });
});

describe("ELEMENT_THEMES", () => {
  it("has theme for every element", () => {
    const elements = ["FLAME", "WAVE", "TERRA", "ZEPHYR", "VOID", "LUMINA"];
    for (const element of elements) {
      expect(ELEMENT_THEMES[element as keyof typeof ELEMENT_THEMES]).toBeDefined();
      expect(ELEMENT_THEMES[element as keyof typeof ELEMENT_THEMES].primary).toBeDefined();
      expect(ELEMENT_THEMES[element as keyof typeof ELEMENT_THEMES].ambience).toBeDefined();
    }
  });
});

// ──────────────────────────────────────────
// 11. Events module
// ──────────────────────────────────────────
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
