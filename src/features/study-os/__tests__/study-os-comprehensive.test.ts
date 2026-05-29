/**
 * Study OS — Comprehensive Tests
 *
 * Covers: service-helpers-plan, service-helpers-recall, study-plan-service,
 *         enhanced-block-completion, repository, schemas, events, analytics
 */

import { firstSentence } from "../service-helpers";
import {
  planId,
  makeBlock,
  buildStudyOsHomeSurface,
  computeStudyOsUnlockGate,
  computeStudyOsPremiumGate,
  buildDayZeroStudyPreview,
  isContentStudyBackendAvailable,
  getManualStudyFallbackMessage,
  generateRecallQuestion,
  getEmptyRecallFallback,
  shouldGenerateRecall,
  buildMemoryContentFromBlock,
  getPlannedBlocksFromPlan,
  createManualStudyPlan,
  createPasteStudyPlan,
  buildFailedGenerationFallbackPlan,
  completeStudyBlock,
  completeStudyBlockEnhanced,
} from "../service";

import {
  StudyPlanSchema,
  StudyBlockSchema,
  StudySourceSchema,
  ReviewItemSchema,
  RecallQuestionSchema,
  StudyOsHomeSurfaceSchema,
  StudyOsUnlockGateSchema,
  StudyOsPremiumGateSchema,
} from "../schemas";

import { validateStudyPlanEventPayload } from "../events";
import { STUDY_OS_ANALYTICS_EVENTS } from "../analytics";
import { listStoredStudyPlans, upsertStoredStudyPlan } from "../repository";

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

// ─── firstSentence ───────────────────────────────────────────────

describe("firstSentence", () => {
  it("returns first sentence from period-separated text", () => {
    expect(firstSentence("Hello world. Second sentence.")).toBe("Hello world");
  });

  it("returns first sentence from exclamation-separated text", () => {
    expect(firstSentence("Amazing! But wait.")).toBe("Amazing");
  });

  it("returns first sentence from question-separated text", () => {
    expect(firstSentence("Is this correct? Yes it is.")).toBe("Is this correct");
  });

  it("returns full text if no sentence terminators", () => {
    expect(firstSentence("Just one thought")).toBe("Just one thought");
  });

  it("returns fallback for empty string", () => {
    expect(firstSentence("")).toBe("Study next useful section");
  });

  it("handles newline-separated text", () => {
    expect(firstSentence("First line\nSecond line")).toBe("First line");
  });

  it("trims whitespace from result", () => {
    expect(firstSentence("  Spaced out. Next.")).toBe("Spaced out");
  });
});

// ─── planId ──────────────────────────────────────────────────────

describe("planId", () => {
  it("generates correct format", () => {
    expect(planId("user-1", 1000)).toBe("user-1:study:1000");
  });

  it("includes userId and timestamp", () => {
    const id = planId("student-42", 1700000000000);
    expect(id).toContain("student-42");
    expect(id).toContain("1700000000000");
  });
});

// ─── makeBlock ───────────────────────────────────────────────────

describe("makeBlock", () => {
  it("creates a valid study block", () => {
    const block = makeBlock("plan-1", "Read Chapter 1", "Understand photosynthesis");
    expect(block.id).toBe("plan-1:block:1");
    expect(block.title).toBe("Read Chapter 1");
    expect(block.objective).toBe("Understand photosynthesis");
    expect(block.estimatedMinutes).toBe(25);
    expect(block.priority).toBe("medium");
    expect(block.status).toBe("not_started");
    expect(block.studyPlanId).toBe("plan-1");
  });

  it("validates against StudyBlockSchema", () => {
    const block = makeBlock("plan-2", "Review notes", "Summarize key points");
    expect(() => StudyBlockSchema.parse(block)).not.toThrow();
  });
});

// ─── buildStudyOsHomeSurface ─────────────────────────────────────

