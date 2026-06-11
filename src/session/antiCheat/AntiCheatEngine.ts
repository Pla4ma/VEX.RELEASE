import { createDebugger } from '../../utils/debug';
import { THRESHOLDS } from './AntiCheatConfig';
import type { AntiCheatFlag } from '../types';
import type {
  SessionValidationInput,
  TickValidationResult,
  DeviceChangeResult,
  ActionResult,
  TickRecord,
  PurityLabel,
  SeverityLevel,
  EngineStatus,
} from './anti-cheat-types';
import { validateTick, validateTickPatterns } from './tick-validation';
import { validateSession, validateDataConsistency } from './session-validation';
import {
  calculatePurityScore,
  getPurityLabel as labelFromScore,
  getSeverity as severityFromFlags,
  getStatus as statusFromFlags,
  determineAction,
} from './purity-scoring';

export type {
  SessionValidationInput,
  TickValidationResult,
  DeviceChangeResult,
  ActionResult,
  TickRecord,
  PurityLabel,
  SeverityLevel,
  EngineStatus,
} from './anti-cheat-types';

const debug = createDebugger('session:anticheat');

type FlagType = AntiCheatFlag['type'];
type FlagSeverity = AntiCheatFlag['severity'];

export class AntiCheatEngine {
  private flags: AntiCheatFlag[] = [];
  private sessionId: string | null = null;
  private tickHistory: TickRecord[] = [];
  private lastTickTime = 0;
  private deviceFingerprint: string | null = null;
  private backgroundSwitches = 0;
  private manualPauses = 0;
  private suspendedCount = 0;
  private uninterruptedFocusAccumulatedMs = 0;
  private uninterruptedFocusStartedAt: number | null = null;

  initialize(sessionId: string, deviceFingerprint: string): void {
    this.sessionId = sessionId;
    this.deviceFingerprint = deviceFingerprint;
    this.flags = [];
    this.tickHistory = [];
    this.lastTickTime = 0;
    this.backgroundSwitches = 0;
    this.manualPauses = 0;
    this.suspendedCount = 0;
    this.uninterruptedFocusAccumulatedMs = 0;
    this.uninterruptedFocusStartedAt = null;
    debug.info('AntiCheatEngine initialized for session %s', sessionId);
  }

  validateTick(elapsed: number, timestamp: number): TickValidationResult {
    if (!this.sessionId)
      {return { valid: false, warning: 'Engine not initialized' };}
    if (!this.uninterruptedFocusStartedAt)
      {this.uninterruptedFocusStartedAt = timestamp;}
    const flag = (t: FlagType, s: FlagSeverity, e: Record<string, unknown>) =>
      this.flagViolation(t, s, e);
    const result = validateTick(this.tickHistory, this.lastTickTime, elapsed, timestamp, flag);
    if (!result.valid) {return result;}
    this.tickHistory.push({ timestamp, elapsed });
    this.lastTickTime = timestamp;
    if (this.tickHistory.length > THRESHOLDS.MAX_TICK_HISTORY)
      {this.tickHistory = this.tickHistory.slice(-THRESHOLDS.MAX_TICK_HISTORY_TRIM);}
    return { valid: true };
  }

  recordManualPause(): void { this.manualPauses++; this.endCurrentFocusSegment(Date.now()); }
  recordBackgroundSwitch(): void { this.backgroundSwitches++; this.endCurrentFocusSegment(Date.now()); }
  recordSuspension(durationMs: number): void {
    if (durationMs > THRESHOLDS.MAX_SUSPENSION_MS) {
      this.suspendedCount = 1;
      this.endCurrentFocusSegment(Date.now());
    }
  }

  getCurrentPurityScore(): number {
    return calculatePurityScore(
      this.backgroundSwitches, this.manualPauses, this.suspendedCount,
      this.uninterruptedFocusAccumulatedMs, this.uninterruptedFocusStartedAt,
    );
  }
  getPurityLabel(): PurityLabel { return labelFromScore(this.getCurrentPurityScore()); }

  validateSession(session: SessionValidationInput): {
    valid: boolean;
    flags: AntiCheatFlag[];
  } {
    if (!this.sessionId) {return { valid: false, flags: [] };}
    const flag = (t: FlagType, s: FlagSeverity, e: Record<string, unknown>) =>
      this.flagViolation(t, s, e);
    validateSession(session, flag);
    validateDataConsistency(session, flag);
    validateTickPatterns(this.tickHistory, flag);
    return { valid: this.getSeverity() !== 'CRITICAL', flags: this.flags };
  }

  validateDeviceChange(newFingerprint: string): DeviceChangeResult {
    if (!this.deviceFingerprint) {return { valid: true, changed: false };}
    if (newFingerprint !== this.deviceFingerprint) {
      this.flagViolation('DEVICE_CHANGE', 'WARNING', {
        previousDevice: this.deviceFingerprint, newDevice: newFingerprint,
      });
      return { valid: true, changed: true };
    }
    return { valid: true, changed: false };
  }

  private flagViolation(type: FlagType, severity: FlagSeverity, evidence: Record<string, unknown>): void {
    if (!this.sessionId) {return;}
    this.flags.push({
      id: `flag-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      sessionId: this.sessionId, type, severity, detectedAt: Date.now(), evidence, actionTaken: 'NONE',
    });
    debug.warn('Anti-cheat flag: %s (%s)', type, severity);
  }

  getFlags(): AntiCheatFlag[] { return [...this.flags]; }
  getSeverity(): SeverityLevel { return severityFromFlags(this.flags); }
  getStatus(): EngineStatus { return statusFromFlags(this.flags, this.getSeverity()); }
  takeAction(): ActionResult { return determineAction(this.getStatus()); }

  flagDeviceChange(oldHash: string, newHash: string): void {
    if (!this.sessionId) {return;}
    this.flagViolation('DEVICE_CHANGE', 'WARNING', { reason: 'Device fingerprint changed during session', oldHash, newHash });
  }
  applyActions(): void {
    const action = this.takeAction();
    this.flags = this.flags.map((flag) => ({ ...flag, actionTaken: action.action }));
  }
  reset(): void {
    this.flags = []; this.tickHistory = []; this.lastTickTime = 0;
    this.backgroundSwitches = 0; this.manualPauses = 0; this.suspendedCount = 0;
    this.uninterruptedFocusAccumulatedMs = 0; this.uninterruptedFocusStartedAt = null;
  }
  destroy(): void { this.reset(); this.sessionId = null; this.deviceFingerprint = null; }

  private endCurrentFocusSegment(timestamp: number): void {
    if (!this.uninterruptedFocusStartedAt) {return;}
    this.uninterruptedFocusAccumulatedMs += Math.max(0, timestamp - this.uninterruptedFocusStartedAt);
    this.uninterruptedFocusStartedAt = null;
  }
}

export function createAntiCheatEngine(): AntiCheatEngine {
  return new AntiCheatEngine();
}
