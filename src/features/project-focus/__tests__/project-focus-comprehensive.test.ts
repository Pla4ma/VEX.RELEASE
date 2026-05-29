/**
 * Comprehensive tests for project-focus feature
 * Covers: project-thread-service.ts, project-session-service.ts,
 * project-home-surface.ts, memory-integration.ts, integration.ts, store.ts, events.ts
 */
import {
  buildProjectHomeSurface,
  buildProjectMemoryCandidate,
  buildProjectResumeBrief,
  buildProjectSessionBrief,
  completeProjectSession,
  createProjectThread,
  ensureProjectThread,
  refreshProjectThreadState,
  rescueStaleProject,
  shouldShowProjectSurface,
} from "../service";
import {
  buildProjectHandoffForMemory,
  shouldExportProjectMemory,
} from "../memory-integration";
import { validateProjectThreadEventPayload } from "../events";
import { useProjectFocusStore } from "../store";

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

const DAY_MS = 86_400_000;

describe("project-focus comprehensive tests", () => {
  beforeEach(() => mockStore.clear());

  // ──────────────────── Thread creation ────────────────────

  describe("createProjectThread", () => {
    it("creates a thread with correct defaults", async () => {
      const thread = await createProjectThread({
        currentObjective: "Build landing page",
        nextMove: "Write hero copy",
        now: 100,
        projectTitle: "Marketing Site",
        userId: "user-1",
      });

      expect(thread.state).toBe("new");
      expect(thread.bestSessionMode).toBe("CREATIVE");
      expect(thread.blocker).toBeNull();
      expect(thread.handoffNote).toBeNull();
      expect(thread.lastSessionSummary).toBeNull();
      expect(thread.rescuedAt).toBeNull();
      expect(thread.staleRisk).toBe("none");
      expect(thread.openQuestions).toEqual([]);
      expect(thread.projectTitle).toBe("Marketing Site");
      expect(thread.currentObjective).toBe("Build landing page");
      expect(thread.nextMove).toBe("Write hero copy");
      expect(thread.id).toContain("user-1:project:");
    });
  });

  // ──────────────────── ensureProjectThread ────────────────────

  describe("ensureProjectThread", () => {
    it("returns existing non-completed thread", async () => {
      await createProjectThread({
        currentObjective: "Build API",
        nextMove: "Design schema",
        now: 100,
        projectTitle: "Backend",
        userId: "user-2",
      });
      const thread = await ensureProjectThread({
        projectTitle: "Backend v2",
        userId: "user-2",
        now: 200,
      });
      expect(thread.projectTitle).toBe("Backend");
      expect(thread.nextMove).toBe("Design schema");
    });

    it("creates new thread when all are completed", async () => {
      const t = await createProjectThread({
        currentObjective: "Write",
        nextMove: "Draft",
        now: 100,
        projectTitle: "Essay",
        userId: "user-3",
      });
      // complete it
      await completeProjectSession({
        lastSessionSummary: "Done",
        nextMove: "Nothing",
        now: 200,
        threadId: t.id,
        userId: "user-3",
      });
      // mark completed manually via another path — but completeProjectSession sets
      // state to "active" or "blocked" not "completed". For a thread to be "completed"
      // it would need a different mechanism. Let's test the no-active-thread path by
      // storing a completed thread directly.
      mockStore.set(
        "project-focus:user-3b",
        JSON.stringify([
          {
            id: "t-completed",
            userId: "user-3b",
            projectTitle: "Old",
            state: "completed",
            bestSessionMode: "CREATIVE",
            blocker: null,
            currentObjective: "Done",
            handoffNote: null,
            lastSessionSummary: "Done",
            lastTouched: 100,
            nextMove: "Nothing",
            openQuestions: [],
            rescuedAt: null,
            staleRisk: "none",
          },
        ]),
      );
      const newThread = await ensureProjectThread({
        projectTitle: "New Project",
        userId: "user-3b",
        now: 500,
      });
      expect(newThread.state).toBe("new");
      expect(newThread.projectTitle).toBe("New Project");
    });
  });

  // ──────────────────── refreshProjectThreadState ────────────────────

  describe("refreshProjectThreadState", () => {
    it("returns stale risk high after 6+ days", async () => {
      const thread = await createProjectThread({
        currentObjective: "Build",
        nextMove: "Code",
        now: 100,
        projectTitle: "App",
        userId: "user-4",
      });
      const refreshed = refreshProjectThreadState(thread, 100 + 7 * DAY_MS);
      expect(refreshed.staleRisk).toBe("high");
      expect(refreshed.state).toBe("stale");
    });

    it("returns stale risk medium after 3-6 days", async () => {
      const thread = await createProjectThread({
        currentObjective: "Build",
        nextMove: "Code",
        now: 100,
        projectTitle: "App",
        userId: "user-4b",
      });
      const refreshed = refreshProjectThreadState(thread, 100 + 4 * DAY_MS);
      expect(refreshed.staleRisk).toBe("medium");
      expect(refreshed.state).toBe("stale");
    });

    it("returns stale risk low after 1-3 days", async () => {
      const thread = await createProjectThread({
        currentObjective: "Build",
        nextMove: "Code",
        now: 100,
        projectTitle: "App",
        userId: "user-4c",
      });
      const refreshed = refreshProjectThreadState(thread, 100 + 2 * DAY_MS);
      expect(refreshed.staleRisk).toBe("low");
    });

    it("does not change state of completed threads", async () => {
      const thread = await createProjectThread({
        currentObjective: "Build",
        nextMove: "Code",
        now: 100,
        projectTitle: "App",
        userId: "user-4d",
      });
      const completed = {
        ...thread,
        state: "completed" as const,
      };
      const refreshed = refreshProjectThreadState(completed, 100 + 10 * DAY_MS);
      expect(refreshed.state).toBe("completed");
    });

    it("does not change state of blocked threads", async () => {
      const thread = await createProjectThread({
        currentObjective: "Build",
        nextMove: "Code",
        now: 100,
        projectTitle: "App",
        userId: "user-4e",
      });
      const blocked = {
        ...thread,
        state: "blocked" as const,
      };
      const refreshed = refreshProjectThreadState(blocked, 100 + 10 * DAY_MS);
      expect(refreshed.state).toBe("blocked");
    });
  });

  // ──────────────────── rescueStaleProject ────────────────────

  describe("rescueStaleProject", () => {
    it("sets state to rescued with null staleRisk", async () => {
      const thread = await createProjectThread({
        currentObjective: "Compose",
        nextMove: "Find motif",
        now: 100,
        projectTitle: "Music",
        userId: "user-5",
      });
      const stale = refreshProjectThreadState(thread, 100 + 7 * DAY_MS);
      const rescued = rescueStaleProject(stale, 100 + 7 * DAY_MS);
      expect(rescued.state).toBe("rescued");
      expect(rescued.staleRisk).toBe("none");
      expect(rescued.rescuedAt).toBe(100 + 7 * DAY_MS);
    });

    it("switches DEEP_WORK to CREATIVE on rescue", async () => {
      const thread = await createProjectThread({
        currentObjective: "Code",
        nextMove: "Refactor",
        now: 100,
        projectTitle: "Engine",
        userId: "user-5b",
      });
      const deepThread = {
        ...thread,
        bestSessionMode: "DEEP_WORK" as const,
        state: "stale" as const,
        staleRisk: "high" as const,
      };
      const rescued = rescueStaleProject(deepThread, 200);
      expect(rescued.bestSessionMode).toBe("CREATIVE");
    });

    it("preserves non-DEEP_WORK modes on rescue", async () => {
      const thread = await createProjectThread({
        currentObjective: "Code",
        nextMove: "Refactor",
        now: 100,
        projectTitle: "Engine",
        userId: "user-5c",
      });
      const lightThread = {
        ...thread,
        bestSessionMode: "LIGHT_FOCUS" as const,
        state: "stale" as const,
        staleRisk: "high" as const,
      };
      const rescued = rescueStaleProject(lightThread, 200);
      expect(rescued.bestSessionMode).toBe("LIGHT_FOCUS");
    });
  });

  // ──────────────────── buildProjectSessionBrief ────────────────────

  describe("buildProjectSessionBrief", () => {
    it("creates normal resume brief", async () => {
      const thread = await createProjectThread({
        currentObjective: "Build",
        nextMove: "Write tests",
        now: 100,
        projectTitle: "VEX",
        userId: "user-6",
      });
      const brief = buildProjectSessionBrief(thread, 100);
      expect(brief.durationSeconds).toBe(25 * 60);
      expect(brief.title).toContain("Resume");
      expect(brief.title).toContain("VEX");
      expect(brief.successCondition).toBe("Write tests");
    });

    it("creates rescued session brief with 10-minute duration", async () => {
      const thread = await createProjectThread({
        currentObjective: "Compose",
        nextMove: "Find motif",
        now: 100,
        projectTitle: "Track",
        userId: "user-6b",
      });
      const stale = refreshProjectThreadState(thread, 100 + 7 * DAY_MS);
      const rescued = rescueStaleProject(stale, 100 + 7 * DAY_MS);
      const brief = buildProjectSessionBrief(rescued, 200);
      expect(brief.durationSeconds).toBe(10 * 60);
      expect(brief.title).toContain("Recover");
    });

    it("creates high-stale-risk session brief with 15-minute duration", async () => {
      const thread = await createProjectThread({
        currentObjective: "Build",
        nextMove: "Code",
        now: 100,
        projectTitle: "App",
        userId: "user-6c",
      });
      const stale = refreshProjectThreadState(thread, 100 + 7 * DAY_MS);
      const brief = buildProjectSessionBrief(stale, 100 + 7 * DAY_MS);
      expect(brief.durationSeconds).toBe(15 * 60);
    });

    it("uses lastSessionSummary as warmup when available", async () => {
      const thread = await createProjectThread({
        currentObjective: "Build",
        nextMove: "Code",
        now: 100,
        projectTitle: "App",
        userId: "user-6d",
      });
      const completed = await completeProjectSession({
        lastSessionSummary: "Finished auth module",
        nextMove: "Add tests",
        now: 200,
        threadId: thread.id,
        userId: "user-6d",
      });
      const brief = buildProjectSessionBrief(completed, 300);
      expect(brief.warmup).toContain("Finished auth module");
    });
  });

  // ──────────────────── buildProjectResumeBrief ────────────────────

  describe("buildProjectResumeBrief", () => {
    it("returns same structure as buildProjectSessionBrief", async () => {
      const thread = await createProjectThread({
        currentObjective: "Design",
        nextMove: "Sketch wireframes",
        now: 100,
        projectTitle: "UI",
        userId: "user-7",
      });
      const brief = buildProjectResumeBrief(thread, 100);
      expect(brief.title).toContain("Resume");
      expect(brief.successCondition).toBe("Sketch wireframes");
    });
  });

  // ──────────────────── completeProjectSession ────────────────────

  describe("completeProjectSession", () => {
    it("throws when thread not found", async () => {
      await expect(
        completeProjectSession({
          lastSessionSummary: "Done",
          nextMove: "Continue",
          now: 200,
          threadId: "nonexistent",
          userId: "user-8",
        }),
      ).rejects.toThrow("Project thread could not be found.");
    });

    it("sets state to blocked when blocker is provided", async () => {
      const thread = await createProjectThread({
        currentObjective: "Build",
        nextMove: "Code",
        now: 100,
        projectTitle: "App",
        userId: "user-8b",
      });
      const updated = await completeProjectSession({
        lastSessionSummary: "Hit an issue",
        nextMove: "Wait for API key",
        blocker: "Need API access from admin",
        now: 200,
        threadId: thread.id,
        userId: "user-8b",
      });
      expect(updated.state).toBe("blocked");
      expect(updated.blocker).toBe("Need API access from admin");
    });

    it("appends open questions", async () => {
      const thread = await createProjectThread({
        currentObjective: "Research",
        nextMove: "Read papers",
        now: 100,
        projectTitle: "Thesis",
        userId: "user-8c",
      });
      const updated = await completeProjectSession({
        lastSessionSummary: "Read 3 papers",
        nextMove: "Summarize",
        openQuestion: "Which methodology is best?",
        now: 200,
        threadId: thread.id,
        userId: "user-8c",
      });
      expect(updated.openQuestions).toContain("Which methodology is best?");
    });
  });

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

  // ──────────────────── events.ts ────────────────────

  describe("validateProjectThreadEventPayload", () => {
    it("validates a correct ProjectThread payload", () => {
      const result = validateProjectThreadEventPayload({
        id: "t-1",
        userId: "user-11",
        projectTitle: "Test",
        state: "active",
        bestSessionMode: "CREATIVE",
        blocker: null,
        currentObjective: "Build",
        handoffNote: null,
        lastSessionSummary: null,
        lastTouched: 100,
        nextMove: "Code",
        openQuestions: [],
        rescuedAt: null,
        staleRisk: "none",
      });
      expect(result.id).toBe("t-1");
    });

    it("rejects invalid payload", () => {
      expect(() => validateProjectThreadEventPayload({})).toThrow();
    });
  });

  // ──────────────────── store.ts ────────────────────

  describe("useProjectFocusStore", () => {
    it("has correct initial state", () => {
      const state = useProjectFocusStore.getState();
      expect(state.activeThreadId).toBeNull();
      expect(state.rescuedThreadId).toBeNull();
    });

    it("setActiveThread sets active thread", () => {
      useProjectFocusStore.getState().setActiveThread("thread-1");
      expect(useProjectFocusStore.getState().activeThreadId).toBe("thread-1");
    });

    it("markRescued sets rescued thread", () => {
      useProjectFocusStore.getState().markRescued("thread-2");
      expect(useProjectFocusStore.getState().rescuedThreadId).toBe("thread-2");
    });

    it("clearRescueFlag resets rescued thread to null", () => {
      useProjectFocusStore.getState().markRescued("thread-3");
      useProjectFocusStore.getState().clearRescueFlag();
      expect(useProjectFocusStore.getState().rescuedThreadId).toBeNull();
    });
  });

  // ──────────────────── shouldShowProjectSurface ────────────────────

  describe("shouldShowProjectSurface", () => {
    it("returns true only for deep_creative", () => {
      expect(shouldShowProjectSurface("deep_creative")).toBe(true);
      expect(shouldShowProjectSurface("student")).toBe(false);
      expect(shouldShowProjectSurface("game_like")).toBe(false);
      expect(shouldShowProjectSurface("minimal_normal")).toBe(false);
    });
  });

  // ──────────────────── buildProjectHomeSurface ────────────────────

  describe("buildProjectHomeSurface", () => {
    it("returns hidden surface for non-deep_creative lanes", () => {
      const surface = buildProjectHomeSurface({
        lane: "student",
        thread: null,
      });
      expect(surface.hidden).toBe(true);
    });

    it("shows Create project CTA when no thread", () => {
      const surface = buildProjectHomeSurface({
        lane: "deep_creative",
        thread: null,
      });
      expect(surface.hidden).toBe(false);
      expect(surface.ctaLabel).toBe("Create project");
    });

    it("shows Resume project CTA when thread exists", async () => {
      const now = Date.now();
      const thread = await createProjectThread({
        currentObjective: "Build",
        nextMove: "Code",
        now,
        projectTitle: "App",
        userId: "user-12",
      });
      const surface = buildProjectHomeSurface({
        lane: "deep_creative",
        thread,
      });
      expect(surface.ctaLabel).toBe("Resume project");
      // title is the nextMove since thread is fresh (not stale)
      expect(surface.title).toBe("Code");
    });

    it("shows recovery prompt for rescued threads", async () => {
      const thread = await createProjectThread({
        currentObjective: "Compose",
        nextMove: "Find motif",
        now: 100,
        projectTitle: "Track",
        userId: "user-12b",
      });
      const stale = refreshProjectThreadState(thread, 100 + 7 * DAY_MS);
      const rescued = rescueStaleProject(stale, 100 + 7 * DAY_MS);
      const surface = buildProjectHomeSurface({
        lane: "deep_creative",
        thread: rescued,
      });
      expect(surface.title).toContain("Recover");
      expect(surface.recoveryPrompt).toContain("Continue recovery");
    });

    it("shows stale prompt for stale threads", async () => {
      const thread = await createProjectThread({
        currentObjective: "Build",
        nextMove: "Code",
        now: 100,
        projectTitle: "App",
        userId: "user-12c",
      });
      const stale = refreshProjectThreadState(thread, 100 + 7 * DAY_MS);
      const surface = buildProjectHomeSurface({
        lane: "deep_creative",
        thread: stale,
      });
      expect(surface.title).toContain("Stale:");
      expect(surface.recoveryPrompt).toContain("Re-enter");
    });
  });
});
