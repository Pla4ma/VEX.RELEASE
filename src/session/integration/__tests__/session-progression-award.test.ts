import { buildSessionProgressAward } from "../session-progression-award";
import { SessionMode } from "../../modes";
import type { SessionSummary } from "../../types";

const BASE_SUMMARY: SessionSummary = {
  actualDuration: 25 * 60 * 1000,
  baseScore: 250,
  bonuses: [],
  coinsEarned: 0,
  completedAt: Date.now(),
  completionPercentage: 100,
  createdAt: Date.now(),
  damageTaken: 0,
  effectiveDuration: 25 * 60 * 1000,
  finalScore: 90,
  focusPurityScore: 95,
  focusQuality: 95,
  gemsEarned: 0,
  interruptions: 0,
  isPerfect: true,
  modeBonus: 0,
  pauses: 0,
  pausedDuration: 0,
  penaltiesApplied: [],
  plannedDuration: 25 * 60 * 1000,
  sessionId: "11111111-1111-4111-8111-111111111111",
  sessionMode: SessionMode.LIGHT_FOCUS,
  status: "COMPLETED",
  streakBonus: 0,
  streakDays: 3,
  streakIncreased: true,
  streakMaintained: true,
  tasksCompleted: 1,
  timeBonus: 0,
  userId: "22222222-2222-4222-8222-222222222222",
  userLevel: 2,
  vsAverage: 0,
  vsBest: 0,
  xpEarned: 0,
};

describe("buildSessionProgressAward", () => {
  it("rewards real completed focus time plus quality score", () => {
    const award = buildSessionProgressAward({
      companionXpMultiplier: 1,
      newStreakDays: 4,
      sessionId: BASE_SUMMARY.sessionId,
      summary: BASE_SUMMARY,
      userId: BASE_SUMMARY.userId,
    });

    expect(award.amount).toBe(715);
    expect(award.sessionId).toBe(BASE_SUMMARY.sessionId);
    expect(award.metadata).toMatchObject({
      effectiveDurationMs: 25 * 60 * 1000,
      perfectSession: true,
      sourceVersion: "session-progress-award/v1",
      streakDays: 4,
      tasksCompleted: 1,
    });
  });

  it("applies companion XP multiplier deterministically", () => {
    const award = buildSessionProgressAward({
      companionXpMultiplier: 1.2,
      newStreakDays: 1,
      sessionId: BASE_SUMMARY.sessionId,
      summary: BASE_SUMMARY,
      userId: BASE_SUMMARY.userId,
    });

    expect(award.amount).toBe(858);
  });

  it("keeps a minimum award for a valid completed session", () => {
    const summary: SessionSummary = {
      ...BASE_SUMMARY,
      effectiveDuration: 0,
      finalScore: 0,
      isPerfect: false,
    };
    const award = buildSessionProgressAward({
      companionXpMultiplier: 1,
      newStreakDays: 0,
      sessionId: summary.sessionId,
      summary,
      userId: summary.userId,
    });

    expect(award.amount).toBe(1);
  });
});
