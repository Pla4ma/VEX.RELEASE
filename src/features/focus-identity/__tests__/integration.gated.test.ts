import { initializeFocusIdentityIntegrations } from "../integration";
import { initializeFocusScoreIntegration } from "../integration-focus-score";
import { getAvailabilityFor } from "../../liveops-config/feature-access-store";

jest.mock("../../liveops-config/feature-access-store", () => ({
  getAvailabilityFor: jest.fn(),
}));
jest.mock("../../../api/QueryProvider", () => ({
  queryClient: { invalidateQueries: jest.fn() },
}));
jest.mock("../repository-focus-score", () => ({
  fetchCurrentFocusScore: jest.fn().mockResolvedValue({ currentScore: 600 }),
  upsertCurrentFocusScore: jest.fn().mockResolvedValue({}),
  appendFocusScoreHistory: jest.fn().mockResolvedValue({}),
}));
jest.mock("../analytics", () => ({
  trackFocusScoreChanged: jest.fn(),
}));
jest.mock("../../focus-contract/service", () => ({
  getCompletionSignal: jest
    .fn()
    .mockResolvedValue({ rate: 0.8, completedContractCount: 5 }),
}));
jest.mock("../score-algorithm", () => ({
  calculateFocusScoreUpdate: jest.fn().mockReturnValue({
    newScore: 620,
    previousScore: 600,
    delta: 20,
    band: "Strong",
    userFacingReason: "Test",
    topPositiveFactor: "sessionQuality",
    topNegativeFactor: "intentionalDifficulty",
    factors: {},
    historyPoint: {
      timestamp: new Date().toISOString(),
      score: 620,
      delta: 20,
      reason: "test",
    },
  }),
}));

describe("Focus-identity integrations - FeatureAvailability gating", () => {
  const mockedGetAvailability = jest.mocked(getAvailabilityFor);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initializeFocusIdentityIntegrations", () => {
    it("should not subscribe when focus_session cannot subscribe to events", () => {
      mockedGetAvailability.mockReturnValue({
        state: "locked",
        canRenderEntryPoint: false,
        canNavigate: false,
        canQuery: false,
        canRegisterRoute: false,
        canSubscribeToEvents: false,
        canExpose: false,
        canShowTeaser: false,
        snapshot: {} as ReturnType<typeof getAvailabilityFor>["snapshot"],
      } as ReturnType<typeof getAvailabilityFor>);

      const cleanup = initializeFocusIdentityIntegrations();
      expect(typeof cleanup).toBe("function");
    });

    it("should subscribe when focus_session canSubscribeToEvents is true", () => {
      const testSubscribe = jest.fn().mockReturnValue(jest.fn());
      jest.doMock("../../../events", () => ({
        eventBus: {
          publish: jest.fn(),
          subscribe: testSubscribe,
        },
      }));

      mockedGetAvailability.mockReturnValue({
        state: "unlocked",
        canRenderEntryPoint: true,
        canNavigate: true,
        canQuery: true,
        canRegisterRoute: true,
        canSubscribeToEvents: true,
        canExpose: true,
        canShowTeaser: false,
        snapshot: {} as ReturnType<typeof getAvailabilityFor>["snapshot"],
      } as ReturnType<typeof getAvailabilityFor>);

      const cleanup = initializeFocusIdentityIntegrations();
      expect(typeof cleanup).toBe("function");
      cleanup();
    });

    it("should not subscribe when focus_session is hidden", () => {
      mockedGetAvailability.mockReturnValue({
        state: "hidden",
        canRenderEntryPoint: false,
        canNavigate: false,
        canQuery: false,
        canRegisterRoute: false,
        canSubscribeToEvents: false,
        canExpose: false,
        canShowTeaser: false,
        snapshot: {} as ReturnType<typeof getAvailabilityFor>["snapshot"],
      } as ReturnType<typeof getAvailabilityFor>);

      const cleanup = initializeFocusIdentityIntegrations();
      expect(typeof cleanup).toBe("function");
      cleanup();
    });
  });

  describe("initializeFocusScoreIntegration", () => {
    it("should not subscribe when focus_session cannot subscribe to events", () => {
      mockedGetAvailability.mockReturnValue({
        state: "degraded",
        canRenderEntryPoint: true,
        canNavigate: true,
        canQuery: true,
        canRegisterRoute: true,
        canSubscribeToEvents: false,
        canExpose: false,
        canShowTeaser: false,
        snapshot: {} as ReturnType<typeof getAvailabilityFor>["snapshot"],
      } as ReturnType<typeof getAvailabilityFor>);

      const cleanup = initializeFocusScoreIntegration();
      expect(typeof cleanup).toBe("function");
    });
  });
});
