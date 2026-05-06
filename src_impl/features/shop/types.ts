/**
 * Shop Feature Types
 *
 * Types for in-game shop, virtual economy, and marketplace features.
 */

export interface Shop {
  id: string;
  name: string;
  type: ShopType;
  category: ShopCategory;
  status: ShopStatus;
  configuration: ShopConfiguration;
  inventory: ShopInventory;
  currency: ShopCurrency;
  transactions: ShopTransaction[];
  analytics: ShopAnalytics;
  settings: ShopSettings;
  createdAt: Date;
  updatedAt: Date;
}

export type ShopType = "general_store" | "specialty_shop" | "premium_store" | "marketplace" | "auction_house" | "trade_post" | "mystery_shop" | "seasonal_shop" | "event_shop" | "vip_shop";

export type ShopCategory = "items" | "cosmetics" | "abilities" | "boosts" | "currency" | "bundles" | "services" | "upgrades" | "collectibles" | "consumables";

export type ShopStatus = "active" | "inactive" | "maintenance" | "seasonal" | "event" | "limited_time" | "coming_soon";

export interface ShopConfiguration {
  layout: ShopLayout;
  featured: FeaturedSection[];
  categories: ShopCategorySection[];
  filters: ShopFilter[];
  sorting: ShopSorting[];
  search: SearchConfiguration;
  recommendations: RecommendationEngine;
}

export interface ShopLayout {
  type: LayoutType;
  sections: LayoutSection[];
  navigation: NavigationConfig;
  display: DisplayConfig;
  responsiveness: ResponsiveConfig;
}

export type LayoutType = "grid" | "list" | "carousel" | "masonry" | "featured_grid" | "category_tabs" | "infinite_scroll";

export interface LayoutSection {
  id: string;
  type: SectionType;
  title: string;
  position: number;
  size: SectionSize;
  items: LayoutItem[];
  visibility: VisibilityConfig;
}

export type SectionType = "featured" | "new_arrivals" | "best_sellers" | "special_offers" | "categories" | "recommendations" | "recently_viewed" | "limited_time";

export interface SectionSize {
  width: number; // percentage or pixels
  height: number; // percentage or pixels
  columns: number;
  rows: number;
}

export interface LayoutItem {
  id: string;
  type: ItemType;
  productId: string;
  position: number;
  prominence: number; // 0-100
  metadata: ItemMetadata;
}

export type ItemType = "product" | "category" | "banner" | "promotion" | "recommendation" | "advertisement";

export interface ItemMetadata {
  title?: string;
  description?: string;
  image?: string;
  badge?: string;
  price?: number;
  discount?: number;
  rating?: number;
  tags?: string[];
}

export interface VisibilityConfig {
  condition: VisibilityCondition;
  user_segment: string[];
  time_restriction: TimeRestriction;
  device_restriction: DeviceRestriction;
}

export interface VisibilityCondition {
  field: string;
  operator: "equals" | "not_equals" | "greater_than" | "less_than" | "in" | "not_in";
  value: unknown;
}

export interface TimeRestriction {
  start?: Date;
  end?: Date;
  timezone: string;
  recurring?: RecurringPattern;
}

export interface RecurringPattern {
  type: "daily" | "weekly" | "monthly" | "yearly";
  days?: number[]; // 0-6 for weekly
  dates?: number[]; // 1-31 for monthly
  months?: number[]; // 1-12 for yearly
}

export interface DeviceRestriction {
  platforms: PlatformType[];
  min_version?: string;
  max_version?: string;
}

export type PlatformType = "ios" | "android" | "web" | "desktop" | "console";

export interface NavigationConfig {
  type: NavigationType;
  items: NavigationItem[];
  breadcrumbs: BreadcrumbConfig;
  search: SearchNavigation;
}

export type NavigationType = "sidebar" | "top_bar" | "bottom_bar" | "dropdown" | "mega_menu";

export interface NavigationItem {
  id: string;
  label: string;
  type: "link" | "category" | "dropdown" | "action";
  target: string;
  icon?: string;
  badge?: string;
  children?: NavigationItem[];
  order: number;
}

