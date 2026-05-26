import type { DiscountType, ItemMetadata, ShippingInfo, TransactionDiscount, TransactionMetadata } from './types';

export interface StockTracking {
  enabled: boolean;
  method: TrackingMethod;
  accuracy: number; // 0-100
  real_time: boolean;
}

export type TrackingMethod = 'manual' | 'automated' | 'hybrid' | 'api_based' | 'rfid';

export interface StockAlert {
  id: string;
  type: AlertType;
  threshold: number;
  severity: AlertSeverity;
  recipients: AlertRecipient[];
  actions: AlertAction[];
  enabled: boolean;
}

export type AlertType = 'low_stock' | 'out_of_stock' | 'overstock' | 'restock_needed' | 'discontinued';

export type AlertSeverity = 'info' | 'warning' | 'critical' | 'emergency';

export interface AlertRecipient {
  type: 'email' | 'sms' | 'webhook' | 'user';
  address: string;
  role?: string;
}

export interface AlertAction {
  type: 'notification' | 'auto_restock' | 'price_adjust' | 'hide_product' | 'custom';
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

export type RestockingMethod = 'manual' | 'automatic' | 'just_in_time' | 'periodic' | 'demand_based';

export interface StockForecasting {
  enabled: boolean;
  algorithm: ForecastingAlgorithm;
  data_sources: ForecastingDataSource[];
  accuracy: number; // 0-100
  horizon: number; // in days
}

export type ForecastingAlgorithm = 'moving_average' | 'exponential_smoothing' | 'arima' | 'neural_network' | 'ensemble';

export interface ForecastingDataSource {
  type: 'sales' | 'seasonal' | 'trend' | 'external' | 'social';
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

export type RoundingMethod = 'none' | 'up' | 'down' | 'nearest';

export interface ConversionFee {
  type: 'percentage' | 'fixed';
  value: number;
  min_fee?: number;
  max_fee?: number;
}

export interface CurrencyDisplay {
  symbol_position: 'before' | 'after';
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

export type TransactionType = 'purchase' | 'refund' | 'exchange' | 'gift' | 'subscription' | 'donation';

export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'disputed';

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

export interface PaymentInfo {
  method: PaymentMethod;
  amount: number;
  currency: string;
  status: PaymentStatus;
  gateway: string;
  transaction_id?: string;
  gateway_response?: unknown;
}

export type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'stripe' | 'apple_pay' | 'google_pay' | 'crypto' | 'bank_transfer' | 'store_credit' | 'gift_card';

export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'cancelled';

export interface TransactionTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  discounts: number;
  fees: number;
  total: number;
  currency: string;
}
