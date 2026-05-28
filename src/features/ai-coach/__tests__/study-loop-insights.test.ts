import {
  abandonStudyPlan,
  adjustStudyDifficulty,
  getStudyInsights,
  needsAttention,
} from "../study-loop";
import { createMockPlan } from "./study-loop-test-helpers";

describe("Study Loop — Insights & Maintenance", () => {
  describe("needsAttention", () => {
    it("returns true when stalled for 48 hours", () => {
      const plan = createMockPlan({
        sessionsCompleted: 2,
        status: "active" as const,
        startedAt: Date.now(),
      });
      const lastSessionAt = Date.now() - 50 * 60 * 60 * 1000;
      expect(needsAttention(plan, lastSessionAt)).toBe(true);
    });

    it("returns true when near completion but stalled", () => {
      const plan = createMockPlan({
        sessionsTotal: 5,
        sessionsCompleted: 4,
        status: "active" as const,
        startedAt: Date.now(),
      });
      expect(needsAttention(plan)).toBe(true);
    });

    it("returns false for inactive plans", () => {
      const plan = createMockPlan();
      expect(needsAttention(plan)).toBe(false);
    });
  });

  describe("adjustStudyDifficulty", () => {
    it("increases difficulty when high quality", () => {
      const plan = createMockPlan({
        sessionsCompleted: 3,
        status: "active" as const,
        startedAt: Date.now(),
      });
      const adjusted = adjustStudyDifficulty(plan, 95);
      expect(adjusted.difficulty).toBe("intermediate");
    });

    it("decreases difficulty when low quality", () => {
      const plan = createMockPlan({
        sessionsCompleted: 3,
        difficulty: "advanced" as const,
        status: "active" as const,
        startedAt: Date.now(),
      });
      const adjusted = adjustStudyDifficulty(plan, 50);
      expect(adjusted.difficulty).toBe("intermediate");
    });

    it("stays same when quality normal", () => {
      const plan = createMockPlan({
        sessionsCompleted: 3,
        status: "active" as const,
        startedAt: Date.now(),
      });
      const adjusted = adjustStudyDifficulty(plan, 75);
      expect(adjusted.difficulty).toBe("beginner");
    });
  });

  describe("abandonStudyPlan", () => {
    it("marks plan as abandoned", () => {
      const plan = createMockPlan({
        sessionsTotal: 5,
        sessionsCompleted: 2,
        status: "active" as const,
        startedAt: Date.now(),
      });
      const abandoned = abandonStudyPlan(plan, "Too hard");
      expect(abandoned.status).toBe("abandoned");
    });
  });

  describe("getStudyInsights", () => {
    it("identifies strong areas when high completion", () => {
      const plan = createMockPlan({
        sessionsTotal: 5,
        sessionsCompleted: 4,
        status: "active" as const,
        startedAt: Date.now(),
        sessions: [
          { id: "s1", title: "Session 1", completed: true, duration: 30 },
          { id: "s2", title: "Session 2", completed: true, duration: 30 },
          { id: "s3", title: "Session 3", completed: true, duration: 30 },
          { id: "s4", title: "Session 4", completed: true, duration: 30 },
        ],
      });
      const insights = getStudyInsights(plan);
      expect(insights.strongAreas).toContain("Consistency");
      expect(insights.completionRate).toBe(80);
      expect(insights.avgSessionDuration).toBe(30);
    });

    it("identifies improvement areas when low completion", () => {
      const plan = createMockPlan({
        sessionsTotal: 5,
        sessionsCompleted: 2,
        status: "active" as const,
        startedAt: Date.now(),
        sessions: [
          { id: "s1", title: "Session 1", completed: true, duration: 30 },
          { id: "s2", title: "Session 2", completed: true, duration: 30 },
        ],
      });
      const insights = getStudyInsights(plan);
      expect(insights.improvementAreas).toContain("Session completion");
    });

    it("returns 0 avg duration when no completed sessions", () => {
      const plan = createMockPlan();
      const insights = getStudyInsights(plan);
      expect(insights.avgSessionDuration).toBe(0);
    });
  });
});
