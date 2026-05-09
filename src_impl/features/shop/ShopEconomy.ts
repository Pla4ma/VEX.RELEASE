/**
 * Shop Economy System
 *
 * Phase 4.2 - Shop & Economy Polish
 * Dual currency system:
 * - Coins (earned): Session rewards, boss damage, challenges
 * - Gems (premium/purchased): Premium cosmetics, insurance, convenience
 *
 * Economy Philosophy:
 * - Coins feel abundant but have meaningful sinks
 * - Gems feel scarce and valuable
 * - No pay-to-win: All gameplay achievable free
 * - Premium = convenience + cosmetics + early access
 *
 * Dependencies:
 * - Economy (currency management)
 * - Sessions (coin earning)
 * - Boss (loot/coins from damage)
 * - PremiumTierSystem (gem earning for premium)
 */

import { eventBus } from '../../events';

// ============================================================================
// Currency Types
// ============================================================================

export type CurrencyType = 'COINS' | 'GEMS';

export interface Wallet {
  userId: string;
  coins: number;
  gems: number;
  lifetimeCoins: number;
  lifetimeGems: number;
  lastUpdated: number;
}

export interface CurrencyTransaction {
  id: string;
  userId: string;
  currency: CurrencyType;
  amount: number;
  type: TransactionType;
  source: TransactionSource;
  description: string;
  createdAt: number;
}

export type TransactionType = 'EARN' | 'SPEND' | 'REFUND' | 'CONVERT' | 'BONUS';

export type TransactionSource =
  // Earn sources
  | 'SESSION_COMPLETE'
  | 'BOSS_DAMAGE'
  | 'BOSS_DEFEAT'
  | 'BOSS_BOUNTY'
  | 'STREAK_MILESTONE'
  | 'ACHIEVEMENT_UNLOCK'
  | 'CHALLENGE_COMPLETE'
  | 'DAILY_REWARD'
  | 'PURCHASE'
  | 'PREMIUM_BONUS'
  // Spend sources
  | 'SHOP_PURCHASE'
  | 'BOSS_BOUNTY_PLACE'
  | 'STREAK_INSURANCE'
  | 'XP_BOOST'
  | 'DAMAGE_BOOST'
  | 'COSMETIC_UNLOCK'
  | 'STUDY_PLAN_SLOT';

// ============================================================================
// Currency Constants
// ============================================================================

// Coin earning rates
export const COIN_EARN_RATES = {
  SESSION_BASE: 10, // Base coins per session
  SESSION_MINUTE: 1, // 1 coin per minute of focus
  QUALITY_BONUS_S: 50, // S-rank bonus
  QUALITY_BONUS_A: 30, // A-rank bonus
  QUALITY_BONUS_B: 15, // B-rank bonus
  BOSS_DAMAGE: 2, // 2 coins per damage dealt
  BOSS_DEFEAT_BONUS: 100, // Bonus for defeating boss
  BOUNTY_HIT: 25, // Bonus when bounty pays off
  STREAK_MILESTONE_3: 50,
  STREAK_MILESTONE_7: 150,
  STREAK_MILESTONE_14: 300,
  STREAK_MILESTONE_30: 1000,
  STREAK_MILESTONE_100: 5000,
  ACHIEVEMENT_COMMON: 50,
  ACHIEVEMENT_UNCOMMON: 100,
  ACHIEVEMENT_RARE: 250,
  ACHIEVEMENT_EPIC: 500,
  ACHIEVEMENT_LEGENDARY: 2000,
  DAILY_REWARD: 100,
  DAILY_STREAK_BONUS: 25, // Per day of login streak
} as const;

// Gem earning (very limited - mainly premium)
export const GEM_EARN_RATES = {
  PREMIUM_MONTHLY: 100, // Monthly gem allowance for premium
  ACHIEVEMENT_EPIC: 10,
  ACHIEVEMENT_LEGENDARY: 50,
  STREAK_MILESTONE_30: 25,
  STREAK_MILESTONE_100: 100,
  SPECIAL_EVENT: 50,
} as const;

