/**
 * Themes Feature Types
 *
 * Types for UI themes, visual customization, and user experience personalization.
 */
import type { AnimationTheme, ColorPalette, ComponentTheme, PlatformSupport, SpacingTheme, ThemeFallback, ThemeMetadata, TypographyTheme, VersionSupport } from './types';

export interface Theme {
  id: string;
  name: string;
  description: string;
  type: ThemeType;
  category: ThemeCategory;
  status: ThemeStatus;
  configuration: ThemeConfiguration;
  colors: ColorPalette;
  typography: TypographyTheme;
  spacing: SpacingTheme;
  components: ComponentTheme;
  animations: AnimationTheme;
  metadata: ThemeMetadata;
  created_at: Date;
  updated_at: Date;
}

export type ThemeType =
  | 'light'
  | 'dark'
  | 'auto'
  | 'custom'
  | 'seasonal'
  | 'event'
  | 'accessibility'
  | 'brand';

export type ThemeCategory =
  | 'default'
  | 'minimal'
  | 'modern'
  | 'classic'
  | 'playful'
  | 'professional'
  | 'gaming'
  | 'accessibility'
  | 'seasonal'
  | 'brand';

export type ThemeStatus =
  | 'active'
  | 'inactive'
  | 'draft'
  | 'deprecated'
  | 'premium'
  | 'exclusive';

export interface ThemeConfiguration {
  mode: ThemeMode;
  auto_switch: AutoSwitchConfig;
  accessibility: AccessibilityConfig;
  performance: PerformanceConfig;
  compatibility: CompatibilityConfig;
}

export type ThemeMode =
  | 'light'
  | 'dark'
  | 'auto'
  | 'system'
  | 'custom';

export interface AutoSwitchConfig {
  enabled: boolean;
  schedule: SwitchSchedule;
  conditions: SwitchCondition[];
  transition: TransitionConfig;
}

export interface SwitchSchedule {
  type: 'time_based' | 'sunrise_sunset' | 'user_activity';
  light_start?: string; // HH:mm
  dark_start?: string; // HH:mm
  timezone: string;
}

export interface SwitchCondition {
  type: ConditionType;
  trigger: string;
  value: unknown;
  operator: string;
}

export type ConditionType =
  | 'time'
  | 'location'
  | 'battery'
  | 'user_preference'
  | 'ambient_light'
  | 'system_theme';

export interface TransitionConfig {
  enabled: boolean;
  duration: number; // in milliseconds
  easing: string;
  type: TransitionType;
}

export type TransitionType =
  | 'fade'
  | 'slide'
  | 'dissolve'
  | 'crossfade'
  | 'instant';

export interface AccessibilityConfig {
  high_contrast: boolean;
  reduced_motion: boolean;
  screen_reader: boolean;
  keyboard_navigation: boolean;
  color_blind_support: ColorBlindSupport;
  font_scaling: FontScaling;
}

export interface ColorBlindSupport {
  enabled: boolean;
  type: ColorBlindType;
  adjustments: ColorAdjustment[];
}

export type ColorBlindType =
  | 'protanopia'
  | 'deuteranopia'
  | 'tritanopia'
  | 'achromatopsia';

export interface ColorAdjustment {
  color: string;
  adjusted: string;
  algorithm: string;
}

export interface FontScaling {
  enabled: boolean;
  base_size: number;
  scale_factor: number;
  max_size: number;
  min_size: number;
}

export interface PerformanceConfig {
  gpu_acceleration: boolean;
  reduced_animations: boolean;
  lazy_loading: boolean;
  cache_optimization: boolean;
  memory_limit: number; // in MB
}

export interface CompatibilityConfig {
  browsers: BrowserSupport[];
  platforms: PlatformSupport[];
  versions: VersionSupport[];
  fallbacks: ThemeFallback[];
}

export interface BrowserSupport {
  name: string;
  min_version: string;
  supported_features: string[];
  polyfills: string[];
}