describe("buildStudyOsHomeSurface", () => {
  it("student lane shows study surface even without plan", () => {
    const surface = buildStudyOsHomeSurface({ lane: "student", plan: null });
    expect(surface.hidden).toBe(false);
    expect(surface.title).toBe("Study OS");
    expect(surface.ctaLabel).toBe("Create study block");
  });

  it("non-student lane hides surface without plan", () => {
    expect(buildStudyOsHomeSurface({ lane: "minimal_normal", plan: null }).hidden).toBe(true);
    expect(buildStudyOsHomeSurface({ lane: "game_like", plan: null }).hidden).toBe(true);
    expect(buildStudyOsHomeSurface({ lane: "deep_creative", plan: null }).hidden).toBe(true);
  });

  it("non-student lane shows surface when plan exists", () => {
    const plan = StudyPlanSchema.parse({
      blocks: [],
      createdAt: 100,
      deadlineAt: null,
      id: "p1",
      reviewItems: [],
      source: { createdAt: 100, extractedTextStatus: "none", id: "s1", title: "Math", type: "manual", userId: "u1" },
      status: "active",
      title: "Calculus",
      userId: "u1",
    });
    const surface = buildStudyOsHomeSurface({ lane: "minimal_normal", plan });
    expect(surface.hidden).toBe(false);
    expect(surface.title).toBe("Calculus");
    expect(surface.ctaLabel).toBe("Start study block");
  });

  it("offline shows fallback message", () => {
    const surface = buildStudyOsHomeSurface({
      isOffline: true,
      lane: "student",
      plan: null,
    });
    expect(surface.offlineFallback).toContain("Offline");
  });

  it("online has null offline fallback", () => {
    const surface = buildStudyOsHomeSurface({ lane: "student", plan: null });
    expect(surface.offlineFallback).toBeNull();
  });

  it("deadlineAt set shows risk label", () => {
    const plan = StudyPlanSchema.parse({
      blocks: [],
      createdAt: 100,
      deadlineAt: 999999,
      id: "p1",
      reviewItems: [],
      source: { createdAt: 100, extractedTextStatus: "none", id: "s1", title: "T", type: "manual", userId: "u1" },
      status: "active",
      title: "Title",
      userId: "u1",
    });
    const surface = buildStudyOsHomeSurface({ lane: "student", plan });
    expect(surface.riskLabel).toBe("Deadline risk active");
  });

  it("no deadline means null risk label", () => {
    const surface = buildStudyOsHomeSurface({ lane: "student", plan: null });
    expect(surface.riskLabel).toBeNull();
  });
});

// ─── computeStudyOsUnlockGate ────────────────────────────────────

describe("computeStudyOsUnlockGate", () => {
  it("Day 0 user is locked with day_zero reason", () => {
    const gate = computeStudyOsUnlockGate({
      completedSessions: 0,
      studyUsageRatio: 0,
    });
    expect(gate.isUnlocked).toBe(false);
    expect(gate.isDayZero).toBe(true);
    expect(gate.unlockReason).toBe("day_zero");
  });

  it("7+ sessions fully unlocks", () => {
    const gate = computeStudyOsUnlockGate({
      completedSessions: 7,
      studyUsageRatio: 0.5,
    });
    expect(gate.isUnlocked).toBe(true);
    expect(gate.unlockReason).toBe("full");
  });

  it("firstWeekPhase >= 7 fully unlocks", () => {
    const gate = computeStudyOsUnlockGate({
      completedSessions: 3,
      studyUsageRatio: 0.1,
      firstWeekPhase: 7,
    });
    expect(gate.isUnlocked).toBe(true);
    expect(gate.unlockReason).toBe("full");
  });

  it("5+ sessions unlocks with evidence_sessions reason", () => {
    const gate = computeStudyOsUnlockGate({
      completedSessions: 5,
      studyUsageRatio: 0.1,
    });
    expect(gate.isUnlocked).toBe(true);
    expect(gate.unlockReason).toBe("evidence_sessions");
  });

  it("high usage ratio unlocks with evidence_usage reason", () => {
    const gate = computeStudyOsUnlockGate({
      completedSessions: 2,
      studyUsageRatio: 0.35,
    });
    expect(gate.isUnlocked).toBe(true);
    expect(gate.unlockReason).toBe("evidence_usage");
  });

  it("few sessions without high usage stays locked with first_week reason", () => {
    const gate = computeStudyOsUnlockGate({
      completedSessions: 2,
      studyUsageRatio: 0.1,
    });
    expect(gate.isUnlocked).toBe(false);
    expect(gate.unlockReason).toBe("first_week");
  });

  it("passes through completedSessions and studyUsageRatio", () => {
    const gate = computeStudyOsUnlockGate({
      completedSessions: 3,
      studyUsageRatio: 0.25,
    });
    expect(gate.completedSessions).toBe(3);
    expect(gate.studyUsageRatio).toBe(0.25);
  });
});

