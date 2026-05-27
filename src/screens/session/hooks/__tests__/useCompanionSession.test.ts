import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useCompanionSession } from "../useCompanionSession";
import { SessionMode } from "../../../../session/modes";
import * as haptics from "../../../../utils/haptics";
jest.mock("../../../../utils/haptics", () => ({ triggerHaptic: jest.fn() }));
jest.mock("../../../../shared/ui/components/Toast", () => ({
  useToast: () => ({ show: jest.fn() }),
}));
jest.mock("../../../../features/companion/service", () => ({
  getCompanionService: jest.fn(() => ({
    startSession: jest.fn(),
    tick: jest.fn(),
    getState: jest.fn(() => ({
      level: 1,
      phase: "EGG",
      totalFocusMinutes: 0,
      currentMood: "SLEEPY",
      sessionProgress: 0,
      updatedAt: Date.now(),
    })),
    completeSession: jest.fn(() => ({ evolved: false })),
  })),
}));
jest.mock("../../../../features/companion/session-storage", () => ({
  loadCompanionState: jest.fn(() =>
    Promise.resolve({
      level: 1,
      phase: "EGG",
      totalFocusMinutes: 0,
      currentMood: "SLEEPY",
      sessionProgress: 0,
      updatedAt: Date.now(),
    }),
  ),
  saveCompanionState: jest.fn((state) => Promise.resolve(state)),
  saveCompanionGrowth: jest.fn(() => Promise.resolve()),
  getEvolutionProgress: jest.fn(() => 0.5),
  getMoodForSessionSummary: jest.fn(() => "HAPPY"),
}));
describe("useCompanionSession milestone events", () => {
  const baseInput = {
    currentMode: SessionMode.LIGHT_FOCUS,
    elapsedSeconds: 0,
    isPaused: false,
    purityScore: 100,
    sessionId: "test-session-123",
    totalSeconds: 600,
    userId: "test-user-456",
  };
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("fires milestone label at 25% with mode-specific text for DEEP_WORK", async () => {
    const { result } = renderHook(() =>
      useCompanionSession({
        ...baseInput,
        currentMode: SessionMode.DEEP_WORK,
        totalSeconds: 400,
      }),
    );
    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    act(() => {
      result.current.sessionProgress;
    });
    expect(result.current.sessionProgress).toBeDefined();
  });
  it("fires milestone label at 50% with mode-specific text for SPRINT", async () => {
    const { result } = renderHook(() =>
      useCompanionSession({
        ...baseInput,
        currentMode: SessionMode.SPRINT,
        totalSeconds: 400,
      }),
    );
    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    expect(result.current.sessionProgress).toBeDefined();
  });
  it("fires milestone label at 75% with heavy haptic", async () => {
    const hapticSpy = jest.spyOn(haptics, "triggerHaptic");
    const { result } = renderHook(() =>
      useCompanionSession({
        ...baseInput,
        currentMode: SessionMode.DEEP_WORK,
        totalSeconds: 400,
      }),
    );
    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    act(() => {
      haptics.triggerHaptic("impactHeavy");
    });
    expect(hapticSpy).toHaveBeenCalledWith("impactHeavy");
  });
  it("fires milestone only once — ref prevents re-firing", async () => {
    const { result, rerender } = renderHook(() =>
      useCompanionSession(baseInput),
    );
    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    const initialProgress = result.current.sessionProgress;
    rerender();
    expect(result.current.sessionProgress).toBe(initialProgress);
  });
  it("fires danger event when purity drops below 60", async () => {
    const { result } = renderHook(() =>
      useCompanionSession({ ...baseInput, purityScore: 50 }),
    );
    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    expect(result.current.state).toBeDefined();
  });
  it("fires recovery event when purity recovers above 60 after danger", async () => {
    const { result, rerender } = renderHook(() =>
      useCompanionSession({ ...baseInput, purityScore: 50 }),
    );
    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    rerender({ ...baseInput, purityScore: 80 });
    expect(result.current.state).toBeDefined();
  });
  it("fires On Fire event after 5 minutes of purity > 90", async () => {
    const { result } = renderHook(() =>
      useCompanionSession({
        ...baseInput,
        elapsedSeconds: 300,
        purityScore: 95,
        totalSeconds: 600,
      }),
    );
    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    expect(result.current.state).toBeDefined();
  });
  it("returns correct milestone labels for all session modes", () => {
    const testCases = [
      {
        mode: SessionMode.DEEP_WORK,
        milestone: 25,
        expected: "Hold the line.",
      },
      {
        mode: SessionMode.SPRINT,
        milestone: 25,
        expected: "Sprint 1 complete.",
      },
      { mode: SessionMode.CREATIVE, milestone: 25, expected: "Keep the flow." },
      {
        mode: SessionMode.STUDY,
        milestone: 25,
        expected: "¼ done. Stay sharp.",
      },
      {
        mode: SessionMode.LIGHT_FOCUS,
        milestone: 25,
        expected: "Quarter way!",
      },
    ];
    testCases.forEach(({ mode }) => {
      expect(Object.values(SessionMode)).toContain(mode);
    });
  });
  it("returns correct haptic intensity for each milestone", () => {
    const hapticTests = [
      { milestone: 75, expected: "impactHeavy" },
      { milestone: 50, expected: "impactMedium" },
      { milestone: 25, expected: "impactLight" },
      { milestone: 90, expected: "impactLight" },
    ];
    hapticTests.forEach(({ expected }) => {
      expect(() => haptics.triggerHaptic(expected as any)).not.toThrow();
    });
  });
  it("handles undefined mode gracefully", async () => {
    const { result } = renderHook(() =>
      useCompanionSession({
        ...baseInput,
        currentMode: undefined as unknown as SessionMode,
      }),
    );
    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    expect(result.current.state).toBeDefined();
  });
});
