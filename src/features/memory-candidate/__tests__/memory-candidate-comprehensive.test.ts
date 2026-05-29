/**
 * Comprehensive tests for memory-candidate feature
 * Covers: repository.ts CRUD, service.ts, what-vex-learned-service.ts,
 * insight-builders/index.ts
 */
import {
  addMemoryCandidate,
  addMemoryFromRecall,
  addMemoryFromStudyBlock,
  getMemoryCandidates,
  removeMemoryCandidate,
} from "../service";
import {
  buildWhatVEXLearned,
  shouldShowWhatVEXLearned,
} from "../what-vex-learned-service";
import { buildInsightBuilders } from "../insight-builders";
import { clearMemoryCandidates } from "../repository";
import type { WhatVEXLearnedInput } from "../schemas";

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

const userId = "test-user-mc";

function baseInput(overrides: Partial<WhatVEXLearnedInput> = {}): WhatVEXLearnedInput {
  return {
    userId,
    totalSessions: 10,
    totalFocusMinutes: 500,
    streakDays: 5,
    completedSessions: 10,
    ...overrides,
  };
}

describe("memory-candidate comprehensive tests", () => {
  afterEach(() => {
    mockStore.clear();
  });

  // ──────────────────── repository CRUD ────────────────────

  describe("repository CRUD", () => {
    it("creates and lists memory candidates", async () => {
      await addMemoryCandidate({
        content: "Test memory",
        source: "study_block",
        sourceId: "block-1",
        userId,
      });
      const list = await getMemoryCandidates(userId);
      expect(list).toHaveLength(1);
      expect(list[0]!.content).toBe("Test memory");
      expect(list[0]!.source).toBe("study_block");
      expect(list[0]!.confidence).toBe("medium");
    });

    it("creates with tags", async () => {
      await addMemoryCandidate({
        content: "Tagged memory",
        source: "recall",
        sourceId: "recall-1",
        tags: ["biology", "exam"],
        userId,
      });
      const list = await getMemoryCandidates(userId);
      expect(list[0]!.tags).toEqual(["biology", "exam"]);
    });

    it("deleteMemoryCandidate removes by id", async () => {
      await addMemoryCandidate({
        content: "To delete",
        source: "study_block",
        sourceId: "block-2",
        userId,
      });
      const list = await getMemoryCandidates(userId);
      expect(list).toHaveLength(1);
      await removeMemoryCandidate(userId, list[0]!.id);
      const after = await getMemoryCandidates(userId);
      expect(after).toHaveLength(0);
    });

    it("clearMemoryCandidates removes all", async () => {
      for (let i = 0; i < 3; i++) {
        await addMemoryCandidate({
          content: `Memory ${i}`,
          source: "study_block",
          sourceId: `block-${i}`,
          userId,
        });
      }
      expect((await getMemoryCandidates(userId)).length).toBe(3);
      await clearMemoryCandidates(userId);
      expect((await getMemoryCandidates(userId)).length).toBe(0);
    });

    it("caps at 100 candidates", async () => {
      for (let i = 0; i < 110; i++) {
        await addMemoryCandidate({
          content: `Memory entry ${i}`,
          source: "study_block",
          sourceId: `block-${i}`,
          userId: "cap-user",
        });
      }
      const list = await getMemoryCandidates("cap-user");
      expect(list.length).toBeLessThanOrEqual(100);
    });

    it("returns empty array for unknown user", async () => {
      const list = await getMemoryCandidates("unknown-user");
      expect(list).toEqual([]);
    });
  });

  // ──────────────────── service addMemoryFromStudyBlock ────────────────────

  describe("addMemoryFromStudyBlock", () => {
    it("formats content from title and objective", async () => {
      const mc = await addMemoryFromStudyBlock({
        blockTitle: "Cell Biology",
        blockObjective: "Understand mitosis",
        studyBlockId: "block-1",
        userId,
      });
      expect(mc).not.toBeNull();
      expect(mc!.content).toContain("Cell Biology");
      expect(mc!.content).toContain("Understand mitosis");
      expect(mc!.source).toBe("study_block");
      expect(mc!.sourceId).toBe("block-1");
    });

    it("truncates content to 2000 chars", async () => {
      const longTitle = "A".repeat(1500);
      const longObj = "B".repeat(1500);
      const mc = await addMemoryFromStudyBlock({
        blockTitle: longTitle,
        blockObjective: longObj,
        studyBlockId: "block-long",
        userId,
      });
      expect(mc!.content.length).toBeLessThanOrEqual(2000);
    });
  });

  // ──────────────────── service addMemoryFromRecall ────────────────────

  describe("addMemoryFromRecall", () => {
    it("includes hint when provided", async () => {
      const mc = await addMemoryFromRecall({
        prompt: "What is photosynthesis?",
        answerHint: "Light energy conversion",
        recallId: "recall-1",
        userId,
      });
      expect(mc).not.toBeNull();
      expect(mc!.content).toContain("photosynthesis");
      expect(mc!.content).toContain("Light energy conversion");
      expect(mc!.source).toBe("recall");
    });

    it("omits hint section when answerHint is null", async () => {
      const mc = await addMemoryFromRecall({
        prompt: "What is DNA?",
        answerHint: null,
        recallId: "recall-2",
        userId,
      });
      expect(mc!.content).not.toContain("Hint:");
      expect(mc!.content).toContain("DNA");
    });
  });

  // ──────────────────── buildWhatVEXLearned ────────────────────

  describe("buildWhatVEXLearned", () => {
    it("returns empty items when totalSessions < 3", () => {
      const result = buildWhatVEXLearned(
        baseInput({ totalSessions: 2 }),
      );
      expect(result.items).toEqual([]);
      expect(result.hasEnoughEvidence).toBe(false);
    });

    it("sets hasEnoughEvidence true when totalSessions >= 3", () => {
      const result = buildWhatVEXLearned(
        baseInput({ totalSessions: 3 }),
      );
      expect(result.hasEnoughEvidence).toBe(true);
    });

    it("includes early disclaimer for < 5 sessions", () => {
      const result = buildWhatVEXLearned(
        baseInput({ totalSessions: 3 }),
      );
      expect(result.disclaimer).toContain("Still early");
    });

    it("includes forming disclaimer for 5-9 sessions", () => {
      const result = buildWhatVEXLearned(
        baseInput({ totalSessions: 7 }),
      );
      expect(result.disclaimer).toContain("Patterns are forming");
    });

    it("includes mature disclaimer for 10+ sessions", () => {
      const result = buildWhatVEXLearned(
        baseInput({ totalSessions: 12 }),
      );
      expect(result.disclaimer).toContain("Based on your session data");
    });

    it("returns not-enough disclaimer when totalSessions < 3", () => {
      const result = buildWhatVEXLearned(
        baseInput({ totalSessions: 1 }),
      );
      expect(result.disclaimer).toContain("Not enough session data");
    });

    it("sets correct id and userId", () => {
      const result = buildWhatVEXLearned(baseInput());
      expect(result.id).toBe(`vex-learned:${userId}`);
      expect(result.userId).toBe(userId);
    });

    it("caps items at 5 maximum", () => {
      const result = buildWhatVEXLearned(
        baseInput({
          totalSessions: 20,
          completedSessions: 20,
          totalFocusMinutes: 1000,
          streakDays: 10,
          abandonedStarts: 5,
          avgDelayBeforeStartSeconds: 200,
          shortCompletions: 15,
          earlyQuits: 5,
          modeChanges: 10,
          eveningNudgeDismissals: 5,
          morningNudgeOpens: 5,
          rescueSessionsCompleted: 5,
          averageFocusScore: 85,
          mostProductiveTimeLabel: "in the morning",
          bestSessionDurationMinutes: 30,
          completedNamedStudyTargets: 5,
        }),
      );
      expect(result.items.length).toBeLessThanOrEqual(5);
    });
  });

  // ──────────────────── shouldShowWhatVEXLearned ────────────────────

  describe("shouldShowWhatVEXLearned", () => {
    it("returns false when totalSessions < 3", () => {
      expect(
        shouldShowWhatVEXLearned({ totalSessions: 2, lastShownAt: null }),
      ).toBe(false);
    });

    it("returns true when lastShownAt is null and sessions >= 3", () => {
      expect(
        shouldShowWhatVEXLearned({ totalSessions: 3, lastShownAt: null }),
      ).toBe(true);
    });

    it("returns true when shown more than 24 hours ago", () => {
      const hoursAgo25 = Date.now() - 25 * 60 * 60 * 1000;
      expect(
        shouldShowWhatVEXLearned({
          totalSessions: 5,
          lastShownAt: hoursAgo25,
        }),
      ).toBe(true);
    });

    it("returns false when shown less than 24 hours ago", () => {
      const hoursAgo1 = Date.now() - 1 * 60 * 60 * 1000;
      expect(
        shouldShowWhatVEXLearned({
          totalSessions: 5,
          lastShownAt: hoursAgo1,
        }),
      ).toBe(false);
    });
  });

  // ──────────────────── buildInsightBuilders ────────────────────

  describe("buildInsightBuilders", () => {
    it("returns builders from all categories", () => {
      const builders = buildInsightBuilders(baseInput(), Date.now());
      expect(builders.length).toBeGreaterThan(0);
      const categories = new Set(builders.map((b) => b.category));
      expect(categories.size).toBeGreaterThan(1);
    });

    it("each builder has condition and build functions", () => {
      const builders = buildInsightBuilders(baseInput(), Date.now());
      for (const builder of builders) {
        expect(typeof builder.condition).toBe("function");
        expect(typeof builder.build).toBe("function");
        expect(builder.category).toBeDefined();
      }
    });

    it("returns start_friction insight when abandonedStarts is high", () => {
      const input = baseInput({
        abandonedStarts: 5,
        totalSessions: 5,
        completedSessions: 5,
      });
      const builders = buildInsightBuilders(input, Date.now());
      const friction = builders.filter(
        (b) => b.category === "start_friction" && b.condition(),
      );
      expect(friction.length).toBeGreaterThan(0);
    });

    it("returns mode_behavior insight when modeChanges is high", () => {
      const input = baseInput({
        modeChanges: 5,
        totalSessions: 10,
        completedSessions: 10,
      });
      const builders = buildInsightBuilders(input, Date.now());
      const modeInsights = builders.filter(
        (b) => b.category === "mode_behavior" && b.condition(),
      );
      expect(modeInsights.length).toBeGreaterThan(0);
    });

    it("returns notification_behavior insight when evening nudges dismissed", () => {
      const input = baseInput({
        eveningNudgeDismissals: 3,
        totalSessions: 5,
      });
      const builders = buildInsightBuilders(input, Date.now());
      const notifInsights = builders.filter(
        (b) => b.category === "notification_behavior" && b.condition(),
      );
      expect(notifInsights.length).toBeGreaterThan(0);
    });

    it("returns rescue_behavior insight when rescue accepts >= 1", () => {
      const input = baseInput({
        rescueAcceptsAfterMiss: 2,
        totalSessions: 5,
      });
      const builders = buildInsightBuilders(input, Date.now());
      const rescueInsights = builders.filter(
        (b) => b.category === "rescue_behavior" && b.condition(),
      );
      expect(rescueInsights.length).toBeGreaterThan(0);
    });

    it("returns study_continuity insight for named study targets", () => {
      const input = baseInput({
        completedNamedStudyTargets: 3,
        totalSessions: 5,
        completedSessions: 5,
      });
      const builders = buildInsightBuilders(input, Date.now());
      const studyInsights = builders.filter(
        (b) => b.category === "study_continuity" && b.condition(),
      );
      expect(studyInsights.length).toBeGreaterThan(0);
    });

    it("build items have required LearnedItem fields", () => {
      const input = baseInput({
        abandonedStarts: 5,
        totalSessions: 5,
        completedSessions: 5,
      });
      const builders = buildInsightBuilders(input, Date.now());
      const matching = builders.filter((b) => b.condition());
      for (const builder of matching) {
        const item = builder.build();
        expect(item.id).toBeDefined();
        expect(item.observation).toBeDefined();
        expect(item.evidence).toBeDefined();
        expect(["weak", "medium", "strong"]).toContain(item.confidence);
        expect(item.userVisible).toBe(true);
        expect(item.editedByUser).toBe(false);
        expect(item.deletedByUser).toBe(false);
        expect(item.createdAt).toBeDefined();
      }
    });
  });
});
