/**
 * Shop Categories System
 *
 * Phase 4.2 - Shop & Economy Polish
 * Three shop categories:
 * 1. Cosmetics (visual customization) - Avatar frames, boss themes, backgrounds
 * 2. Utility (gameplay items) - Insurance, XP boosts, damage boosts
 * 3. Premium (subscription-only) - Exclusive items not purchasable with currency
 *
 * Dependencies:
 * - ShopEconomy (dual currency)
 * - Achievements (cosmetic unlocks)
 * - Streaks (insurance system)
 * - PremiumTierSystem (premium exclusives)
 */

import { eventBus } from "../../events";
import type { CurrencyType } from "./ShopEconomy";

// ============================================================================
// Shop Item Types
// ============================================================================

export type ShopCategory = "COSMETICS" | "UTILITY" | "PREMIUM";
export type ItemRarity = "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ShopCategory;
  rarity: ItemRarity;
  icon: string;
  previewUrl?: string;

  // Pricing
  price: {
    currency: CurrencyType;
    amount: number;
    saleAmount?: number; // If on sale
  };

  // Requirements
  requirements?: {
    minLevel?: number;
    achievementId?: string;
    bossDefeatId?: string;
    streakDays?: number;
    premiumOnly?: boolean;
  };

  // Availability
  limitedTime?: {
    startAt: number;
    endAt: number;
  };
  stockLimit?: number; // Limited quantity
  purchasedCount?: number; // Track how many sold

  // Meta
  addedAt: number;
  featured?: boolean;
  new?: boolean;
}

export interface UserInventory {
  userId: string;
  items: InventoryItem[];
  equippedCosmetics: {
    avatarFrame: string | null;
    sessionBackground: string | null;
    bossTheme: string | null;
    companionSkin: string | null;
  };
}

export interface InventoryItem {
  itemId: string;
  acquiredAt: number;
  equipped: boolean;
  source: "SHOP_PURCHASE" | "ACHIEVEMENT" | "BOSS_DEFEAT" | "STREAK_MILESTONE" | "PREMIUM_BONUS";
}

// ============================================================================
// Cosmetics Category
// ============================================================================

