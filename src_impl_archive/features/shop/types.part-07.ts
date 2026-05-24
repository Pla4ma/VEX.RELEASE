import type { AnalyticsInsight, AnalyticsTrend, DiscountType, RevenueAnalytics } from './types';

export interface TransactionDiscount {
  id: string;
  name: string;
  type: DiscountType;
  value: number;
  applied_to: 'cart' | 'items' | 'shipping';
}

export interface TransactionMetadata {
  ip_address?: string;
  user_agent?: string;
  device?: string;
  location?: LocationInfo;
  referral?: string;
  campaign?: string;
}

export interface LocationInfo {
  country: string;
  region: string;
  city: string;
  postal_code: string;
  timezone: string;
}

export interface ShopAnalytics {
  overview: AnalyticsOverview;
  sales: SalesAnalytics;
  products: ProductAnalytics;
  customers: CustomerAnalytics;
  conversions: ConversionAnalytics;
  revenue: RevenueAnalytics;
  trends: AnalyticsTrend[];
  insights: AnalyticsInsight[];
}

export interface AnalyticsOverview {
  period: AnalyticsPeriod;
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  conversion_rate: number;
  unique_visitors: number;
  page_views: number;
  bounce_rate: number;
}

export type AnalyticsPeriod = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface SalesAnalytics {
  total_sales: number;
  sales_by_period: SalesByPeriod[];
  sales_by_category: SalesByCategory[];
  sales_by_product: SalesByProduct[];
  sales_by_region: SalesByRegion[];
  sales_by_channel: SalesByChannel[];
}

export interface SalesByPeriod {
  period: Date;
  revenue: number;
  orders: number;
  aov: number;
}

export interface SalesByCategory {
  category: string;
  revenue: number;
  orders: number;
  growth: number;
}

export interface SalesByProduct {
  product_id: string;
  product_name: string;
  revenue: number;
  units_sold: number;
  growth: number;
}

export interface SalesByRegion {
  region: string;
  revenue: number;
  orders: number;
  aov: number;
}

export interface SalesByChannel {
  channel: string;
  revenue: number;
  orders: number;
  conversion_rate: number;
}

export interface ProductAnalytics {
  top_products: ProductPerformance[];
  trending_products: ProductPerformance[];
  underperforming: ProductPerformance[];
  product_views: ProductViews[];
  add_to_cart_rate: number;
  cart_abandonment_rate: number;
}

export interface ProductPerformance {
  product_id: string;
  product_name: string;
  views: number;
  add_to_carts: number;
  purchases: number;
  revenue: number;
  conversion_rate: number;
  growth: number;
}

export interface ProductViews {
  product_id: string;
  views: number;
  unique_views: number;
  average_view_duration: number;
}

export interface CustomerAnalytics {
  total_customers: number;
  new_customers: number;
  returning_customers: number;
  customer_lifetime_value: number;
  average_orders_per_customer: number;
  customer_segments: CustomerSegment[];
  customer_retention: CustomerRetention[];
}

export interface CustomerSegment {
  segment: string;
  count: number;
  revenue: number;
  aov: number;
  growth: number;
}

export interface CustomerRetention {
  period: string;
  new_customers: number;
  returning_customers: number;
  retention_rate: number;
  churn_rate: number;
}

export interface ConversionAnalytics {
  funnel: ConversionFunnel[];
  conversion_rate: number;
  cart_abandonment_rate: number;
  checkout_abandonment: number;
  payment_success_rate: number;
}

export interface ConversionFunnel {
  step: string;
  users: number;
  conversion_rate: number;
  drop_off_rate: number;
}

