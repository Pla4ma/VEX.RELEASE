export interface DamageValidationResult {
    valid: boolean;
    errors: string[];
    suspicious: boolean;
    expectedDamageRange?: { min: number; max: number };
}

export interface BossBalanceMetrics {
    avgDefeatTime: number;
    defeatCount: number;
    attemptCount: number;
    avgPlayerCount: number;
    healEfficiency: number;
}

export type BossAttack = z.infer<typeof BossAttackSchema>;
