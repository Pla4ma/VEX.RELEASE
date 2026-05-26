/**
 * @deprecated BLOCKED by VEX Phase 14. Old economy event definitions.
 * Kept for event payload type compatibility only. No new code should publish these events.
 */
/**
 * Shop Events
 */

export interface ShopEventDefinitions {
  'shop:purchase': {
    userId: string;
    itemId: string;
    price: { currency: 'COINS' | 'GEMS' | 'SEASONAL' | 'FOCUS_POINTS'; amount: number };
  };
  'shop:item_purchased': {
    userId: string;
    itemId: string;
    price?: number;
    currency?: string;
    [key: string]: unknown;
  };
  'shop:cosmetic_equipped': {
    userId: string;
    itemId: string;
    slot: string;
  };
  'shop:item_awarded': {
    userId: string;
    itemId: string;
    reason: string;
    source?: string;
  };
  'currency:earned': {
    userId: string;
    currency: string;
    amount: number;
    source: string;
    newBalance?: number;
    [key: string]: unknown;
  };
  'currency:spent': {
    userId: string;
    currency: string;
    amount: number;
    itemId?: string;
    source?: string;
    newBalance?: number;
    [key: string]: unknown;
  };
}
