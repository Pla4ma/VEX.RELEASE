import { capture } from "../../shared/analytics/analytics-service";


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

export function trackShopFunnel(userId: string, step: 'shop_visited' | 'product_viewed' | 'added_to_cart' | 'checkout_started' | 'purchase_completed' | 'repeat_purchase'): void {
  capture('shop_funnel', {
    user_id: userId,
    funnel_step: step,
  });
}