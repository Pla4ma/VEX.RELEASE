export interface SessionModeV2Config {
    name: string;
    description: string;
    icon: string;
    color: string;
    bossHealthMultiplier: number;
    bossAttackFrequency: number;
    pausePenaltyMultiplier: number;
    purityPassThreshold: number;
    xpMultiplier: number;
    coinMultiplier: number;
    gemDropChance: number;
    allowPauses: boolean;
    maxPauses: number;
    minimumDurationMinutes: number;
    maximumDurationMinutes: number;
    scoringWeights: {
        consistency: number;
        depth: number;
        recovery: number;
        };
    companionBehavior: CompanionModeBehaviorV2;
    comebackBonusActive: boolean;
}

export type CompanionModeBehaviorV2 = | 'focused'      // FLOW: Steady, encouraging
      | 'intense'      // CHALLENGE: Demanding, high stakes
      | 'gentle';

export enum SessionModeV2 {
    FLOW = 'FLOW',
    CHALLENGE = 'CHALLENGE',
    RECOVERY = 'RECOVERY'
}