// ─── computeStudyOsPremiumGate ───────────────────────────────────

describe("computeStudyOsPremiumGate", () => {
  it("full premium access when entitled and healthy", () => {
    const gate = computeStudyOsPremiumGate({
      hasPremiumEntitlement: true,
      revenueCatHealthy: true,
    });
    expect(gate.canAccessPremiumDepth).toBe(true);
    expect(gate.revenueCatHealthy).toBe(true);
    expect(gate.basicStudyFree).toBe(true);
    expect(gate.restrictionReason).toBeNull();
  });

  it("no premium depth without entitlement", () => {
    const gate = computeStudyOsPremiumGate({
      hasPremiumEntitlement: false,
      revenueCatHealthy: true,
    });
    expect(gate.canAccessPremiumDepth).toBe(false);
    expect(gate.restrictionReason).toContain("VEX+");
  });

  it("no premium depth when RevenueCat is degraded", () => {
    const gate = computeStudyOsPremiumGate({
      hasPremiumEntitlement: true,
      revenueCatHealthy: false,
    });
    expect(gate.canAccessPremiumDepth).toBe(false);
    expect(gate.revenueCatHealthy).toBe(false);
    expect(gate.restrictionReason).toContain("RevenueCat");
  });

  it("basicStudyFree is always true", () => {
    expect(
      computeStudyOsPremiumGate({
        hasPremiumEntitlement: false,
        revenueCatHealthy: false,
      }).basicStudyFree,
    ).toBe(true);
  });
});

// ─── buildDayZeroStudyPreview ────────────────────────────────────

describe("buildDayZeroStudyPreview", () => {
  it("returns visible surface with start CTA", () => {
    const preview = buildDayZeroStudyPreview();
    expect(preview.hidden).toBe(false);
    expect(preview.ctaLabel).toBe("Start first study block");
    expect(preview.title).toContain("VEX helps you");
    expect(preview.riskLabel).toBeNull();
    expect(preview.offlineFallback).toBeNull();
  });

  it("validates against StudyOsHomeSurfaceSchema", () => {
    expect(() =>
      StudyOsHomeSurfaceSchema.parse(buildDayZeroStudyPreview()),
    ).not.toThrow();
  });
});

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

// ─── Repository ──────────────────────────────────────────────────

