export interface BaseModel {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
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
  onboardingCompletedAt?: string | null;
}
export type UserRole = "user" | "moderator" | "admin" | "superadmin";
export type UserStatus = "active" | "inactive" | "suspended" | "pending";
export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  accessibility: AccessibilityPreferences;
}
export interface NotificationPreferences {
  push: boolean;
  email: boolean;
  sms: boolean;
  inApp: boolean;
  digestFrequency: "realtime" | "daily" | "weekly" | "never";
  quietHours: QuietHoursConfig;
}
export interface QuietHoursConfig {
  enabled: boolean;
  start: string;
  end: string;
  timezone: string;
}
export interface PrivacyPreferences {
  profileVisibility: "public" | "followers" | "private";
  activityStatus: boolean;
  readReceipts: boolean;
  allowTagging: boolean;
  allowMentions: boolean;
  dataSharing: boolean;
}
export interface AccessibilityPreferences {
  reduceMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReaderOptimized: boolean;
  colorBlindMode?: "deuteranopia" | "protanopia" | "tritanopia";
}
export interface UserMetadata {
  lastLoginAt?: string;
  loginCount: number;
  signupSource?: string;
  referringUserId?: string;
  deviceHistory: UserDeviceInfo[];
}
export interface UserDeviceInfo {
  id: string;
  platform: string;
  model: string;
  osVersion: string;
  appVersion: string;
  lastUsedAt: string;
  pushToken?: string;
}
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
export type AchievementCategory =
  | "social"
  | "gaming"
  | "economy"
  | "exploration"
  | "mastery"
  | "special";
export type AchievementTier =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond";
export interface AchievementCriteria {
  type: string;
  target: number;
  conditions?: Record<string, unknown>;
}
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
export interface SquadMember {
  userId: string;
  role: SquadMemberRole;
  joinedAt: string;
  contributions: number;
}
export type SquadMemberRole = "member" | "officer" | "coLeader" | "leader";
export interface SquadSettings {
  visibility: "public" | "private" | "inviteOnly";
  requiresApproval: boolean;
  maxMembers: number;
  allowInvites: boolean;
  allowChat: boolean;
}
export interface SquadStats {
  totalMembers: number;
  totalAchievements: number;
  totalPoints: number;
  rank?: number;
  winRate: number;
}
export interface Wallet extends BaseModel {
  userId: string;
  balance: number;
  currency: string;
  frozenBalance: number;
  transactions: Transaction[];
  stats: WalletStats;
}
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
export type TransactionType =
  | "deposit"
  | "withdrawal"
  | "transfer"
  | "purchase"
  | "reward"
  | "refund"
  | "fee"
  | "bonus";
export type TransactionStatus =
  | "pending"
  | "completed"
  | "failed"
  | "cancelled"
  | "reversed";
export interface WalletStats {
  totalDeposits: number;
  totalWithdrawals: number;
  totalTransactions: number;
  volume24h: number;
  volume7d: number;
  volume30d: number;
}
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
export type NotificationType =
  | "system"
  | "achievement"
  | "squad"
  | "economy"
  | "social"
  | "content"
  | "security";
export type NotificationPriority = "low" | "normal" | "high" | "urgent";
export interface ActivityFeedItem extends BaseModel {
  userId: string;
  type: ActivityType;
  title: string;
  description?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
  relatedEntities: RelatedEntity[];
}
export type ActivityType =
  | "joined"
  | "created"
  | "updated"
  | "completed"
  | "achieved"
  | "earned"
  | "shared"
  | "commented"
  | "liked";
export interface RelatedEntity {
  type: string;
  id: string;
  name: string;
  image?: string;
}
export interface SearchResult<T> {
  items: T[];
  total: number;
  filters: AppliedFilter[];
  suggestions?: string[];
  didYouMean?: string;
}
export interface AppliedFilter {
  key: string;
  value: unknown;
  operator: string;
}