export const COSMETIC_ITEMS: ShopItem[] = [
  // Avatar Frames (Coin purchases)
  {
    id: "frame-focus-beginner",
    name: "Focus Beginner",
    description: "A simple frame for those starting their journey",
    category: "COSMETICS",
    rarity: "COMMON",
    icon: "🌱",
    price: { currency: "COINS", amount: 500 },
    addedAt: Date.now(),
    new: false,
  },
  {
    id: "frame-dedicated-student",
    name: "Dedicated Student",
    description: "Shows your commitment to learning",
    category: "COSMETICS",
    rarity: "UNCOMMON",
    icon: "📚",
    price: { currency: "COINS", amount: 1500 },
    requirements: { minLevel: 5 },
    addedAt: Date.now(),
  },
  {
    id: "frame-boss-slayer",
    name: "Boss Slayer",
    description: "Frame awarded to those who defeat their first boss",
    category: "COSMETICS",
    rarity: "RARE",
    icon: "⚔️",
    price: { currency: "COINS", amount: 3000 },
    requirements: { achievementId: "achievement-first-boss" },
    addedAt: Date.now(),
  },
  {
    id: "frame-streak-warrior",
    name: "Streak Warrior",
    description: "Animated flames show your 7+ day streak",
    category: "COSMETICS",
    rarity: "RARE",
    icon: "🔥",
    price: { currency: "COINS", amount: 5000 },
    requirements: { streakDays: 7 },
    addedAt: Date.now(),
  },
  {
    id: "frame-monthly-master",
    name: "Monthly Master",
    description: "Crown frame for 30-day streak achievers",
    category: "COSMETICS",
    rarity: "EPIC",
    icon: "👑",
    price: { currency: "GEMS", amount: 50 },
    requirements: { streakDays: 30 },
    addedAt: Date.now(),
  },
  {
    id: "frame-century-legend",
    name: "Century Legend",
    description: "Exclusive rainbow aura for 100-day streak holders",
    category: "COSMETICS",
    rarity: "LEGENDARY",
    icon: "🏆",
    price: { currency: "GEMS", amount: 200 },
    requirements: { streakDays: 100, premiumOnly: true },
    addedAt: Date.now(),
  },

  // Session Backgrounds
  {
    id: "bg-calm-forest",
    name: "Calm Forest",
    description: "Peaceful forest ambiance for your sessions",
    category: "COSMETICS",
    rarity: "COMMON",
    icon: "🌲",
    price: { currency: "COINS", amount: 1000 },
    addedAt: Date.now(),
  },
  {
    id: "bg-cozy-library",
    name: "Cozy Library",
    description: "Study in a warm, classic library setting",
    category: "COSMETICS",
    rarity: "UNCOMMON",
    icon: "📖",
    price: { currency: "COINS", amount: 2500 },
    addedAt: Date.now(),
  },
  {
    id: "bg-neon-cyber",
    name: "Neon Cyber",
    description: "Futuristic cyberpunk focus environment",
    category: "COSMETICS",
    rarity: "RARE",
    icon: "💠",
    price: { currency: "GEMS", amount: 30 },
    addedAt: Date.now(),
  },
  {
    id: "bg-zen-garden",
    name: "Zen Garden",
    description: "Minimalist zen garden for deep focus",
    category: "COSMETICS",
    rarity: "EPIC",
    icon: "🏯",
    price: { currency: "GEMS", amount: 75 },
    requirements: { achievementId: "achievement-100-sessions" },
    addedAt: Date.now(),
  },

  // Boss Themes (affect boss battle visuals)
  {
    id: "theme-dragon-arena",
    name: "Dragon Arena",
    description: "Fiery arena for boss battles",
    category: "COSMETICS",
    rarity: "UNCOMMON",
    icon: "🐉",
    price: { currency: "COINS", amount: 2000 },
    requirements: { bossDefeatId: "procrastination-dragon" },
    addedAt: Date.now(),
  },
  {
    id: "theme-demon-circus",
    name: "Demon Circus",
    description: "Chaotic circus theme for distraction demon",
    category: "COSMETICS",
    rarity: "RARE",
    icon: "🎪",
    price: { currency: "GEMS", amount: 40 },
    requirements: { bossDefeatId: "distraction-demon" },
    addedAt: Date.now(),
  },
  {
    id: "theme-legendary-sanctum",
    name: "Legendary Sanctum",
    description: "Mythical battleground for master slayers",
    category: "COSMETICS",
    rarity: "LEGENDARY",
    icon: "⚡",
    price: { currency: "GEMS", amount: 150 },
    requirements: { achievementId: "achievement-all-bosses", premiumOnly: true },
    addedAt: Date.now(),
  },
];

// ============================================================================
// Utility Category
// ============================================================================

export const UTILITY_ITEMS: ShopItem[] = [
  // Streak Insurance (backup purchase)
  {
    id: "insurance-single",
    name: "Streak Insurance",
    description: "Protect your streak once when life gets busy",
    category: "UTILITY",
    rarity: "RARE",
    icon: "🛡️",
    price: { currency: "GEMS", amount: 25 },
    addedAt: Date.now(),
  },
  {
    id: "insurance-pack-3",
    name: "Insurance Pack (3)",
    description: "3 streak insurances at a discount",
    category: "UTILITY",
    rarity: "EPIC",
    icon: "🛡️",
    price: { currency: "GEMS", amount: 60 },
    addedAt: Date.now(),
  },

  // XP Boosts
  {
    id: "xp-boost-24h",
    name: "XP Boost (24h)",
    description: "Earn 2x XP for 24 hours",
    category: "UTILITY",
    rarity: "UNCOMMON",
    icon: "⬆️",
    price: { currency: "COINS", amount: 3000 },
    addedAt: Date.now(),
  },
  {
    id: "xp-boost-3d",
    name: "XP Boost (3 Days)",
    description: "Earn 2x XP for 3 days",
    category: "UTILITY",
    rarity: "RARE",
    icon: "⬆️",
    price: { currency: "GEMS", amount: 20 },
    addedAt: Date.now(),
  },
  {
    id: "xp-boost-week",
    name: "XP Boost (Week)",
    description: "Earn 2x XP for 7 days",
    category: "UTILITY",
    rarity: "EPIC",
    icon: "⬆️",
    price: { currency: "GEMS", amount: 50 },
    addedAt: Date.now(),
  },

  // Boss Damage Boosts (single use, not pay-to-win)
  {
    id: "damage-boost-small",
    name: "Damage Boost",
    description: "Deal 1.5x damage in your next boss session",
    category: "UTILITY",
    rarity: "UNCOMMON",
    icon: "⚡",
    price: { currency: "COINS", amount: 1500 },
    addedAt: Date.now(),
  },
  {
    id: "damage-boost-large",
    name: "Major Damage Boost",
    description: "Deal 2x damage in your next boss session",
    category: "UTILITY",
    rarity: "RARE",
    icon: "⚡",
    price: { currency: "GEMS", amount: 15 },
    addedAt: Date.now(),
  },

  // Convenience Items
  {
    id: "study-slot-extra",
    name: "Extra Study Plan Slot",
    description: "Permanently unlock +1 study plan slot (Free users only)",
    category: "UTILITY",
    rarity: "EPIC",
    icon: "📚",
    price: { currency: "GEMS", amount: 100 },
    addedAt: Date.now(),
  },
];

