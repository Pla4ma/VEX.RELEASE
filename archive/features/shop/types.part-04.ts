import type { ProductDimensions, ShippingInfo, WarrantyInfo } from './types';

export interface ProductDiscount {
  enabled: boolean;
  type: DiscountType;
  value: number;
  start_date?: Date;
  end_date?: Date;
  reason?: string;
}

export type DiscountType = 'percentage' | 'fixed' | 'bogo' | 'tiered' | 'bundle';

export interface PricingModel {
  type: ModelType;
  tiers?: PricingTier[];
  subscription?: SubscriptionModel;
  dynamic?: DynamicPricing;
}

export type ModelType = 'fixed' | 'tiered' | 'subscription' | 'dynamic' | 'auction' | 'negotiated';

export interface PricingTier {
  id: string;
  name: string;
  quantity: number;
  price: number;
  unit_price: number;
  savings?: number;
}

export interface SubscriptionModel {
  interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
  trial_period?: number; // in days
  auto_renew: boolean;
  cancellation_policy: CancellationPolicy;
}

export interface CancellationPolicy {
  refund_period: number; // in days
  refund_percentage: number;
  conditions: string[];
}

export interface DynamicPricing {
  enabled: boolean;
  algorithm: PricingAlgorithm;
  factors: PricingFactor[];
  min_price: number;
  max_price: number;
  update_frequency: number; // in hours
}

export type PricingAlgorithm = 'demand_based' | 'competition_based' | 'time_based' | 'inventory_based' | 'user_segment_based' | 'machine_learning';

export interface PricingFactor {
  factor: string;
  weight: number; // 0-1
  influence: number; // -100 to 100
}

export interface ProductAvailability {
  status: AvailabilityStatus;
  stock_level: number;
  stock_threshold: number;
  restock_date?: Date;
  limited_quantity: boolean;
  pre_order: boolean;
  back_order: boolean;
}

export type AvailabilityStatus = 'available' | 'limited' | 'out_of_stock' | 'discontinued' | 'coming_soon' | 'pre_order' | 'back_order';

export interface ProductAttribute {
  name: string;
  value: unknown;
  type: AttributeType;
  display: boolean;
  searchable: boolean;
  filterable: boolean;
}

export type AttributeType = 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';

export interface ProductImage {
  id: string;
  url: string;
  alt_text: string;
  type: ImageType;
  order: number;
  width?: number;
  height?: number;
}

export type ImageType = 'thumbnail' | 'gallery' | 'banner' | 'icon' | 'detail';

export interface ProductVideo {
  id: string;
  url: string;
  thumbnail?: string;
  title?: string;
  duration?: number;
  order: number;
}

export interface ProductReview {
  id: string;
  user_id: string;
  username: string;
  rating: number; // 1-5
  title?: string;
  content: string;
  verified_purchase: boolean;
  helpful_count: number;
  created_at: Date;
  updated_at?: Date;
  response?: ReviewResponse;
}

export interface ReviewResponse {
  content: string;
  responded_by: string;
  responded_at: Date;
}

export interface ProductRating {
  average: number; // 1-5
  count: number;
  distribution: RatingDistribution;
  trend: RatingTrend;
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface RatingTrend {
  period: 'daily' | 'weekly' | 'monthly';
  data: TrendData[];
}

export interface TrendData {
  date: Date;
  rating: number;
  count: number;
}

export interface ProductMetadata {
  sku?: string;
  isbn?: string;
  weight?: number;
  dimensions?: ProductDimensions;
  materials?: string[];
  care_instructions?: string[];
  warranty?: WarrantyInfo;
  shipping?: ShippingInfo;
}

