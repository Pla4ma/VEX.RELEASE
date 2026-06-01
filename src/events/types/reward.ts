export interface RewardEventDefinitions {
  'reward:granted': {
    type?: string;
    userId?: string;
    amount?: number;
    source?: string;
    [key: string]: unknown;
  };
  'reward:claimed': {
    rewardId: string;
    userId: string;
    claimedAt: number;
    actualValue: number;
    appliedBoosts: string[];
  };
  'reward:expired': {
    rewardId: string;
    userId: string;
    expiredAt: number;
    unclaimedValue: number;
  };
  'reward:batch_granted': {
    userId?: string;
    count: number;
    totalXP?: number;
    totalCurrency?: number;
    rewards?: unknown[];
  };
  'rewards:badge-granted': { userId: string; badgeId: string; rarity?: string };
  'rewards:title-granted': { userId: string; titleId: string };
  'rewards:cosmetic-unlocked': { userId: string; cosmeticId: string };
  'rewards:coin_reward_queued': {
    userId: string;
    amount: number;
    warId: string;
  };
  'rewards:badge_reward_queued': {
    userId: string;
    badgeId: string;
    warId: string;
  };
  'rewards:title_reward_queued': {
    userId: string;
    titleId: string;
    warId: string;
  };
  'economy:grant_reward': {
    userId: string;
    rewardType: string;
    amount: number;
    source: string;
  };
  VARIABLE_REWARD_SPIN: {
    userId: string;
    sessionId: string;
    reward: {
      id: string;
      tier: string;
      type: string;
      value: number;
      description: string;
      rarity: string;
      visualEffect: string;
    };
    tier: string;
    isJackpot: boolean;
  };
  VARIABLE_REWARD_CLAIMED: {
    userId: string;
    sessionId: string;
    reward: {
      id: string;
      tier: string;
      type: string;
      value: number;
      description: string;
      rarity: string;
      visualEffect: string;
    };
    xpGained: number;
    gemsGained: number;
  };
  CHEST_OPENED: {
    userId: string;
    chestId: string;
    type: string;
    rewards: {
      id: string;
      type: string;
      value: number;
      name: string;
      description: string;
      rarity: string;
    }[];
    totalValue: { xp: number; gems: number; coins: number };
  };
  GACHA_PULL: {
    userId: string;
    pullId: string;
    item: {
      id: string;
      name: string;
      description: string;
      type: string;
      rarity: string;
      visualAsset: string;
      isLimited: boolean;
    };
    rarity: string;
    isNewItem: boolean;
    pityTriggered: boolean;
    legendaryPityTriggered: boolean;
  };
  SURPRISE_TRIGGERED: {
    userId: string;
    surpriseId: string;
    type: string;
    [key: string]: unknown;
  };
  SURPRISE_CLAIMED: {
    userId: string;
    surpriseId: string;
    type: string;
    [key: string]: unknown;
  };
  COLLECTION_ITEM_UNLOCKED: {
    userId: string;
    collectionId: string;
    itemId: string;
    itemName: string;
    isSetComplete: boolean;
  };
  COLLECTION_COMPLETED: {
    userId: string;
    collectionId: string;
    collectionName: string;
    bonus: { xp: number; gems: number; title?: string; cosmetic?: string };
  };
  DIFFICULTY_CHANGED: {
    userId: string;
    oldDifficulty: string;
    newDifficulty: string;
    reason: string;
  };
  CHALLENGE_INJECTED: {
    userId: string;
    challengeType: string;
    sessionMinute: number;
  };
  NOTIFICATIONS_REDUCED: { userId: string; reason: string; flowScore: number };
  COSMETIC_UNLOCKED: {
    userId: string;
    cosmeticId: string;
    cosmeticName: string;
    rarity: string;
    source: string;
  };
  COSMETIC_EQUIPPED: {
    userId: string;
    cosmeticId: string;
    type: string;
    cosmeticName: string;
  };
  'daily_reward:claimed': {
    userId: string;
    day: number;
    reward?: unknown;
    items?: unknown[];
    isPremium?: boolean;
    newStreak?: number;
    timestamp?: number;
  };
  'daily_reward:weekly_completed': {
    userId: string;
    weekNumber: number;
    timestamp?: number;
  };
  'daily_reward:streak_reset': {
    userId: string;
    previousStreak: number;
    reason: string;
    timestamp?: number;
  };
  'chest:opened': {
    userId: string;
    chestId: string;
    rewards: unknown[];
    multiplier?: number;
  };
  'mystery_multiplier:applied': {
    userId: string;
    multiplierId: string;
    multiplierValue: number;
    chestId: string;
  };
}
