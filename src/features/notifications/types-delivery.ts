import type { NotificationChannel, NotificationCategory } from './types-core';

export interface NotificationAnalytics {
  userId: string;
  timeframe: 'hourly' | 'daily' | 'weekly' | 'monthly';
  metrics: {
    totalReceived: number;
    totalRead: number;
    totalClicked: number;
    readRate: number;
    clickRate: number;
    averageResponseTime: number;
    categoryBreakdown: Record<NotificationCategory, number>;
    channelBreakdown: Record<NotificationChannel, number>;
  };
  trends: { received: TrendData[]; read: TrendData[]; clicked: TrendData[] };
  insights: string[];
  recommendations: string[];
}

export interface TrendData {
  timestamp: Date;
  value: number;
  change: number;
  significance: 'low' | 'medium' | 'high';
}

export interface NotificationDelivery {
  id: string;
  notificationId: string;
  userId: string;
  channel: NotificationChannel;
  status: DeliveryStatus;
  attempts: DeliveryAttempt[];
  deliveredAt?: Date;
  failedAt?: Date;
  error?: DeliveryError;
  metadata: DeliveryMetadata;
}

export type DeliveryStatus =
  | 'pending'
  | 'processing'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'cancelled';

export interface DeliveryAttempt {
  attempt: number;
  timestamp: Date;
  status: DeliveryStatus;
  response?: unknown;
  error?: string;
  duration: number;
}

export interface DeliveryError {
  code: string;
  message: string;
  type: 'temporary' | 'permanent';
  retryable: boolean;
  retryAfter?: number;
}

export interface DeliveryMetadata {
  provider: string;
  messageId?: string;
  trackingId?: string;
  cost?: number;
  latency?: number;
}

export interface NotificationEvent {
  type:
    | 'notification_sent'
    | 'notification_delivered'
    | 'notification_read'
    | 'notification_clicked'
    | 'notification_failed'
    | 'preferences_updated';
  userId: string;
  notificationId?: string;
  channelId?: NotificationChannel;
  data: Record<string, unknown>;
  timestamp: Date;
}

export interface NotificationWebhook {
  id: string;
  name: string;
  url: string;
  events: NotificationEvent['type'][];
  secret: string;
  active: boolean;
  retryPolicy: WebhookRetryPolicy;
  headers: Record<string, string>;
  createdAt: Date;
  lastTriggered?: Date;
}

export interface WebhookRetryPolicy {
  enabled: boolean;
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  retryDelay: number;
}

export interface WebhookPayload {
  event: NotificationEvent['type'];
  data: Record<string, unknown>;
  timestamp: Date;
  signature: string;
  version: string;
}
