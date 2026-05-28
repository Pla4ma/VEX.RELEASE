import { z } from "zod";
import { StudyPlanSchema } from "../study-loop";

export type StudyPlan = z.infer<typeof StudyPlanSchema>;

export function createMockPlan(overrides: Partial<StudyPlan> = {}): StudyPlan {
  return {
    id: "plan-123",
    userId: "user-123",
    title: "Test",
    description: "Test",
    subject: "Test",
    goal: "Test",
    sessionsTotal: 5,
    sessionsCompleted: 0,
    estimatedMinutesPerSession: 30,
    difficulty: "beginner" as const,
    status: "draft" as const,
    createdAt: Date.now(),
    sessions: [],
    ...overrides,
  };
}
