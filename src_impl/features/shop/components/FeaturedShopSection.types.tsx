export interface FeaturedItem {
    id: string;
    name: string;
    description: string;
    icon: string;
    emoji: string;
    originalPrice: number;
    discountedPrice: number;
    currency: 'COINS' | 'GEMS';
    rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}
