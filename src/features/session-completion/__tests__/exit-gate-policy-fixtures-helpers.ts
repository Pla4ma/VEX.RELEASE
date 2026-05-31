import { SessionMode } from '../../../session/modes';
import type { SessionSummary } from '../../../session/types';
import type { CompletionLedger } from '../schemas';
import type { CompletionSyncState } from '../../../store/session-state';
import {
  mockConnectionState,
  mockFindLedger,
  mockCreateLedger,
  mockApplySubsystems,
  mockApplySideEffects,
  mockSetCompletionSyncState,
} from './exit-gate-policy-fixtures-mocks';

export const pendingSyncState: CompletionSyncState = {
  ledgerId: '550e8400-e29b-41d4-a716-446655440201',
  message: 'One session is saved offline.',
  repairCtaLabel: null,
  status: 'pending_sync',
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
    status: 'COMPLETED',
    streakDays: 5,
    streakIncreased: true,
    streakMaintained: true,
    streakBonus: 10,
    timeBonus: 10,
    userId: 'user-phase-1',
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
        typeof value === 'function' ? value(cache.get(cacheKey)) : value,
      );
    },
  };
}

export function setupMocks() {
  jest.clearAllMocks();
  mockConnectionState.mockReturnValue('online');
  mockFindLedger.mockResolvedValue(null);
  mockCreateLedger.mockImplementation(
    async (ledger: CompletionLedger) => ledger,
  );
  mockApplySubsystems.mockImplementation(
    async ({ ledger }: { ledger: CompletionLedger }) => ({
      degradedSystems: [],
      ledger: {
        ...ledger,
        companionReactionId: 'companion-proud',
        dailyMissionResult: {
          missionId: 'mission-focus',
          progressDelta: 1,
          status: 'completed',
        },
        focusScoreDelta: 9,
        rewardIds: ['reward-session'],
        streakResult: { action: 'extended', newDays: 6, previousDays: 5 },
        xpDelta: 80,
      },
    }),
  );
  mockApplySideEffects.mockImplementation(
    async ({
      finalLedger,
      degradedSystems,
      summary,
    }: {
      finalLedger: CompletionLedger;
      degradedSystems: string[];
      summary: SessionSummary;
    }) => {
      const pendingSync = finalLedger.offlineSyncStatus === 'pending_sync';
      // Simulate real side effects calling setCompletionSyncState
      if (pendingSync) {
        mockSetCompletionSyncState({
          ledgerId: finalLedger.ledgerId,
          message: 'One session is saved offline. It will sync when you reconnect.',
          repairCtaLabel: null,
          status: 'pending_sync',
          updatedAt: Date.now(),
        });
      }
      return {
        beats: [
          { accessibilityLabel: 'Grade', body: `Grade ${finalLedger.grade}`, companionLine: null, id: 'b1', kind: 'grade', metric: null, title: 'Grade' },
          { accessibilityLabel: 'XP', body: `+${finalLedger.xpDelta} XP`, companionLine: null, id: 'b2', kind: 'result', metric: { label: 'XP', value: `${finalLedger.xpDelta}` }, title: 'XP' },
          { accessibilityLabel: 'Streak', body: `${finalLedger.streakResult.newDays} days`, companionLine: null, id: 'b3', kind: 'result', metric: null, title: 'Streak' },
          { accessibilityLabel: 'Focus', body: `Focus +${finalLedger.focusScoreDelta}`, companionLine: null, id: 'b4', kind: 'meaning', metric: null, title: 'Focus' },
          { accessibilityLabel: 'Next', body: 'Start next focus', companionLine: null, id: 'b5', kind: 'tomorrow', metric: null, title: 'Next' },
        ],
        companionReaction: { reactionId: finalLedger.companionReactionId },
        companionMemory: null,
        companionPromise: null,
        dailyMission: finalLedger.dailyMissionResult,
        degradedWarnings: degradedSystems,
        focusScoreDeltaCard: {
          delta: finalLedger.focusScoreDelta,
          label: `Focus Score +${finalLedger.focusScoreDelta}`,
        },
        gradeCard: {
          grade: finalLedger.grade,
          label: `Grade ${finalLedger.grade}`,
          score: finalLedger.gradeScore,
        },
        headline: { kind: 'xp', label: `+${finalLedger.xpDelta} XP`, xpAmount: finalLedger.xpDelta },
        nextActionCta: {
          label: 'Return home',
          reason: 'Home will hold the next safe move for you.',
          route: 'Home',
          routeParams: null,
        },
        pendingSync,
        personalBestProof: null,
        personalization: null,
        rewardReveal: { rewardIds: finalLedger.rewardIds },
        sessionId: summary.sessionId,
        streakState: finalLedger.streakResult,
        xpProgress: { xpDelta: finalLedger.xpDelta },
      };
    },
  );
}
