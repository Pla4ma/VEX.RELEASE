export interface Wallet {
    userId: string;
    coins: number;
    tokens: number;
    totalEarnedCoins: number;
    totalEarnedTokens: number;
    totalSpentCoins: number;
    totalSpentTokens: number;
    lastUpdated: number;
}

export interface Item {
    id: string;
    templateId: string;
    name: string;
    description: string;
    rarity: ItemRarity;
    type: 'EQUIPMENT' | 'CONSUMABLE' | 'MATERIAL' | 'COSMETIC' | 'CHEST';
    level: number;
    maxLevel: number;
    durability: number;
    maxDurability: number;
    sockets: number;
    gems: Gem[];
    stats: ItemStat[];
    setId?: string;
}

export interface ItemStat {
    type: 'DAMAGE_BOOST' | 'XP_BOOST' | 'COIN_BOOST' | 'PURITY_BOOST' | 'DURABILITY_BOOST';
    value: number;
    isPercentage: boolean;
}

export interface Gem {
    id: string;
    color: 'RED' | 'BLUE' | 'GREEN' | 'YELLOW' | 'PURPLE';
    stat: ItemStat;
}

export interface UpgradeCost {
    coins: number;
    materials: Array<{ materialId: string; count: number }>;
}

export interface UpgradeResult {
    success: boolean;
    newLevel: number;
    newStats: ItemStat[];
    destroyed: boolean;
}

export interface LootTable {
    id: string;
    name: string;
    cost: { currency: Currency; amount: number };
    drops: LootDrop[];
}

export interface LootDrop {
    itemId: string;
    weight: number;
    rarity: ItemRarity;
}

export interface TradeListing {
    id: string;
    sellerId: string;
    item: Item;
    price: number;
    listedAt: number;
    expiresAt: number;
}

export type Currency = z.infer<typeof CurrencySchema>;
export type ItemRarity = z.infer<typeof ItemRaritySchema>;
