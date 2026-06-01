import {
  applyCompletionSubsystems,
  mockOrder,
  mockCaptureException,
  mockGrantReward,
  baseLedger,
  baseSummary,
  resetMocks,
} from './helpers';

describe('applyCompletionSubsystems', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('keeps the ledger when rewards fail and marks the story degraded', async () => {
    mockGrantReward.mockImplementationOnce(async (): Promise<void> => {
      mockOrder.push('rewards');
      throw new Error('reward unavailable');
    });

    const result = await applyCompletionSubsystems({
      ledger: baseLedger,
      summary: baseSummary,
    });

    expect(result.ledger.ledgerId).toBe(baseLedger.ledgerId);
    expect(result.degradedSystems).toContain('rewards');
    expect(result.ledger.degradedSystems).toContain('rewards');
    expect(mockCaptureException).toHaveBeenCalled();
    expect(mockOrder).toContain('companion');
  });

  it('captures Focus Score failure and still awards downstream systems', async () => {
    const { updateFocusScoreFromSessionCompletion } = jest.requireMock(
      '../../../../features/focus-identity/update-focus-score.helper',
    );
    (updateFocusScoreFromSessionCompletion as jest.Mock).mockImplementationOnce(
      async (): Promise<void> => {
        mockOrder.push('focus-identity');
        throw new Error('focus unavailable');
      },
    );

    const result = await applyCompletionSubsystems({
      ledger: baseLedger,
      summary: baseSummary,
    });

    expect(result.degradedSystems).toContain('focus-identity');
    expect(mockOrder).toEqual([
      'focus-identity',
      'streak',
      'progression',
      'rewards',
      'companion',
    ]);
    expect(result.ledger.rewardIds).toEqual([
      `session-xp:${baseLedger.sessionId}`,
    ]);
  });

  it('skips feature-dependent subsystems when feature is locked', async () => {
    const { setFeatureAccessMap } = require('./helpers');
    setFeatureAccessMap({
      companion_detail: {
        isUnlocked: false,
        isVisible: false,
        lockedDescription: 'locked',
        recommendedUnlockMoment: '',
        unlockReason: '',
        releaseState: 'final_release_progressive',
      },
      challenges: {
        isUnlocked: false,
        isVisible: false,
        lockedDescription: 'locked',
        recommendedUnlockMoment: '',
        unlockReason: '',
        releaseState: 'final_release_progressive',
      },
    });

    const result = await applyCompletionSubsystems({
      ledger: baseLedger,
      summary: baseSummary,
    });

    expect(result.degradedSystems).toEqual([]);
    expect(mockOrder).toEqual([
      'focus-identity',
      'streak',
      'progression',
      'rewards',
    ]);
    expect(result.ledger.companionReactionId).toBeNull();
    expect(result.ledger.dailyMissionResult.status).toBe('unchanged');
    expect(require('./helpers').mockCompleteSession).not.toHaveBeenCalled();
  });
});
