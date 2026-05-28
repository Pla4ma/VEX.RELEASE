import { orchestrateSessionCompletion } from "../completion-orchestrator";
import {
  applyHomeReturnOptimisticUpdate,
  completionReturnQueryKeys,
  getNextCompletionSyncState,
  invalidateCompletionReturnQueries,
} from "../home-return-sync";
import {
  createSummary,
  createQueryClient,
  pendingSyncState,
  mockConnectionState,
  mockEnqueue,
  mockSetCompletionSyncState,
  setupMocks,
} from "./exit-gate-policy.fixtures";

const summary = createSummary("550e8400-e29b-41d4-a716-446655440101");

describe("Phase 1 exit gate", () => {
  beforeEach(() => {
    setupMocks();
  });

  it("verifies start-complete-story-home sync for the launch spine", async () => {
    const story = await orchestrateSessionCompletion({
      sessionId: summary.sessionId,
      summary,
      timestamp: 4000000,
      userId: summary.userId,
    });
    expect(story?.gradeCard.grade).toBe("S");
    expect(story?.focusScoreDeltaCard.delta).toBe(9);
    expect(story?.streakState.newDays).toBe(6);
    expect(story?.companionReaction.reactionId).toBe("companion-proud");
    expect(story?.dailyMission.status).toBe("completed");

    const queryClient = createQueryClient();
    queryClient.setQueryData(
      completionReturnQueryKeys.activeSession(summary.userId),
      { id: summary.sessionId },
    );
    queryClient.setQueryData(
      completionReturnQueryKeys.progression(summary.userId),
      { level: 1, xp: 20 },
    );
    queryClient.setQueryData(completionReturnQueryKeys.streak(summary.userId), {
      currentDays: 5,
    });

    applyHomeReturnOptimisticUpdate({
      queryClient,
      sessionId: summary.sessionId,
      summary,
      userId: summary.userId,
    });
    await invalidateCompletionReturnQueries({
      queryClient,
      sessionId: summary.sessionId,
      userId: summary.userId,
    });

    expect(
      queryClient.getQueryData(
        completionReturnQueryKeys.activeSession(summary.userId),
      ),
    ).toBeNull();
    expect(
      queryClient.getQueryData(
        completionReturnQueryKeys.progression(summary.userId),
      ),
    ).toMatchObject({ xp: 100 });
    expect(
      queryClient.getQueryData(
        completionReturnQueryKeys.streak(summary.userId),
      ),
    ).toMatchObject({ currentDays: 5 });
    expect(queryClient.invalidated).toEqual(
      expect.arrayContaining([
        JSON.stringify(completionReturnQueryKeys.focusScore(summary.userId)),
        JSON.stringify(completionReturnQueryKeys.dailyMission(summary.userId)),
        JSON.stringify(completionReturnQueryKeys.companion(summary.userId)),
        JSON.stringify(completionReturnQueryKeys.rewards(summary.userId)),
      ]),
    );
  });

  it("verifies offline completion pending banner and reconnect clear", async () => {
    mockConnectionState.mockReturnValue("offline");
    const offlineSummary = createSummary(
      "550e8400-e29b-41d4-a716-446655440102",
    );
    const story = await orchestrateSessionCompletion({
      sessionId: offlineSummary.sessionId,
      summary: offlineSummary,
      timestamp: 5000000,
      userId: offlineSummary.userId,
    });

    expect(story?.pendingSync).toBe(true);
    expect(mockEnqueue).toHaveBeenCalledWith(
      expect.objectContaining({ operation: "CREATE" }),
    );
    expect(mockSetCompletionSyncState).toHaveBeenCalledWith(
      expect.objectContaining({ status: "pending_sync" }),
    );

    const cleared = getNextCompletionSyncState({
      current: pendingSyncState,
      failed: false,
      pendingSync: false,
    });
    expect(cleared.status).toBe("synced");
    expect(cleared.message).toBeNull();
  });
});