// Exchange rate (gems to coins - intentionally poor to discourage)
export const GEM_TO_COIN_RATE = 100; // 1 gem = 100 coins

// Coin sink targets (how much we want users to spend)
export const COIN_SINK_TARGETS = {
  DAILY: 200, // Target 200 coins spent per day
  WEEKLY: 1000, // Target 1000 coins spent per week
};

// ============================================================================
// Wallet Management
// ============================================================================

const wallets = new Map<string, Wallet>();
const transactions: CurrencyTransaction[] = [];

/**
 * Get or create wallet
 */
export function getWallet(userId: string): Wallet {
  let wallet = wallets.get(userId);
  if (!wallet) {
    wallet = {
      userId,
      coins: 0,
      gems: 0,
      lifetimeCoins: 0,
      lifetimeGems: 0,
      lastUpdated: Date.now(),
    };
    wallets.set(userId, wallet);
  }
  return wallet;
}

/**
 * Add coins to wallet
 */
export function earnCoins(userId: string, amount: number, source: TransactionSource, description: string): Wallet {
  const wallet = getWallet(userId);
  wallet.coins += amount;
  wallet.lifetimeCoins += amount;
  wallet.lastUpdated = Date.now();

  recordTransaction(userId, 'COINS', amount, 'EARN', source, description);

  eventBus.publish('currency:earned', {
    userId,
    currency: 'COINS',
    amount,
    source,
    newBalance: wallet.coins,
  });

  return wallet;
}

/**
 * Add gems to wallet
 */
export function earnGems(userId: string, amount: number, source: TransactionSource, description: string): Wallet {
  const wallet = getWallet(userId);
  wallet.gems += amount;
  wallet.lifetimeGems += amount;
  wallet.lastUpdated = Date.now();

  recordTransaction(userId, 'GEMS', amount, 'EARN', source, description);

  eventBus.publish('currency:earned', {
    userId,
    currency: 'GEMS',
    amount,
    source,
    newBalance: wallet.gems,
  });

  return wallet;
}

/**
 * Spend coins
 */
export function spendCoins(userId: string, amount: number, source: TransactionSource, description: string): { success: boolean; wallet: Wallet; error?: string } {
  const wallet = getWallet(userId);

  if (wallet.coins < amount) {
    return {
      success: false,
      wallet,
      error: `Insufficient coins. Need ${amount}, have ${wallet.coins}`,
    };
  }

  wallet.coins -= amount;
  wallet.lastUpdated = Date.now();

  recordTransaction(userId, 'COINS', -amount, 'SPEND', source, description);

  eventBus.publish('currency:spent', {
    userId,
    currency: 'COINS',
    amount,
    source,
    newBalance: wallet.coins,
  });

  return { success: true, wallet };
}

/**
 * Spend gems
 */
export function spendGems(userId: string, amount: number, source: TransactionSource, description: string): { success: boolean; wallet: Wallet; error?: string } {
  const wallet = getWallet(userId);

  if (wallet.gems < amount) {
    return {
      success: false,
      wallet,
      error: `Insufficient gems. Need ${amount}, have ${wallet.gems}`,
    };
  }

  wallet.gems -= amount;
  wallet.lastUpdated = Date.now();

  recordTransaction(userId, 'GEMS', -amount, 'SPEND', source, description);

  eventBus.publish('currency:spent', {
    userId,
    currency: 'GEMS',
    amount,
    source,
    newBalance: wallet.gems,
  });

  return { success: true, wallet };
}

/**
 * Convert gems to coins (intentionally poor rate)
 */
