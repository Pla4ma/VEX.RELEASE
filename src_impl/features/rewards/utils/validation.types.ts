export interface ValidationResult<T> {
    valid: boolean;
    data?: T;
    violations: RewardViolation[];
    warnings: RewardWarning[];
    manipulationRisk: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface RewardViolation {
    type: 'VALUE_MISMATCH' | 'IMPOSSIBLE_DROP' | 'RATE_LIMIT' | 'DUPLICATE' | 'POLICY';
    field: string;
    message: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface RewardWarning {
    field: string;
    message: string;
    code: string;
}

export type ChestTier = z.infer<typeof ChestTierSchema>;
export type RewardItem = z.infer<typeof RewardItemSchema>;
export type ChestReward = z.infer<typeof ChestRewardSchema>;
