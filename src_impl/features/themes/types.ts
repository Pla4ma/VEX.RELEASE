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
export type ThemeMode =
  | 'light'
  | 'dark'
  | 'auto'
  | 'system'
  | 'custom';
export type ConditionType =
  | 'time'
  | 'location'
  | 'battery'
  | 'user_preference'
  | 'ambient_light'
  | 'system_theme';
export type TransitionType =
  | 'fade'
  | 'slide'
  | 'dissolve'
  | 'crossfade'
  | 'instant';
export type ColorBlindType =
  | 'protanopia'
  | 'deuteranopia'
  | 'tritanopia'
  | 'achromatopsia';
export type PlatformType =
  | 'ios'
  | 'android'
  | 'web'
  | 'desktop'
  | 'console';
export type FontCategory =
  | 'serif'
  | 'sans_serif'
  | 'monospace'
  | 'cursive'
  | 'fantasy'
  | 'display';
export type LoadingStrategy =
  | 'block'
  | 'swap'
  | 'fallback'
  | 'optional';

export type FallbackDisplay =
  | 'block'
  | 'swap'
  | 'fallback'
  | 'optional';
export type TextTransform =
  | 'none'
  | 'capitalize'
  | 'uppercase'
  | 'lowercase';

export type TextDecoration =
  | 'none'
  | 'underline'
  | 'overline'
  | 'line_through';
export type FormLayout =
  | 'vertical'
  | 'horizontal'
  | 'inline'
  | 'grid';

export type LabelPosition =
  | 'top'
  | 'left'
  | 'right'
  | 'hidden';
export type LicenseType =
  | 'mit'
  | 'apache'
  | 'gpl'
  | 'creative_commons'
  | 'proprietary'
  | 'custom';
export type IssueType =
  | 'visual'
  | 'performance'
  | 'accessibility'
  | 'compatibility'
  | 'usability';

export type IssueSeverity =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';
export type TrendPeriod =
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly';
// Event Types
export * from "./types.types";
