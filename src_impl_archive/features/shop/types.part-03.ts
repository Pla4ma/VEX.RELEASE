import type { PricingModel, ProductAttribute, ProductAvailability, ProductBundle, ProductCategory, ProductDiscount, ProductImage, ProductMetadata, ProductRating, ProductReview, ProductVideo, ShopPromotion, StockManagement } from './types';

export type FilterType = 'range' | 'select' | 'checkbox' | 'radio' | 'toggle' | 'search';

export interface FilterOption {
  value: unknown;
  label: string;
  count: number;
  icon?: string;
}

export interface ShopFilter {
  id: string;
  name: string;
  field: string;
  type: FilterType;
  options: FilterOption[];
  default_value?: unknown;
  validation: FilterValidation;
}

export interface FilterValidation {
  required: boolean;
  min?: number;
  max?: number;
  pattern?: string;
}

export interface ShopSorting {
  id: string;
  name: string;
  field: string;
  direction: 'asc' | 'desc';
  default: boolean;
  icon?: string;
}

export interface SearchConfiguration {
  enabled: boolean;
  placeholder: string;
  autocomplete: boolean;
  suggestions: boolean;
  filters: SearchFilter[];
  sorting: SearchSorting[];
  results: SearchResultsConfig;
}

export interface SearchFilter {
  field: string;
  type: FilterType;
  options: FilterOption[];
}

export interface SearchSorting {
  field: string;
  name: string;
  direction: 'asc' | 'desc';
}

export interface SearchResultsConfig {
  per_page: number;
  max_results: number;
  highlight: boolean;
  snippets: boolean;
  faceted: boolean;
}

export interface RecommendationEngine {
  enabled: boolean;
  algorithm: RecommendationAlgorithm;
  data_sources: DataSource[];
  personalization: PersonalizationConfig;
  a_b_testing: ABTestingConfig;
}

export type RecommendationAlgorithm = 'collaborative_filtering' | 'content_based' | 'hybrid' | 'popularity_based' | 'context_aware' | 'deep_learning';

export interface DataSource {
  type: DataSourceType;
  weight: number; // 0-1
  configuration: Record<string, unknown>;
}

export type DataSourceType = 'user_behavior' | 'product_attributes' | 'purchase_history' | 'social_data' | 'contextual_data' | 'external_api';

export interface PersonalizationConfig {
  enabled: boolean;
  factors: PersonalizationFactor[];
  weight_adjustment: number; // 0-100
  diversity_threshold: number; // 0-100
}

export interface PersonalizationFactor {
  factor: string;
  weight: number; // 0-1
  decay_rate: number; // 0-1 per day
}

export interface ABTestingConfig {
  enabled: boolean;
  test_groups: TestGroup[];
  traffic_allocation: TrafficAllocation;
  success_metrics: SuccessMetric[];
}

export interface TestGroup {
  id: string;
  name: string;
  algorithm: RecommendationAlgorithm;
  weight: number; // 0-1
}

export interface TrafficAllocation {
  type: 'equal' | 'weighted' | 'adaptive';
  allocations: Record<string, number>;
}

export interface SuccessMetric {
  metric: string;
  weight: number; // 0-1
  target: number;
}

export interface ShopInventory {
  products: ShopProduct[];
  categories: ProductCategory[];
  bundles: ProductBundle[];
  promotions: ShopPromotion[];
  stock: StockManagement;
}

export interface ShopProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  type: ProductType;
  rarity: ProductRarity;
  price: ProductPrice;
  currency: string;
  availability: ProductAvailability;
  attributes: ProductAttribute[];
  images: ProductImage[];
  videos: ProductVideo[];
  reviews: ProductReview[];
  ratings: ProductRating;
  tags: string[];
  metadata: ProductMetadata;
  created_at: Date;
  updated_at: Date;
}

export type ProductType = 'item' | 'cosmetic' | 'ability' | 'boost' | 'currency' | 'service' | 'upgrade' | 'collectible' | 'consumable' | 'bundle';

export type ProductRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'exclusive';

export interface ProductPrice {
  base: number;
  current: number;
  currency: string;
  discount: ProductDiscount;
  pricing_model: PricingModel;
}

