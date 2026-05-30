/**
 * Study OS — Recall Tests
 *
 * Covers: generateRecallQuestion, getEmptyRecallFallback, shouldGenerateRecall
 */

import {
  generateRecallQuestion,
  getEmptyRecallFallback,
  shouldGenerateRecall,
} from "../service";
import { StudyPlanSchema, RecallQuestionSchema } from "../schemas";

// ─── Mock external dependencies ──────────────────────────────────

const mockStore = new Map<string, string>();

jest.mock("react-native-mmkv", () => ({
  MMKV: class MockMMKV {
    getString(key: string): string | undefined {
      return mockStore.get(key);
    }
    set(key: string, value: string | number | boolean): void {
      mockStore.set(key, String(value));
    }
    delete(key: string): void {
      mockStore.delete(key);
    }
    contains(key: string): boolean {
      return mockStore.has(key);
    }
    getAllKeys(): string[] {
      return Array.from(mockStore.keys());
    }
  },
}));

jest.mock("../../../session/modes", () => ({
  SessionMode: {
    STUDY: "STUDY",
    FOCUS: "FOCUS",
  },
}));

jest.mock("../../session-start/service", () => ({
  buildLaneSessionBrief: jest.fn((input: { durationSeconds: number; lane: string }) => ({
    durationSeconds: input.durationSeconds,
    lane: input.lane,
    mode: "study",
  })),
}));

// ─── generateRecallQuestion ──────────────────────────────────────

describe("generateRecallQuestion", () => {
  it("generates recall type without reflection", () => {
    const q = generateRecallQuestion({
      blockTitle: "Photosynthesis",
      blockObjective: "Understand light reactions",
      studyBlockId: "b1",
      studyPlanId: "p1",
    });
    expect(q.kind).toBe("recall");
    expect(q.prompt).toContain("Photosynthesis");
    expect(q.answerHint).toBeNull();
    expect(q.studyBlockId).toBe("b1");
    expect(q.studyPlanId).toBe("p1");
  });

  it("generates reflection type with reflection text", () => {
    const q = generateRecallQuestion({
      blockTitle: "Photosynthesis",
      blockObjective: "Understand light reactions",
      reflection: "The diagrams helped a lot",
      studyBlockId: "b1",
      studyPlanId: "p1",
    });
    expect(q.kind).toBe("reflection");
    expect(q.prompt).toContain("Reflect");
    expect(q.answerHint).toContain("diagrams helped");
  });

  it("truncates answerHint to 200 chars", () => {
    const longReflection = "A".repeat(300);
    const q = generateRecallQuestion({
      blockTitle: "Test",
      blockObjective: "Test obj",
      reflection: longReflection,
      studyBlockId: "b1",
      studyPlanId: "p1",
    });
    expect(q.answerHint!.length).toBeLessThanOrEqual(200);
  });

  it("generates ID containing studyBlockId", () => {
    const q = generateRecallQuestion({
      blockTitle: "A",
      blockObjective: "B",
      studyBlockId: "b1",
      studyPlanId: "p1",
    });
    expect(q.id).toContain("b1");
    expect(q.id).toContain("recall");
  });

  it("validates against RecallQuestionSchema", () => {
    const q = generateRecallQuestion({
      blockTitle: "Test",
      blockObjective: "Learn",
      studyBlockId: "b1",
      studyPlanId: "p1",
    });
    expect(() => RecallQuestionSchema.parse(q)).not.toThrow();
  });
});

// ─── getEmptyRecallFallback ──────────────────────────────────────

describe("getEmptyRecallFallback", () => {
  it("returns a valid fallback question", () => {
    const fallback = getEmptyRecallFallback();
    expect(fallback.id).toBe("no-recall");
    expect(fallback.prompt).toContain("start one first");
    expect(fallback.kind).toBe("reflection");
    expect(fallback.answerHint).toBeNull();
  });

  it("validates against RecallQuestionSchema", () => {
    expect(() =>
      RecallQuestionSchema.parse(getEmptyRecallFallback()),
    ).not.toThrow();
  });
});

// ─── shouldGenerateRecall ────────────────────────────────────────

describe("shouldGenerateRecall", () => {
  it("returns false for null plan", () => {
    expect(shouldGenerateRecall(null)).toBe(false);
  });

  it("returns false when no blocks are completed", () => {
    const plan = StudyPlanSchema.parse({
      blocks: [
        { estimatedMinutes: 25, id: "b1", objective: "Learn", priority: "medium", status: "not_started", studyPlanId: "p1", title: "T" },
      ],
      createdAt: 100,
      deadlineAt: null,
      id: "p1",
      reviewItems: [],
      source: { createdAt: 100, extractedTextStatus: "none", id: "s1", title: "T", type: "manual", userId: "u1" },
      status: "active",
      title: "Plan",
      userId: "u1",
    });
    expect(shouldGenerateRecall(plan)).toBe(false);
  });

  it("returns true when at least one block is completed", () => {
    const plan = StudyPlanSchema.parse({
      blocks: [
        { estimatedMinutes: 25, id: "b1", objective: "Learn", priority: "medium", status: "completed", studyPlanId: "p1", title: "T" },
        { estimatedMinutes: 25, id: "b2", objective: "More", priority: "medium", status: "not_started", studyPlanId: "p1", title: "T2" },
      ],
      createdAt: 100,
      deadlineAt: null,
      id: "p1",
      reviewItems: [],
      source: { createdAt: 100, extractedTextStatus: "none", id: "s1", title: "T", type: "manual", userId: "u1" },
      status: "active",
      title: "Plan",
      userId: "u1",
    });
    expect(shouldGenerateRecall(plan)).toBe(true);
  });
});