export function convertGemsToCoins(userId: string, gemAmount: number): { success: boolean; wallet: Wallet; error?: string } {
  const wallet = getWallet(userId);

  if (wallet.gems < gemAmount) {
    return {
      success: false,
      wallet,
      error: `Insufficient gems. Need ${gemAmount}, have ${wallet.gems}`,
    };
  }

  const coinAmount = gemAmount * GEM_TO_COIN_RATE;

  wallet.gems -= gemAmount;
  wallet.coins += coinAmount;
  wallet.lastUpdated = Date.now();

  recordTransaction(userId, 'GEMS', -gemAmount, 'CONVERT', 'SHOP_PURCHASE', `Converted to ${coinAmount} coins`);
  recordTransaction(userId, 'COINS', coinAmount, 'CONVERT', 'SHOP_PURCHASE', `Converted from ${gemAmount} gems`);

  return { success: true, wallet };
}

/**
 * Record transaction
 */
function recordTransaction(userId: string, currency: CurrencyType, amount: number, type: TransactionType, source: TransactionSource, description: string): void {
  transactions.push({
    id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    currency,
    amount,
    type,
    source,
    description,
    createdAt: Date.now(),
  });
}

/**
 * Get transaction history
 */
export function getTransactionHistory(userId: string, currency?: CurrencyType, limit: number = 50): CurrencyTransaction[] {
  let userTransactions = transactions.filter((t) => t.userId === userId);

  if (currency) {
    userTransactions = userTransactions.filter((t) => t.currency === currency);
  }

  return userTransactions.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
}

// ============================================================================
// Earning Helpers
// ============================================================================

/**
 * Calculate session coins earned
 */
export function calculateSessionCoins(durationMinutes: number, qualityRank: 'S' | 'A' | 'B' | 'C' | 'D', streakMultiplier: number = 1): number {
  const base = COIN_EARN_RATES.SESSION_BASE;
  const minuteBonus = durationMinutes * COIN_EARN_RATES.SESSION_MINUTE;

  let qualityBonus = 0;
  switch (qualityRank) {
    case 'S':
      qualityBonus = COIN_EARN_RATES.QUALITY_BONUS_S;
      break;
    case 'A':
      qualityBonus = COIN_EARN_RATES.QUALITY_BONUS_A;
      break;
    case 'B':
      qualityBonus = COIN_EARN_RATES.QUALITY_BONUS_B;
      break;
  }

  const total = Math.floor((base + minuteBonus + qualityBonus) * streakMultiplier);
  return total;
}

/**
 * Calculate boss damage coins
 */
export function calculateBossDamageCoins(damageDealt: number, wasCritical: boolean = false): number {
  const base = damageDealt * COIN_EARN_RATES.BOSS_DAMAGE;
  const criticalBonus = wasCritical ? 10 : 0;
  return base + criticalBonus;
}

/**
 * Calculate streak milestone coins
 */
export function calculateStreakMilestoneCoins(days: number): { coins: number; gems: number } {
  switch (days) {
    case 3:
      return { coins: COIN_EARN_RATES.STREAK_MILESTONE_3, gems: 0 };
    case 7:
      return { coins: COIN_EARN_RATES.STREAK_MILESTONE_7, gems: 0 };
    case 14:
      return { coins: COIN_EARN_RATES.STREAK_MILESTONE_14, gems: 0 };
    case 30:
      return { coins: COIN_EARN_RATES.STREAK_MILESTONE_30, gems: GEM_EARN_RATES.STREAK_MILESTONE_30 };
    case 100:
      return { coins: COIN_EARN_RATES.STREAK_MILESTONE_100, gems: GEM_EARN_RATES.STREAK_MILESTONE_100 };
    default:
      return { coins: 0, gems: 0 };
  }
}

/**
 * Award premium monthly gems
 */
export function awardPremiumMonthlyGems(userId: string): Wallet {
  return earnGems(userId, GEM_EARN_RATES.PREMIUM_MONTHLY, 'PREMIUM_BONUS', 'Monthly premium gem allowance');
}

