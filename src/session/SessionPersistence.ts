/**
 * Session Persistence Helpers
 * Extracted persistence logic from SessionOrchestrator
 */

import type { SessionState, SessionSummary } from './types';
import type { SessionRepository } from './repository/SessionRepository';
import { TimerEngine } from './engines/TimerEngine';

interface RestoreConfig {
  onTick: (elapsed: number, remaining: number, percentage: number) => void;
  onComplete: () => void;
  onWarning: (secondsRemaining: number) => void;
}

export async function saveSessionState(
  session: SessionState,
  repository: SessionRepository,
): Promise<void> {
  session.updatedAt = Date.now();
  await repository.saveActiveSession(session);
  await repository.addToSyncQueue(session.id);
}

export async function loadActiveSession(
  repository: SessionRepository,
): Promise<SessionState | null> {
  return await repository.getActiveSession();
}

export function restoreTimerEngine(
  session: SessionState,
  timerConfig: Record<string, unknown>,
  handlers: RestoreConfig,
): TimerEngine {
  const engine = new TimerEngine(
    session.id,
    session.config.duration,
    timerConfig,
    handlers,
  );

  engine.restore({
    elapsed: session.effectiveDuration || 0,
    duration: session.config.duration,
    isRunning: session.status === 'ACTIVE',
    isPaused: session.status === 'PAUSED',
    totalPausedTime: session.pausedTime || 0,
    warningSent: [],
  });

  return engine;
}

export async function finalizeSession(
  session: SessionState,
  summary: SessionSummary,
  repository: SessionRepository,
): Promise<void> {
  await repository.saveSessionSummary(summary);
  await repository.addToHistory({
    sessionId: session.id,
    userId: session.userId,
    status: session.status,
    config: session.config,
    summary,
    startedAt: session.startedAt || session.createdAt,
    endedAt: Date.now(),
    createdAt: session.createdAt,
    duration: session.actualDuration || 0,
    mode: session.config.sessionMode,
    completionPercentage: session.completionPercentage || 0,
    focusQuality: session.focusQuality || 0,
  });
  await repository.clearActiveSession();
  await repository.removeFromSyncQueue(session.id);
}

export async function finalizeAbandonedSession(
  session: SessionState,
  repository: SessionRepository,
): Promise<void> {
  await repository.addToHistory({
    sessionId: session.id,
    userId: session.userId,
    status: session.status,
    config: session.config,
    summary: {
      sessionId: session.id,
      userId: session.userId,
      status: session.status,
      sessionMode: session.config.sessionMode,
      plannedDuration: session.config.duration,
      actualDuration: session.actualDuration || 0,
      effectiveDuration: session.effectiveDuration || 0,
      pausedDuration: session.pausedTime || 0,
      completionPercentage: session.completionPercentage || 0,
      focusQuality: session.focusQuality || 0,
      interruptions: session.interruptions || 0,
      pauses: session.pauses || 0,
      pausedTime: session.pausedTime || 0,
      streakMaintained: session.streakMaintained || false,
      modeBonus: session.modeBonus || 0,
      baseScore: session.baseScore || 0,
      timeBonus: session.timeBonus || 0,
      finalScore: session.finalScore || 0,
      streakIncreased: false,
      streakDays: 0,
      xpEarned: 0,
      coinsEarned: 0,
      gemsEarned: 0,
      userLevel: 1,
      bonuses: [],
      damageTaken: session.damagePoints || 0,
      penaltiesApplied: session.antiCheatFlags,
      vsAverage: 0,
      vsBest: 0,
      createdAt: session.createdAt,
    },
    startedAt: session.startedAt || session.createdAt,
    endedAt: Date.now(),
    createdAt: session.createdAt,
    duration: session.actualDuration || 0,
    mode: session.config.sessionMode,
    completionPercentage: session.completionPercentage || 0,
    focusQuality: session.focusQuality || 0,
  });
  await repository.clearActiveSession();
}
