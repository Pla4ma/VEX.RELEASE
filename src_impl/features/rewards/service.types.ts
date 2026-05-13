export interface MysteryChest {
    id: string;
    rarity: ChestRarity;
    droppedAt: number;
    expiresAt: number;
    opened: boolean;
}

export type ChestRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
