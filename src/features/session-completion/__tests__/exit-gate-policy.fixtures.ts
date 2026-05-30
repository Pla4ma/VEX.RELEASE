import { SessionMode } from "../../../session/modes";
import type { SessionSummary } from "../../../session/types";
import type { CompletionLedger } from "../schemas";
import type { CompletionSyncState } from "../../../store/session-state";

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

export const pendingSyncState: CompletionSyncState = {
  ledgerId: "550e8400-e29b-41d4-a716-446655440201",
  message: "One session is saved offline.",
  repairCtaLabel: null,
  status: "pending_sync",
  updatedAt: 1,
};

export function createSummary(sessionId: string): SessionSummary {
  return {
    actualDuration: 1500,
    baseScore: 90,
    bonuses: [],
    coinsEarned: 20,
    completionPercentage: 100,
    createdAt: 1,
    damageTaken: 0,
    effectiveDuration: 1450,
    finalScore: 90,
    focusPurityScore: 90,
    focusQuality: 90,
    gemsEarned: 0,
    interruptions: 0,
    modeBonus: 0,
    pausedDuration: 0,
    pausedTime: 0,
    pauses: 0,
    penaltiesApplied: [],
    plannedDuration: 1500,
    sessionId,
    sessionMode: SessionMode.FLOW,
    status: "COMPLETED",
    streakDays: 5,
    streakIncreased: true,
    streakMaintained: true,
    streakBonus: 10,
    timeBonus: 10,
    userId: "user-phase-1",
    userLevel: 1,
    vsAverage: 0,
    vsBest: 0,
    xpEarned: 80,
  };
}

export function createQueryClient() {
  const cache = new Map<string, unknown>();
  const invalidated: string[] = [];
  return {
    get invalidated(): string[] {
      return invalidated;
    },
    getQueryData: (key: readonly unknown[]) => cache.get(JSON.stringify(key)),
    invalidateQueries: async ({
      queryKey,
    }: {
      queryKey: readonly unknown[];
    }): Promise<void> => {
      invalidated.push(JSON.stringify(queryKey));
    },
    setQueryData: (
      key: readonly unknown[],
      value: unknown | ((old: unknown) => unknown),
    ): void => {
      const cacheKey = JSON.stringify(key);
      cache.set(
        cacheKey,
        typeof value === "function" ? value(cache.get(cacheKey)) : value,
      );
    },
  };
}

export function setupMocks() {
  jest.clearAllMocks();
  mockConnectionState.mockReturnValue("online");
  mockFindLedger.mockResolvedValue(null);
  mockCreateLedger.mockImplementation(
    async (ledger: CompletionLedger) => ledger,
  );
  mockApplySubsystems.mockImplementation(
    async ({ ledger }: { ledger: CompletionLedger }) => ({
      degradedSystems: [],
      ledger: {
        ...ledger,
        companionReactionId: "companion-proud",
        dailyMissionResult: {
          missionId: "mission-focus",
          progressDelta: 1,
          status: "completed",
        },
        focusScoreDelta: 9,
        rewardIds: ["reward-session"],
        streakResult: { action: "extended", newDays: 6, previousDays: 5 },
        xpDelta: 80,
      },
    }),
  );
  mockApplySideEffects.mockImplementation(
    async ({
      finalLedger,
      degradedSystems,
      summary,
    }: {
      finalLedger: CompletionLedger;
      degradedSystems: string[];
      summary: SessionSummary;
    }) => {
      const pendingSync = finalLedger.offlineSyncStatus === "pending_sync";
      // Simulate real side effects calling setCompletionSyncState
      if (pendingSync) {
        mockSetCompletionSyncState({
          ledgerId: finalLedger.ledgerId,
          message: "One session is saved offline. It will sync when you reconnect.",
          repairCtaLabel: null,
          status: "pending_sync",
          updatedAt: Date.now(),
        });
      }
      return {
        beats: [
          { accessibilityLabel: "Grade", body: `Grade ${finalLedger.grade}`, companionLine: null, id: "b1", kind: "grade", metric: null, title: "Grade" },
          { accessibilityLabel: "XP", body: `+${finalLedger.xpDelta} XP`, companionLine: null, id: "b2", kind: "result", metric: { label: "XP", value: `${finalLedger.xpDelta}` }, title: "XP" },
          { accessibilityLabel: "Streak", body: `${finalLedger.streakResult.newDays} days`, companionLine: null, id: "b3", kind: "result", metric: null, title: "Streak" },
          { accessibilityLabel: "Focus", body: `Focus +${finalLedger.focusScoreDelta}`, companionLine: null, id: "b4", kind: "meaning", metric: null, title: "Focus" },
          { accessibilityLabel: "Next", body: "Start next focus", companionLine: null, id: "b5", kind: "tomorrow", metric: null, title: "Next" },
        ],
        companionReaction: { reactionId: finalLedger.companionReactionId },
        companionMemory: null,
        companionPromise: null,
        dailyMission: finalLedger.dailyMissionResult,
        degradedWarnings: degradedSystems,
        focusScoreDeltaCard: {
          delta: finalLedger.focusScoreDelta,
          label: `Focus Score +${finalLedger.focusScoreDelta}`,
        },
        gradeCard: {
          grade: finalLedger.grade,
          label: `Grade ${finalLedger.grade}`,
          score: finalLedger.gradeScore,
        },
        headline: { kind: "xp", label: `+${finalLedger.xpDelta} XP`, xpAmount: finalLedger.xpDelta },
        nextActionCta: {
          label: "Return home",
          reason: "Home will hold the next safe move for you.",
          route: "Home",
          routeParams: null,
        },
        pendingSync,
        personalBestProof: null,
        personalization: null,
        rewardReveal: { rewardIds: finalLedger.rewardIds },
        sessionId: summary.sessionId,
        streakState: finalLedger.streakResult,
        xpProgress: { xpDelta: finalLedger.xpDelta },
      };
    },
  );
}

export {
  mockConnectionState,
  mockEnqueue,
  mockSetCompletionSyncState,
  mockCreateLedger,
  mockFindLedger,
  mockApplySubsystems,
  mockApplySideEffects,
};
