import { eventBus, type EventChannels } from '../events';
import type { SessionEventChannel } from './types/events';
import type {
  SessionSummary,
  InterruptionRecord,
  RecoveryRecord,
  AntiCheatFlag,
} from './types';
import type {
  InterruptionRiskLevel,
  ConflictResolution,
  Payload,
  PartialPayload,
} from './session-event-emitter-types';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('session:events');

export { InterruptionRiskLevel, ConflictResolution, Payload, PartialPayload };

export class SessionEventEmitterBase {
  protected sessionId: string | null = null;
  protected userId: string | null = null;

  attach(sessionId: string, userId: string): void {
    this.sessionId = sessionId;
    this.userId = userId;
    debug.debug('SessionEventEmitter attached to session %s', sessionId);
  }

  detach(): void {
    this.sessionId = null;
    this.userId = null;
    debug.debug('SessionEventEmitter detached');
  }

  protected emit<E extends SessionEventChannel>(
    channel: E,
    payload: PartialPayload<E>,
  ): void {
    if (!this.sessionId) {return;}
    eventBus.publish(
      channel as keyof EventChannels,
      {
        sessionId: this.sessionId,
        userId: this.userId,
        timestamp: Date.now(),
        ...payload,
      } as EventChannels[keyof EventChannels],
    );
  }

  emitSessionCreated(config: Payload<'session:created'>['config']): void {
    this.emit('session:created', { config });
    debug.debug('Session created event emitted: %s', this.sessionId);
  }
  emitSessionStarting(countdown: number): void {
    this.emit('session:starting', { countdown });
    debug.debug(
      'Session starting: %s (countdown: %d)',
      this.sessionId,
      countdown,
    );
  }
  emitSessionStarted(phase: string): void {
    this.emit('session:started', { startedAt: Date.now(), phase });
    debug.info('Session started: %s', this.sessionId);
  }
  emitSessionPaused(reason?: string): void {
    this.emit('session:paused', { pausedAt: Date.now(), reason });
    debug.debug('Session paused: %s', this.sessionId);
  }
  emitSessionResumed(pausedDuration: number): void {
    this.emit('session:resumed', { resumedAt: Date.now(), pausedDuration });
    debug.debug('Session resumed: %s', this.sessionId);
  }
  emitPhaseChanged(previousPhase: string, newPhase: string): void {
    this.emit('session:phase:changed', { previousPhase, newPhase });
    debug.debug('Phase changed: %s -> %s', previousPhase, newPhase);
  }
  emitIntervalCompleted(interval: number, totalIntervals: number): void {
    this.emit('session:interval:completed', { interval, totalIntervals });
    debug.debug('Interval completed: %d/%d', interval, totalIntervals);
  }
  emitSessionCompleting(completionPercentage: number): void {
    this.emit('session:completing', { completionPercentage });
    debug.debug('Session completing: %s', this.sessionId);
  }
  emitSessionCompleted(summary: SessionSummary): void {
    this.emit('session:completed', { summary });
    debug.info(
      'Session completed: %s, Score: %d',
      this.sessionId,
      summary.finalScore,
    );
  }
  emitSessionPartial(summary: SessionSummary, partialReason: string): void {
    this.emit('session:partial', { summary, partialReason });
    debug.info(
      'Session partial: %s, Completion: %d%%',
      this.sessionId,
      summary.completionPercentage,
    );
  }
  emitSessionAbandoned(
    abandonedAt: number,
    reason?: string,
    elapsedTime: number = 0,
  ): void {
    this.emit('session:abandoned', { abandonedAt, reason, elapsedTime });
    debug.warn(
      'Session abandoned: %s (reason: %s)',
      this.sessionId,
      reason || 'none',
    );
  }
  emitSessionFailed(error: string, canRecover: boolean = true): void {
    this.emit('session:failed', { error, canRecover });
    debug.error('Session failed: %s (error: %s)', this.sessionId, error);
  }
  emitTick(
    elapsed: number,
    remaining: number,
    percentage: number,
    phase: string,
  ): void {
    this.emit('session:tick', { elapsed, remaining, percentage, phase });
  }
  emitProgress(
    phase: string,
    interval: number,
    percentage: number,
    timeRemaining: number,
  ): void {
    this.emit('session:progress', {
      phase,
      interval,
      percentage,
      timeRemaining,
    });
  }
  emitInterruption(interruption: InterruptionRecord): void {
    this.emit('session:interruption', { interruption });
    debug.warn(
      'Interruption: %s (type: %s)',
      this.sessionId,
      interruption.type,
    );
  }
  emitInterruptionRisk(
    riskLevel: InterruptionRiskLevel,
    timeUntilRisk: number,
  ): void {
    this.emit('session:interruption:risk', { riskLevel, timeUntilRisk });
    debug.debug('Interruption risk: %s', this.sessionId);
  }
}
