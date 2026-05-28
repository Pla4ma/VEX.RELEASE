import { getSupabaseClient } from '../config/supabase';
import { getSessionRepository } from './repository/SessionRepository';
import { enqueue, registerProcessor, type OfflineQueueEntry } from '../lib/offline/queue';
import { captureException } from '../config/sentry';
import { createDebugger } from '../utils/debug';
import type { SessionState } from './types';
import type { Database } from '../types/supabase';

const debug = createDebugger('session:sync');

type SessionRow = Database['public']['Tables']['sessions']['Insert'];

function mapSessionToSupabaseRow(session: SessionState): SessionRow {
  return {
    id: session.id,
    user_id: session.userId,
    status: session.status,
    duration: Math.round(session.totalDuration / 1000),
    effective_duration: Math.round(session.effectiveDuration / 1000),
    started_at: session.startedAt ? new Date(session.startedAt).toISOString() : null,
    ended_at: session.endedAt ? new Date(session.endedAt).toISOString() : null,
    completed_at: session.status === 'COMPLETED' ? new Date(session.updatedAt).toISOString() : null,
    difficulty: session.config.difficultyLevel ?? null,
    mode: session.config.sessionMode ?? null,
    quality_score: session.focusQuality ?? null,
    metadata: {
      config_duration: session.config.duration,
      intervals: session.config.intervals,
      category: session.config.category,
      tags: session.config.tags,
      base_score: session.baseScore,
      final_score: session.finalScore,
      streak_bonus: session.streakBonus,
      time_bonus: session.timeBonus,
    },
  };
}

async function syncSessionToSupabase(session: SessionState): Promise<void> {
  const supabase = getSupabaseClient();
  const row = mapSessionToSupabaseRow(session);

  const { error } = await supabase.from('sessions').upsert(row, { onConflict: 'id' });

  if (error) {
    throw new Error(`Failed to sync session ${session.id}: ${error.message}`);
  }
  debug.info('Session synced to Supabase: %s', session.id);
}

function sessionProcessor(entry: OfflineQueueEntry): Promise<void> {
  const repository = getSessionRepository();
  const sessionId = entry.payload.sessionId as string;
  if (!sessionId) {
    throw new Error('Session sync entry missing sessionId');
  }
  return repository.getSessionById(sessionId).then(async (session) => {
    if (!session) {
      debug.warn('Session not found in local storage for sync: %s', sessionId);
      return;
    }
    const activeSession = await repository.getActiveSession();
    if (activeSession && activeSession.id === sessionId) {
      const sessionState: SessionState = {
        id: activeSession.id,
        userId: activeSession.userId,
        status: session.status,
        phase: 'REVIEW',
        config: activeSession.config,
        remainingTime: activeSession.remainingTime,
        totalDuration: session.duration ?? activeSession.totalDuration,
        elapsedTime: activeSession.elapsedTime,
        effectiveTime: activeSession.effectiveTime,
        effectiveDuration: session.effectiveDuration ?? activeSession.effectiveDuration ?? 0,
        actualDuration: activeSession.actualDuration,
        pausedTime: activeSession.pausedTime,
        totalPausedTime: activeSession.totalPausedTime,
        totalBackgroundTime: activeSession.totalBackgroundTime,
        currentInterval: activeSession.currentInterval,
        totalIntervals: activeSession.totalIntervals,
        intervalsCompleted: activeSession.intervalsCompleted,
        interruptions: activeSession.interruptions,
        pauses: activeSession.pauses,
        backgroundTime: activeSession.backgroundTime,
        baseScore: activeSession.baseScore,
        finalScore: activeSession.finalScore,
        timeBonus: activeSession.timeBonus,
        streakBonus: activeSession.streakBonus,
        focusQuality: activeSession.focusQuality,
        completionPercentage: activeSession.completionPercentage,
        streakMaintained: activeSession.streakMaintained,
        damagePoints: activeSession.damagePoints,
        penaltyMultiplier: activeSession.penaltyMultiplier,
        recoveryAttempts: activeSession.recoveryAttempts,
        maxRecoveryAttempts: activeSession.maxRecoveryAttempts,
        canRecover: activeSession.canRecover,
        conflictStatus: activeSession.conflictStatus,
        storageStatus: activeSession.storageStatus,
        deviceId: activeSession.deviceId,
        appVersion: activeSession.appVersion,
        osVersion: activeSession.osVersion,
        antiCheatStatus: activeSession.antiCheatStatus,
        antiCheatFlags: activeSession.antiCheatFlags,
        createdAt: activeSession.createdAt,
        updatedAt: activeSession.updatedAt,
        startedAt: activeSession.startedAt,
        endedAt: session.endedAt,
        isDirty: activeSession.isDirty,
        isOnline: activeSession.isOnline,
        modeBonus: activeSession.modeBonus,
        pausedAt: activeSession.pausedAt,
        resumedAt: activeSession.resumedAt,
      };
      await syncSessionToSupabase(sessionState);
    }
    await repository.removeFromSyncQueue(sessionId);
  }).catch((error) => {
    captureException(error instanceof Error ? error : new Error(String(error)), {
      tags: { feature: 'session-sync' },
      extra: { sessionId },
    });
    throw error;
  });
}

export class SessionSyncService {
  private initialized = false;

  initialize(): void {
    if (this.initialized) return;
    this.initialized = true;
    registerProcessor('sessions', 'SESSION_COMPLETE', sessionProcessor);
    debug.info('SessionSyncService initialized');
  }

  async syncCompletedSession(sessionId: string): Promise<void> {
    const repository = getSessionRepository();
    await repository.addToSyncQueue(sessionId);
    enqueue({
      feature: 'sessions',
      operation: 'SESSION_COMPLETE',
      idempotencyKey: `session:sync:${sessionId}`,
      payload: { sessionId },
      priority: 'high',
    });
  }

  async flushPendingSyncs(): Promise<void> {
    const repository = getSessionRepository();
    const queue = await repository.getSyncQueue();
    for (const sessionId of queue) {
      await this.syncCompletedSession(sessionId);
    }
    debug.info('Flushed %d pending session syncs', queue.length);
  }
}

let instance: SessionSyncService | null = null;

export function getSessionSyncService(): SessionSyncService {
  if (!instance) {
    instance = new SessionSyncService();
  }
  return instance;
}
