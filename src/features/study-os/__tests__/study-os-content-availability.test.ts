/**
 * Study OS — Content Availability & Memory Tests
 *
 * Covers: isContentStudyBackendAvailable, getManualStudyFallbackMessage,
 *         buildMemoryContentFromBlock, getPlannedBlocksFromPlan
 */

import {
  isContentStudyBackendAvailable,
  getManualStudyFallbackMessage,
  buildMemoryContentFromBlock,
  getPlannedBlocksFromPlan,
} from "../service";
import { StudyPlanSchema } from "../schemas";

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

// ─── isContentStudyBackendAvailable ──────────────────────────────

describe("isContentStudyBackendAvailable", () => {
  it("true when all conditions met", () => {
    expect(
      isContentStudyBackendAvailable({
        featureHealth: "healthy",
        aiConfigured: true,
        storageConfigured: true,
      }),
    ).toBe(true);
  });

  it("false when degraded", () => {
    expect(
      isContentStudyBackendAvailable({
        featureHealth: "degraded",
        aiConfigured: true,
        storageConfigured: true,
      }),
    ).toBe(false);
  });

  it("false when unavailable", () => {
    expect(
      isContentStudyBackendAvailable({
        featureHealth: "unavailable",
        aiConfigured: true,
        storageConfigured: true,
      }),
    ).toBe(false);
  });

  it("false when AI not configured", () => {
    expect(
      isContentStudyBackendAvailable({
        featureHealth: "healthy",
        aiConfigured: false,
        storageConfigured: true,
      }),
    ).toBe(false);
  });

  it("false when storage not configured", () => {
    expect(
      isContentStudyBackendAvailable({
        featureHealth: "healthy",
        aiConfigured: true,
        storageConfigured: false,
      }),
    ).toBe(false);
  });
});

// ─── getManualStudyFallbackMessage ───────────────────────────────

describe("getManualStudyFallbackMessage", () => {
  it("offline message mentions offline", () => {
    expect(getManualStudyFallbackMessage(true)).toContain("offline");
  });

  it("degraded message mentions manual", () => {
    const msg = getManualStudyFallbackMessage(false);
    expect(msg).toContain("manual study session");
    expect(msg).not.toContain("offline");
  });
});

// ─── buildMemoryContentFromBlock ─────────────────────────────────

describe("buildMemoryContentFromBlock", () => {
  const block = {
    estimatedMinutes: 25,
    id: "b1",
    objective: "Understand mitosis",
    priority: "medium" as const,
    status: "not_started" as const,
    studyPlanId: "p1",
    title: "Cell Division",
  };

  it("includes title and objective without reflection", () => {
    const content = buildMemoryContentFromBlock(block);
    expect(content).toContain("Cell Division");
    expect(content).toContain("Understand mitosis");
    expect(content).not.toContain("Reflection");
  });

  it("includes reflection when provided", () => {
    const content = buildMemoryContentFromBlock(block, "Diagrams were helpful");
    expect(content).toContain("Cell Division");
    expect(content).toContain("Reflection: Diagrams were helpful");
  });

  it("handles null reflection", () => {
    const content = buildMemoryContentFromBlock(block, null);
    expect(content).not.toContain("Reflection");
  });
});

// ─── getPlannedBlocksFromPlan ────────────────────────────────────

describe("getPlannedBlocksFromPlan", () => {
  it("returns empty array for null plan", () => {
    expect(getPlannedBlocksFromPlan(null)).toEqual([]);
  });

  it("returns only not_started blocks", () => {
    const plan = StudyPlanSchema.parse({
      blocks: [
        { estimatedMinutes: 25, id: "b1", objective: "A", priority: "medium", status: "not_started", studyPlanId: "p1", title: "T1" },
        { estimatedMinutes: 25, id: "b2", objective: "B", priority: "medium", status: "completed", studyPlanId: "p1", title: "T2" },
        { estimatedMinutes: 25, id: "b3", objective: "C", priority: "medium", status: "not_started", studyPlanId: "p1", title: "T3" },
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
    const planned = getPlannedBlocksFromPlan(plan);
    expect(planned).toHaveLength(2);
    expect(planned.every((b) => b.status === "not_started")).toBe(true);
  });
});
