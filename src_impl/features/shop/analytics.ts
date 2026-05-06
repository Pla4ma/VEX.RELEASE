/**
 * Shop Feature Analytics
 *
 * Comprehensive analytics tracking for in-game shop, virtual economy, and marketplace features.
 */

import { capture } from "../../shared/analytics/analytics-service";

// ============================================================================
// SHOP LIFECYCLE ANALYTICS
// ============================================================================

export function trackShopVisited(
  userId: string,
  shopId: string,
  shopType: string,
  visitType: "browse" | "search" | "specific" | "promotion",
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
  capture("shop_visited", {
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
  capture("shop_viewed", {
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
  reason: "purchase" | "no_purchase" | "timeout" | "error" | "interruption",
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
  capture("shop_left", {
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
  capture("shop_product_viewed", {
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
  capture("shop_product_added_to_cart", {
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

export function trackProductRemovedFromCart(
  userId: string,
  productId: string,
  productName: string,
  quantity: number,
  removedAt: Date,
  reason: "change_mind" | "budget" | "found_better" | "technical" | "timeout",
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
  capture("shop_product_removed_from_cart", {
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
  reason: "future_purchase" | "price_drop" | "budget" | "research" | "gift",
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
  capture("shop_product_wishlisted", {
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
  updateType: "add" | "remove" | "modify" | "clear" | "restore",
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
  capture("shop_cart_updated", {
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
  abandonmentReason: "timeout" | "price" | "technical" | "distraction" | "decision",
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
  capture("shop_cart_abandoned", {
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
  recoveryMethod: "email" | "notification" | "promotion" | "return_visit",
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
  capture("shop_cart_recovered", {
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

export function trackPurchaseInitiated(
  userId: string,
  transactionId: string,
  initiatedAt: Date,
  items: {
    productId: string;
    quantity: number;
    price: number;
    discount: number;
  }[],
  totals: {
    subtotal: number;
    tax: number;
    shipping: number;
    discounts: number;
    total: number;
  },
  payment: {
    method: string;
    currency: string;
    installments?: number;
  },
  context: {
    device: string;
    location: string;
    sessionDuration: number;
  },
): void {
  capture("shop_purchase_initiated", {
    user_id: userId,
    transaction_id: transactionId,
    initiated_at: initiatedAt.toISOString(),
    items,
    totals,
    payment,
    context,
  });
}

export function trackPurchaseCompleted(
  userId: string,
  transactionId: string,
  completedAt: Date,
  completionTime: number,
  status: "success" | "failed" | "pending" | "cancelled",
  items: {
    productId: string;
    quantity: number;
    price: number;
    discount: number;
    finalPrice: number;
  }[],
  totals: {
    subtotal: number;
    tax: number;
    shipping: number;
    discounts: number;
    total: number;
  },
  payment: {
    method: string;
    status: string;
    gateway: string;
    transactionReference?: string;
  },
  delivery: {
    method: string;
    estimated: Date;
    tracking?: string;
  },
): void {
  capture("shop_purchase_completed", {
    user_id: userId,
    transaction_id: transactionId,
    completed_at: completedAt.toISOString(),
    completion_time: completionTime,
    status,
    items,
    totals,
    payment,
    delivery: {
      ...delivery,
      estimated: delivery.estimated.toISOString(),
    },
  });
}

export function trackPurchaseFailed(
  userId: string,
  transactionId: string,
  failedAt: Date,
  failureReason: string,
  failureType: "payment" | "inventory" | "technical" | "validation" | "fraud",
  errorCode: string,
  errorMessage: string,
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[],
  context: {
    paymentMethod: string;
    gateway: string;
    attempts: number;
  },
  recovery: {
    retryable: boolean;
    alternatives: string[];
    recommendations: string[];
  },
): void {
  capture("shop_purchase_failed", {
    user_id: userId,
    transaction_id: transactionId,
    failed_at: failedAt.toISOString(),
    failure_reason: failureReason,
    failure_type: failureType,
    error_code: errorCode,
    error_message: errorMessage,
    items,
    context,
    recovery,
  });
}

export function trackPurchaseRefunded(
  userId: string,
  transactionId: string,
  refundId: string,
  refundedAt: Date,
  refundReason: string,
  refundType: "full" | "partial" | "exchange" | "store_credit",
  amount: number,
  items: {
    productId: string;
    quantity: number;
    refundAmount: number;
    reason: string;
  }[],
  processing: {
    time: number;
    method: string;
    status: string;
  },
  impact: {
    customerSatisfaction: number;
    futurePurchases: string;
    feedback: string;
  },
): void {
  capture("shop_purchase_refunded", {
    user_id: userId,
    transaction_id: transactionId,
    refund_id: refundId,
    refunded_at: refundedAt.toISOString(),
    refund_reason: refundReason,
    refund_type: refundType,
    amount,
    items,
    processing,
    impact,
  });
}

// ============================================================================
// PROMOTION ANALYTICS
// ============================================================================

export function trackPromotionViewed(
  userId: string,
  promotionId: string,
  promotionName: string,
  promotionType: string,
  viewDuration: number,
  context: {
    source: string;
    position: number;
    relevance: number;
  },
  engagement: {
    clicked: boolean;
    shared: boolean;
    saved: boolean;
    used: boolean;
  },
  details: {
    discount: number;
    conditions: string[];
    validity: string;
    urgency: string;
  },
): void {
  capture("shop_promotion_viewed", {
    user_id: userId,
    promotion_id: promotionId,
    promotion_name: promotionName,
    promotion_type: promotionType,
    view_duration: viewDuration,
    context,
    engagement,
    details,
  });
}

export function trackPromotionApplied(
  userId: string,
  promotionId: string,
  promotionName: string,
  appliedAt: Date,
  discount: {
    type: string;
    value: number;
    savings: number;
  },
  transactionId?: string,
  context?: {
    items: string[];
    conditions: string[];
    eligibility: boolean;
  },
  impact?: {
    cartValue: number;
    conversion: boolean;
    satisfaction: number;
  },
): void {
  capture("shop_promotion_applied", {
    user_id: userId,
    promotion_id: promotionId,
    promotion_name: promotionName,
    applied_at: appliedAt.toISOString(),
    transaction_id: transactionId,
    discount,
    context,
    impact,
  });
}

export function trackPromotionExpired(
  userId: string,
  promotionId: string,
  promotionName: string,
  expiredAt: Date,
  reason: "time" | "usage_limit" | "budget" | "manual" | "technical",
  usage: {
    totalUses: number;
    uniqueUsers: number;
    totalSavings: number;
    conversionRate: number;
  },
  performance: {
    effectiveness: number;
    efficiency: number;
    roi: number;
  },
  insights: {
    successes: string[];
    failures: string[];
    improvements: string[];
  },
): void {
  capture("shop_promotion_expired", {
    user_id: userId,
    promotion_id: promotionId,
    promotion_name: promotionName,
    expired_at: expiredAt.toISOString(),
    reason,
    usage,
    performance,
    insights,
  });
}

// ============================================================================
// RECOMMENDATION ANALYTICS
// ============================================================================

export function trackRecommendationViewed(
  userId: string,
  recommendationId: string,
  recommendationType: string,
  viewedAt: Date,
  products: {
    productId: string;
    position: number;
    relevance: number;
    viewed: boolean;
  }[],
  context: {
    algorithm: string;
    dataPoints: string[];
    confidence: number;
  },
  engagement: {
    clicked: number;
    addedToCart: number;
    purchased: number;
    ignored: number;
  },
): void {
  capture("shop_recommendation_viewed", {
    user_id: userId,
    recommendation_id: recommendationId,
    recommendation_type: recommendationType,
    viewed_at: viewedAt.toISOString(),
    products,
    context,
    engagement,
  });
}

export function trackRecommendationClicked(
  userId: string,
  recommendationId: string,
  productId: string,
  position: number,
  clickedAt: Date,
  context: {
    algorithm: string;
    relevance: number;
    factors: string[];
  },
  outcome: {
    addedToCart: boolean;
    purchased: boolean;
    timeToAction: number;
  },
): void {
  capture("shop_recommendation_clicked", {
    user_id: userId,
    recommendation_id: recommendationId,
    product_id: productId,
    position,
    clicked_at: clickedAt.toISOString(),
    context,
    outcome,
  });
}

export function trackRecommendationFeedback(
  userId: string,
  recommendationId: string,
  productId: string,
  feedbackType: "positive" | "negative" | "neutral" | "irrelevant",
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
  capture("shop_recommendation_feedback", {
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
  dashboardType: "overview" | "products" | "transactions" | "promotions" | "analytics",
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
  capture("shop_dashboard_viewed", {
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
  capture("shop_user_properties", {
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
  errorType: "inventory_error" | "payment_error" | "pricing_error" | "system_error",
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
  capture("shop_error", {
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

export function trackShopFunnel(userId: string, step: "shop_visited" | "product_viewed" | "added_to_cart" | "checkout_started" | "purchase_completed" | "repeat_purchase"): void {
  capture("shop_funnel", {
    user_id: userId,
    funnel_step: step,
  });
}
