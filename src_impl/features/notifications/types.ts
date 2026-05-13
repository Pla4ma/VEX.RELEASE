export type NotificationType = 'session_reminder' | 'achievement_unlocked' | 'challenge_update' | 'social_invite' | 'system_update' | 'progress_milestone' | 'streak_update' | 'reward_claimed' | 'leaderboard_change' | 'feature_announcement' | 'maintenance' | 'security' | 'billing' | 'custom';

export type NotificationCategory = 'productivity' | 'social' | 'gamification' | 'system' | 'security' | 'billing' | 'updates' | 'reminders' | 'achievements' | 'challenges';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';

export type NotificationChannel = 'in_app' | 'push' | 'email' | 'sms' | 'webhook';

export type NotificationStatus = 'pending' | 'scheduled' | 'sending' | 'delivered' | 'read' | 'failed' | 'expired' | 'cancelled';
export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled' | 'failed';
export type DeliveryStatus = 'pending' | 'processing' | 'sent' | 'delivered' | 'failed' | 'cancelled';
// Event Types
// Webhook Types
export * from "./types.types";
