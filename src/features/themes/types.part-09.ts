import type { ThemeUsage } from './types';

export type LicenseType =
  | 'mit'
  | 'apache'
  | 'gpl'
  | 'creative_commons'
  | 'proprietary'
  | 'custom';

export interface UserThemePreference {
  user_id: string;
  theme_id: string;
  customizations: ThemeCustomization[];
  settings: UserSettings;
  created_at: Date;
  updated_at: Date;
}

export interface ThemeCustomization {
  component: string;
  property: string;
  value: string;
  original_value?: string;
}

export interface UserSettings {
  auto_switch: boolean;
  accessibility: boolean;
  performance: boolean;
  custom_css: string;
  custom_js: string;
}

export interface ThemeAnalytics {
  theme_id: string;
  usage: ThemeUsage;
  performance: ThemePerformance;
  feedback: ThemeFeedback[];
  trends: ThemeTrend[];
}

export interface ThemePerformance {
  load_time: number; // in milliseconds
  render_time: number; // in milliseconds
  memory_usage: number; // in MB
  bundle_size: number; // in KB
  score: number; // 0-100
}

export interface ThemeFeedback {
  user_id: string;
  rating: number; // 1-5
  comment?: string;
  issues: ThemeIssue[];
  suggestions: string[];
  created_at: Date;
}

export interface ThemeIssue {
  type: IssueType;
  severity: IssueSeverity;
  description: string;
  component?: string;
  browser?: string;
  platform?: string;
}

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

export interface ThemeTrend {
  metric: string;
  period: TrendPeriod;
  data: TrendData[];
  trend: 'up' | 'down' | 'stable';
  significance: 'low' | 'medium' | 'high';
}

export type TrendPeriod =
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly';

export interface TrendData {
  timestamp: Date;
  value: number;
  change: number;
}

// Event Types
export interface ThemeEvent {
  type: 'theme_applied' | 'theme_customized' | 'theme_created' | 'theme_deleted' | 'theme_shared';
  userId: string;
  themeId: string;
  data: Record<string, unknown>;
  timestamp: Date;
}
