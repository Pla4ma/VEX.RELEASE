/**
 * Shop Feature Analytics
 *
 * Comprehensive analytics tracking for in-game shop, virtual economy, and marketplace features.
 */
// ============================================================================
// SHOP LIFECYCLE ANALYTICS
// ============================================================================
import { capture } from '../../shared/analytics/analytics-service';

export function trackShopVisited(
  userId: string,
  shopId: string,
  shopType: string,
  visitType: 'browse' | 'search' | 'specific' | 'promotion',
  context: {
    source: string;
    campaign?: string;
    referral?: string;
    previousVisit?: Date;
  },
  expectations: {
    budget: number;
    categories: string[];
    urgency: string;
    decisionTime: number;
  },
): void {
  capture('shop_visited', {
    user_id: userId,
    shop_id: shopId,
    shop_type: shopType,
    visit_type: visitType,
    context: {
      ...context,
      previous_visit: context.previousVisit?.toISOString(),
    },
    expectations,
  });
}

export function trackShopViewed(
  userId: string,
  shopId: string,
  viewDuration: number,
  sections: {
    section: string;
    timeSpent: number;
    interactions: number;
    itemsViewed: number;
  }[],
  interactions: {
    searches: number;
    filters: number;
    sorts: number;
    comparisons: number;
    shares: number;
  },
  context: {
    device: string;
    location?: string;
    sessionDuration: number;
  },
): void {
  capture('shop_viewed', {
    user_id: userId,
    shop_id: shopId,
    view_duration: viewDuration,
    sections,
    interactions,
    context,
  });
}

export function trackShopLeft(
  userId: string,
  shopId: string,
  leftAt: Date,
  totalDuration: number,
  reason: 'purchase' | 'no_purchase' | 'timeout' | 'error' | 'interruption',
  outcomes: {
    itemsViewed: number;
    itemsAdded: number;
    itemsPurchased: number;
    totalValue: number;
    satisfaction: number;
  },
  nextActions: {
    returnIntent: string;
    timeframe: string;
    reasons: string[];
  },
): void {
  capture('shop_left', {
    user_id: userId,
    shop_id: shopId,
    left_at: leftAt.toISOString(),
    total_duration: totalDuration,
    reason,
    outcomes,
    next_actions: nextActions,
  });
}

// ============================================================================
// PRODUCT ANALYTICS
// ============================================================================

export function trackProductViewed(
  userId: string,
  productId: string,
  productName: string,
  productType: string,
  viewDuration: number,
  context: {
    source: string;
    position: number;
    listType: string;
    searchTerm?: string;
  },
  interactions: {
    imagesViewed: number;
    videosWatched: number;
    reviewsRead: number;
    detailsExpanded: string[];
    comparisons: number;
  },
  engagement: {
    addToCart: boolean;
    wishlist: boolean;
    share: boolean;
    inquiry: boolean;
  },
): void {
  capture('shop_product_viewed', {
    user_id: userId,
    product_id: productId,
    product_name: productName,
    product_type: productType,
    view_duration: viewDuration,
    context,
    interactions,
    engagement,
  });
}

export function trackProductAddedToCart(
  userId: string,
  productId: string,
  productName: string,
  quantity: number,
  price: number,
  currency: string,
  context: {
    source: string;
    position: number;
    promotion?: string;
    bundle?: boolean;
  },
  cartState: {
    previousItems: number;
    currentItems: number;
    totalValue: number;
    budgetRemaining: number;
  },
  decision: {
    timeToDecision: number;
    alternatives: string[];
    confidence: number;
  },
): void {
  capture('shop_product_added_to_cart', {
    user_id: userId,
    product_id: productId,
    product_name: productName,
    quantity,
    price,
    currency,
    context,
    cart_state: cartState,
    decision,
  });
}

