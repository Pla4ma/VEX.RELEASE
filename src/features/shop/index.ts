/**
 * Shop Feature
 * Export all shop-related modules
 */

// Hooks
export * from './hooks';

// Components
export { ShopScreen } from './components/shop-screen';
export * from './components';

// Flash Sale System
export * from './FlashSaleSystem';

// PHASE 5.5: Premium Consumables
export {
  PREMIUM_CONSUMABLES,
  PREMIUM_CONSUMABLE_DROP_WEIGHTS,
  PREMIUM_CONSUMABLE_SHOP_CONFIG,
  getPremiumConsumableDefinition,
  isPremiumConsumable,
  getPremiumConsumableIds,
  getPremiumConsumablePrice,
  type ConsumableEffectHandlers,
} from './components/premium-consumables';

// Phase 4.2 - Shop Economy & Categories
export {
  COIN_EARN_RATES,
  GEM_EARN_RATES,
  GEM_TO_COIN_RATE,
  getWallet,
  earnCoins,
  earnGems,
  spendCoins,
  spendGems,
  convertGemsToCoins,
  getTransactionHistory,
  calculateSessionCoins,
  calculateBossDamageCoins,
  calculateStreakMilestoneCoins,
  awardPremiumMonthlyGems,
  getEconomyAnalytics,
  checkEconomyBalance,
  type Wallet,
  type CurrencyTransaction,
  type TransactionType,
  type TransactionSource,
  type EconomyAnalytics,
  type CurrencyType,
} from './ShopEconomy';

export {
  COSMETIC_ITEMS,
  UTILITY_ITEMS,
  PREMIUM_ITEMS,
  getAvailableItems,
  getUserInventory,
  purchaseItem,
  equipCosmetic,
  awardItem,
  getEquippedCosmetics,
  getItemById,
  getFeaturedItems,
  getNewItems,
  type ShopItem,
  type UserInventory,
  type InventoryItem,
  type ShopCategory,
  type ItemRarity,
} from './ShopCategories';
