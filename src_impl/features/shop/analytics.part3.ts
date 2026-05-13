import { capture } from "../../shared/analytics/analytics-service";


export function trackPurchaseCompleted(
  userId: string,
  transactionId: string,
  completedAt: Date,
  completionTime: number,
  status: 'success' | 'failed' | 'pending' | 'cancelled',
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
  capture('shop_purchase_completed', {
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
  failureType: 'payment' | 'inventory' | 'technical' | 'validation' | 'fraud',
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
  capture('shop_purchase_failed', {
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
  refundType: 'full' | 'partial' | 'exchange' | 'store_credit',
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
  capture('shop_purchase_refunded', {
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