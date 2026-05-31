import {
  applyHomeReturnOptimisticUpdate,
  completionReturnQueryKeys,
  getNextCompletionSyncState,
} from '../home-return-sync';
import { SessionMode } from '../../../session/modes';
import type { SessionSummary } from '../../../session/types';
import type { CompletionSyncState } from '../../../store/session-state';

const summary: SessionSummary = {
  actualDuration: 1200,
  baseScore: 80,
  coinsEarned: 10,
  completionPercentage: 100,
  createdAt: 1,
  damageTaken: 0,
  effectiveDuration: 1200,
  finalScore: 88,
  focusQuality: 88,
  focusPurityScore: 88,
  gemsEarned: 0,
  interruptions: 0,
  modeBonus: 0,
  pausedDuration: 0,
  pausedTime: 0,
  pauses: 0,
  penaltiesApplied: [],
  plannedDuration: 1200,
  sessionId: 'session-1',
  sessionMode: SessionMode.FLOW,
  status: 'COMPLETED',
  streakDays: 2,
  streakIncreased: true,
  streakMaintained: true,
  timeBonus: 8,
  userId: 'user-1',
  userLevel: 1,
  vsAverage: 4,
  vsBest: -5,
  xpEarned: 40,
};

const pendingState: CompletionSyncState = {
  ledgerId: 'ledger-1',
  message: 'One session is saved offline.',
  repairCtaLabel: null,
  status: 'pending_sync',
  updatedAt: 1,
};

describe('home return sync', () => {
  it('optimistically updates visible Home completion data and can rollback', () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(
      completionReturnQueryKeys.activeSession('user-1'),
      {
        id: 'active-session',
      },
    );
    queryClient.setQueryData(completionReturnQueryKeys.progression('user-1'), {
      level: 1,
      xp: 10,
    });

    const rollback = applyHomeReturnOptimisticUpdate({
      queryClient,
      sessionId: 'session-1',
      summary,
      userId: 'user-1',
    });

    expect(
      queryClient.getQueryData(
        completionReturnQueryKeys.activeSession('user-1'),
      ),
    ).toBeNull();
    expect(
      queryClient.getQueryData(completionReturnQueryKeys.progression('user-1')),
    ).toMatchObject({
      xp: 50,
    });

    rollback();
    expect(
      queryClient.getQueryData(
        completionReturnQueryKeys.activeSession('user-1'),
      ),
    ).toMatchObject({
      id: 'active-session',
    });
  });

  it('keeps pending sync visible offline and clears it after successful sync', () => {
    expect(
      getNextCompletionSyncState({
        current: pendingState,
        failed: false,
        pendingSync: true,
      }).status,
    ).toBe('pending_sync');

    expect(
      getNextCompletionSyncState({
        current: pendingState,
        failed: false,
        pendingSync: false,
      }).status,
    ).toBe('synced');
  });

  it('keeps progress visible with repair CTA after sync failure', () => {
    const failed = getNextCompletionSyncState({
      current: pendingState,
      failed: true,
      pendingSync: false,
    });

    expect(failed.status).toBe('failed_sync');
    expect(failed.repairCtaLabel).toBe('Repair now');
  });
});

function createQueryClient() {
  const cache = new Map<string, unknown>();
  return {
    getQueryData: (key: readonly unknown[]) => cache.get(JSON.stringify(key)),
    invalidateQueries: async (): Promise<void> => undefined,
    setQueryData: (
      key: readonly unknown[],
      value: unknown | ((old: unknown) => unknown),
    ): void => {
      const cacheKey = JSON.stringify(key);
      const next =
        typeof value === 'function' ? value(cache.get(cacheKey)) : value;
      cache.set(cacheKey, next);
    },
  };
}