describe("Repository", () => {
  beforeEach(() => mockStore.clear());

  it("listStoredStudyPlans returns empty array for new user", async () => {
    const plans = await listStoredStudyPlans("new-user");
    expect(plans).toEqual([]);
  });

  it("upsertStoredStudyPlan stores and retrieves plan", async () => {
    const plan = StudyPlanSchema.parse({
      blocks: [
        { estimatedMinutes: 25, id: "b1", objective: "Learn X", priority: "medium", status: "not_started", studyPlanId: "p1", title: "Block 1" },
      ],
      createdAt: 100,
      deadlineAt: null,
      id: "p1",
      reviewItems: [],
      source: { createdAt: 100, extractedTextStatus: "none", id: "s1", title: "Test", type: "manual", userId: "user-1" },
      status: "active",
      title: "Test Plan",
      userId: "user-1",
    });
    await upsertStoredStudyPlan(plan);
    const plans = await listStoredStudyPlans("user-1");
    expect(plans).toHaveLength(1);
    expect(plans[0]!.id).toBe("p1");
    expect(plans[0]!.title).toBe("Test Plan");
  });

  it("upsert updates existing plan with same id", async () => {
    const plan1 = StudyPlanSchema.parse({
      blocks: [],
      createdAt: 100,
      deadlineAt: null,
      id: "p1",
      reviewItems: [],
      source: { createdAt: 100, extractedTextStatus: "none", id: "s1", title: "T", type: "manual", userId: "user-2" },
      status: "active",
      title: "Original",
      userId: "user-2",
    });
    await upsertStoredStudyPlan(plan1);

    const plan2 = StudyPlanSchema.parse({
      ...plan1,
      title: "Updated",
    });
    await upsertStoredStudyPlan(plan2);

    const plans = await listStoredStudyPlans("user-2");
    expect(plans).toHaveLength(1);
    expect(plans[0]!.title).toBe("Updated");
  });
});

// ─── Study Plan Service ──────────────────────────────────────────

describe("Study Plan Service", () => {
  beforeEach(() => mockStore.clear());

  it("createManualStudyPlan creates plan with manual source", async () => {
    const plan = await createManualStudyPlan({
      objective: "Learn algebra basics",
      title: "Algebra 101",
      userId: "student-1",
      now: 1000,
    });
    expect(plan.source.type).toBe("manual");
    expect(plan.status).toBe("active");
    expect(plan.blocks).toHaveLength(1);
    expect(plan.blocks[0]!.objective).toBe("Learn algebra basics");
    expect(plan.reviewItems).toHaveLength(0);
    expect(plan.userId).toBe("student-1");
  });

  it("createPasteStudyPlan creates plan with paste source and review item", async () => {
    const plan = await createPasteStudyPlan({
      pastedText: "Photosynthesis converts light into energy. It is essential for life.",
      title: "Biology",
      userId: "student-2",
      now: 2000,
    });
    expect(plan.source.type).toBe("paste");
    expect(plan.source.extractedTextStatus).toBe("ready");
    expect(plan.blocks).toHaveLength(1);
    expect(plan.reviewItems).toHaveLength(1);
    expect(plan.reviewItems[0]!.confidence).toBe("unknown");
  });

  it("createPasteStudyPlan uses firstSentence as objective", async () => {
    const plan = await createPasteStudyPlan({
      pastedText: "Newton's laws govern motion. F=ma is key.",
      title: "Physics",
      userId: "student-3",
      now: 3000,
    });
    expect(plan.blocks[0]!.objective).toBe("Newton's laws govern motion");
  });

  it("buildFailedGenerationFallbackPlan returns failed_generation status", () => {
    const plan = buildFailedGenerationFallbackPlan({
      sourceTitle: "Complex PDF",
      userId: "student-4",
      now: 4000,
    });
    expect(plan.status).toBe("failed_generation");
    expect(plan.source.extractedTextStatus).toBe("failed");
    expect(plan.blocks[0]!.objective).toContain("Complex PDF");
  });

  it("completeStudyBlock marks block as completed and adds review item", async () => {
    const plan = await createManualStudyPlan({
      objective: "Learn geometry",
      title: "Geometry",
      userId: "student-5",
      now: 5000,
    });
    const updated = await completeStudyBlock({
      blockId: plan.blocks[0]!.id,
      studyPlanId: plan.id,
      userId: "student-5",
      reflection: "Shapes are interesting",
      now: 6000,
    });
    expect(updated.blocks[0]!.status).toBe("completed");
    expect(updated.reviewItems.length).toBeGreaterThanOrEqual(1);
  });

  it("completeStudyBlock throws if plan not found", async () => {
    await expect(
      completeStudyBlock({
        blockId: "b1",
        studyPlanId: "nonexistent",
        userId: "student-x",
        now: 9000,
      }),
    ).rejects.toThrow("Study plan could not be found");
  });

  it("completeStudyBlock sets plan status to completed when all blocks done", async () => {
    const plan = await createManualStudyPlan({
      objective: "Learn calculus",
      title: "Calculus",
      userId: "student-6",
      now: 10000,
    });
    const updated = await completeStudyBlock({
      blockId: plan.blocks[0]!.id,
      studyPlanId: plan.id,
      userId: "student-6",
      now: 11000,
    });
    expect(updated.status).toBe("completed");
  });
});

