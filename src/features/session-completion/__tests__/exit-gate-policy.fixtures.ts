import { SessionMode } from "../../../session/modes";
import type { SessionSummary } from "../../../session/types";
import type { CompletionLedger } from "../schemas";
import type { CompletionSyncState } from "../../../store/session-state";

const mockCreateLedger = jest.fn();
const mockFindLedger = jest.fn();
const mockApplySubsystems = jest.fn();
const mockConnectionState = jest.fn(() => "online");
const mockSetCompletionSyncState = jest.fn();
const mockEnqueue = jest.fn();

jest.mock("../../../config/supabase", () => ({ getSupabaseClient: jest.fn() }));
jest.mock("../../../events", () => ({ eventBus: { subscribe: jest.fn() } }));
jest.mock("../../../lib/offline/queue", () => ({
  enqueue: (...args: unknown[]) => mockEnqueue(...args),
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
  createDebugger: () => ({ info: jest.fn() }),
}));
jest.mock("../../companion-promise/service", () => ({
  processCompletedSessionPromise: jest.fn().mockResolvedValue({
    createdPromise: null,
    fulfilledPromise: null,
    missedPromise: null,
  }),
}));
jest.mock("../repository", () => ({
  createCompletionLedger: (...args: unknown[]) => mockCreateLedger(...args),
  getCompletionLedgerByIdempotencyKey: (...args: unknown[]) =>
    mockFindLedger(...args),
}));
jest.mock("../completion-subsystems", () => ({
  applyCompletionSubsystems: (...args: unknown[]) =>
    mockApplySubsystems(...args),
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
}

export { mockConnectionState, mockEnqueue, mockSetCompletionSyncState };