// ============================================================================
// Premium Category (Subscription Exclusive)
// ============================================================================

export const PREMIUM_ITEMS: ShopItem[] = [
  // These are not purchasable - they come with subscription
  {
    id: "premium-avatar-frames",
    name: "Premium Avatar Frames",
    description: "Exclusive frames updated monthly for Premium members",
    category: "PREMIUM",
    rarity: "LEGENDARY",
    icon: "💎",
    price: { currency: "GEMS", amount: 0 }, // Not purchasable
    requirements: { premiumOnly: true },
    addedAt: Date.now(),
  },
  {
    id: "premium-boss-themes",
    name: "Premium Boss Themes",
    description: "Exclusive boss battle themes for Premium members",
    category: "PREMIUM",
    rarity: "LEGENDARY",
    icon: "👑",
    price: { currency: "GEMS", amount: 0 },
    requirements: { premiumOnly: true },
    addedAt: Date.now(),
  },
  {
    id: "premium-session-bg",
    name: "Premium Session Backgrounds",
    description: "New backgrounds added monthly for Premium members",
    category: "PREMIUM",
    rarity: "LEGENDARY",
    icon: "🎨",
    price: { currency: "GEMS", amount: 0 },
    requirements: { premiumOnly: true },
    addedAt: Date.now(),
  },
  {
    id: "premium-beta-access",
    name: "Beta Feature Access",
    description: "Try new features before everyone else",
    category: "PREMIUM",
    rarity: "EPIC",
    icon: "🔮",
    price: { currency: "GEMS", amount: 0 },
    requirements: { premiumOnly: true },
    addedAt: Date.now(),
  },
];

// ============================================================================
// Shop Inventory Management
// ============================================================================

const inventories = new Map<string, UserInventory>();
const allItems = [...COSMETIC_ITEMS, ...UTILITY_ITEMS, ...PREMIUM_ITEMS];

/**
 * Get all available items for user
 */
export function getAvailableItems(userId: string, isPremium: boolean): Record<ShopCategory, ShopItem[]> {
  const userInventory = getUserInventory(userId);
  const ownedIds = new Set(userInventory.items.map((i) => i.itemId));

  // Filter items user doesn't own and meets requirements
  const available = allItems.filter((item) => {
    if (ownedIds.has(item.id)) {
      return false;
    }

    // Check premium requirement
    if (item.requirements?.premiumOnly && !isPremium) {
      return false;
    }

    // Check limited time
    if (item.limitedTime) {
      const now = Date.now();
      if (now < item.limitedTime.startAt || now > item.limitedTime.endAt) {
        return false;
      }
    }

    // Check stock limit
    if (item.stockLimit && (item.purchasedCount || 0) >= item.stockLimit) {
      return false;
    }

    return true;
  });

  return {
    COSMETICS: available.filter((i) => i.category === "COSMETICS"),
    UTILITY: available.filter((i) => i.category === "UTILITY"),
    PREMIUM: isPremium ? PREMIUM_ITEMS : [],
  };
}

/**
 * Get or create user inventory
 */
