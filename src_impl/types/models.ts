/**
 * User role types
 */
export type UserRole = 'user' | 'moderator' | 'admin' | 'superadmin';

/**
 * User status types
 */
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';
/**
 * Achievement categories
 */
export type AchievementCategory =
  | 'social'
  | 'gaming'
  | 'economy'
  | 'exploration'
  | 'mastery'
  | 'special';

/**
 * Achievement tiers
 */
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
/**
 * Squad member roles
 */
export type SquadMemberRole = 'member' | 'officer' | 'coLeader' | 'leader';
/**
 * Transaction types
 */
export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'transfer'
  | 'purchase'
  | 'reward'
  | 'refund'
  | 'fee'
  | 'bonus';

/**
 * Transaction status
 */
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'reversed';
/**
 * Notification types
 */
export type NotificationType =
  | 'system'
  | 'achievement'
  | 'squad'
  | 'economy'
  | 'social'
  | 'content'
  | 'security';

/**
 * Notification priority
 */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
/**
 * Activity types
 */
export type ActivityType =
  | 'joined'
  | 'created'
  | 'updated'
  | 'completed'
  | 'achieved'
  | 'earned'
  | 'shared'
  | 'commented'
  | 'liked';

export * from "./models.types";
