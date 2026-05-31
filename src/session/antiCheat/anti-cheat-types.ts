import type { AntiCheatFlag } from '../types';

export interface SessionValidationInput {
  endedAt?: number;
  startedAt?: number;
  completionPercentage: number;
  config: { duration: number };
  elapsedTime: number;
  remainingTime: number;
  effectiveTime: number;
  pausedTime: number;
  intervalsCompleted: number;
  pauses: number;
}

export interface TickValidationResult {
  valid: boolean;
  warning?: string;
}

export interface DeviceChangeResult {
  valid: boolean;
  changed: boolean;
}

export interface ActionResult {
  action: AntiCheatFlag['actionTaken'];
  scoreReduction: number;
  shouldInvalidate: boolean;
}

export interface TickRecord {
  timestamp: number;
  elapsed: number;
}

export type PurityLabel = 'Elite' | 'Good' | 'Okay' | 'Distracted';
export type SeverityLevel = 'CLEAN' | 'WARNING' | 'MODERATE' | 'CRITICAL';
export type EngineStatus =
  | 'CLEAN'
  | 'WARNING'
  | 'FLAGGED'
  | 'FAILED'
  | 'INVALIDATED';
