import {
  hasWeeklyIntelligenceData,
} from "../service";
import type { StudyPlan } from "../../study-os/schemas";

const basePlan: StudyPlan = {
  blocks: [],
  createdAt: 1000,
  deadlineAt: null,
  id: "plan-1",
  reviewItems: [],
  source: {
    createdAt: 1000,
    extractedTextStatus: "none",
    id: "src-1",
    title: "Biology",
    type: "manual",
    userId: "u-1",
  },
  status: "active",
  title: "Biology basics",
  userId: "u-1",
};

describe("hasWeeklyIntelligenceData", () => {
  it("returns false for empty plans", () => {
    expect(hasWeeklyIntelligenceData([])).toBe(false);
  });

  it("returns false when no blocks are completed", () => {
    const plan: StudyPlan = {
      ...basePlan,
      blocks: [
        {
          estimatedMinutes: 25,
          id: "b-1",
          objective: "Study X",
          priority: "medium",
          status: "not_started",
          studyPlanId: "plan-1",
          title: "Topic X",
        },
      ],
    };
    expect(hasWeeklyIntelligenceData([plan])).toBe(false);
  });

  it("returns true when completed blocks exist", () => {
    const plan: StudyPlan = {
      ...basePlan,
      blocks: [
        {
          estimatedMinutes: 25,
          id: "b-1",
          objective: "Learn X",
          priority: "medium",
          status: "completed",
          studyPlanId: "plan-1",
          title: "Topic X",
        },
      ],
    };
    expect(hasWeeklyIntelligenceData([plan])).toBe(true);
  });

  it("returns true when any plan has a completed block", () => {
    const plan1: StudyPlan = {
      ...basePlan,
      id: "plan-1",
      blocks: [
        {
          estimatedMinutes: 25,
          id: "b-1",
          objective: "Learn X",
          priority: "medium",
          status: "not_started",
          studyPlanId: "plan-1",
          title: "Topic X",
        },
      ],
    };
    const plan2: StudyPlan = {
      ...basePlan,
      id: "plan-2",
      blocks: [
        {
          estimatedMinutes: 30,
          id: "b-2",
          objective: "Learn Y",
          priority: "high",
          status: "completed",
          studyPlanId: "plan-2",
          title: "Topic Y",
        },
      ],
    };
    expect(hasWeeklyIntelligenceData([plan1, plan2])).toBe(true);
  });
});