export function getUserInventory(userId: string): UserInventory {
  let inventory = inventories.get(userId);
  if (!inventory) {
    inventory = {
      userId,
      items: [],
      equippedCosmetics: {
        avatarFrame: null,
        sessionBackground: null,
        bossTheme: null,
        companionSkin: null,
      },
    };
    inventories.set(userId, inventory);
  }
  return inventory;
}

/**
 * Purchase item
 */
export function purchaseItem(userId: string, itemId: string, deductCurrency: (currency: CurrencyType, amount: number) => boolean): { success: boolean; inventory?: UserInventory; error?: string } {
  const item = allItems.find((i) => i.id === itemId);
  if (!item) {
    return { success: false, error: "Item not found" };
  }

  const inventory = getUserInventory(userId);
  if (inventory.items.some((i) => i.itemId === itemId)) {
    return { success: false, error: "Item already owned" };
  }

  // Deduct currency
  const price = item.price.saleAmount || item.price.amount;
  const deducted = deductCurrency(item.price.currency, price);
  if (!deducted) {
    return { success: false, error: `Insufficient ${item.price.currency}` };
  }

  // Add to inventory
  inventory.items.push({
    itemId,
    acquiredAt: Date.now(),
    equipped: false,
    source: "SHOP_PURCHASE",
  });

  // Track purchase count for limited items
  if (item.stockLimit) {
    item.purchasedCount = (item.purchasedCount || 0) + 1;
  }

  eventBus.publish("shop:item_purchased", {
    userId,
    itemId,
    currency: item.price.currency,
    amount: price,
  });

  return { success: true, inventory };
}

/**
 * Equip cosmetic
 */
export function equipCosmetic(userId: string, itemId: string, slot: keyof UserInventory["equippedCosmetics"]): UserInventory {
  const inventory = getUserInventory(userId);
  const hasItem = inventory.items.some((i) => i.itemId === itemId);

  if (!hasItem) {
    throw new Error("User does not own this item");
  }

  // Unequip previous
  const previousId = inventory.equippedCosmetics[slot];
  if (previousId) {
    const prevItem = inventory.items.find((i) => i.itemId === previousId);
    if (prevItem) {
      prevItem.equipped = false;
    }
  }

  // Equip new
  inventory.equippedCosmetics[slot] = itemId;
  const newItem = inventory.items.find((i) => i.itemId === itemId);
  if (newItem) {
    newItem.equipped = true;
  }

  eventBus.publish("shop:cosmetic_equipped", {
    userId,
    itemId,
    slot,
  });

  return inventory;
}

/**
 * Award item from achievement/boss/etc
 */
export function awardItem(userId: string, itemId: string, source: InventoryItem["source"]): UserInventory {
  const inventory = getUserInventory(userId);
  const item = allItems.find((i) => i.id === itemId);

  if (!item) {
    throw new Error("Item not found");
  }

  if (inventory.items.some((i) => i.itemId === itemId)) {
    return inventory; // Already has it
  }

  inventory.items.push({
    itemId,
    acquiredAt: Date.now(),
    equipped: false,
    source,
  });

  (eventBus as any).publish("shop:item_awarded", {
    userId,
    itemId,
    source,
  });

  return inventory;
}

/**
 * Get equipped cosmetics
 */
export function getEquippedCosmetics(userId: string): UserInventory["equippedCosmetics"] {
  return getUserInventory(userId).equippedCosmetics;
}

/**
 * Get item by ID
 */
export function getItemById(itemId: string): ShopItem | undefined {
  return allItems.find((i) => i.id === itemId);
}

// ============================================================================
// Featured & New Items
// ============================================================================

/**
 * Get featured items
 */
export function getFeaturedItems(limit: number = 4): ShopItem[] {
  return allItems.filter((i) => i.featured && i.category !== "PREMIUM").slice(0, limit);
}

/**
 * Get new items
 */
export function getNewItems(limit: number = 6): ShopItem[] {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return allItems
    .filter((i) => i.new || i.addedAt > oneWeekAgo)
    .sort((a, b) => b.addedAt - a.addedAt)
    .slice(0, limit);
}

// ============================================================================
// Exports (types already exported above)
// ============================================================================
