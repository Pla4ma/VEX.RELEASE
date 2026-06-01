export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  status: NotificationStatus;
  createdAt: Date;
  scheduledAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  expiresAt?: Date;
  metadata: NotificationMetadata;
}

export type NotificationType =
  | 'session_reminder'
  | 'achievement_unlocked'
  | 'challenge_update'
  | 'social_invite'
  | 'system_update'
  | 'progress_milestone'
  | 'streak_update'
  | 'reward_claimed'
  | 'leaderboard_change'
  | 'feature_announcement'
  | 'maintenance'
  | 'security'
  | 'billing'
  | 'custom';

export type NotificationCategory =
  | 'productivity'
  | 'social'
  | 'gamification'
  | 'system'
  | 'security'
  | 'billing'
  | 'updates'
  | 'reminders'
  | 'achievements'
  | 'challenges';

export type NotificationPriority =
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent'
  | 'critical';

export type NotificationChannel =
  | 'in_app'
  | 'push'
  | 'email'
  | 'sms'
  | 'webhook';

export type NotificationStatus =
  | 'pending'
  | 'scheduled'
  | 'sending'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'expired'
  | 'cancelled';

export interface NotificationMetadata {
  source: string;
  campaign?: string;
  version: string;
  platform?: string;
  deviceInfo?: DeviceInfo;
  geolocation?: Geolocation;
  sessionId?: string;
  correlationId?: string;
}

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop' | 'web';
  os: string;
  version: string;
  appVersion?: string;
  pushToken?: string;
}

export interface Geolocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timezone?: string;
  country?: string;
  city?: string;
}
