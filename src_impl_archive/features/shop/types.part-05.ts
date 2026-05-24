import type { AvailabilityStatus, CategoryFilter, RecurringPattern, RestockingConfig, StockAlert, StockForecasting, StockTracking } from './types';

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in' | 'mm';
}

export interface WarrantyInfo {
  period: number; // in months
  coverage: string[];
  conditions: string[];
}

export interface ShippingInfo {
  weight: number;
  dimensions?: ProductDimensions;
  restrictions: string[];
  methods: ShippingMethod[];
}

export interface ShippingMethod {
  method: string;
  cost: number;
  duration: number; // in days
  tracking: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  parent_id?: string;
  icon?: string;
  banner?: string;
  product_count: number;
  subcategories: string[]; // category IDs
  filters: CategoryFilter[];
  sort_order: number;
  metadata: CategoryMetadata;
}

export interface CategoryMetadata {
  seo_title?: string;
  seo_description?: string;
  keywords?: string[];
  custom_fields?: Record<string, unknown>;
}

export interface ProductBundle {
  id: string;
  name: string;
  description: string;
  type: BundleType;
  products: BundleProduct[];
  price: BundlePrice;
  availability: BundleAvailability;
  limitations: BundleLimitation[];
  created_at: Date;
  expires_at?: Date;
}

export type BundleType = 'fixed' | 'customizable' | 'tiered' | 'mystery' | 'seasonal';

export interface BundleProduct {
  product_id: string;
  quantity: number;
  required: boolean;
  discount?: number;
  substitution?: BundleSubstitution;
}

export interface BundleSubstitution {
  allowed: boolean;
  options: string[]; // product IDs
  price_adjustment: number;
}

export interface BundlePrice {
  type: 'fixed' | 'discounted' | 'percentage';
  value: number;
  savings: number;
  show_savings: boolean;
}

export interface BundleAvailability {
  status: AvailabilityStatus;
  stock_level: number;
  limited_quantity: boolean;
  max_per_customer: number;
}

export interface BundleLimitation {
  type: LimitationType;
  value: number;
  description: string;
}

export type LimitationType = 'quantity' | 'time' | 'user_level' | 'user_segment' | 'location';

export interface ShopPromotion {
  id: string;
  name: string;
  description: string;
  type: PromotionType;
  scope: PromotionScope;
  conditions: PromotionCondition[];
  rewards: PromotionReward[];
  schedule: PromotionSchedule;
  limits: PromotionLimit[];
  status: PromotionStatus;
  created_at: Date;
}

export type PromotionType = 'discount' | 'bogo' | 'bundle' | 'free_shipping' | 'cashback' | 'loyalty_points' | 'free_gift' | 'upgrade';

export type PromotionScope = 'global' | 'category' | 'product' | 'user_segment' | 'location' | 'device';

export interface PromotionCondition {
  type: ConditionType;
  field: string;
  operator: string;
  value: unknown;
  description: string;
}

export type ConditionType = 'cart_value' | 'product_quantity' | 'user_level' | 'user_segment' | 'location' | 'device' | 'time' | 'custom';

export interface PromotionReward {
  type: RewardType;
  value: number;
  description: string;
  applies_to: string[]; // product IDs or categories
}

export type RewardType = 'percentage_discount' | 'fixed_discount' | 'free_product' | 'free_shipping' | 'cashback' | 'points' | 'upgrade';

export interface PromotionSchedule {
  start_date: Date;
  end_date: Date;
  timezone: string;
  recurring?: RecurringPattern;
}

export interface PromotionLimit {
  type: LimitType;
  value: number;
  scope: LimitScope;
}

export type LimitType = 'usage' | 'user' | 'total' | 'daily' | 'weekly' | 'monthly';

export type LimitScope = 'global' | 'user' | 'segment' | 'product';

export type PromotionStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'expired' | 'cancelled';

export interface StockManagement {
  tracking: StockTracking;
  alerts: StockAlert[];
  restocking: RestockingConfig;
  forecasting: StockForecasting;
}

