import { capture } from '../../shared/analytics/analytics-service';

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
  capture('shop_promotion_viewed', {
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
  capture('shop_promotion_applied', {
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
  reason: 'time' | 'usage_limit' | 'budget' | 'manual' | 'technical',
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
  capture('shop_promotion_expired', {
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
  capture('shop_recommendation_viewed', {
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
  capture('shop_recommendation_clicked', {
    user_id: userId,
    recommendation_id: recommendationId,
    product_id: productId,
    position,
    clicked_at: clickedAt.toISOString(),
    context,
    outcome,
  });
}

