import { capture } from '../../shared/analytics/analytics-service';

export function trackProductRemovedFromCart(
  userId: string,
  productId: string,
  productName: string,
  quantity: number,
  removedAt: Date,
  reason: 'change_mind' | 'budget' | 'found_better' | 'technical' | 'timeout',
  context: {
    timeInCart: number;
    priceChange: boolean;
    stockChange: boolean;
    alternative: string;
  },
  impact: {
    cartValue: number;
    budgetImpact: number;
    satisfaction: number;
  },
): void {
  capture('shop_product_removed_from_cart', {
    user_id: userId,
    product_id: productId,
    product_name: productName,
    quantity,
    removed_at: removedAt.toISOString(),
    reason,
    context,
    impact,
  });
}

export function trackProductWishlisted(
  userId: string,
  productId: string,
  productName: string,
  productType: string,
  wishlistedAt: Date,
  reason: 'future_purchase' | 'price_drop' | 'budget' | 'research' | 'gift',
  context: {
    price: number;
    discount: number;
    stock: string;
    urgency: string;
  },
  notification: {
    priceAlert: boolean;
    stockAlert: boolean;
    promotionAlert: boolean;
  },
): void {
  capture('shop_product_wishlisted', {
    user_id: userId,
    product_id: productId,
    product_name: productName,
    product_type: productType,
    wishlisted_at: wishlistedAt.toISOString(),
    reason,
    context,
    notification,
  });
}

// ============================================================================
// CART ANALYTICS
// ============================================================================

export function trackCartUpdated(
  userId: string,
  updateType: 'add' | 'remove' | 'modify' | 'clear' | 'restore',
  updatedAt: Date,
  items: {
    productId: string;
    quantity: number;
    price: number;
    change: string;
  }[],
  totals: {
    subtotal: number;
    tax: number;
    shipping: number;
    discounts: number;
    total: number;
  },
  context: {
    promotion?: string;
    currency: string;
    location: string;
  },
): void {
  capture('shop_cart_updated', {
    user_id: userId,
    update_type: updateType,
    updated_at: updatedAt.toISOString(),
    items,
    totals,
    context,
  });
}

export function trackCartAbandoned(
  userId: string,
  abandonedAt: Date,
  abandonmentReason: 'timeout' | 'price' | 'technical' | 'distraction' | 'decision',
  cartValue: number,
  itemCount: number,
  timeSinceLastActivity: number,
  context: {
    sessionDuration: number;
    pageViews: number;
    interactions: number;
  },
  recovery: {
    possible: boolean;
    methods: string[];
    incentives: unknown[];
    timeframe: number;
  },
): void {
  capture('shop_cart_abandoned', {
    user_id: userId,
    abandoned_at: abandonedAt.toISOString(),
    abandonment_reason: abandonmentReason,
    cart_value: cartValue,
    item_count: itemCount,
    time_since_last_activity: timeSinceLastActivity,
    context,
    recovery,
  });
}

export function trackCartRecovered(
  userId: string,
  recoveredAt: Date,
  recoveryMethod: 'email' | 'notification' | 'promotion' | 'return_visit',
  originalAbandonment: Date,
  timeSinceAbandonment: number,
  incentive: {
    type: string;
    value: number;
    accepted: boolean;
  },
  outcome: {
    purchased: boolean;
    conversionTime: number;
    finalValue: number;
  },
): void {
  capture('shop_cart_recovered', {
    user_id: userId,
    recovered_at: recoveredAt.toISOString(),
    recovery_method: recoveryMethod,
    original_abandonment: originalAbandonment.toISOString(),
    time_since_abandonment: timeSinceAbandonment,
    incentive,
    outcome,
  });
}

// ============================================================================
// TRANSACTION ANALYTICS
// ============================================================================

