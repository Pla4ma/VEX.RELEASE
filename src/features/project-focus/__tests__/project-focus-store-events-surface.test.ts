/**
 * Tests for project-focus feature — events, store, surface display
 */
import {
  buildProjectHomeSurface,
  createProjectThread,
  refreshProjectThreadState,
  rescueStaleProject,
  shouldShowProjectSurface,
} from "../service";
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

describe("project-focus — store, events, surface", () => {
  beforeEach(() => mockStore.clear());

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
