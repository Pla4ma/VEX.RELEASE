jest.mock("../../../config/supabase", () => ({ getSupabaseClient: jest.fn() }));
jest.mock("../../../utils/debug", () => ({
  createDebugger: () => ({
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  }),
}));
jest.mock("../../../lib/repository/base", () => ({
  getConnectionState: jest.fn().mockReturnValue("online"),
}));
jest.mock("../../../lib/offline/queue", () => ({ enqueue: jest.fn() }));
jest.mock("../../../store/session-state", () => ({
  useSessionUIStore: {
    getState: jest.fn().mockReturnValue({ setCompletionSyncState: jest.fn() }),
  },
}));
jest.mock("../../companion-promise/service", () => ({
  processCompletedSessionPromise: jest.fn().mockResolvedValue({
    createdPromise: null,
    fulfilledPromise: null,
    missedPromise: null,
  }),
}));
jest.mock("../repository", () => ({
  createCompletionLedger: jest.fn(),
  getCompletionLedgerByIdempotencyKey: jest.fn(),
}));
jest.mock("../completion-subsystems", () => ({
  applyCompletionSubsystems: jest.fn(),
}));
jest.mock(
  "../../session-story/StoryGenerator",
  () => ({
    generateStoryForCompletedSession: jest.fn(),
  }),
  { virtual: true },
);
jest.mock("../companion-memory-integration", () => ({
  recordCompletionCompanionMemories: jest.fn().mockResolvedValue([]),
}));
jest.mock("../story-view-model-service", () => ({
  buildPostSessionStoryViewModel: jest.fn(
    (input: Record<string, unknown>) => input,
  ),
}));
jest.mock("../ledger-service", () => ({
  buildCompletionLedger: jest.fn((input: Record<string, unknown>) => ({
    companionReactionId: null,
    completedAt: (input as { completedAt?: number }).completedAt ?? Date.now(),
    completedDurationSeconds: 1500,
    createdAt: (input as { completedAt?: number }).completedAt ?? Date.now(),
    dailyMissionResult: {
      missionId: null,
      progressDelta: 0,
      status: "unchanged" as const,
    },
    degradedSystems: [],
    effectiveFocusedSeconds: 1400,
    focusScoreDelta: 8,
    grade: "A",
    gradeScore: 88,
    idempotencyKey: `${(input as { sessionId: string }).sessionId}:${(input as { completedAt?: number }).completedAt ?? Date.now()}`,
    interruptionCount: 0,
    ledgerId: "550e8400-e29b-41d4-a716-446655440001",
    mode: "FLOW" as const,
    offlineSyncStatus:
      (input as { offlineSyncStatus?: string }).offlineSyncStatus ?? "synced",
    pauseCount: 0,
    qualityScore: 88,
    rewardIds: [],
    sessionId: (input as { sessionId: string }).sessionId,
    startedAt: Date.now() - 1500000,
    streakResult: { action: "extended" as const, newDays: 5, previousDays: 4 },
    strictMode: false,
    targetDurationSeconds: 1500,
    timezone: (input as { timezone?: string }).timezone ?? "UTC",
    userId: (input as { userId: string }).userId,
    xpDelta: 120,
  })),
}));
