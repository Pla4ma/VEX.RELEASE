import type { DamageCalculation, SessionStatus, SessionSummary } from '../types';

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
