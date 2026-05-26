/**
 * Shop Feature Types
 *
 * Types for in-game shop, virtual economy, and marketplace features.
 */
import type { AnimationConfig, ColorScheme, DisplayTheme, FeaturedSection, RecommendationEngine, ResponsiveConfig, SearchConfiguration, ShopAnalytics, ShopCategorySection, ShopCurrency, ShopFilter, ShopInventory, ShopSettings, ShopSorting, ShopTransaction, SpacingConfig, TypographyConfig } from './types';

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

export type ShopType = 'general_store' | 'specialty_shop' | 'premium_store' | 'marketplace' | 'auction_house' | 'trade_post' | 'mystery_shop' | 'seasonal_shop' | 'event_shop' | 'vip_shop';

export type ShopCategory = 'items' | 'cosmetics' | 'abilities' | 'boosts' | 'currency' | 'bundles' | 'services' | 'upgrades' | 'collectibles' | 'consumables';

export type ShopStatus = 'active' | 'inactive' | 'maintenance' | 'seasonal' | 'event' | 'limited_time' | 'coming_soon';

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

export type LayoutType = 'grid' | 'list' | 'carousel' | 'masonry' | 'featured_grid' | 'category_tabs' | 'infinite_scroll';

export interface LayoutSection {
  id: string;
  type: SectionType;
  title: string;
  position: number;
  size: SectionSize;
  items: LayoutItem[];
  visibility: VisibilityConfig;
}

export type SectionType = 'featured' | 'new_arrivals' | 'best_sellers' | 'special_offers' | 'categories' | 'recommendations' | 'recently_viewed' | 'limited_time';

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

export type ItemType = 'product' | 'category' | 'banner' | 'promotion' | 'recommendation' | 'advertisement';

export interface ItemMetadata {
  title?: string;
  description?: string;
  image?: string;
  badge?: string;
  price?: number;
  discount?: number;
  rating?: number;
  tags?: string[];
  variant?: string;
  customization?: string;
  gift_wrap?: boolean;
  message?: string;
}

export interface VisibilityConfig {
  condition: VisibilityCondition;
  user_segment: string[];
  time_restriction: TimeRestriction;
  device_restriction: DeviceRestriction;
}

export interface VisibilityCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: unknown;
}

export interface TimeRestriction {
  start?: Date;
  end?: Date;
  timezone: string;
  recurring?: RecurringPattern;
}

export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  days?: number[]; // 0-6 for weekly
  dates?: number[]; // 1-31 for monthly
  months?: number[]; // 1-12 for yearly
}

export interface DeviceRestriction {
  platforms: PlatformType[];
  min_version?: string;
  max_version?: string;
}

export type PlatformType = 'ios' | 'android' | 'web' | 'desktop' | 'console';

export interface NavigationConfig {
  type: NavigationType;
  items: NavigationItem[];
  breadcrumbs: BreadcrumbConfig;
  search: SearchNavigation;
}

export type NavigationType = 'sidebar' | 'top_bar' | 'bottom_bar' | 'dropdown' | 'mega_menu';

export interface NavigationItem {
  id: string;
  label: string;
  type: 'link' | 'category' | 'dropdown' | 'action';
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
