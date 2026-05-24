import type { SessionSummary } from "../../types";
import {
  parseSessionSummaryMapJson,
  parseSyncQueueJson,
} from "../SessionRepositoryParsers";

function makeSummary(): SessionSummary {
  return {
    sessionId: "session-1",
    userId: "user-1",
    status: "COMPLETED",
    sessionMode: "FLOW",
    plannedDuration: 900,
    actualDuration: 900,
    effectiveDuration: 840,
    pausedDuration: 0,
    completionPercentage: 100,
    focusQuality: 90,
    interruptions: 0,
    pauses: 0,
    pausedTime: 0,
    streakMaintained: true,
    modeBonus: 0,
    baseScore: 900,
    timeBonus: 0,
    finalScore: 900,
    createdAt: Date.now(),
    streakIncreased: true,
    streakDays: 2,
    xpEarned: 90,
    coinsEarned: 12,
    gemsEarned: 0,
    userLevel: 1,
    bonuses: [],
    damageTaken: 0,
    penaltiesApplied: [],
    vsAverage: 0,
    vsBest: 0,
  };
}

describe("SessionRepositoryParsers", () => {
  it("parses session summary maps through the session summary schema", () => {
    const result = parseSessionSummaryMapJson(
      JSON.stringify({ "session-1": makeSummary() }),
    );

    expect(result["session-1"]?.finalScore).toBe(900);
  });

  it("rejects malformed sync queues instead of trusting JSON casts", () => {
    expect(() =>
      parseSyncQueueJson(JSON.stringify(["session-1", 123])),
    ).toThrow();
  });
});
