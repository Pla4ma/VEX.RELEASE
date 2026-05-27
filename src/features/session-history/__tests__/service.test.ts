import { SessionMode } from "../../../session/modes";
import type { SessionSummary } from "../../../session/types";
import type { SupabaseSessionRow } from "../schemas";
import {
  buildSessionHistoryViewModel,
  mapSessionRowToHistoryItem,
} from "../service";

const baseRow: SupabaseSessionRow = {
  id: "session-1",
  user_id: "user-1",
  status: "COMPLETED",
  duration: 1500,
  effective_duration: 1320,
  quality_score: 91,
  mode: "DEEP_WORK",
  difficulty: "MEDIUM",
  metadata: {},
  started_at: "2026-05-20T14:00:00.000Z",
  completed_at: "2026-05-20T14:25:00.000Z",
  ended_at: "2026-05-20T14:25:00.000Z",
  created_at: "2026-05-20T13:59:00.000Z",
  updated_at: "2026-05-20T14:25:00.000Z",
};

function makeSummary(): SessionSummary {
  return {
    sessionId: "session-1",
    userId: "user-1",
    status: "COMPLETED",
    sessionMode: SessionMode.DEEP_WORK,
    plannedDuration: 1500,
    actualDuration: 1500,
    effectiveDuration: 1320,
    pausedDuration: 0,
    completionPercentage: 100,
    focusQuality: 91,
    focusPurityScore: 91,
    interruptions: 0,
    pauses: 0,
    pausedTime: 0,
    streakMaintained: true,
    modeBonus: 0,
    baseScore: 910,
    timeBonus: 0,
    finalScore: 910,
    createdAt: Date.parse(baseRow.created_at),
    streakIncreased: true,
    streakDays: 4,
    xpEarned: 120,
    coinsEarned: 16,
    gemsEarned: 0,
    userLevel: 3,
    bonuses: [],
    damageTaken: 0,
    penaltiesApplied: [],
    vsAverage: 0,
    vsBest: 0,
  };
}

describe("session history service", () => {
  it("maps a Supabase session row into a truthful history item", () => {
    const item = mapSessionRowToHistoryItem(baseRow);

    expect(item.sessionId).toBe(baseRow.id);
    expect(item.userId).toBe(baseRow.user_id);
    expect(item.mode).toBe(SessionMode.DEEP_WORK);
    expect(item.effectiveDurationSeconds).toBe(1320);
    expect(item.finalScore).toBe(910);
    expect(item.grade).toBe("S");
    expect(item.summary).toBeNull();
  });

  it("preserves validated completion summary when the row has one", () => {
    const summary = makeSummary();
    const item = mapSessionRowToHistoryItem({
      ...baseRow,
      metadata: { summary },
    });

    expect(item.summary?.xpEarned).toBe(120);
    expect(item.summary?.streakMaintained).toBe(true);
  });

  it("computes aggregate stats without treating empty history as failure", () => {
    const viewModel = buildSessionHistoryViewModel([]);

    expect(viewModel.items).toEqual([]);
    expect(viewModel.stats.completedSessions).toBe(0);
    expect(viewModel.stats.averageScore).toBeNull();
  });
});
