/**
 * Economy Achievements (3)
 *
 * Achievements related to economy and crafting.
 */

import type { Achievement } from "../types";
import { RARITY_CONFIG } from "./rarity-config";

export const ECONOMY_ACHIEVEMENTS: Achievement[] = [
  {
    id: "econ-spend-1000",
    title: "Big Spender",
    description: "Spend 1,000 coins",
    category: "ECONOMY",
    rarity: "UNCOMMON",
    icon: "💸",
    isHidden: false,
    isDeprecated: true,
    progressMax: 1000,
    unlockCondition: {
      type: "COINS_SPENT",
      target: 1000,
      comparator: "CUMULATIVE",
    },
    pointValue: RARITY_CONFIG.UNCOMMON.points,
    reward: { coins: 0, xp: 300 },
    shareText: "Spent 1000 coins! Investment in excellence 💸",
    unlockRate: 0.55,
  },
  {
    id: "econ-craft-first",
    title: "Craftsman",
    description: "Craft your first item",
    category: "ECONOMY",
    rarity: "UNCOMMON",
    icon: "🔨",
    isHidden: false,
    isDeprecated: true,
    progressMax: 1,
    unlockCondition: {
      type: "ITEM_CRAFT",
      target: 1,
      comparator: "GREATER_THAN",
    },
    pointValue: RARITY_CONFIG.UNCOMMON.points,
    reward: { coins: 200, xp: 400 },
    shareText: "Crafted my first item! DIY king 🔨",
    unlockRate: 0.4,
  },
  {
    id: "econ-own-5",
    title: "Collector",
    description: "Own 5 items simultaneously",
    category: "ECONOMY",
    rarity: "RARE",
    icon: "🎒",
    isHidden: false,
    isDeprecated: true,
    progressMax: 5,
    unlockCondition: {
      type: "ITEMS_OWNED",
      target: 5,
      comparator: "GREATER_THAN",
    },
    pointValue: RARITY_CONFIG.RARE.points,
    reward: { coins: 400, xp: 800, badge: "Collector" },
    shareText: "5 items in my collection! Hoarder? Maybe 🎒",
    unlockRate: 0.25,
  },
];