export interface BreadcrumbConfig {
  enabled: boolean;
  separator: string;
  max_items: number;
  home_label: string;
}

export interface SearchNavigation {
  enabled: boolean;
  placeholder: string;
  suggestions: boolean;
  autocomplete: boolean;
  filters: boolean;
}

export interface DisplayConfig {
  theme: DisplayTheme;
  colors: ColorScheme;
  typography: TypographyConfig;
  animations: AnimationConfig;
  spacing: SpacingConfig;
}

export interface ThemeCustomization {
  colors?: Record<string, string>;
  fonts?: Record<string, string>;
}

export interface DisplayTheme {
  mode: "light" | "dark" | "auto";
  style: "minimal" | "modern" | "classic" | "playful";
  customization: ThemeCustomization;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  error: string;
  warning: string;
  success: string;
}

export interface TypographyConfig {
  font_family: string;
  font_sizes: FontSizes;
  font_weights: FontWeights;
  line_heights: LineHeights;
}

export interface FontSizes {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

export interface FontWeights {
  light: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
}

export interface LineHeights {
  tight: number;
  normal: number;
  relaxed: number;
}

export interface AnimationConfig {
  enabled: boolean;
  type: AnimationType;
  duration: number;
  easing: string;
}

export type AnimationType = "fade" | "slide" | "bounce" | "zoom" | "flip" | "none";

export interface SpacingConfig {
  unit: string;
  scale: SpacingScale;
}

export interface SpacingScale {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

export interface ResponsiveConfig {
  breakpoints: BreakpointConfig;
  layouts: ResponsiveLayout[];
}

export interface BreakpointConfig {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
}

export interface ResponsiveLayout {
  breakpoint: string;
  columns: number;
  item_size: string;
  navigation: NavigationType;
}

export interface FeaturedSection {
  id: string;
  title: string;
  type: FeaturedType;
  products: string[]; // product IDs
  layout: FeaturedLayout;
  rotation: RotationConfig;
  criteria: SelectionCriteria;
}

export type FeaturedType = "spotlight" | "banner" | "carousel" | "grid" | "showcase";

export interface FeaturedLayout {
  items_per_view: number;
  auto_scroll: boolean;
  scroll_interval: number; // in seconds
  show_indicators: boolean;
  show_navigation: boolean;
}

export interface RotationConfig {
  enabled: boolean;
  interval: number; // in minutes
  random: boolean;
  max_items: number;
}

export interface ProductFilter {
  field: string;
  operator: "eq" | "ne" | "gt" | "lt" | "gte" | "lte" | "in";
  value: unknown;
}

export interface SelectionCriteria {
  type: CriteriaType;
  filters: ProductFilter[];
  sort_by: string;
  limit: number;
}

export type CriteriaType = "manual" | "algorithmic" | "trending" | "seasonal" | "personalized";

export interface ShopCategorySection {
  id: string;
  category: string;
  title: string;
  description: string;
  icon?: string;
  banner?: string;
  products: string[]; // product IDs
  subcategories: Subcategory[];
  filters: CategoryFilter[];
}

export interface Subcategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  product_count: number;
}

export interface CategoryFilter {
  field: string;
  type: FilterType;
  options: FilterOption[];
  multi_select: boolean;
}

export type FilterType = "range" | "select" | "checkbox" | "radio" | "toggle" | "search";

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
  direction: "asc" | "desc";
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
  direction: "asc" | "desc";
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

export type RecommendationAlgorithm = "collaborative_filtering" | "content_based" | "hybrid" | "popularity_based" | "context_aware" | "deep_learning";

export interface DataSource {
  type: DataSourceType;
  weight: number; // 0-1
  configuration: Record<string, unknown>;
}

export type DataSourceType = "user_behavior" | "product_attributes" | "purchase_history" | "social_data" | "contextual_data" | "external_api";

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
  type: "equal" | "weighted" | "adaptive";
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

export type ProductType = "item" | "cosmetic" | "ability" | "boost" | "currency" | "service" | "upgrade" | "collectible" | "consumable" | "bundle";

export type ProductRarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic" | "exclusive";

export interface ProductPrice {
  base: number;
  current: number;
  currency: string;
  discount: ProductDiscount;
  pricing_model: PricingModel;
}

export interface ProductDiscount {
  enabled: boolean;
  type: DiscountType;
  value: number;
  start_date?: Date;
  end_date?: Date;
  reason?: string;
}

export type DiscountType = "percentage" | "fixed" | "bogo" | "tiered" | "bundle";

export interface PricingModel {
  type: ModelType;
  tiers?: PricingTier[];
  subscription?: SubscriptionModel;
  dynamic?: DynamicPricing;
}

export type ModelType = "fixed" | "tiered" | "subscription" | "dynamic" | "auction" | "negotiated";

export interface PricingTier {
  id: string;
  name: string;
  quantity: number;
  price: number;
  unit_price: number;
  savings?: number;
}

export interface SubscriptionModel {
  interval: "daily" | "weekly" | "monthly" | "yearly";
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

export type PricingAlgorithm = "demand_based" | "competition_based" | "time_based" | "inventory_based" | "user_segment_based" | "machine_learning";

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

export type AvailabilityStatus = "available" | "limited" | "out_of_stock" | "discontinued" | "coming_soon" | "pre_order" | "back_order";

export interface ProductAttribute {
  name: string;
  value: unknown;
  type: AttributeType;
  display: boolean;
  searchable: boolean;
  filterable: boolean;
}

export type AttributeType = "string" | "number" | "boolean" | "date" | "array" | "object";

export interface ProductImage {
  id: string;
  url: string;
  alt_text: string;
  type: ImageType;
  order: number;
  width?: number;
  height?: number;
}

export type ImageType = "thumbnail" | "gallery" | "banner" | "icon" | "detail";

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
  period: "daily" | "weekly" | "monthly";
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

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: "cm" | "in" | "mm";
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

export type BundleType = "fixed" | "customizable" | "tiered" | "mystery" | "seasonal";

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
  type: "fixed" | "discounted" | "percentage";
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

export type LimitationType = "quantity" | "time" | "user_level" | "user_segment" | "location";

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

export type PromotionType = "discount" | "bogo" | "bundle" | "free_shipping" | "cashback" | "loyalty_points" | "free_gift" | "upgrade";

export type PromotionScope = "global" | "category" | "product" | "user_segment" | "location" | "device";

export interface PromotionCondition {
  type: ConditionType;
  field: string;
  operator: string;
  value: unknown;
  description: string;
}

export type ConditionType = "cart_value" | "product_quantity" | "user_level" | "user_segment" | "location" | "device" | "time" | "custom";

export interface PromotionReward {
  type: RewardType;
  value: number;
  description: string;
  applies_to: string[]; // product IDs or categories
}

export type RewardType = "percentage_discount" | "fixed_discount" | "free_product" | "free_shipping" | "cashback" | "points" | "upgrade";

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

export type LimitType = "usage" | "user" | "total" | "daily" | "weekly" | "monthly";

export type LimitScope = "global" | "user" | "segment" | "product";

export type PromotionStatus = "draft" | "scheduled" | "active" | "paused" | "expired" | "cancelled";

export interface StockManagement {
  tracking: StockTracking;
  alerts: StockAlert[];
  restocking: RestockingConfig;
  forecasting: StockForecasting;
}

export interface StockTracking {
  enabled: boolean;
  method: TrackingMethod;
  accuracy: number; // 0-100
  real_time: boolean;
}

export type TrackingMethod = "manual" | "automated" | "hybrid" | "api_based" | "rfid";

export interface StockAlert {
  id: string;
  type: AlertType;
  threshold: number;
  severity: AlertSeverity;
  recipients: AlertRecipient[];
  actions: AlertAction[];
  enabled: boolean;
}

export type AlertType = "low_stock" | "out_of_stock" | "overstock" | "restock_needed" | "discontinued";

export type AlertSeverity = "info" | "warning" | "critical" | "emergency";

export interface AlertRecipient {
  type: "email" | "sms" | "webhook" | "user";
  address: string;
  role?: string;
}

export interface AlertAction {
  type: "notification" | "auto_restock" | "price_adjust" | "hide_product" | "custom";
  parameters: Record<string, unknown>;
}

export interface RestockingConfig {
  enabled: boolean;
  method: RestockingMethod;
  lead_time: number; // in days
  safety_stock: number;
  reorder_point: number;
  max_stock: number;
}

export type RestockingMethod = "manual" | "automatic" | "just_in_time" | "periodic" | "demand_based";

export interface StockForecasting {
  enabled: boolean;
  algorithm: ForecastingAlgorithm;
  data_sources: ForecastingDataSource[];
  accuracy: number; // 0-100
  horizon: number; // in days
}

export type ForecastingAlgorithm = "moving_average" | "exponential_smoothing" | "arima" | "neural_network" | "ensemble";

export interface ForecastingDataSource {
  type: "sales" | "seasonal" | "trend" | "external" | "social";
  weight: number; // 0-1
  configuration: Record<string, unknown>;
}

export interface ShopCurrency {
  primary: string;
  supported: string[];
  exchange_rates: ExchangeRate[];
  conversion: ConversionConfig;
  display: CurrencyDisplay;
}

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  updated_at: Date;
  source: string;
}

export interface ConversionConfig {
  auto_convert: boolean;
  rounding: RoundingMethod;
  fees: ConversionFee[];
}

export type RoundingMethod = "none" | "up" | "down" | "nearest";

export interface ConversionFee {
  type: "percentage" | "fixed";
  value: number;
  min_fee?: number;
  max_fee?: number;
}

export interface CurrencyDisplay {
  symbol_position: "before" | "after";
  decimal_places: number;
  thousands_separator: string;
  decimal_separator: string;
}

export interface ShopTransaction {
  id: string;
  user_id: string;
  type: TransactionType;
  status: TransactionStatus;
  items: TransactionItem[];
  payment: PaymentInfo;
  shipping?: ShippingInfo;
  totals: TransactionTotals;
  discounts: TransactionDiscount[];
  metadata: TransactionMetadata;
  created_at: Date;
  completed_at?: Date;
}

export type TransactionType = "purchase" | "refund" | "exchange" | "gift" | "subscription" | "donation";

export type TransactionStatus = "pending" | "processing" | "completed" | "failed" | "cancelled" | "refunded" | "disputed";

export interface TransactionItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discounts: ItemDiscount[];
  metadata: ItemMetadata;
}

