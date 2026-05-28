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
