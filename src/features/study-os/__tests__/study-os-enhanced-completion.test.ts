/**
 * Study OS — Enhanced Block Completion Tests
 *
 * Covers: completeStudyBlockEnhanced
 */

import { createManualStudyPlan, completeStudyBlockEnhanced } from "../service";

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

// ─── completeStudyBlockEnhanced ──────────────────────────────────

describe("completeStudyBlockEnhanced", () => {
  beforeEach(() => mockStore.clear());

  it("returns recall question and memory content after completion", async () => {
    const plan = await createManualStudyPlan({
      objective: "Study organic chemistry",
      title: "Organic Chem",
      userId: "student-enhanced",
      now: 20000,
    });
    const result = await completeStudyBlockEnhanced({
      blockId: plan.blocks[0]!.id,
      studyPlanId: plan.id,
      userId: "student-enhanced",
      reflection: "Benzene rings are fascinating",
      now: 21000,
    });
    expect(result.plan).toBeDefined();
    expect(result.recallQuestion).not.toBeNull();
    expect(result.recallQuestion!.kind).toBe("reflection");
    expect(result.memoryContent).toContain("Benzene rings");
    expect(result.memoryTags.length).toBeGreaterThanOrEqual(1);
    expect(result.memoryTags).toContain("study-block");
  });

  it("returns null suggestedNextBlock when all blocks done", async () => {
    const plan = await createManualStudyPlan({
      objective: "Study physics",
      title: "Physics",
      userId: "student-physics",
      now: 30000,
    });
    const result = await completeStudyBlockEnhanced({
      blockId: plan.blocks[0]!.id,
      studyPlanId: plan.id,
      userId: "student-physics",
      now: 31000,
    });
    expect(result.suggestedNextBlock).toBeNull();
  });

  it("generates memory tags from block title", async () => {
    const plan = await createManualStudyPlan({
      objective: "Learn about cells",
      title: "Cell Biology",
      userId: "student-bio",
      now: 40000,
    });
    const result = await completeStudyBlockEnhanced({
      blockId: plan.blocks[0]!.id,
      studyPlanId: plan.id,
      userId: "student-bio",
      now: 41000,
    });
    expect(result.memoryTags).toContain("cell-biology");
    expect(result.memoryTags).toContain("study-block");
  });

  it("works without reflection", async () => {
    const plan = await createManualStudyPlan({
      objective: "Learn about atoms",
      title: "Atomic Theory",
      userId: "student-atomic",
      now: 50000,
    });
    const result = await completeStudyBlockEnhanced({
      blockId: plan.blocks[0]!.id,
      studyPlanId: plan.id,
      userId: "student-atomic",
      now: 51000,
    });
    expect(result.recallQuestion).not.toBeNull();
    expect(result.recallQuestion!.kind).toBe("recall");
    expect(result.memoryContent).not.toContain("Reflection");
  });
});
