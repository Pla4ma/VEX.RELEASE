import {
  computeWeakTopics,
  computeWeeklyIntelligence,
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

describe("study intelligence — comprehensive", () => {
  describe("computeWeakTopics", () => {
    it("returns empty array when no plans", () => {
      expect(computeWeakTopics([])).toEqual([]);
    });

    it("returns empty array when plans have no blocks or review items", () => {
      expect(computeWeakTopics([basePlan])).toEqual([]);
    });

    it("detects weak topics from weak confidence review items", () => {
      const plan: StudyPlan = {
        ...basePlan,
        blocks: [
          {
            estimatedMinutes: 25,
            id: "b-1",
            objective: "Understand how mitochondria produce energy in cells",
            priority: "medium",
            status: "completed",
            studyPlanId: "plan-1",
            title: "Cellular respiration basics",
          },
        ],
        reviewItems: [
          {
            answerHint: null,
            confidence: "weak",
            dueAt: 2000,
            id: "r-1",
            prompt:
              "Explain how mitochondria function in cellular respiration",
            studyPlanId: "plan-1",
          },
        ],
      };

      const topics = computeWeakTopics([plan]);
      expect(topics.length).toBeGreaterThan(0);
      expect(topics.some((t) => t.confidence === "weak")).toBe(true);
    });

    it("caps results at 5 weak topics", () => {
      const blocks = Array.from({ length: 10 }, (_, i) => ({
        estimatedMinutes: 25,
        id: `b-${i}`,
        objective: `Unique topic objective number ${i} about science`,
        priority: "medium" as const,
        status: "completed" as const,
        studyPlanId: "plan-1",
        title: `Topic ${i} science biology chemistry physics`,
      }));

      const reviewItems = Array.from({ length: 10 }, (_, i) => ({
        answerHint: null,
        confidence: "weak" as const,
        dueAt: 2000,
        id: `r-${i}`,
        prompt: `Topic ${i} science biology chemistry physics review question`,
        studyPlanId: "plan-1",
      }));

      const plan: StudyPlan = {
        ...basePlan,
        blocks,
        reviewItems,
      };

      const topics = computeWeakTopics([plan], 5000);
      expect(topics.length).toBeLessThanOrEqual(5);
    });

    it("generates suggested action text for weak topics", () => {
      const plan: StudyPlan = {
        ...basePlan,
        createdAt: 100,
        blocks: [
          {
            estimatedMinutes: 25,
            id: "b-1",
            objective: "understanding neural networks",
            priority: "medium",
            status: "completed",
            studyPlanId: "plan-1",
            title: "neural",
          },
        ],
        reviewItems: [
          {
            answerHint: null,
            confidence: "weak",
            dueAt: 200,
            id: "r-1",
            prompt: "neural understanding basics",
            studyPlanId: "plan-1",
          },
        ],
      };

      const topics = computeWeakTopics([plan], 200);
      for (const topic of topics) {
        expect(topic.suggestedAction).toBeTruthy();
        expect(topic.suggestedAction.length).toBeGreaterThan(0);
      }
    });

    it("uses current time when now is not provided", () => {
      const plan: StudyPlan = {
        ...basePlan,
        createdAt: Date.now() - 100,
        blocks: [
          {
            estimatedMinutes: 25,
            id: "b-1",
            objective: "understanding quantum physics basics",
            priority: "medium",
            status: "completed",
            studyPlanId: "plan-1",
            title: "quantum",
          },
        ],
        reviewItems: [
          {
            answerHint: null,
            confidence: "weak",
            dueAt: Date.now(),
            id: "r-1",
            prompt: "quantum physics basics understanding",
            studyPlanId: "plan-1",
          },
        ],
      };

      expect(() => computeWeakTopics([plan])).not.toThrow();
    });
  });

  describe("computeWeeklyIntelligence", () => {
    it("returns zero-state intelligence when no completed blocks", () => {
      const plan: StudyPlan = {
        ...basePlan,
        blocks: [
          {
            estimatedMinutes: 25,
            id: "b-1",
            objective: "Study cell structure",
            priority: "medium",
            status: "not_started",
            studyPlanId: "plan-1",
            title: "Cell Structure",
          },
        ],
      };

      const intel = computeWeeklyIntelligence({ plans: [plan], streakDays: 0 });
      expect(intel.completedBlocks).toBe(0);
      expect(intel.totalStudyMinutes).toBe(25);
      expect(intel.suggestion).toContain("first study block");
    });

    it("computes correct totals with mixed block statuses", () => {
      const plan: StudyPlan = {
        ...basePlan,
        blocks: [
          {
            estimatedMinutes: 25,
            id: "b-1",
            objective: "Learn cell biology",
            priority: "medium",
            status: "completed",
            studyPlanId: "plan-1",
            title: "Cell Biology",
          },
          {
            estimatedMinutes: 30,
            id: "b-2",
            objective: "Review genetics",
            priority: "high",
            status: "not_started",
            studyPlanId: "plan-1",
            title: "Genetics review",
          },
          {
            estimatedMinutes: 15,
            id: "b-3",
            objective: "Practice problems",
            priority: "low",
            status: "completed",
            studyPlanId: "plan-1",
            title: "Practice",
          },
        ],
        reviewItems: [
          {
            answerHint: null,
            confidence: "weak",
            dueAt: 100,
            id: "r-1",
            prompt: "Explain cell biology basics",
            studyPlanId: "plan-1",
          },
          {
            answerHint: null,
            confidence: "strong",
            dueAt: 9999,
            id: "r-2",
            prompt: "Describe gene expression",
            studyPlanId: "plan-1",
          },
        ],
      };

      const intel = computeWeeklyIntelligence({
        plans: [plan],
        streakDays: 3,
        now: 5000,
      });
      expect(intel.completedBlocks).toBe(2);
      expect(intel.totalStudyMinutes).toBe(70);
      expect(intel.reviewItemsDue).toBe(1);
      expect(intel.streakDays).toBe(3);
    });

    it("says start first block when no completed blocks exist", () => {
      const intel = computeWeeklyIntelligence({ plans: [], streakDays: 5 });
      expect(intel.suggestion).toContain("Start your first study block");
    });

    it("suggests topic review when weak topics exist", () => {
      const plan: StudyPlan = {
        ...basePlan,
        createdAt: 100,
        blocks: [
          {
            estimatedMinutes: 25,
            id: "b-1",
            objective: "understanding photosynthesis in biology",
            priority: "medium",
            status: "completed",
            studyPlanId: "plan-1",
            title: "biology",
          },
        ],
        reviewItems: [
          {
            answerHint: null,
            confidence: "weak",
            dueAt: 200,
            id: "r-1",
            prompt: "biology understanding photosynthesis",
            studyPlanId: "plan-1",
          },
        ],
      };

      const intel = computeWeeklyIntelligence({
        plans: [plan],
        streakDays: 2,
        now: 200,
      });
      expect(intel.completedBlocks).toBe(1);
      expect(intel.weakTopics.length).toBeGreaterThan(0);
      expect(intel.suggestion).toContain("topic");
    });

    it("generates valid WeeklyIntelligence schema", () => {
      const plan: StudyPlan = {
        ...basePlan,
        blocks: [
          {
            estimatedMinutes: 25,
            id: "b-1",
            objective: "Study biology",
            priority: "medium",
            status: "completed",
            studyPlanId: "plan-1",
            title: "Biology",
          },
        ],
      };

      const intel = computeWeeklyIntelligence({
        plans: [plan],
        streakDays: 1,
        now: 1000,
      });
      expect(intel.generatedAt).toBe(1000);
      expect(typeof intel.totalStudyMinutes).toBe("number");
      expect(typeof intel.completedBlocks).toBe("number");
      expect(typeof intel.reviewItemsDue).toBe("number");
      expect(Array.isArray(intel.weakTopics)).toBe(true);
      expect(typeof intel.streakDays).toBe("number");
      expect(typeof intel.suggestion).toBe("string");
    });
  });

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
});
