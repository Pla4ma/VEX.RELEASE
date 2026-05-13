export interface SessionState {
    id: string;
    userId: string;
    status: SessionStatus;
    phase: SessionPhase;
    config: SessionConfig;
    remainingTime: number;
    totalDuration: number;
    elapsedTime: number;
    effectiveTime: number;
    pausedTime: number;
    totalPausedTime: number;
    totalBackgroundTime: number;
    currentInterval: number;
    totalIntervals: number;
    intervalsCompleted: number;
    interruptions: number;
    pauses: number;
    backgroundTime: number;
    baseScore: number;
    timeBonus: number;
    streakBonus: number;
    focusQuality: number;
    completionPercentage: number;
    damagePoints: number;
    penaltyMultiplier: number;
    recoveryAttempts: number;
    maxRecoveryAttempts: number;
    canRecover: boolean;
    conflictStatus: 'NONE' | 'DETECTED' | 'RESOLVED';
    storageStatus: 'HEALTHY' | 'CORRUPTED' | 'MISSING';
    deviceId: string;
    appVersion: string;
    osVersion: string;
    antiCheatStatus: 'CLEAN' | 'SUSPICIOUS' | 'FLAGGED';
    antiCheatFlags: string[];
    createdAt: number;
    updatedAt: number;
    startedAt?: number;
    pausedAt?: number;
    resumedAt?: number;
    completedAt?: number;
    isDirty: boolean;
}

export interface BossEncounter {
    id: string;
    userId: string;
    bossId: string;
    bossName: string;
    bossAvatarUrl: string | null;
    bossMaxHealth: number;
    bossCurrentHealth: number;
    percentHealthRemaining: number;
    currentPhase: BossPhase;
    currentAttackPattern: BossAttackPattern | null;
    attackPatternStartedAt: number | null;
    attackPatternDurationMs: number;
    userMaxFocusEnergy: number;
    userCurrentFocusEnergy: number;
    userFocusEnergyRegenRate: number;
    availableAbilities: CombatAbility[];
    abilityCooldowns: Record<string, number>;
    encounterStartedAt: number;
    expiresAt: number;
    lastUserActionAt: number | null;
    sessionCount: number;
    totalDamageDealt: number;
    attacksDodged: number;
    attacksHit: number;
    status: 'ACTIVE' | 'VICTORY' | 'DEFEAT' | 'TIMED_OUT';
    tier: BossTier;
}

export interface BossState {
    encounter: BossEncounter | null;
    damageThisSession: DamageCalculation;
    estimatedKill: KillEstimate;
    combatState: 'ENCOUNTER_START' | 'COMBAT_ACTIVE' | 'BOSS_RAGE' | 'NEAR_DEATH' | 'VICTORY';
    showDamageFlash: boolean;
    recentDamage: number;
    isLoading: boolean;
    error: Error | null;
}

export interface DamageCalculation {
    baseDamage: number;
    purityMultiplier: number;
    streakMultiplier: number;
    totalDamage: number;
    damagePerMinute: number;
}

export interface KillEstimate {
    willDefeat: boolean;
    sessionsRemaining: number;
    minutesRemaining: number;
    percentDamage: number;
}

export interface CombatActionResult {
    success: boolean;
    damageDealt: number;
    energyConsumed: number;
    bossHealthRemaining: number;
    newPhase: BossPhase;
    comboBonus: number;
    message: string;
}

export interface ActiveEncounter {
    id: string;
    userId: string;
    bossId: string;
    bossName: string;
    bossAvatarUrl: string | null;
    bossMaxHealth: number;
    bossCurrentHealth: number;
    currentPhase: BossPhase;
    currentAttackPattern: BossAttackPattern | null;
    attackPatternStartedAt: number | null;
    attackPatternDurationMs: number;
    userMaxFocusEnergy: number;
    userCurrentFocusEnergy: number;
    userFocusEnergyRegenRate: number;
    availableAbilities: CombatAbility[];
    abilityCooldowns: Record<string, number>;
    encounterStartedAt: number;
    expiresAt: number;
    lastUserActionAt: number | null;
    sessionCount: number;
    totalDamageDealt: number;
    attacksDodged: number;
    attacksHit: number;
    status: 'ACTIVE' | 'VICTORY' | 'DEFEAT' | 'TIMED_OUT';
}

export interface SessionSummary {
    sessionId: string;
    userId: string;
    duration: number;
    actualDuration?: number;
    effectiveDuration: number;
    completionPercentage: number;
    focusQuality: number;
    purityScore: number;
    focusPurityScore?: number;
    interruptions: number;
    baseScore: number;
    finalScore: number;
    grade: string;
    xpEarned: number;
    levelUp: boolean;
    newLevel?: number;
    bossDamageDealt: number;
    bossDefeated: boolean;
    startedAt: number;
    completedAt: number;
    wasAbandoned: boolean;
    hadInterruptions: boolean;
    usedRecovery: boolean;
    streakIncreased?: boolean;
    streakDays?: number;
    streakBonus?: number;
}
