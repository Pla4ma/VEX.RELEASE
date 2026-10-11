import {
  applyCompletionSubsystems,
  mockAddXP,
  mockGetProgressionService,
  mockGetRewardService,
  mockGrantReward,
  baseLedger,
  baseSummary,
  resetMocks,
} from './helpers';

describe('applyCompletionSubsystems', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('passes user identity and an idempotency key to progression', async () => {
    await applyCompletionSubsystems({
      ledger: baseLedger,
      summary: baseSummary,
    });

    expect(mockGetProgressionService).toHaveBeenCalledWith(baseLedger.userId);
    expect(mockAddXP).toHaveBeenCalledWith(
      baseLedger.xpDelta,
      'SESSION_COMPLETE',
      {
        sessionId: baseLedger.sessionId,
        idempotencyKey: `${baseLedger.idempotencyKey}:xp`,
      },
    );
  });

  it('rewards subsystem is receipt-only — not a second XP mutation', async () => {
    const result = await applyCompletionSubsystems({
      ledger: baseLedger,
      summary: baseSummary,
    });

    expect(mockAddXP).toHaveBeenCalledTimes(1);
    expect(mockGetRewardService).toHaveBeenCalledWith(baseLedger.userId);
    expect(mockGrantReward).toHaveBeenCalledWith(
      'XP',
      'SESSION_COMPLETE',
      expect.objectContaining({ baseAmount: expect.any(Number) }),
      expect.objectContaining({
        idempotencyKey: `${baseLedger.idempotencyKey}:reward`,
        sessionId: baseLedger.sessionId,
      }),
    );

    const rewardIds = result.ledger.rewardIds as string[];
    expect(rewardIds).toContain(`session-xp:${baseLedger.sessionId}`);
    expect(result.ledger.xpDelta).toBe(baseLedger.xpDelta);
  });
});
