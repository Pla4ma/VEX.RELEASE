export interface FeatureUnlock {
    achievementId: string;
    featureType: 'COSMETIC' | 'BOSS' | 'STUDY' | 'SOCIAL' | 'PREMIUM';
    featureId: string;
    featureName: string;
    description: string;
    icon: string;
}

export interface ProgressionGuide {
    currentAchievement: Achievement | null;
    nextAchievement: Achievement | null;
    nearbyAchievements: Achievement[];
    categoryProgress: Record<AchievementCategory, number>;
    totalPoints: number;
    nextUnlock: FeatureUnlock | null;
}
