import type { AnalyticsPeriod, InAppNotifications, LocalizationSettings, PaymentMethod, SecuritySettings, ShippingMethod, TrendData } from './types';

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
  trend: 'up' | 'down' | 'stable';
  significance: 'low' | 'medium' | 'high';
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

export type InsightType = 'opportunity' | 'issue' | 'trend' | 'anomaly' | 'prediction';

export interface InsightImpact {
  level: 'low' | 'medium' | 'high' | 'critical';
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

export type FraudAction = 'flag' | 'block' | 'review' | 'require_verification';

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
  type: 'standard' | 'reduced' | 'zero';
}

export interface TaxCalculation {
  method: 'origin' | 'destination' | 'hybrid';
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

