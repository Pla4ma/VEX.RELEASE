export interface CriticalHitResult {
    /** Whether crit triggered */
    triggered: boolean;
    /** Damage multiplier (2x if crit) */
    damageMultiplier: number;
    /** Status for UI overlay */
    status: CritStatus;
    /** Roll value (0-1) for analytics */
    roll: number;
    /** For near-miss: how close they were */
    nearMissPercent?: number;
    /** Whether this was a near-miss (rolled 11-20%) */
    wasNearMiss: boolean;
}

export interface CritSessionState {
    sessionId: string;
    bossEncounterId: string;
    critStatus: CritStatus;
    roll: number;
    hasShownOverlay: boolean;
}

export interface WeeklyCritStats {
    totalCrits: number;
    nearMisses: number;
    totalSessions: number;
    critRate: number;
    weekStarting: string;
}

export type CalculateCritChanceInput = z.infer<typeof CalculateCritChanceInputSchema>;

export enum CritStatus {
    /** No crit this session */
    NONE = 'NONE',
    /** Crit is active - will trigger at completion */
    ACTIVE = 'ACTIVE',
    /** Near-miss (11-20%) - almost got crit */
    NEAR_MISS = 'NEAR_MISS'
}
