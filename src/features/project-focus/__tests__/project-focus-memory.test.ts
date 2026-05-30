/**
 * Tests for project-focus feature — memory integration
 */
import {
  buildProjectMemoryCandidate,
  completeProjectSession,
  createProjectThread,
} from "../service";
import {
  buildProjectHandoffForMemory,
  shouldExportProjectMemory,
} from "../memory-integration";

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

describe("project-focus — memory", () => {
  beforeEach(() => mockStore.clear());

  // ──────────────────── buildProjectMemoryCandidate ────────────────────

  describe("buildProjectMemoryCandidate", () => {
    it("includes handoff, summary, and next move in content", async () => {
      const thread = await createProjectThread({
        currentObjective: "Write",
        nextMove: "Draft conclusion",
        now: 100,
        projectTitle: "Report",
        userId: "user-9",
      });
      const updated = await completeProjectSession({
        handoffNote: "Check section 3 references",
        lastSessionSummary: "Finished intro and body",
        nextMove: "Draft conclusion",
        now: 200,
        threadId: thread.id,
        userId: "user-9",
      });
      const candidate = buildProjectMemoryCandidate(updated);
      expect(candidate.type).toBe("project_handoff");
      expect(candidate.content).toContain("Check section 3 references");
      expect(candidate.content).toContain("Finished intro and body");
      expect(candidate.content).toContain("Draft conclusion");
      expect(candidate.metadata.projectTitle).toBe("Report");
      expect(candidate.metadata.state).toBe("active");
    });

    it("omits blocker line when no blocker exists", async () => {
      const thread = await createProjectThread({
        currentObjective: "Build",
        nextMove: "Code",
        now: 100,
        projectTitle: "App",
        userId: "user-9b",
      });
      const candidate = buildProjectMemoryCandidate(thread);
      expect(candidate.content).not.toContain("Blocker:");
    });
  });

  // ──────────────────── memory-integration.ts ────────────────────

  describe("buildProjectHandoffForMemory", () => {
    it("returns ProjectMemoryHandoff with correct fields", async () => {
      const thread = await createProjectThread({
        currentObjective: "Design",
        nextMove: "Iterate",
        now: 100,
        projectTitle: "Product",
        userId: "user-10",
      });
      const updated = await completeProjectSession({
        handoffNote: "Finalize mockups",
        lastSessionSummary: "Created wireframes",
        nextMove: "Iterate on design",
        now: 200,
        threadId: thread.id,
        userId: "user-10",
      });
      const handoff = buildProjectHandoffForMemory(updated);
      expect(handoff.type).toBe("project_handoff");
      expect(handoff.projectTitle).toBe("Product");
      expect(handoff.threadId).toBe(updated.id);
      expect(handoff.content).toContain("Finalize mockups");
    });
  });

  describe("shouldExportProjectMemory", () => {
    it("returns true for active, blocked, and completed states", () => {
      const states = ["active", "blocked", "completed"] as const;
      for (const state of states) {
        expect(
          shouldExportProjectMemory({
            id: "t",
            userId: "u",
            projectTitle: "P",
            state,
            bestSessionMode: "CREATIVE",
            blocker: null,
            currentObjective: "Obj",
            handoffNote: null,
            lastSessionSummary: null,
            lastTouched: 100,
            nextMove: "Next",
            openQuestions: [],
            rescuedAt: null,
            staleRisk: "none",
          }),
        ).toBe(true);
      }
    });

    it("returns false for new, stale, and rescued states", () => {
      const states = ["new", "stale", "rescued"] as const;
      for (const state of states) {
        expect(
          shouldExportProjectMemory({
            id: "t",
            userId: "u",
            projectTitle: "P",
            state,
            bestSessionMode: "CREATIVE",
            blocker: null,
            currentObjective: "Obj",
            handoffNote: null,
            lastSessionSummary: null,
            lastTouched: 100,
            nextMove: "Next",
            openQuestions: [],
            rescuedAt: null,
            staleRisk: "none",
          }),
        ).toBe(false);
      }
    });
  });
});
