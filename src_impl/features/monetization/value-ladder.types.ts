export interface TierConfig {
    id: ValueTier;
    name: string;
    price: number;
    period: 'month' | 'year';
    features: string[];
    highlight?: string;
    badge?: string;
    trialDays?: number;
}

export interface LadderPosition {
    currentTier: ValueTier;
    sessionsCompleted: number;
    daysActive: number;
    nextRecommendedTier: ValueTier;
    upgradeUrgency: 'low' | 'medium' | 'high';
    discountEligible: boolean;
    discountPercent?: number;
}

export type ValueTier = 'free' | 'plus' | 'pro' | 'elite';
