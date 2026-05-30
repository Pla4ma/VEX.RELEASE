import type { CompletionLedger } from "../schemas";

const mockCreateLedger = jest.fn();
const mockFindLedger = jest.fn();
const mockApplySubsystems = jest.fn();
const mockApplySideEffects = jest.fn();
const mockConnectionState = jest.fn(() => "online");
const mockSetCompletionSyncState = jest.fn();
const mockEnqueue = jest.fn();
const mockBeginKeyProcessing = jest.fn(() => true);
const mockMarkKeyProcessed = jest.fn();
const mockReleaseKeyProcessing = jest.fn();
const mockResolvePersonalBest = jest.fn(async () => ({ isPersonalBest: false }));
const mockIntegratePersonalization = jest.fn(async () => null);
const mockInvalidateCompletionQueries = jest.fn();
const mockCreateSessionRecord = jest.fn();
const mockCountCompletedSessions = jest.fn(async () => 0);
const mockGetFocusProfile = jest.fn(async () => null);
const mockResolveInitialLane = jest.fn(() => ({
  primaryLane: "default",
  confidence: 0.5,
}));

// Mock @sentry/react-native FIRST — many other modules import it at load time
jest.mock("@sentry/react-native", () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

jest.mock("../../../config/supabase", () => ({ getSupabaseClient: jest.fn() }));
jest.mock("../../../events", () => ({ eventBus: { subscribe: jest.fn() } }));
jest.mock("../../../lib/offline/queue", () => ({
  enqueue: (...args: unknown[]) => (mockEnqueue as Function)(...args),
}));
jest.mock("../../../lib/repository/base", () => ({
  getConnectionState: () => mockConnectionState(),
}));
jest.mock("../../../store/session-state", () => ({
  useSessionUIStore: {
    getState: () => ({ setCompletionSyncState: mockSetCompletionSyncState }),
  },
}));
jest.mock("../../../utils/debug", () => ({
  createDebugger: () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));
jest.mock("../../companion-promise/service", () => ({
  processCompletedSessionPromise: jest.fn().mockResolvedValue({
    createdPromise: null,
    fulfilledPromise: null,
    missedPromise: null,
  }),
}));
jest.mock("../repository", () => ({
  createCompletionLedger: (...args: unknown[]) => (mockCreateLedger as Function)(...args),
  getCompletionLedgerByIdempotencyKey: (...args: unknown[]) =>
    (mockFindLedger as Function)(...args),
}));
jest.mock("../completion-subsystems", () => ({
  applyCompletionSubsystems: (...args: unknown[]) =>
    (mockApplySubsystems as Function)(...args),
}));
jest.mock("../ledger-service", () => ({
  buildCompletionLedger: jest.fn((input: Record<string, unknown>) => {
    const summary = input.summary as Record<string, unknown>;
    return {
      companionReactionId: null,
      completedAt: (input.completedAt as number) ?? Date.now(),
      completedDurationSeconds: summary.actualDuration as number,
      createdAt: Date.now(),
      dailyMissionResult: { missionId: null, progressDelta: 0, status: "unchanged" },
      degradedSystems: [],
      effectiveFocusedSeconds: summary.effectiveDuration as number,
      focusScoreDelta: 8,
      grade: "S",
      gradeScore: 95,
      idempotencyKey: `${input.sessionId}:completed`,
      interruptionCount: summary.interruptions as number,
      ledgerId: "550e8400-e29b-41d4-a716-446655440001",
      mode: summary.sessionMode ?? "FLOW",
      offlineSyncStatus: input.offlineSyncStatus ?? "synced",
      pauseCount: summary.pauses as number,
      qualityScore: 90,
      rewardIds: [],
      sessionId: input.sessionId as string,
      startedAt: ((input.completedAt as number) ?? Date.now()) - (summary.plannedDuration as number) * 1000,
      streakResult: {
        action: summary.streakIncreased ? "extended" : "maintained",
        newDays: (summary.streakDays as number) ?? 0,
        previousDays: ((summary.streakDays as number) ?? 0) - (summary.streakIncreased ? 1 : 0),
      },
      strictMode: false,
      targetDurationSeconds: summary.plannedDuration as number,
      timezone: (input.timezone as string) ?? "UTC",
      userId: input.userId as string,
      xpDelta: summary.xpEarned as number,
    } as unknown as CompletionLedger;
  }),
}));
jest.mock("../idempotency", () => ({
  beginKeyProcessing: (...args: unknown[]) => (mockBeginKeyProcessing as Function)(...args),
  markKeyProcessed: (...args: unknown[]) => (mockMarkKeyProcessed as Function)(...args),
  releaseKeyProcessing: (...args: unknown[]) => (mockReleaseKeyProcessing as Function)(...args),
}));
jest.mock("../personal-best-integration", () => ({
  resolveCompletionPersonalBest: (...args: unknown[]) =>
    (mockResolvePersonalBest as Function)(...args),
}));
jest.mock("../completion-personalization-integration", () => ({
  integrateCompletionPersonalization: (...args: unknown[]) =>
    (mockIntegratePersonalization as Function)(...args),
}));
jest.mock("../completion-side-effects", () => ({
  applyCompletionSideEffects: (...args: unknown[]) =>
    (mockApplySideEffects as Function)(...args),
}));
jest.mock("../completion-query-invalidation", () => ({
  invalidateCompletionQueries: (...args: unknown[]) =>
    (mockInvalidateCompletionQueries as Function)(...args),
}));
jest.mock("../story-view-model-service", () => ({
  buildPostSessionStoryViewModel: jest.fn(),
}));
jest.mock("../../session-history/repository", () => ({
  createSessionRecord: (...args: unknown[]) => (mockCreateSessionRecord as Function)(...args),
  countCompletedSessions: (...args: unknown[]) => (mockCountCompletedSessions as Function)(...args),
}));
jest.mock("../../focus-profile/service", () => ({
  getFocusProfile: (...args: unknown[]) => (mockGetFocusProfile as Function)(...args),
}));
jest.mock("../../lane-engine/service", () => ({
  resolveInitialLane: (...args: unknown[]) => (mockResolveInitialLane as Function)(...args),
}));

export {
  mockConnectionState,
  mockEnqueue,
  mockSetCompletionSyncState,
  mockCreateLedger,
  mockFindLedger,
  mockApplySubsystems,
  mockApplySideEffects,
};
