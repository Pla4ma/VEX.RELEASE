export interface FeaturedAchievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    emoji: string;
    unlockedAt: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}
