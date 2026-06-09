// Helper must be imported FIRST so its jest.mock() calls register before source modules load
import {
  mockOrder,
  mockAddBreadcrumb,
  mockCaptureException,
  mockAddXP,
  mockGrantReward,
  baseLedger,
  baseSummary,
  defaultFeatureAccess,
} from './completion-subsystems.helpers';
import { applyCompletionSubsystems } from '../completion-subsystems';
import { setFeatureAccessMap } from '../../liveops-config/feature-access-store';
import type {} from '../../liveops-config/feature-access';

describe('applyCompletionSubsystems', () => {
  beforeEach(() => {
    mockOrder.length = 0;
    jest.clearAllMocks();
    setFeatureAccessMap(defaultFeatureAccess);
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
      '../../../features/focus-identity/update-focus-score.helper',
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
