import { SessionMode } from "../../../session/modes";
import type { SessionSummary } from "../../../session/types";
import { orchestrateSessionCompletion } from "../completion-orchestrator";
import type { CompletionLedger } from "../schemas";
import { summary, ledger } from "./__fixtures__/orchestrator-return.fixtures";
import {
  createStoryViewModelMock,
  createLedgerServiceMock,
} from "./__fixtures__/orchestrator-return.mock-factories";

const mockSetCompletionSyncState = jest.fn();
const mockApplyCompletionSubsystems = jest.fn();
const mockCheckAndUpdatePersonalBest = jest.fn();
const mockCreateCompletionLedger = jest.fn();
const mockGetCompletionLedgerByIdempotencyKey = jest.fn();
jest.mock("@sentry/react-native", () => ({ captureException: jest.fn() }));
jest.mock("../../../events", () => ({ eventBus: { subscribe: jest.fn() } }));
jest.mock("../../../utils/debug", () => ({
  createDebugger: () => ({ info: jest.fn(), warn: jest.fn() }),
}));
jest.mock("../../../lib/repository/base", () => ({
  getConnectionState: jest.fn(() => "online"),
}));
jest.mock("../../../lib/offline/queue", () => ({ enqueue: jest.fn() }));
jest.mock("../../../store/session-state", () => ({
  useSessionUIStore: {
    getState: jest.fn(() => ({
      setCompletionSyncState: mockSetCompletionSyncState,
    })),
  },
}));
jest.mock("../../companion-promise/service", () => ({
  processCompletedSessionPromise: jest
    .fn()
    .mockResolvedValue({
      createdPromise: null,
      fulfilledPromise: null,
      missedPromise: null,
    }),
}));

jest.mock("../repository", () => ({
  createCompletionLedger: (...args: unknown[]) =>
    mockCreateCompletionLedger(...args),
  getCompletionLedgerByIdempotencyKey: (...args: unknown[]) =>
    mockGetCompletionLedgerByIdempotencyKey(...args),
}));
jest.mock("../completion-subsystems", () => ({
  applyCompletionSubsystems: (...args: unknown[]) =>
    mockApplyCompletionSubsystems(...args),
}));
jest.mock("../../personal-bests/service", () => ({
  checkAndUpdatePersonalBest: (...args: unknown[]) =>
    mockCheckAndUpdatePersonalBest(...args),
}));
jest.mock("../companion-memory-integration", () => ({
  recordCompletionCompanionMemories: jest.fn().mockResolvedValue([]),
}));
jest.mock("../story-view-model-service", createStoryViewModelMock);
jest.mock("../ledger-service", createLedgerServiceMock);

describe("orchestrateSessionCompletion story return", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCompletionLedgerByIdempotencyKey.mockResolvedValue(null);
    mockCreateCompletionLedger.mockResolvedValue(ledger);
    mockApplyCompletionSubsystems.mockResolvedValue({
      degradedSystems: [],
      ledger,
    });
    mockCheckAndUpdatePersonalBest.mockResolvedValue({
      current: null,
      isNewRecord: false,
      margin: null,
      previousBest: null,
    });
  });

  it("returns a post-session story view model after subsystem updates", async () => {
    const {
      processCompletedSessionPromise,
    } = require("../../companion-promise/service");
    processCompletedSessionPromise.mockResolvedValueOnce({
      createdPromise: {
        createdAt: "2026-05-20T12:00:00.000Z",
        fulfilledAt: null,
        id: "550e8400-e29b-41d4-a716-446655440090",
        missedAt: null,
        sourceSessionId: summary.sessionId,
        status: "pending",
        targetDate: "2026-05-21",
        targetDurationMinutes: 25,
        targetMode: "FOCUS",
        userId: summary.userId,
      },
      fulfilledPromise: null,
      missedPromise: null,
    });
    const story = await orchestrateSessionCompletion({
      sessionId: summary.sessionId,
      summary,
      timestamp: 3000000,
      userId: summary.userId,
    });

    expect(story?.gradeCard.grade).toBe("A");
    expect(story?.rewardReveal.rewardIds).toEqual(ledger.rewardIds);
    expect(story?.companionReaction.reactionId).toBe(
      "companion-session-complete",
    );
    expect(story?.companionPromise).toMatchObject({
      status: "pending",
      targetMode: "FOCUS",
    });
    expect(story?.dailyMission.status).toBe("progressed");
    expect(mockSetCompletionSyncState).toHaveBeenCalledWith(
      expect.objectContaining({ status: "synced" }),
    );
  });

  it("passes a new personal best into the headline reward", async () => {
    mockCheckAndUpdatePersonalBest.mockResolvedValueOnce({
      current: { bestPurityScore: 95 },
      isNewRecord: true,
      margin: 7,
      previousBest: 88,
    });

    const story = await orchestrateSessionCompletion({
      sessionId: summary.sessionId,
      summary,
      timestamp: 3000002,
      userId: summary.userId,
    });

    expect(mockCheckAndUpdatePersonalBest).toHaveBeenCalledWith(
      summary.userId,
      ledger.mode,
      ledger.targetDurationSeconds,
      summary.focusPurityScore,
      ledger.grade,
    );
    expect(story?.headline.type).toBe("personal_best");
  });

  it("does not replay subsystems for an already processed idempotency key", async () => {
    await orchestrateSessionCompletion({
      sessionId: summary.sessionId,
      summary,
      timestamp: 3000001,
      userId: summary.userId,
    });

    const replay = await orchestrateSessionCompletion({
      sessionId: summary.sessionId,
      summary,
      timestamp: 3000001,
      userId: summary.userId,
    });

    expect(replay).toBeNull();
    expect(mockApplyCompletionSubsystems).toHaveBeenCalledTimes(1);
  });
});
