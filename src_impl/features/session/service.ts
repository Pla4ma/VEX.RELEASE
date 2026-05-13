import { SessionMode } from '../../session/modes';
import {
  ACTIVE_SESSION_CONFIG,
  canBackground,
  getActiveSessionConfig,
} from './active-session-modes';
import {
  getGlobalCooldownRemaining,
  getInterventionStats,
} from './coach-cooldown';
import type { SessionViewModel, TimerState } from './schemas';
import { SessionPhase, SessionPurity, SessionStatus } from './schemas';

interface BuildViewModelInput {
  sessionId: string;
  userId: string;
  status: SessionStatus;
  phase: SessionPhase;
  mode: SessionMode;
  elapsedSeconds: number;
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  purityScore: number;
  pauseCount: number;
  totalPauseSeconds: number;
  backgroundTimeSeconds: number;
  focusInterruptions: number;
  startedAt: number;
  isOffline: boolean;
  activeConsumables?: string[];
}

interface SessionCapabilities {
  canPause: boolean;
  canComplete: boolean;
  canAbandon: boolean;
  canBackground: boolean;
  canGracefulExit: boolean;
}

export function buildSessionCapabilities(
  input: BuildViewModelInput
): SessionCapabilities {
  const config = getActiveSessionConfig(input.mode);
  const hasZenShield = input.activeConsumables?.includes('zen-shield');
  const maxPauses = config.maxPauses + (hasZenShield ? 1 : 0);

  return {
    canPause:
      config.allowPauses &&
      input.elapsedSeconds >= config.minFocusSecondsBeforePause &&
      input.pauseCount < maxPauses,
    canComplete: input.elapsedSeconds >= 60,
    canAbandon: input.status === 'ACTIVE' || input.status === 'PAUSED',
    canBackground: canBackground(input.mode, input.backgroundTimeSeconds),
    canGracefulExit:
      (input.status === 'ACTIVE' || input.status === 'PAUSED') &&
      input.elapsedSeconds / input.totalSeconds >= 0.5,
  };
}

export function buildTimerState(input: BuildViewModelInput): TimerState {
  return {
    elapsedSeconds: input.elapsedSeconds,
    remainingSeconds: input.remainingSeconds,
    totalSeconds: input.totalSeconds,
    isRunning: input.isRunning,
    lastTickAt: input.isRunning ? Date.now() : undefined,
  };
}

export function buildPurityState(input: BuildViewModelInput): SessionPurity {
  const score = Math.max(0, Math.min(100, input.purityScore));
  let label: SessionPurity['label'];

  if (score >= 90) {
    label = 'EXCELLENT';
  } else if (score >= 75) {
    label = 'GOOD';
  } else if (score >= 50) {
    label = 'FAIR';
  } else if (score >= 25) {
    label = 'POOR';
  } else {
    label = 'CRITICAL';
  }

  return {
    score,
    label,
    pauseCount: input.pauseCount,
    totalPauseSeconds: input.totalPauseSeconds,
    backgroundTimeSeconds: input.backgroundTimeSeconds,
    focusInterruptions: input.focusInterruptions,
  };
}

export function buildSessionViewModel(
  input: BuildViewModelInput
): SessionViewModel {
  const capabilities = buildSessionCapabilities(input);
  const timer = buildTimerState(input);
  const purity = buildPurityState(input);

  return {
    id: input.sessionId,
    userId: input.userId,
    status: input.status,
    phase: input.phase,
    mode: input.mode,
    timer,
    purity,
    startedAt: input.startedAt,
    expectedDurationSeconds: input.totalSeconds,
    canPause: capabilities.canPause,
    canComplete: capabilities.canComplete,
    canAbandon: capabilities.canAbandon,
    canGracefulExit: capabilities.canGracefulExit,
    isOffline: input.isOffline,
    activeConsumables: input.activeConsumables || [],
    metadata: {},
  };
}

export function getModeCoachConfig(mode: SessionMode): {
  enabled: boolean;
  cooldownSeconds: number;
  globalCooldownRemaining: number;
} {
  const config = ACTIVE_SESSION_CONFIG[mode] ?? ACTIVE_SESSION_CONFIG[SessionMode.FLOW];

  return {
    enabled: config?.coachEnabled ?? true,
    cooldownSeconds: config?.coachCooldownSeconds ?? 300,
    globalCooldownRemaining: 0,
  };
}

export function getCoachStatusForSession(sessionId: string): {
  enabled: boolean;
  cooldownSeconds: number;
  interventionsCount: number;
  globalCooldownRemaining: number;
  secondsSinceLastIntervention: number | null;
} {
  const stats = getInterventionStats(sessionId);
  const globalCooldownRemaining = getGlobalCooldownRemaining(sessionId);

  return {
    enabled: true,
    cooldownSeconds: 60,
    interventionsCount: stats.totalInterventions,
    globalCooldownRemaining,
    secondsSinceLastIntervention: stats.secondsSinceLastIntervention,
  };
}

export function calculateProgressPercentage(
  elapsedSeconds: number,
  totalSeconds: number
): number {
  if (totalSeconds <= 0) {
    return 0;
  }
  const percentage = (elapsedSeconds / totalSeconds) * 100;
  return Math.min(100, Math.max(0, percentage));
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
