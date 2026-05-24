/**
 * Integration Events
 */

export interface IntegrationEventDefinitions {
  'integration:session_rewards': {
    sessionId: string;
    userId: string;
    rewards: {
      xp: number;
      coins: number;
      gems: number;
      chestTier?: string;
      bonusItemId?: string;
    };
    streak: { days: number; multiplier: number; increased: boolean };
    purity: { score: number; label: string; perfectFocus: boolean };
    timestamp: number;
  };
  'config:updated': {
    key: string;
    value: unknown;
    previousValue: unknown;
    source: string;
    version?: string;
    previousVersion?: string;
    breakingChanges?: boolean;
  };
  'analytics:economy_event': {
    userId?: string;
    event?: string;
    type?: string;
    currency?: string;
    amount?: number;
    source?: string;
    properties?: Record<string, unknown>;
  };
  'crafting:item_crafted': {
    userId: string;
    itemId: string;
    itemType: string;
    recipeId?: string;
    rarity: string;
    quantity?: number;
    materialsUsed: Record<string, number>;
    coinsSpent: number;
  };
}