// ============================================================================
// Economy Analytics
// ============================================================================

export interface EconomyAnalytics {
  userId: string;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  totalGemsEarned: number;
  totalGemsSpent: number;
  netWorth: number;
  dailyAverageEarn: number;
  dailyAverageSpend: number;
  favoriteCurrency: 'COINS' | 'GEMS' | 'BOTH';
  spendingCategories: Record<string, number>;
}

/**
 * Get economy analytics for user
 */
export function getEconomyAnalytics(userId: string): EconomyAnalytics {
  const wallet = getWallet(userId);
  const userTransactions = transactions.filter((t) => t.userId === userId);

  const coinEarns = userTransactions.filter((t) => t.currency === 'COINS' && t.type === 'EARN');
  const coinSpends = userTransactions.filter((t) => t.currency === 'COINS' && t.type === 'SPEND');
  const gemEarns = userTransactions.filter((t) => t.currency === 'GEMS' && t.type === 'EARN');
  const gemSpends = userTransactions.filter((t) => t.currency === 'GEMS' && t.type === 'SPEND');

  const totalCoinsEarned = coinEarns.reduce((sum, t) => sum + t.amount, 0);
  const totalCoinsSpent = Math.abs(coinSpends.reduce((sum, t) => sum + t.amount, 0));
  const totalGemsEarned = gemEarns.reduce((sum, t) => sum + t.amount, 0);
  const totalGemsSpent = Math.abs(gemSpends.reduce((sum, t) => sum + t.amount, 0));

  // Calculate daily averages (assume 30 days of history)
  const daysActive = Math.max(1, userTransactions.length / 5); // Approximate
  const dailyAverageEarn = totalCoinsEarned / daysActive;
  const dailyAverageSpend = totalCoinsSpent / daysActive;

  // Spending by category
  const spendingCategories: Record<string, number> = {};
  for (const t of coinSpends) {
    spendingCategories[t.source] = (spendingCategories[t.source] || 0) + Math.abs(t.amount);
  }

  return {
    userId,
    totalCoinsEarned,
    totalCoinsSpent,
    totalGemsEarned,
    totalGemsSpent,
    netWorth: wallet.coins + wallet.gems * GEM_TO_COIN_RATE,
    dailyAverageEarn,
    dailyAverageSpend,
    favoriteCurrency: totalGemsEarned > totalCoinsEarned / 10 ? 'GEMS' : totalCoinsEarned > 0 ? 'COINS' : 'BOTH',
    spendingCategories,
  };
}

// ============================================================================
// Economy Balance Checks
// ============================================================================

/**
 * Check if economy is balanced for user
 */
export function checkEconomyBalance(userId: string): {
  isBalanced: boolean;
  issues: string[];
  recommendations: string[];
} {
  const analytics = getEconomyAnalytics(userId);
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check if user is earning too much vs spending (inflation)
  const spendRatio = analytics.totalCoinsSpent / Math.max(1, analytics.totalCoinsEarned);
  if (spendRatio < 0.3) {
    issues.push('Low spend ratio - user is accumulating too many coins');
    recommendations.push('Introduce more compelling coin sinks');
    recommendations.push('Offer limited-time exclusive items');
  }

  // Check if user is spending too much (deflation)
  if (spendRatio > 0.9) {
    issues.push('High spend ratio - user may run out of coins');
    recommendations.push('Increase coin rewards slightly');
    recommendations.push('Offer coin bonus events');
  }

  // Check gem scarcity
  if (analytics.totalGemsEarned > analytics.totalGemsSpent * 2) {
    issues.push('User accumulating gems without spending');
    recommendations.push('Show premium cosmetic previews');
    recommendations.push('Offer gem-exclusive limited items');
  }

  return {
    isBalanced: issues.length === 0,
    issues,
    recommendations,
  };
}

// ============================================================================
// Exports
// ============================================================================
// Exports (types already exported above)
// ============================================================================
