/**
 * Live Ops System Types
 *
 * Phase 12.2 — Remote config, A/B testing, events calendar
 */

// ============================================================================
// Remote Config
// ============================================================================

export interface RemoteConfig {
  version: number;
  updatedAt: number;
  features: FeatureFlags;
  content: ContentConfig;
  experiments: ExperimentConfig[];
  events: LiveEvent[];
}

export interface FeatureFlags {
  // Feature toggles
  enableNewOnboarding: boolean;
  enableAdvancedAnalytics: boolean;
  enableSocialFeatures: boolean;
  enablePushNotifications: boolean;
  // Boss schedule
  bossRotation: string[];
  specialBossChance: number;
  // Store
  showPremiumOffers: boolean;
  discountPercentage: number;
}

export interface ContentConfig {
  // Challenge rotation
  dailyChallengePool: string[];
  weeklyChallengePool: string[];
  // Boss schedules
  bossSpawnRates: Record<string, number>;
  // Theme
  currentTheme: string;
  holidayTheme: string | null;
}

// ============================================================================
// A/B Testing
// ============================================================================

export interface ExperimentConfig {
  id: string;
  name: string;
  description: string;
  status: 'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
  startDate: string;
  endDate: string;
  variants: ExperimentVariant[];
  trafficAllocation: number;
  targetAudience: AudienceCriteria;
  metrics: string[];
}

export interface ExperimentVariant {
  id: string;
  name: string;
  config: Partial<FeatureFlags>;
  weight: number;
}

export interface AudienceCriteria {
  userTypes?: ('new' | 'returning' | 'vip')[];
  platforms?: ('ios' | 'android' | 'web')[];
  minLevel?: number;
  maxLevel?: number;
  countries?: string[];
}

export interface UserExperimentAssignment {
  userId: string;
  experimentId: string;
  variantId: string;
  assignedAt: number;
}

// ============================================================================
// Live Events Calendar
// ============================================================================

export interface LiveEvent {
  id: string;
  name: string;
  description: string;
  type: 'XP_BOOST' | 'BOSS_EVENT' | 'CHALLENGE_EVENT' | 'SALE' | 'SEASONAL';
  status: 'UPCOMING' | 'ACTIVE' | 'ENDED';
  startTime: number;
  endTime: number;
  // Event bonuses
  xpMultiplier?: number;
  coinMultiplier?: number;
  specialBossId?: string;
  specialChallenges?: string[];
  discountPercentage?: number;
  // Visuals
  bannerImage?: string;
  themeColor?: string;
  // Notifications
  preEventReminder?: number; // hours before
}

export interface EventParticipation {
  userId: string;
  eventId: string;
  joinedAt: number;
  progress: number;
  rewardsClaimed: boolean;
}

// ============================================================================
// Push Notification Campaigns
// ============================================================================

export interface NotificationCampaign {
  id: string;
  name: string;
  type: 'RETENTION' | 'ENGAGEMENT' | 'PROMOTIONAL' | 'EVENT';
  status: 'DRAFT' | 'SCHEDULED' | 'SENT' | 'CANCELLED';
  scheduledTime: number;
  audience: AudienceCriteria;
  content: {
    title: string;
    body: string;
    data?: Record<string, unknown>;
    deepLink?: string;
  };
  // Metrics
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
}

// ============================================================================
// Constants
// ============================================================================

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  enableNewOnboarding: true,
  enableAdvancedAnalytics: true,
  enableSocialFeatures: true,
  enablePushNotifications: true,
  bossRotation: ['boss-procrastinator', 'boss-distractor', 'boss-perfectionist'],
  specialBossChance: 0.1,
  showPremiumOffers: true,
  discountPercentage: 0,
};

// ============================================================================
// Helper Types
// ============================================================================

export type ExperimentStatus = 'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
export type EventType = 'XP_BOOST' | 'BOSS_EVENT' | 'CHALLENGE_EVENT' | 'SALE' | 'SEASONAL';
export type EventStatus = 'UPCOMING' | 'ACTIVE' | 'ENDED';
export type CampaignType = 'RETENTION' | 'ENGAGEMENT' | 'PROMOTIONAL' | 'EVENT';
export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'SENT' | 'CANCELLED';
