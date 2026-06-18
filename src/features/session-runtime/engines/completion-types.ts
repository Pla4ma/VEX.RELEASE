import type {
  DamageCalculation,
  FocusQualityMetrics,
  ScoreCalculation,
  SessionState,
  SessionSummary,
  SessionStatus,
} from '../types';

export interface CompletionResult {
  success: boolean;
  status: SessionStatus;
  summary: SessionSummary;
  rewardsGranted: boolean;
  streakMaintained: boolean;
  recoveryAvailable: boolean;
  error?: string;
}

export interface AbandonResult {
  sessionId: string;
  damage: DamageCalculation;
  canRecover: boolean;
  streakBroken: boolean;
  partialCredit: boolean;
}

export interface SessionStatsResult {
  efficiency: number;
  focusRating: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'NEEDS_IMPROVEMENT';
  productivity: number;
  recommendations: string[];
}

export interface CompletionEligibility {
  eligible: boolean;
  reason?: string;
}

export function validateEligibility(
  session: SessionState,
): CompletionEligibility {
  if (session.status === 'COMPLETED') {
    return { eligible: false, reason: 'Session already completed' };
  }
  if (session.status === 'ABANDONED') {
    return { eligible: false, reason: 'Session was abandoned' };
  }
  if (!session.startedAt) {
    return { eligible: false, reason: 'Session was never started' };
  }
  if (session.antiCheatStatus === 'FAILED') {
    return {
      eligible: false,
      reason: 'Session failed anti-cheat validation',
    };
  }
  return { eligible: true };
}
