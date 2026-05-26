import type { FilterOption, FilterType, NavigationType } from './types';

export interface ThemeCustomization {
  colors?: Record<string, string>;
  fonts?: Record<string, string>;
}

export interface DisplayTheme {
  mode: 'light' | 'dark' | 'auto';
  style: 'minimal' | 'modern' | 'classic' | 'playful';
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

export type AnimationType = 'fade' | 'slide' | 'bounce' | 'zoom' | 'flip' | 'none';

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

export type FeaturedType = 'spotlight' | 'banner' | 'carousel' | 'grid' | 'showcase';

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
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in';
  value: unknown;
}

export interface SelectionCriteria {
  type: CriteriaType;
  filters: ProductFilter[];
  sort_by: string;
  limit: number;
}

export type CriteriaType = 'manual' | 'algorithmic' | 'trending' | 'seasonal' | 'personalized';

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

