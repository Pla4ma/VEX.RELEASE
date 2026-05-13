export interface CosmeticItem {
    id: string;
    name: string;
    description: string;
    type: CosmeticType;
    icon: string;
    emoji: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    isEquipped: boolean;
    isOwned: boolean;
    previewColor?: string;
}

export type CosmeticType = 'avatar-frame' | 'badge' | 'background' | 'title';
