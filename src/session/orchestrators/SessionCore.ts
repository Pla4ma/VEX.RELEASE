import { Platform } from 'react-native';
import { v4 as uuidv4 } from '../../utils/uuid';
import type {
  SessionState,
  SessionConfig,
  FocusQualityMetrics,
} from '../types';
import * as persistence from '../SessionPersistence';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('session:orchestrator:core');

import type { SessionOrchestratorBase } from '../SessionOrchestratorBase';

export async function createSession(
  orch: SessionOrchestratorBase,
  config: SessionConfig,
): Promise<SessionState> {
  if (!orch.userId) {throw new Error('SessionOrchestrator: No user set');}
  const sessionId = uuidv4();
  const now = Date.now();
  const session: SessionState = {
    id: sessionId,
    userId: orch.userId,
    status: 'PREPARING',
    phase: 'PREPARATION',
    config,
    remainingTime: config.duration * 1000,
    totalDuration: config.duration * 1000,
    elapsedTime: 0,
    effectiveTime: 0,
    effectiveDuration: 0,
    actualDuration: 0,
    pausedTime: 0,
    totalPausedTime: 0,
    totalBackgroundTime: 0,
    currentInterval: 1,
    totalIntervals: config.intervals,
    intervalsCompleted: 0,
    interruptions: 0,
    pauses: 0,
    backgroundTime: 0,
    baseScore: 0,
    finalScore: 0,
    timeBonus: 0,
    streakBonus: 0,
    focusQuality: 100,
    completionPercentage: 0,
    streakMaintained: false,
    damagePoints: 0,
    penaltyMultiplier: 1,
    recoveryAttempts: 0,
    maxRecoveryAttempts: 3,
    canRecover: true,
    conflictStatus: 'NONE',
    storageStatus: 'HEALTHY',
    syncStatus: 'IDLE' as const,
    deviceId: orch.getDeviceFingerprint(),
    appVersion: '1.0.0',
    osVersion: Platform.Version.toString(),
    antiCheatStatus: 'CLEAN',
    antiCheatFlags: [],
    createdAt: now,
    updatedAt: now,
    isDirty: true,
    isOnline: true,
    modeBonus: 0,
  };
  orch.session = session;
  if (orch.config.enableAntiCheat) {
    orch.antiCheatEngine.initialize(sessionId, orch.getDeviceFingerprint());
  }
  orch.eventEmitter.attach(sessionId, orch.userId);
  await persistence.saveSessionState(session, orch.repository);
  orch.eventEmitter.emitSessionCreated(config);
  debug.info('Session created: %s', sessionId);
  return session;
}

export function loadActiveSession(orch: SessionOrchestratorBase): void {
  persistence.loadActiveSession(orch.repository).then((s) => {
    if (!s) {return;}
    orch.session = s;
    orch.userId = s.userId;
    orch.eventEmitter.attach(s.id, s.userId);
    if (s.status === 'ACTIVE' || s.status === 'PAUSED') {
      orch.timerEngine = persistence.restoreTimerEngine(
        s,
        orch.config.timerConfig || {},
        {
          onTick: orch.handleTimerTick.bind(orch),
          onComplete: orch.handleTimerComplete.bind(orch),
          onWarning: orch.handleTimerWarning.bind(orch),
        },
      );
      orch.isActive = s.status === 'ACTIVE';
    }
    debug.info('Restored active session: %s', s.id);
  });
}

export function finalizeSession(
  orch: SessionOrchestratorBase,
  summary: Parameters<typeof persistence.finalizeSession>[1],
): void {
  if (!orch.session) {return;}
  persistence.finalizeSession(orch.session, summary, orch.repository);
}

export function finalizeAbandonedSession(orch: SessionOrchestratorBase): void {
  if (!orch.session) {return;}
  persistence.finalizeAbandonedSession(orch.session, orch.repository);
}

export function createEmptyFocusMetrics(
  sessionId?: string,
): FocusQualityMetrics {
  return {
    sessionId: sessionId ?? '',
    timeInDeepFocus: 0,
    timeInShallowFocus: 0,
    timeDistracted: 0,
    focusSegments: [],
    consistencyScore: 100,
    depthScore: 100,
    recoveryScore: 100,
    overallScore: 100,
    calculatedAt: Date.now(),
  };
}
