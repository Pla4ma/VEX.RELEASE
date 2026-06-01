import {
  applyCompletionSubsystems,
  mockAddXP,
  mockGrantReward,
  baseLedger,
  baseSummary,
  resetMocks,
} from './helpers';

describe('applyCompletionSubsystems', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('calls addXP exactly once — ProgressionService owns XP mutation', async () => {
    await applyCompletionSubsystems({
      ledger: baseLedger,
      summary: baseSummary,
    });
    expect(mockAddXP).toHaveBeenCalledTimes(1);
    expect(mockAddXP).toHaveBeenCalledWith(
      baseLedger.xpDelta,
      'SESSION_COMPLETE',
      { sessionId: baseLedger.sessionId },
    );
  });

  it('rewards subsystem is receipt-only — not a second XP mutation', async () => {
    const result = await applyCompletionSubsystems({
      ledger: baseLedger,
      summary: baseSummary,
    });

    expect(mockAddXP).toHaveBeenCalledTimes(1);
    expect(mockGrantReward).toHaveBeenCalledWith(
      'XP',
      'SESSION_COMPLETE',
      expect.objectContaining({ baseAmount: expect.any(Number) }),
      expect.objectContaining({ sessionId: baseLedger.sessionId }),
    );

    const rewardIds = result.ledger.rewardIds as string[];
    expect(rewardIds).toContain(`session-xp:${baseLedger.sessionId}`);
    expect(result.ledger.xpDelta).toBe(baseLedger.xpDelta);
  });
});
