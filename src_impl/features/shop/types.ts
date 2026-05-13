export type ShopType = 'general_store' | 'specialty_shop' | 'premium_store' | 'marketplace' | 'auction_house' | 'trade_post' | 'mystery_shop' | 'seasonal_shop' | 'event_shop' | 'vip_shop';

export type ShopCategory = 'items' | 'cosmetics' | 'abilities' | 'boosts' | 'currency' | 'bundles' | 'services' | 'upgrades' | 'collectibles' | 'consumables';

export type ShopStatus = 'active' | 'inactive' | 'maintenance' | 'seasonal' | 'event' | 'limited_time' | 'coming_soon';
export type LayoutType = 'grid' | 'list' | 'carousel' | 'masonry' | 'featured_grid' | 'category_tabs' | 'infinite_scroll';
export type SectionType = 'featured' | 'new_arrivals' | 'best_sellers' | 'special_offers' | 'categories' | 'recommendations' | 'recently_viewed' | 'limited_time';
export type ItemType = 'product' | 'category' | 'banner' | 'promotion' | 'recommendation' | 'advertisement';
export type PlatformType = 'ios' | 'android' | 'web' | 'desktop' | 'console';
export type NavigationType = 'sidebar' | 'top_bar' | 'bottom_bar' | 'dropdown' | 'mega_menu';
export type AnimationType = 'fade' | 'slide' | 'bounce' | 'zoom' | 'flip' | 'none';
export type FeaturedType = 'spotlight' | 'banner' | 'carousel' | 'grid' | 'showcase';
export type CriteriaType = 'manual' | 'algorithmic' | 'trending' | 'seasonal' | 'personalized';
export type FilterType = 'range' | 'select' | 'checkbox' | 'radio' | 'toggle' | 'search';
export type RecommendationAlgorithm = 'collaborative_filtering' | 'content_based' | 'hybrid' | 'popularity_based' | 'context_aware' | 'deep_learning';
export type DataSourceType = 'user_behavior' | 'product_attributes' | 'purchase_history' | 'social_data' | 'contextual_data' | 'external_api';
export type ProductType = 'item' | 'cosmetic' | 'ability' | 'boost' | 'currency' | 'service' | 'upgrade' | 'collectible' | 'consumable' | 'bundle';

export type ProductRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'exclusive';
export type DiscountType = 'percentage' | 'fixed' | 'bogo' | 'tiered' | 'bundle';
export type ModelType = 'fixed' | 'tiered' | 'subscription' | 'dynamic' | 'auction' | 'negotiated';
export type PricingAlgorithm = 'demand_based' | 'competition_based' | 'time_based' | 'inventory_based' | 'user_segment_based' | 'machine_learning';
export type AvailabilityStatus = 'available' | 'limited' | 'out_of_stock' | 'discontinued' | 'coming_soon' | 'pre_order' | 'back_order';
export type AttributeType = 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
export type ImageType = 'thumbnail' | 'gallery' | 'banner' | 'icon' | 'detail';
export type BundleType = 'fixed' | 'customizable' | 'tiered' | 'mystery' | 'seasonal';
export type LimitationType = 'quantity' | 'time' | 'user_level' | 'user_segment' | 'location';
export type PromotionType = 'discount' | 'bogo' | 'bundle' | 'free_shipping' | 'cashback' | 'loyalty_points' | 'free_gift' | 'upgrade';

export type PromotionScope = 'global' | 'category' | 'product' | 'user_segment' | 'location' | 'device';
export type ConditionType = 'cart_value' | 'product_quantity' | 'user_level' | 'user_segment' | 'location' | 'device' | 'time' | 'custom';
export type RewardType = 'percentage_discount' | 'fixed_discount' | 'free_product' | 'free_shipping' | 'cashback' | 'points' | 'upgrade';
export type LimitType = 'usage' | 'user' | 'total' | 'daily' | 'weekly' | 'monthly';

export type LimitScope = 'global' | 'user' | 'segment' | 'product';

export type PromotionStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'expired' | 'cancelled';
export type TrackingMethod = 'manual' | 'automated' | 'hybrid' | 'api_based' | 'rfid';
export type AlertType = 'low_stock' | 'out_of_stock' | 'overstock' | 'restock_needed' | 'discontinued';

export type AlertSeverity = 'info' | 'warning' | 'critical' | 'emergency';
export type RestockingMethod = 'manual' | 'automatic' | 'just_in_time' | 'periodic' | 'demand_based';
export type ForecastingAlgorithm = 'moving_average' | 'exponential_smoothing' | 'arima' | 'neural_network' | 'ensemble';
export type RoundingMethod = 'none' | 'up' | 'down' | 'nearest';
export type TransactionType = 'purchase' | 'refund' | 'exchange' | 'gift' | 'subscription' | 'donation';

export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'disputed';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'stripe' | 'apple_pay' | 'google_pay' | 'crypto' | 'bank_transfer' | 'store_credit' | 'gift_card';

export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'cancelled';
export type AnalyticsPeriod = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type InsightType = 'opportunity' | 'issue' | 'trend' | 'anomaly' | 'prediction';
export type FraudAction = 'flag' | 'block' | 'review' | 'require_verification';
// Event Types
export * from "./types.types";
