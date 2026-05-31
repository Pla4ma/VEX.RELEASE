/**
 * Economy Event Definitions
 *
 * Event interfaces for the economy system: grants, spends, transactions,
 * currency tracking, and purchase completions.
 */

export type EconomyEventType =
  | 'economy:grant'
  | 'economy:spend'
  | 'economy:transaction'
  | 'economy:currency_added'
  | 'economy:currency_spent'
  | 'economy:conversion'
  | 'economy:purchase_complete';

export interface EconomyGrantEvent {
  userId: string;
  currency: 'coins' | 'gems' | 'seasonal';
  amount: number;
  source:
    | 'session'
    | 'boss_defeat'
    | 'level_up'
    | 'challenge'
    | 'daily_bonus'
    | string;
  sourceId?: string;
  multiplier?: number;
  metadata?: Record<string, unknown>;
}

export interface EconomySpendEvent {
  userId: string;
  currency: 'coins' | 'gems' | 'seasonal';
  amount: number;
  sink: 'shop' | 'crafting' | 'gamble' | string;
  itemId?: string;
  remainingBalance: number;
}

export interface EconomyTransactionEvent {
  userId: string;
  type: 'earn' | 'spend' | 'convert' | 'refund';
  currency: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  source: string;
  timestamp: number;
}

export interface EconomyPurchaseCompleteEvent {
  userId: string;
  purchaseId: string;
  itemId: string;
  price: { currency: string; amount: number };
  inventoryItemIds: string[];
  timestamp: number;
}
