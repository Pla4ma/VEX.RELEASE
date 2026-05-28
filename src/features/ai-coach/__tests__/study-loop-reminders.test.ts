import { compareStudyPlans, getNextStudyReminder } from "../study-loop";
import { createMockPlan } from "./study-loop-test-helpers";

describe("Study Loop — Reminders & Comparison", () => {
  describe("getNextStudyReminder", () => {
    it("returns final session reminder for last session", () => {
      const plan = createMockPlan({
        title: "Learn TypeScript",
        sessionsTotal: 5,
        sessionsCompleted: 4,
        status: "active" as const,
        startedAt: Date.now(),
        sessions: [
          { id: "s1", title: "Session 1", completed: true },
          { id: "s2", title: "Session 2", completed: true },
          { id: "s3", title: "Session 3", completed: true },
          { id: "s4", title: "Session 4", completed: true },
          { id: "s5", title: "Session 5", completed: false },
        ],
      });
      const reminder = getNextStudyReminder(plan);
      expect(reminder.shouldRemind).toBe(true);
      expect(reminder.urgency).toBe("high");
      expect(reminder.message).toContain("Final session");
    });

    it("returns progress reminder when >75% complete", () => {
      const plan = createMockPlan({
        title: "Learn TypeScript",
        sessionsTotal: 4,
        sessionsCompleted: 3,
        status: "active" as const,
        startedAt: Date.now(),
        sessions: [
          { id: "s1", title: "Session 1", completed: true },
          { id: "s2", title: "Session 2", completed: true },
          { id: "s3", title: "Session 3", completed: true },
          { id: "s4", title: "Session 4", completed: false },
        ],
      });
      const reminder = getNextStudyReminder(plan);
      expect(reminder.shouldRemind).toBe(true);
      expect(reminder.urgency).toBe("medium");
      expect(reminder.message).toContain("75%");
    });

    it("returns low urgency for normal progress", () => {
      const plan = createMockPlan({
        title: "Learn TypeScript",
        sessionsCompleted: 1,
        status: "active" as const,
        startedAt: Date.now(),
        sessions: [
          { id: "s1", title: "Session 1", completed: true },
          { id: "s2", title: "Session 2", completed: false },
        ],
      });
      const reminder = getNextStudyReminder(plan);
      expect(reminder.shouldRemind).toBe(true);
      expect(reminder.urgency).toBe("low");
    });

    it("returns no reminder when all complete", () => {
      const plan = createMockPlan({
        title: "Learn TypeScript",
        sessionsTotal: 2,
        sessionsCompleted: 2,
        status: "completed" as const,
        startedAt: Date.now(),
        completedAt: Date.now(),
        sessions: [
          { id: "s1", title: "Session 1", completed: true },
          { id: "s2", title: "Session 2", completed: true },
        ],
      });
      const reminder = getNextStudyReminder(plan);
      expect(reminder.shouldRemind).toBe(false);
    });
  });

  describe("compareStudyPlans", () => {
    it("compares two plans correctly", () => {
      const planA = createMockPlan({
        id: "plan-a",
        title: "Plan A",
        description: "Fast plan",
        sessionsTotal: 3,
        sessionsCompleted: 1,
        difficulty: "advanced" as const,
        status: "active" as const,
        startedAt: Date.now(),
      });
      const planB = createMockPlan({
        id: "plan-b",
        title: "Plan B",
        description: "Slow plan",
        sessionsTotal: 5,
        sessionsCompleted: 1,
        status: "active" as const,
        startedAt: Date.now(),
      });
      const comparison = compareStudyPlans(planA, planB);
      expect(comparison.faster.id).toBe("plan-a");
      expect(comparison.moreDifficult.id).toBe("plan-a");
      expect(comparison.higherCompletion.id).toBe("plan-b");
    });
  });
});
