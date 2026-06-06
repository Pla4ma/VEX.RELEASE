/**
 * @deprecated BLOCKED by VEX Phase 14. Old economy event definitions for COINS/GEMS/SEASONAL currency.
 * Kept for event payload type compatibility only. No new code should publish these events.
 */
/**
 * Economy Events
 */

export interface EconomyEventDefinitions {
  'economy:add-currency': {
    userId: string;
    type: 'COINS' | 'GEMS' | 'SEASONAL';
    amount: number;
    source: string;
  };
  'economy:add_currency': {
    userId: string;
    type: 'COINS' | 'GEMS' | 'SEASONAL';
    amount: number;
    source: string;
  };
  'economy:currency_added': {
    userId: string;
    currency: string;
    amount: number;
    source: string;
    newBalance: number;
  };
  'economy:currency_spent': {
    userId: string;
    currency: string;
    amount: number;
    description: string;
    newBalance: number;
  };
  'economy:purchase': {
    userId: string;
    itemId: string;
    price: { currency: 'COINS' | 'GEMS' | 'SEASONAL'; amount: number };
  };
  'economy:milestone_achieved': {
    userId: string;
    milestoneId: string;
    totalEarned: number;
    currency: string;
  };
  'economy:insurance_purchased': {
    userId: string;
    insuranceId: string;
    costGems: number;
    expiresAt: number;
    streakDaysAtPurchase: number;
  };
  'economy:insurance_consumed': {
    userId: string;
    insuranceId: string;
    restoredStreakDays: number;
    streakDaysAtPurchase: number;
  };
  'economy:wager_placed': {
    userId: string;
    wagerId: string;
    wagerType: 'SESSIONS_THIS_WEEK' | 'STREAK_DAYS';
    betAmount: number;
    currency: 'COINS' | 'GEMS';
    target: number;
    potentialWin: number;
  };
  'economy:wager_won': {
    userId: string;
    wagerId: string;
    wonAmount: number;
  };
  'economy:wager_lost': {
    userId: string;
    wagerId: string;
    refundAmount: number;
  };
  'economy:wager_resolved': {
    userId: string;
    wagerId: string;
    outcome: 'WIN' | 'LOSS';
    coinsEarned: number;
  };
  'economy:boss_bounty_placed': {
    userId: string;
    encounterId: string;
    costCoins: number;
    stackCount: number;
    lootMultiplier: number;
  };
  'economy:grant': {
    userId: string;
    currency: string;
    amount: number;
    source: string;
    sourceId?: string;
  };
  'economy:transaction': {
    userId: string;
    currency: string;
    amount: number;
    type: 'earn' | 'spend';
    source: string;
    itemId?: string;
  };
  'cosmetics:unlock_theme': {
    userId: string;
    themeId: string;
    source: string;
  };
}
