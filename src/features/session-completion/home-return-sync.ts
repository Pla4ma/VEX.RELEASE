import type { QueryKey } from '@tanstack/react-query';

import type { CompletionSyncState } from '../../store/session-state';
import type { SessionSummary } from '../../session/types';

export const completionReturnQueryKeys = {
  activeSession: (userId: string) => ['session', 'active', userId] as const,
  companion: (userId: string) => ['companion', userId] as const,
  dailyMission: (userId: string) => ['challenges', 'active', userId] as const,
  focusScore: (userId: string) => ['focus-identity', userId] as const,
  progression: (userId: string) => ['progression', userId, 'summary'] as const,
  rewards: (userId: string) => ['rewards', 'user', userId] as const,
  sessionHistory: (userId: string) => ['session', 'history', userId] as const,
  sessionHistoryEntry: (userId: string, sessionId: string) =>
    ['session-history-entry', userId, sessionId] as const,
  streak: (userId: string) => ['streaks', 'user', userId, 'summary'] as const,
  boss: (userId: string) => ['boss', 'user', userId, 'active'] as const,
};

type Snapshot = {
  key: QueryKey;
  value: unknown;
};

type QueryClientLike = {
  getQueryData: (key: QueryKey) => unknown;
  invalidateQueries: (input: { queryKey: QueryKey }) => Promise<unknown>;
  setQueryData: (
    key: QueryKey,
    value: unknown | ((old: unknown) => unknown),
  ) => void;
};

export function applyHomeReturnOptimisticUpdate(input: {
  queryClient: QueryClientLike;
  sessionId: string;
  summary: SessionSummary;
  userId: string;
}): () => void {
  const keys = getCompletionReturnQueryKeys(input.userId, input.sessionId);
  const snapshots = keys.map((key) => ({
    key,
    value: input.queryClient.getQueryData(key),
  }));

  input.queryClient.setQueryData(completionReturnQueryKeys.activeSession(input.userId), null);
  input.queryClient.setQueryData(
    completionReturnQueryKeys.sessionHistoryEntry(input.userId, input.sessionId),
    (old: unknown) => old ?? { sessionId: input.sessionId, summary: input.summary },
  );
  updateNumericRecord(
    input.queryClient,
    completionReturnQueryKeys.progression(input.userId),
    'xp',
    input.summary.xpEarned,
  );
  updateRecord(input.queryClient, completionReturnQueryKeys.streak(input.userId), {
    currentDays: input.summary.streakDays,
  });

  return () => rollbackSnapshots(input.queryClient, snapshots);
}

export async function invalidateCompletionReturnQueries(input: {
  queryClient: QueryClientLike;
  sessionId: string;
  userId: string;
}): Promise<void> {
  await Promise.all(
    getCompletionReturnQueryKeys(input.userId, input.sessionId).map((queryKey) =>
      input.queryClient.invalidateQueries({ queryKey }),
    ),
  );
}

export async function invalidateCompletionReturnUserQueries(input: {
  queryClient: QueryClientLike;
  userId: string;
}): Promise<void> {
  const keys: QueryKey[] = [
    completionReturnQueryKeys.activeSession(input.userId),
    completionReturnQueryKeys.sessionHistory(input.userId),
    completionReturnQueryKeys.focusScore(input.userId),
    completionReturnQueryKeys.streak(input.userId),
    completionReturnQueryKeys.progression(input.userId),
    completionReturnQueryKeys.rewards(input.userId),
    completionReturnQueryKeys.companion(input.userId),
    completionReturnQueryKeys.dailyMission(input.userId),
    completionReturnQueryKeys.boss(input.userId),
  ];
  await Promise.all(
    keys.map((queryKey) => input.queryClient.invalidateQueries({ queryKey })),
  );
}

export function getNextCompletionSyncState(input: {
  current: CompletionSyncState;
  failed: boolean;
  pendingSync: boolean;
}): CompletionSyncState {
  if (input.pendingSync) {
    return input.current;
  }
  if (input.failed) {
    return {
      ledgerId: input.current.ledgerId,
      message: 'Progress is visible. Tap repair to refresh the missing sync pieces.',
      repairCtaLabel: 'Repair now',
      status: 'failed_sync',
      updatedAt: Date.now(),
    };
  }
  return {
    ledgerId: input.current.ledgerId,
    message: null,
    repairCtaLabel: null,
    status: 'synced',
    updatedAt: Date.now(),
  };
}

function getCompletionReturnQueryKeys(userId: string, sessionId: string): QueryKey[] {
  return [
    completionReturnQueryKeys.activeSession(userId),
    completionReturnQueryKeys.sessionHistory(userId),
    completionReturnQueryKeys.sessionHistoryEntry(userId, sessionId),
    completionReturnQueryKeys.focusScore(userId),
    completionReturnQueryKeys.streak(userId),
    completionReturnQueryKeys.progression(userId),
    completionReturnQueryKeys.rewards(userId),
    completionReturnQueryKeys.companion(userId),
    completionReturnQueryKeys.dailyMission(userId),
    completionReturnQueryKeys.boss(userId),
  ];
}

function rollbackSnapshots(queryClient: QueryClientLike, snapshots: Snapshot[]): void {
  snapshots.forEach((snapshot) => {
    queryClient.setQueryData(snapshot.key, snapshot.value);
  });
}

function updateRecord(
  queryClient: QueryClientLike,
  key: QueryKey,
  patch: Record<string, unknown>,
): void {
  queryClient.setQueryData(key, (old: unknown) =>
    old && typeof old === 'object' && !Array.isArray(old)
      ? { ...old, ...patch }
      : old,
  );
}

function updateNumericRecord(
  queryClient: QueryClientLike,
  key: QueryKey,
  field: string,
  delta: number,
): void {
  queryClient.setQueryData(key, (old: unknown) => {
    if (!old || typeof old !== 'object' || Array.isArray(old)) {
      return old;
    }
    const current = Object.prototype.hasOwnProperty.call(old, field)
      ? Reflect.get(old, field)
      : 0;
    return {
      ...old,
      [field]: typeof current === 'number' ? current + delta : delta,
    };
  });
}
