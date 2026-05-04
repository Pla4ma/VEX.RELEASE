/**
 * Data Model Type Definitions
 *
 * Core data models used throughout the VEX application.
 * These types represent the domain entities of the application.
 */

import type { DateRange } from './global';

/**
 * Base model interface with common fields
 */
export interface BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

/**
 * User model representing application users
 */
export interface User extends BaseModel {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  squadId?: string | null;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  verified: boolean;
  role: UserRole;
  status: UserStatus;
  preferences: UserPreferences;
  metadata: UserMetadata;
}

/**
 * User role types
 */
export type UserRole = 'user' | 'moderator' | 'admin' | 'superadmin';

/**
 * User status types
 */
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

/**
 * User preferences
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  accessibility: AccessibilityPreferences;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  push: boolean;
  email: boolean;
  sms: boolean;
  inApp: boolean;
  digestFrequency: 'realtime' | 'daily' | 'weekly' | 'never';
  quietHours: QuietHoursConfig;
}

/**
 * Quiet hours configuration
 */
export interface QuietHoursConfig {
  enabled: boolean;
  start: string; // HH:mm format
  end: string; // HH:mm format
  timezone: string;
}

/**
 * Privacy preferences
 */
export interface PrivacyPreferences {
  profileVisibility: 'public' | 'followers' | 'private';
  activityStatus: boolean;
  readReceipts: boolean;
  allowTagging: boolean;
  allowMentions: boolean;
  dataSharing: boolean;
}

/**
 * Accessibility preferences
 */
export interface AccessibilityPreferences {
  reduceMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReaderOptimized: boolean;
  colorBlindMode?: 'deuteranopia' | 'protanopia' | 'tritanopia';
}

/**
 * User metadata
 */
export interface UserMetadata {
  lastLoginAt?: string;
  loginCount: number;
  signupSource?: string;
  referringUserId?: string;
  deviceHistory: UserDeviceInfo[];
}

/**
 * Device information for user device history
 */
export interface UserDeviceInfo {
  id: string;
  platform: string;
  model: string;
  osVersion: string;
  appVersion: string;
  lastUsedAt: string;
  pushToken?: string;
}

/**
 * Session model for user authentication
 */
export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: string;
  createdAt: string;
  deviceId: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Achievement model for gamification
 */
export interface Achievement extends BaseModel {
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  tier: AchievementTier;
  points: number;
  criteria: AchievementCriteria;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

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
 * Achievement criteria
 */
export interface AchievementCriteria {
  type: string;
  target: number;
  conditions?: Record<string, unknown>;
}

/**
 * Squad model for teams/groups
 */
export interface Squad extends BaseModel {
  name: string;
  description?: string;
  avatar?: string;
  banner?: string;
  ownerId: string;
  members: SquadMember[];
  settings: SquadSettings;
  stats: SquadStats;
}

/**
 * Squad member
 */
export interface SquadMember {
  userId: string;
  role: SquadMemberRole;
  joinedAt: string;
  contributions: number;
}

/**
 * Squad member roles
 */
export type SquadMemberRole = 'member' | 'officer' | 'coLeader' | 'leader';

/**
 * Squad settings
 */
export interface SquadSettings {
  visibility: 'public' | 'private' | 'inviteOnly';
  requiresApproval: boolean;
  maxMembers: number;
  allowInvites: boolean;
  allowChat: boolean;
}

/**
 * Squad stats
 */
export interface SquadStats {
  totalMembers: number;
  totalAchievements: number;
  totalPoints: number;
  rank?: number;
  winRate: number;
}

/**
 * Wallet model for economy system
 */
export interface Wallet extends BaseModel {
  userId: string;
  balance: number;
  currency: string;
  frozenBalance: number;
  transactions: Transaction[];
  stats: WalletStats;
}

/**
 * Transaction model
 */
export interface Transaction extends BaseModel {
  walletId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  description?: string;
  metadata?: Record<string, unknown>;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

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
 * Wallet statistics
 */
export interface WalletStats {
  totalDeposits: number;
  totalWithdrawals: number;
  totalTransactions: number;
  volume24h: number;
  volume7d: number;
  volume30d: number;
}

/**
 * Notification model
 */
export interface Notification extends BaseModel {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  image?: string;
  actionUrl?: string;
  priority: NotificationPriority;
  read: boolean;
  readAt?: string;
  deliveredAt?: string;
}

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
 * Activity feed item
 */
export interface ActivityFeedItem extends BaseModel {
  userId: string;
  type: ActivityType;
  title: string;
  description?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
  relatedEntities: RelatedEntity[];
}

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

/**
 * Related entity reference
 */
export interface RelatedEntity {
  type: string;
  id: string;
  name: string;
  image?: string;
}

/**
 * Search result model
 */
export interface SearchResult<T> {
  items: T[];
  total: number;
  filters: AppliedFilter[];
  suggestions?: string[];
  didYouMean?: string;
}

/**
 * Applied filter
 */
export interface AppliedFilter {
  key: string;
  value: unknown;
  operator: string;
}
