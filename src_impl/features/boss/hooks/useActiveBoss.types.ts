export interface DamageCalculation {
    /** Base damage from session duration */
    baseDamage: number;
    /** Multiplier from purity score */
    purityMultiplier: number;
    /** Multiplier from streak */
    streakMultiplier: number;
    /** Final damage after all multipliers */
    totalDamage: number;
    /** Damage per minute of focus time */
    damagePerMinute: number;
}

export interface KillEstimate {
    /** Whether this session will defeat the boss */
    willDefeat: boolean;
    /** Sessions needed to defeat at current rate */
    sessionsRemaining: number;
    /** Minutes of focus needed at current rate */
    minutesRemaining: number;
    /** Percentage of boss HP this session deals */
    percentDamage: number;
}

export interface ActiveBossState {
    /** Current boss encounter data */
    encounter: {
        id: string;
        bossId: string;
        bossName: string;
        bossAvatarUrl: string | null;
        healthRemaining: number;
        maxHealth: number;
        percentHealthRemaining: number;
        tier: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
        } | null;
    /** Damage calculation for current session */
    damageThisSession: DamageCalculation;
    /** Kill estimate based on current session */
    estimatedKill: KillEstimate;
    /** Current combat state */
    combatState: 'ENCOUNTER_START' | 'COMBAT_ACTIVE' | 'BOSS_RAGE' | 'NEAR_DEATH' | 'VICTORY';
    /** Whether damage flash should show */
    showDamageFlash: boolean;
    /** Recent damage dealt (for flash animation) */
    recentDamage: number;
    /** Loading state */
    isLoading: boolean;
    /** Error state */
    error: Error | null;
    /** Actions */
    actions: {
        /** Calculate damage for elapsed session time */
        calculateDamage: (elapsedMinutes: number, purityScore: number) => DamageCalculation;
        /** Mark damage flash as shown */
        clearDamageFlash: () => void;
        /** Refresh boss data */
        refresh: () => void;
        };
}