export interface ItemDiscount {
  type: DiscountType;
  value: number;
  reason: string;
  promotion_id?: string;
}

export interface ItemMetadata {
  variant?: string;
  customization?: string;
  gift_wrap?: boolean;
  message?: string;
}

export interface PaymentInfo {
  method: PaymentMethod;
  amount: number;
  currency: string;
  status: PaymentStatus;
  gateway: string;
  transaction_id?: string;
  gateway_response?: unknown;
}

export type PaymentMethod = "credit_card" | "debit_card" | "paypal" | "stripe" | "apple_pay" | "google_pay" | "crypto" | "bank_transfer" | "store_credit" | "gift_card";

export type PaymentStatus = "pending" | "authorized" | "captured" | "failed" | "refunded" | "cancelled";

export interface TransactionTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  discounts: number;
  fees: number;
  total: number;
  currency: string;
}

export interface TransactionDiscount {
  id: string;
  name: string;
  type: DiscountType;
  value: number;
  applied_to: "cart" | "items" | "shipping";
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

export type AnalyticsPeriod = "hourly" | "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

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

export interface RevenueAnalytics {
  total_revenue: number;
  revenue_by_period: RevenueByPeriod[];
  revenue_by_source: RevenueBySource[];
  revenue_by_product: RevenueByProduct[];
  revenue_growth: number;
  profit_margin: number;
}

export interface RevenueByPeriod {
  period: Date;
  revenue: number;
  growth: number;
  profit: number;
}

export interface RevenueBySource {
  source: string;
  revenue: number;
  growth: number;
  percentage: number;
}

export interface RevenueByProduct {
  product_id: string;
  product_name: string;
  revenue: number;
  growth: number;
  margin: number;
}

export interface AnalyticsTrend {
  metric: string;
  period: AnalyticsPeriod;
  data: TrendData[];
  trend: "up" | "down" | "stable";
  significance: "low" | "medium" | "high";
}

export interface AnalyticsInsight {
  type: InsightType;
  title: string;
  description: string;
  impact: InsightImpact;
  confidence: number;
  recommendations: string[];
  created_at: Date;
}

export type InsightType = "opportunity" | "issue" | "trend" | "anomaly" | "prediction";

export interface InsightImpact {
  level: "low" | "medium" | "high" | "critical";
  area: string;
  potential_value?: number;
}

export interface ShopSettings {
  general: GeneralSettings;
  payment: PaymentSettings;
  shipping: ShippingSettings;
  tax: TaxSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  localization: LocalizationSettings;
}

export interface GeneralSettings {
  shop_name: string;
  shop_description: string;
  contact_email: string;
  timezone: string;
  currency: string;
  language: string;
  maintenance_mode: boolean;
  maintenance_message?: string;
}

export interface PaymentSettings {
  enabled_methods: PaymentMethod[];
  default_method: PaymentMethod;
  auto_capture: boolean;
  refund_policy: RefundPolicy;
  fraud_detection: FraudDetection;
}

export interface RefundPolicy {
  enabled: boolean;
  period: number; // in days
  automatic_approval: boolean;
  conditions: string[];
}

export interface FraudDetection {
  enabled: boolean;
  rules: FraudRule[];
  risk_threshold: number;
}

export interface FraudRule {
  rule: string;
  enabled: boolean;
  weight: number;
  action: FraudAction;
}

export type FraudAction = "flag" | "block" | "review" | "require_verification";

export interface ShippingSettings {
  enabled_methods: ShippingMethod[];
  free_shipping_threshold?: number;
  default_method: string;
  tracking: boolean;
  insurance: boolean;
}

export interface TaxSettings {
  enabled: boolean;
  tax_inclusive: boolean;
  tax_rates: TaxRate[];
  tax_calculation: TaxCalculation;
}

export interface TaxRate {
  country: string;
  region?: string;
  rate: number;
  type: "standard" | "reduced" | "zero";
}

export interface TaxCalculation {
  method: "origin" | "destination" | "hybrid";
  vat_enabled: boolean;
}

export interface NotificationSettings {
  email: EmailNotifications;
  sms: SMSNotifications;
  push: PushNotifications;
  in_app: InAppNotifications;
}

export interface EmailNotifications {
  enabled: boolean;
  order_confirmation: boolean;
  shipping_confirmation: boolean;
  delivery_confirmation: boolean;
  refund_confirmation: boolean;
  marketing: boolean;
}

export interface SMSNotifications {
  enabled: boolean;
  order_updates: boolean;
  shipping_updates: boolean;
  delivery_updates: boolean;
}

export interface PushNotifications {
  enabled: boolean;
  promotions: boolean;
  order_updates: boolean;
  recommendations: boolean;
}

export interface InAppNotifications {
  enabled: boolean;
  promotions: boolean;
  recommendations: boolean;
  cart_reminders: boolean;
}

export interface SecuritySettings {
  ssl_enabled: boolean;
  two_factor_auth: boolean;
  session_timeout: number; // in minutes
  ip_whitelist: string[];
  rate_limiting: RateLimiting;
}

export interface RateLimiting {
  enabled: boolean;
  requests_per_minute: number;
  burst_limit: number;
}

export interface LocalizationSettings {
  default_language: string;
  supported_languages: string[];
  auto_detect: boolean;
  currency_conversion: boolean;
  date_format: string;
  time_format: string;
}

// Event Types
export interface ShopEvent {
  type: "product_viewed" | "product_added_to_cart" | "order_placed" | "payment_completed" | "order_shipped" | "order_delivered" | "refund_issued";
  userId: string;
  sessionId: string;
  data: Record<string, unknown>;
  timestamp: Date;
}
