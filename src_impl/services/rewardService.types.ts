export interface Reward {
    id: string;
    type: 'DAILY_LOGIN' | 'STREAK_BONUS' | 'ACHIEVEMENT' | 'LEVEL_UP' | 'SPECIAL';
    title: string;
    description: string;
    rewards: {
        coins?: number;
        gems?: number;
        special?: number;
        xp?: number;
        };
    requirements?: {
        minLevel?: number;
        minStreak?: number;
        achievementId?: string;
        };
    expiresAt?: string;
    claimedAt?: string;
}

export interface ClaimableReward {
    reward: Reward;
    isAvailable: boolean;
    isClaimed: boolean;
    timeUntilAvailable?: number;
}
