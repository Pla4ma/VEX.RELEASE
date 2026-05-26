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
  type: 'product_viewed' | 'product_added_to_cart' | 'order_placed' | 'payment_completed' | 'order_shipped' | 'order_delivered' | 'refund_issued';
  userId: string;
  sessionId: string;
  data: Record<string, unknown>;
  timestamp: Date;
}
