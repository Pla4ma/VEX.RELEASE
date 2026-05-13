export interface PhaseConfig {
    name: string;
    healthThreshold: number;
    mechanic: BossMechanicType;
    mechanicIntensity: number;
    playerCanTakeDamage: boolean;
    playerDamageType: 'STREAK_RISK' | 'XP_PENALTY' | 'COIN_PENALTY' | 'NONE';
    requiredPurity?: number;
    timeLimit?: number;
    damageMultiplier: number;
    incomingDamageMultiplier: number;
    visualIntensity: 'normal' | 'intense' | 'critical';
    audioCue: string;
}

export interface BossPhaseState {
    currentPhase: BossPhase;
    previousPhase: BossPhase | null;
    phaseEnteredAt: number;
    phaseHealthStart: number;
    mechanicActive: boolean;
    mechanicData: Record<string, unknown>;
    executeWindowOpen: boolean;
    playerWarningsIssued: number;
}

export interface PhaseTransitionResult {
    success: boolean;
    newPhase: BossPhase;
    message: string;
    playerTookDamage: boolean;
    damageType: 'STREAK_RISK' | 'XP_PENALTY' | 'COIN_PENALTY' | 'NONE';
    warnings: string[];
}

export interface ExecutePhaseState {
    isActive: boolean;
    timeRemaining: number;
    requiredPurity: number;
    currentPurity: number;
    startedAt: number;
    succeeded: boolean | null;
}

export interface RegenState {
    totalRegenerated: number;
    regenPerPause: number;
    pauseCount: number;
    lastRegenAt: number | null;
}

export type BossPhase = 'PHASE_1' | 'PHASE_2' | 'PHASE_3' | 'ENRAGED' | 'EXECUTE';
