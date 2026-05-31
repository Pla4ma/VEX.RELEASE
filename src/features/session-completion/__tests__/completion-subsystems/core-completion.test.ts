import {
  applyCompletionSubsystems,
  mockOrder,
  mockAddBreadcrumb,
  baseLedger,
  baseSummary,
  resetMocks,
} from './helpers';

describe('applyCompletionSubsystems', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('updates core systems in completion order and enriches the ledger', async () => {
    const result = await applyCompletionSubsystems({
      ledger: baseLedger,
      summary: baseSummary,
    });

    expect(mockOrder).toEqual([
      'focus-identity',
      'streak',
      'progression',
      'rewards',
      'companion',
    ]);
    expect(result.degradedSystems).toEqual([]);
    expect(result.ledger.streakResult.newDays).toBe(5);
    expect(result.ledger.rewardIds).toEqual([
      `session-xp:${baseLedger.sessionId}`,
    ]);
    expect(result.ledger.companionReactionId).toBe(
      'companion-session-complete',
    );
    expect(result.ledger.dailyMissionResult.status).toBe('progressed');
    expect(mockAddBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'vex_session_completed' }),
    );
  });

  it('calls addXP exactly once — ProgressionService owns XP mutation', async () => {
    await applyCompletionSubsystems({
      ledger: baseLedger,
      summary: baseSummary,
    });
    expect(require('./helpers').mockAddXP).toHaveBeenCalledTimes(1);
    expect(require('./helpers').mockAddXP).toHaveBeenCalledWith(
      baseLedger.xpDelta,
      'SESSION_COMPLETE',
      { sessionId: baseLedger.sessionId },
    );
  });
});
