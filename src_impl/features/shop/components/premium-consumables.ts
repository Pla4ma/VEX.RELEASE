/**
 * Premium Consumables - Phase 5.5
 *
 * New high-value consumable items added to the economy:
 * - Void Fragment (RARE, 25 gems): 50 extra boss damage
 * - Focus Crystal (UNCOMMON, 15 gems): Reduces purity threshold by 10
 * - Chain Breaker (RARE, 30 gems): Restores broken SPRINT chain
 *
 * These items appear in:
 * 1. Shop rotating weekly section
 * 2. Variable reward chest drops (adds excitement to chest opens)
 * 3. Special event rewards
 *
 * @phase 5.5
 */

import type { ItemDefinition } from "../../items/schemas";

// ============================================================================
// Premium Consumable Definitions
// ============================================================================

export const PREMIUM_CONSUMABLES: ItemDefinition[] = [
  {
    id: "void-fragment",
    name: "Void Fragment",
    description: "A shard of pure void energy. Deals 50 extra boss damage in your next session, regardless of session quality.",
    type: "CONSUMABLE",
    rarity: "RARE",
    iconUrl: null,
    animationUrl: null,
    stackable: true,
    maxStackSize: 99,
    unique: false,
    tradable: false,
    maxUses: 1,
    effects: [
      {
        type: "BONUS_DAMAGE",
        value: 50,
        duration: 0,
        durationUnit: "SESSIONS",
        target: "SELF",
      },
    ],
    equipmentSlot: null,
    passiveEffects: [],
    craftingRecipe: null,
    baseValue: 100, // Sell value in coins
    shopPrice: {
      currency: "GEMS",
      amount: 25,
    },
    requiredLevel: 5,
    requiredItems: [],
    tags: ["premium", "boss", "combat", "phase-5.5"],
    category: "combat",
    isAvailable: true,
    availableFrom: null,
    availableUntil: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "focus-crystal",
    name: "Focus Crystal",
    description: "A crystal that resonates with focus energy. Reduces the purity threshold needed to pass your next session by 10 points.",
    type: "CONSUMABLE",
    rarity: "UNCOMMON",
    iconUrl: null,
    animationUrl: null,
    stackable: true,
    maxStackSize: 99,
    unique: false,
    tradable: true,
    maxUses: 1,
    effects: [
      {
        type: "FOCUS_ENHANCEMENT",
        value: 10, // Reduces purity threshold by 10
        duration: 0,
        durationUnit: "SESSIONS",
        target: "SELF",
      },
    ],
    equipmentSlot: null,
    passiveEffects: [],
    craftingRecipe: null,
    baseValue: 50,
    shopPrice: {
      currency: "GEMS",
      amount: 15,
    },
    requiredLevel: 3,
    requiredItems: [],
    tags: ["premium", "focus", "utility", "phase-5.5"],
    category: "utility",
    isAvailable: true,
    availableFrom: null,
    availableUntil: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "chain-breaker",
    name: "Chain Breaker",
    description: "A mystical link that can repair broken chains. Instantly restores your SPRINT chain to its previous state if it breaks.",
    type: "CONSUMABLE",
    rarity: "RARE",
    iconUrl: null,
    animationUrl: null,
    stackable: true,
    maxStackSize: 20, // Lower stack limit due to power
    unique: false,
    tradable: false,
    maxUses: 1,
    effects: [
      {
        type: "STREAK_PROTECTION",
        value: 1, // Restores one chain break
        duration: 0,
        durationUnit: "SECONDS",
        target: "SELF",
      },
    ],
    equipmentSlot: null,
    passiveEffects: [],
    craftingRecipe: null,
    baseValue: 200,
    shopPrice: {
      currency: "GEMS",
      amount: 30,
    },
    requiredLevel: 8,
    requiredItems: [],
    tags: ["premium", "sprint", "recovery", "phase-5.5"],
    category: "recovery",
    isAvailable: true,
    availableFrom: null,
    availableUntil: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

// ============================================================================
// Drop Table Integration
// ============================================================================

/**
 * These items are added to variable reward chest drop tables
 * to add excitement to chest opens
 */
export const PREMIUM_CONSUMABLE_DROP_WEIGHTS = {
  "void-fragment": {
    weight: 5, // Rare drop
    minQuantity: 1,
    maxQuantity: 2,
    chestTiers: ["GOLD", "EPIC", "LEGENDARY"],
  },
  "focus-crystal": {
    weight: 15, // Uncommon drop
    minQuantity: 1,
    maxQuantity: 3,
    chestTiers: ["SILVER", "GOLD", "EPIC", "LEGENDARY"],
  },
  "chain-breaker": {
    weight: 8, // Rare drop
    minQuantity: 1,
    maxQuantity: 1,
    chestTiers: ["GOLD", "EPIC", "LEGENDARY"],
  },
} as const;

// ============================================================================
// Shop Integration
// ============================================================================

/**
 * Shop display configuration for rotating weekly section
 */
export const PREMIUM_CONSUMABLE_SHOP_CONFIG = {
  // Appear in rotating weekly section
  rotatingWeekly: true,

  // Maximum times shown per week per user
  maxAppearancesPerWeek: 2,

  // Discounts during special events
  eventDiscountPercent: 20,

  // Bundle deals
  bundles: [
    {
      name: "Boss Slayer Pack",
      items: ["void-fragment", "void-fragment", "void-fragment"],
      price: { currency: "GEMS", amount: 60 }, // 15% discount from 75
      availableDuringBossEvents: true,
    },
    {
      name: "Focus Mastery Set",
      items: ["focus-crystal", "focus-crystal", "focus-crystal", "focus-crystal", "focus-crystal"],
      price: { currency: "GEMS", amount: 60 }, // 20% discount from 75
      availableAlways: true,
    },
  ],
} as const;

// ============================================================================
// Usage Effects
// ============================================================================

/**
 * Effect handlers for when these consumables are used
 * These would be wired up to the actual game systems
 */
export interface ConsumableEffectHandlers {
  // Void Fragment: Add 50 flat damage to next boss encounter
  applyVoidFragment: (userId: string) => Promise<boolean>;

  // Focus Crystal: Reduce purity threshold for next session
  applyFocusCrystal: (userId: string) => Promise<boolean>;

  // Chain Breaker: Restore broken SPRINT chain
  applyChainBreaker: (userId: string, chainProgress: number) => Promise<boolean>;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get item definition by ID
 */
export function getPremiumConsumableDefinition(itemId: string): ItemDefinition | undefined {
  return PREMIUM_CONSUMABLES.find((item) => item.id === itemId);
}

/**
 * Check if item is a premium Phase 5.5 consumable
 */
export function isPremiumConsumable(itemId: string): boolean {
  return PREMIUM_CONSUMABLES.some((item) => item.id === itemId);
}

/**
 * Get all premium consumable IDs
 */
export function getPremiumConsumableIds(): string[] {
  return PREMIUM_CONSUMABLES.map((item) => item.id);
}

/**
 * Get shop price for a premium consumable
 */
export function getPremiumConsumablePrice(itemId: string): { currency: "COINS" | "GEMS"; amount: number } | null {
  const item = PREMIUM_CONSUMABLES.find((i) => i.id === itemId);
  return item?.shopPrice ?? null;
}
