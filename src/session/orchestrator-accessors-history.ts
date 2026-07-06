import type { SessionState } from './types';
import type { SessionAccessorHost } from './orchestrator-accessors';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('session:orchestrator:accessors:history');

export async function getSessionHistory(
  orch: SessionAccessorHost,
  limit: number = 10,
): Promise<SessionState[]> {
  if (!orch.userId) { return []; }
  try {
    const history = await orch.repository.getSessionHistory(limit);
    return history.map(
      (entry) =>
        ({
          id: entry.sessionId,
          userId: orch.userId ?? entry.userId,
          config: entry.config as SessionState['config'],
          status: entry.status as SessionState['status'],
          phase: 'FOCUS' as const,
          actualDuration: entry.duration ?? 0,
          effectiveDuration: entry.effectiveDuration ?? 0,
          completionPercentage: entry.completionPercentage ?? 0,
          focusQuality: entry.focusQuality ?? 0,
          interruptions: 0,
          pauses: 0,
          pausedTime: 0,
          streakMaintained: entry.streakMaintained ?? false,
          modeBonus: 0,
          baseScore: entry.finalScore ?? 0,
          createdAt: entry.startedAt,
          updatedAt: entry.completedAt ?? entry.startedAt,
        }) as SessionState,
    );
  } catch (err) {
    debug.error(
      'Failed to fetch session history: %s',
      err instanceof Error ? err : new Error(String(err)),
    );
    return [];
  }
}

export function getSessionStats(orch: SessionAccessorHost): {
  totalSessions: number;
  totalDuration: number;
  averageDuration: number;
  completionRate: number;
} {
  const completed = orch.session?.status === 'COMPLETED' ? 1 : 0;
  const duration = orch.session?.actualDuration ?? 0;
  return {
    totalSessions: orch.lastSessionSummary ? 1 : 0,
    totalDuration: Math.floor(duration / 60000),
    averageDuration:
      completed > 0 ? Math.floor(duration / completed / 60000) : 0,
    completionRate: orch.lastSessionSummary ? 100 : 0,
  };
}

export function getActiveSession(
  orch: SessionAccessorHost,
): SessionState | null {
  debug.info('getActiveSession');
  return orch.session ? { ...orch.session } : null;
}