// ─── Enhanced Block Completion ───────────────────────────────────

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

// ─── Schemas validation ──────────────────────────────────────────

describe("Schemas", () => {
  it("StudySourceSchema validates valid source", () => {
    expect(() =>
      StudySourceSchema.parse({
        createdAt: 100,
        extractedTextStatus: "none",
        id: "s1",
        title: "Test",
        type: "manual",
        userId: "u1",
      }),
    ).not.toThrow();
  });

  it("StudySourceSchema rejects invalid type", () => {
    expect(() =>
      StudySourceSchema.parse({
        createdAt: 100,
        extractedTextStatus: "none",
        id: "s1",
        title: "Test",
        type: "invalid",
        userId: "u1",
      }),
    ).toThrow();
  });

  it("StudyOsUnlockGateSchema validates all unlock reasons", () => {
    for (const reason of [
      "day_zero",
      "evidence_sessions",
      "evidence_usage",
      "first_week",
      "full",
    ]) {
      expect(() =>
        StudyOsUnlockGateSchema.parse({
          isUnlocked: false,
          isDayZero: false,
          completedSessions: 0,
          studyUsageRatio: 0,
          unlockReason: reason,
        }),
      ).not.toThrow();
    }
  });

  it("StudyOsPremiumGateSchema validates valid gate", () => {
    expect(() =>
      StudyOsPremiumGateSchema.parse({
        canAccessPremiumDepth: true,
        revenueCatHealthy: true,
        basicStudyFree: true,
        restrictionReason: null,
      }),
    ).not.toThrow();
  });

  it("ReviewItemSchema validates valid review item", () => {
    expect(() =>
      ReviewItemSchema.parse({
        answerHint: "Some hint",
        confidence: "unknown",
        dueAt: 1000,
        id: "r1",
        prompt: "What is X?",
        studyPlanId: "p1",
      }),
    ).not.toThrow();
  });
});

// ─── Events ──────────────────────────────────────────────────────

describe("Events", () => {
  it("validateStudyPlanEventPayload validates a valid plan", () => {
    const plan = {
      blocks: [],
      createdAt: 100,
      deadlineAt: null,
      id: "p1",
      reviewItems: [],
      source: { createdAt: 100, extractedTextStatus: "none", id: "s1", title: "T", type: "manual", userId: "u1" },
      status: "active",
      title: "Plan",
      userId: "u1",
    };
    expect(() => validateStudyPlanEventPayload(plan)).not.toThrow();
  });

  it("validateStudyPlanEventPayload rejects invalid payload", () => {
    expect(() => validateStudyPlanEventPayload({ invalid: true })).toThrow();
  });
});

// ─── Analytics ───────────────────────────────────────────────────

describe("Analytics", () => {
  it("defines all expected event names", () => {
    expect(STUDY_OS_ANALYTICS_EVENTS).toContain("study_os_plan_created");
    expect(STUDY_OS_ANALYTICS_EVENTS).toContain("study_os_block_started");
    expect(STUDY_OS_ANALYTICS_EVENTS).toContain("study_os_review_added");
    expect(STUDY_OS_ANALYTICS_EVENTS).toHaveLength(3);
  });
});
