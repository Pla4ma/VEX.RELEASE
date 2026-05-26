import { capture } from '../../shared/analytics/analytics-service';

export function trackRecommendationFeedback(
  userId: string,
  recommendationId: string,
  productId: string,
  feedbackType: 'positive' | 'negative' | 'neutral' | 'irrelevant',
  feedbackAt: Date,
  reasons: string[],
  rating?: number,
  comment?: string,
  context?: {
    purchased: boolean;
    alternative: string;
    expectation: string;
  },
): void {
  capture('shop_recommendation_feedback', {
    user_id: userId,
    recommendation_id: recommendationId,
    product_id: productId,
    feedback_type: feedbackType,
    feedback_at: feedbackAt.toISOString(),
    rating,
    comment,
    reasons,
    context,
  });
}

// ============================================================================
// DASHBOARD ANALYTICS
// ============================================================================

export function trackShopDashboardViewed(
  userId: string,
  dashboardType: 'overview' | 'products' | 'transactions' | 'promotions' | 'analytics',
  filters: {
    timeframe: string;
    category: string[];
    status: string[];
  },
  interactions: {
    viewDuration: number;
    interactions: string[];
    exports: string[];
    shares: string[];
  },
  context: {
    device: string;
    location?: string;
    role: string;
  },
): void {
  capture('shop_dashboard_viewed', {
    user_id: userId,
    dashboard_type: dashboardType,
    filters,
    interactions,
    context,
  });
}

// ============================================================================
// USER PROPERTIES
// ============================================================================

export function trackShopUserProperties(
  userId: string,
  userProperties: {
    totalPurchases: number;
    totalSpent: number;
    averageOrderValue: number;
    favoriteCategory: string;
    preferredPaymentMethod: string;
    cartAbandonmentRate: number;
    conversionRate: number;
    itemsPerOrder: number;
    lastPurchaseDate?: Date;
    loyaltyStatus: string;
    discountUsageRate: number;
  },
): void {
  capture('shop_user_properties', {
    user_id: userId,
    total_purchases: userProperties.totalPurchases,
    total_spent: userProperties.totalSpent,
    average_order_value: userProperties.averageOrderValue,
    favorite_category: userProperties.favoriteCategory,
    preferred_payment_method: userProperties.preferredPaymentMethod,
    cart_abandonment_rate: userProperties.cartAbandonmentRate,
    conversion_rate: userProperties.conversionRate,
    items_per_order: userProperties.itemsPerOrder,
    last_purchase_date: userProperties.lastPurchaseDate?.toISOString(),
    loyalty_status: userProperties.loyaltyStatus,
    discount_usage_rate: userProperties.discountUsageRate,
  });
}

// ============================================================================
// ERROR TRACKING
// ============================================================================

export function trackShopError(
  userId: string,
  errorType: 'inventory_error' | 'payment_error' | 'pricing_error' | 'system_error',
  errorCode: string,
  errorMessage: string,
  context: {
    service: string;
    operation: string;
    userId: string;
    transactionId?: string;
    productId?: string;
  },
): void {
  capture('shop_error', {
    user_id: userId,
    error_type: errorType,
    error_code: errorCode,
    error_message: errorMessage,
    error_context: context,
  });
}

// ============================================================================
// FUNNEL ANALYTICS
// ============================================================================

export function trackShopFunnel(userId: string, step: 'shop_visited' | 'product_viewed' | 'added_to_cart' | 'checkout_started' | 'purchase_completed' | 'repeat_purchase'): void {
  capture('shop_funnel', {
    user_id: userId,
    funnel_step: step,
  });
}
