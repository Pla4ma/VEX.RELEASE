export interface VariableRewardModifiers {
    /** Streak > 7 days: +3% to all tiers */
    streakDays: number;
    /** S grade session: +5% to all tiers */
    isSGrade: boolean;
    /** Boss active: +2% to all tiers */
    bossActive: boolean;
    /** Squad session: +2% to all tiers */
    squadSession: boolean;
    /** Premium user: +3% to all tiers */
    isPremium: boolean;
    /** Daily lucky bonus active */
    luckyBonusActive: boolean;
}

export interface VariableRewardResult {
    tier: VariableRewardTier;
    items: VariableRewardItem[];
    rollValue: number;
    modifiedChances: Record<VariableRewardTier, number>;
    triggeredModifiers: string[];
}

export interface VariableRewardItem {
    type: 'COINS' | 'XP_BOOST' | 'GEMS' | 'STREAK_SHIELD' | 'COSMETIC' | 'LEGENDARY_ITEM';
    amount: number;
    name: string;
    icon: string;
}

export interface VariableRewardConfig {
    tier: VariableRewardTier;
    baseChance: number;
    description: string;
}

export type CalculateVariableRewardInput = z.infer<typeof CalculateVariableRewardInputSchema>;

export enum VariableRewardTier {
    NONE = 'NONE',
    COMMON = 'COMMON',
    UNCOMMON = 'UNCOMMON',
    RARE = 'RARE',
    EPIC = 'EPIC',
    LEGENDARY = 'LEGENDARY'
}
