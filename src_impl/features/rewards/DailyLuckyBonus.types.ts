export interface LuckyBonusStatus {
    /** Whether lucky bonus is available today */
    available: boolean;
    /** Whether lucky bonus was already used today */
    used: boolean;
    /** Date string (YYYY-MM-DD) when last used */
    lastUsedDate: string | null;
    /** Hours until next reset */
    hoursUntilReset: number;
    /** Minutes until next reset */
    minutesUntilReset: number;
}

export interface LuckyBonusResult {
    /** Whether lucky bonus was triggered this session */
    triggered: boolean;
    /** Type of bonus that occurred */
    type: 'double_tier' | 'tier_skip' | 'none';
    /** Original tier before bonus */
    originalTier: string;
    /** Final tier after bonus */
    finalTier: string;
    /** Multiplier applied to rewards */
    rewardMultiplier: number;
}

export enum LuckyBonusType {
    NONE = 'NONE',
    DOUBLE_TIER = 'DOUBLE_TIER',
    TIER_SKIP = 'TIER_SKIP'
}
