import { v4 as uuidv4 } from '../../utils/uuid';
import type {
  InterruptionRecord,
  RecoveryRecord,
  InterruptionType,
  InterruptionSeverity,
  SessionState,
} from '../types';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('session:orchestrator:recovery');

import type { SessionOrchestratorBase } from '../SessionOrchestratorBase';

export async function attemptRecovery(
  orch: SessionOrchestratorBase,
  recoveryType: 'USER_RESUME' | 'STREAK_SAVE' | 'PARTIAL_CREDIT',
): Promise<boolean> {
  if (!orch.session) {throw new Error('No active session');}
  if (
    (orch.session.recoveryAttempts || 0) >=
    (orch.session.maxRecoveryAttempts || 3)
  )
    {return false;}
  const recovery: RecoveryRecord = {
    id: uuidv4(),
    sessionId: orch.session.id,
    type: recoveryType,
    timestamp: Date.now(),
    recoveredTime: 0,
    success: false,
    attemptedAt: Date.now(),
  };
  orch.eventEmitter.emitRecoveryAttempted(recovery);
  const result = orch.completionEngine.attemptRecovery(
    orch.session,
    recoveryType,
    orch.focusMetrics,
    0,
  );
  if (result.success) {
    orch.isActive = true;
    orch.session.status = result.status as SessionState['status'];
    recovery.success = true;
    recovery.recoveredTime = result.summary.effectiveDuration;
    orch.recoveries.push(recovery);
    if (recoveryType === 'USER_RESUME' && orch.timerEngine)
      {orch.timerEngine.resume();}
    orch.eventEmitter.emitRecoverySuccessful(
      Date.now(),
      result.summary.effectiveDuration,
    );
    await orch.saveSessionState();
    debug.info('Recovery successful: %s', orch.session.id);
    return true;
  }
  recovery.success = false;
  orch.recoveries.push(recovery);
  orch.eventEmitter.emitRecoveryFailed(Date.now(), 'Recovery not applicable');
  debug.warn('Recovery failed: %s', orch.session.id);
  return false;
}

export function completeLastInterruption(
  orch: SessionOrchestratorBase,
  duration: number,
): void {
  const last = orch.interruptions[orch.interruptions.length - 1];
  if (last && !last.resolvedAt) {
    last.resolvedAt = Date.now();
    last.duration = duration;
  }
}

export function recordInterruption(
  orch: SessionOrchestratorBase,
  type: InterruptionType,
  severity: InterruptionSeverity = 'MODERATE',
): InterruptionRecord {
  if (!orch.session) {throw new Error('No active session');}
  const interruption: InterruptionRecord = {
    id: uuidv4(),
    sessionId: orch.session.id,
    type,
    severity,
    timestamp: Date.now(),
    reason: 'Session interruption',
    duration: 0,
    resolvedAt: Date.now(),
    autoRecovered: false,
    impact: { timeLost: 0, scoreImpact: 0, damagePoints: 0 },
  };
  orch.interruptions.push(interruption);
  orch.session.interruptions = (orch.session.interruptions || 0) + 1;
  orch.eventEmitter.emitInterruption(interruption);
  const damage = orch.scoringEngine.calculateDamage(
    orch.session,
    'INTERRUPTION',
  );
  if (damage.totalDamage > 0)
    {orch.eventEmitter.emitDamageTaken(
      damage.totalDamage,
      `Interruption: ${type}`,
    );}
  return interruption;
}

export function handleAntiCheatViolation(
  orch: SessionOrchestratorBase,
  warning: string,
): void {
  if (!orch.session) {return;}
  const flags = orch.antiCheatEngine.getFlags();
  if (flags.length > 0) {
    const latestFlag = flags[flags.length - 1]!;
    orch.eventEmitter.emitAntiCheatFlag(latestFlag);
    orch.session.antiCheatStatus =
      orch.antiCheatEngine.getStatus() as SessionState['antiCheatStatus'];
    orch.session.antiCheatFlags = flags.map((f) => f.type);
  }
  debug.error('Anti-cheat violation: %s', new Error(warning));
}

export function logInterruption(
  orch: SessionOrchestratorBase,
  type: string,
  _details?: Record<string, unknown>,
): void {
  if (!orch.session) {return;}
  const severity: InterruptionSeverity =
    type === 'USER_PAUSE' ? 'MINOR' : 'MODERATE';
  recordInterruption(orch, type as InterruptionType, severity);
  orch.session.updatedAt = Date.now();
  orch.session.isDirty = true;
  void orch.saveSessionState();
}

export function logRecovery(
  orch: SessionOrchestratorBase,
  type: string,
  _details?: Record<string, unknown>,
): void {
  if (!orch.session) {return;}
  const recovery: RecoveryRecord = {
    id: uuidv4(),
    sessionId: orch.session.id,
    type: type as RecoveryRecord['type'],
    timestamp: Date.now(),
    recoveredTime: 0,
    success: true,
    attemptedAt: Date.now(),
  };
  orch.recoveries.push(recovery);
  orch.eventEmitter.emitRecoverySuccessful(Date.now(), 0);
  orch.session.updatedAt = Date.now();
  orch.session.isDirty = true;
  void orch.saveSessionState();
}
