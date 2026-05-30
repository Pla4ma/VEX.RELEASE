/**
 * Session Recommendation — Recommendation Engine (Priority Rules) Tests
 */

import { SessionRecommendationInputSchema } from "../schemas";
import type { SessionRecommendationInput } from "../schemas";
import { getPriorityRecommendation } from "../recommendation-engine";

// ── Helpers ──────────────────────────────────────────────────────────

function makeInput(overrides: Partial<SessionRecommendationInput> = {}): SessionRecommendationInput {
  return SessionRecommendationInputSchema.parse({
    timeOfDay: 10,
    streakUrgency: "none",
    recoveryStatus: "none",
    isFirstSession: false,
    hasActiveSession: false,
    userId: "550e8400-e29b-41d4-a716-446655440000",
    ...overrides,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// RECOMMENDATION ENGINE (Priority Rules)
// ═══════════════════════════════════════════════════════════════════════

describe("getPriorityRecommendation", () => {
  it("Priority 1: returns 10-min RECOVERY for first session", () => {
    const rec = getPriorityRecommendation(makeInput({ isFirstSession: true }));
    expect(rec.duration).toBe(10);
    expect(rec.mode).toBe("RECOVERY");
    expect(rec.confidence).toBe(0.95);
    expect(rec.fallback).toBe(false);
    expect(rec.isBlocked).toBe(false);
    expect(rec.reason).toContain("habit");
  });

  it("Priority 2: returns 15-min RECOVERY for critical streak", () => {
    const rec = getPriorityRecommendation(makeInput({ streakUrgency: "critical" }));
    expect(rec.duration).toBe(15);
    expect(rec.mode).toBe("RECOVERY");
    expect(rec.confidence).toBe(0.98);
    expect(rec.reason).toContain("streak");
  });

  it("Priority 2: first session takes precedence over critical streak", () => {
    const rec = getPriorityRecommendation(
      makeInput({ isFirstSession: true, streakUrgency: "critical" }),
    );
    expect(rec.duration).toBe(10); // first session wins
    expect(rec.confidence).toBe(0.95);
  });

  it("Priority 3: returns 20-min RECOVERY for urgent recovery", () => {
    const rec = getPriorityRecommendation(makeInput({ recoveryStatus: "urgent" }));
    expect(rec.duration).toBe(20);
    expect(rec.mode).toBe("RECOVERY");
    expect(rec.confidence).toBe(0.9);
    expect(rec.reason).toContain("recovery");
  });

  it("Priority 2 (streak) takes precedence over Priority 3 (recovery)", () => {
    const rec = getPriorityRecommendation(
      makeInput({ streakUrgency: "critical", recoveryStatus: "urgent" }),
    );
    expect(rec.duration).toBe(15); // streak critical wins
    expect(rec.confidence).toBe(0.98);
  });

  it("Priority 4: uses mission-based recommendation when dailyMissionType set", () => {
    const rec = getPriorityRecommendation(
      makeInput({ dailyMissionType: "boss-fight" }),
    );
    expect(rec.duration).toBe(45);
    expect(rec.mode).toBe("BOSS_PREP");
    expect(rec.confidence).toBe(0.85);
    expect(rec.fallback).toBe(false);
  });

  it("Priority 5: uses time-based recommendation during peak hours", () => {
    const rec = getPriorityRecommendation(makeInput({ timeOfDay: 10 }));
    expect(rec.duration).toBe(45);
    expect(rec.mode).toBe("FOCUS");
    expect(rec.confidence).toBe(0.8);
  });

  it("Priority 6: uses performance-based recommendation when grade + length available", () => {
    const rec = getPriorityRecommendation(
      makeInput({
        timeOfDay: 12, // no time recommendation
        recentSessionLength: 30,
        recentGrade: "A",
      }),
    );
    expect(rec.duration).toBe(40); // min(60, 30+10)
    expect(rec.mode).toBe("FOCUS");
    expect(rec.confidence).toBe(0.75);
  });

  it("Priority 7: returns default 25-min FOCUS when no conditions match", () => {
    const rec = getPriorityRecommendation(
      makeInput({
        timeOfDay: 12, // no time recommendation
      }),
    );
    expect(rec.duration).toBe(25);
    expect(rec.mode).toBe("FOCUS");
    expect(rec.confidence).toBe(0.7);
    expect(rec.fallback).toBe(true);
    expect(rec.reason).toContain("balanced");
  });

  it("non-critical streak urgency does not trigger streak priority", () => {
    const rec = getPriorityRecommendation(
      makeInput({ streakUrgency: "high", timeOfDay: 12 }),
    );
    // Should NOT get the streak-critical recommendation
    expect(rec.confidence).not.toBe(0.98);
  });

  it("non-urgent recovery status does not trigger recovery priority", () => {
    const rec = getPriorityRecommendation(
      makeInput({ recoveryStatus: "needed", timeOfDay: 12 }),
    );
    // Should NOT get the urgent recovery recommendation
    expect(rec.duration).not.toBe(20);
  });
});
