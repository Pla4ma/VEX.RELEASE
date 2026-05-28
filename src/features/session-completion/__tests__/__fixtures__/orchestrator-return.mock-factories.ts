export function createStoryViewModelMock() {
  return {
    buildPostSessionStoryViewModel: jest.fn((input: Record<string, unknown>) => ({
      ...input,
      gradeCard: { grade: "A" },
      rewardReveal: {
        rewardIds:
          (input as { ledger?: { rewardIds?: string[] } }).ledger?.rewardIds ??
          [],
      },
      companionReaction: {
        reactionId:
          (input as { ledger?: { companionReactionId?: string } }).ledger
            ?.companionReactionId ?? null,
      },
      companionPromise:
        (input as { companionPromise?: unknown }).companionPromise ?? null,
      dailyMission: {
        status:
          (input as { ledger?: { dailyMissionResult?: { status?: string } } })
            .ledger?.dailyMissionResult?.status ?? "unchanged",
      },
      headline: (input as { personalBest?: { isPersonalBest?: boolean } })
        .personalBest?.isPersonalBest
        ? { type: "personal_best" }
        : { type: "normal" },
      pendingSync: false,
    })),
  };
}

export function createLedgerServiceMock() {
  return {
    buildCompletionLedger: jest.fn((input: Record<string, unknown>) => ({
      companionReactionId: null,
      completedAt: input.completedAt ?? Date.now(),
      completedDurationSeconds: 1500,
      createdAt: input.completedAt ?? Date.now(),
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
      idempotencyKey: `${input.sessionId}:${input.completedAt ?? Date.now()}`,
      interruptionCount: 0,
      ledgerId: "550e8400-e29b-41d4-a716-446655440011",
      mode: "FLOW" as const,
      offlineSyncStatus: input.offlineSyncStatus ?? "synced",
      pauseCount: 0,
      qualityScore: 88,
      rewardIds: [],
      sessionId: input.sessionId as string,
      startedAt: Date.now() - 1500000,
      streakResult: { action: "extended" as const, newDays: 5, previousDays: 4 },
      strictMode: false,
      targetDurationSeconds: 1500,
      timezone: (input.timezone as string) ?? "UTC",
      userId: input.userId as string,
      xpDelta: 120,
    })),
  };
}
