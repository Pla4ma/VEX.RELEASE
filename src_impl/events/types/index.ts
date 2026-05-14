/**
 * Event Types Barrel Export
 *
 * All event type definitions organized by domain.
 */

import type { AccessibilityEventDefinitions } from './accessibility';
import type { OnboardingEventDefinitions } from './onboarding';
import type { SubscriptionEventDefinitions } from './subscription';
import type { ThemeEventDefinitions } from './theme';
import type { NavigationEventDefinitions } from './navigation';
import type { AuthEventDefinitions } from './auth';
import type { UserEventDefinitions } from './user';
import type { NetworkEventDefinitions } from './network';
import type { AppEventDefinitions } from './app';
import type { ErrorEventDefinitions } from './error';
import type { FeatureEventDefinitions } from './feature';
import type { FeedbackEventDefinitions } from './feedback';
import type { AnalyticsEventDefinitions } from './analytics';
import type { NotificationEventDefinitions } from './notification';
import type { SettingsEventDefinitions } from './settings';
import type { CacheEventDefinitions } from './cache';
import type { StorageEventDefinitions } from './storage';
import type { RewardEventDefinitions } from './reward';
import type { RetentionEventDefinitions } from './retention';
import type { ProgressionEventDefinitions } from './progression';
import type { StreakEventDefinitions } from './streak';
import type { EconomyEventDefinitions } from './economy';
import type { ShopEventDefinitions } from './shop';
import type { SocialEventDefinitions } from './social';
import type { SquadEventDefinitions } from './squad';
import type { GuildEventDefinitions } from './guild';
import type { DuelEventDefinitions } from './duel';
import type { FeedEventDefinitions } from './feed';
import type { RankingEventDefinitions } from './ranking';
import type { ChallengeEventDefinitions } from './challenge';
import type { MilestoneEventDefinitions } from './milestone';
import type { SessionEventDefinitions } from './session';
import type { InventoryEventDefinitions } from './inventory';
import type { AchievementEventDefinitions } from './achievement';
import type { BoostEventDefinitions } from './boost';
import type { CoachEventDefinitions } from './coach';
import type { IntegrationEventDefinitions } from './integration';
import type { SeasonEventDefinitions } from './season';
import type { BossEventDefinitions } from './boss';
import type { LeaderboardEventDefinitions } from './leaderboard';
import type { CosmeticsEventDefinitions } from './cosmetics';
import type { EventsEventDefinitions } from './events';
import type { WeeklyQuestEventDefinitions } from './weekly-quest';
import type { FocusIdentityEventDefinitions } from './focus-identity';
import type { NeuroplasticityEventDefinitions } from './neuroplasticity';
import type { SessionStoryEventDefinitions } from './session-story';
import type { EmotionRetentionEventDefinitions } from './emotion-retention';
import type { BattlePassEventDefinitions } from './battle-pass';
import type { ProductivityEventDefinitions } from './productivity';

export * from './emotion-retention';
export * from './battle-pass';
export * from './productivity';
export * from './base';
export * from './onboarding';
export * from './subscription';
export * from './theme';
export * from './navigation';
export * from './auth';
export * from './user';
export * from './network';
export * from './app';
export * from './error';
export * from './feature';
export * from './feedback';
export * from './analytics';
export * from './notification';
export * from './settings';
export * from './cache';
export * from './storage';
export * from './reward';
export * from './retention';
export * from './progression';
export * from './streak';
export * from './economy';
export * from './shop';
export * from './social';
export * from './squad';
export * from './guild';
export * from './duel';
export * from './feed';
export * from './ranking';
export * from './challenge';
export * from './milestone';
export * from './session';
export * from './inventory';
export * from './achievement';
export * from './boost';
export * from './coach';
export * from './integration';
export * from './season';
export * from './boss';
export * from './leaderboard';
export * from './cosmetics';
export * from './events';
export * from './weekly-quest';
export * from './focus-identity';
export * from './neuroplasticity';
export * from './session-story';
export * from './emotion-retention';

/**
 * Master EventChannels interface combining all domain events
 */
export interface EventChannels
  extends AccessibilityEventDefinitions,
    OnboardingEventDefinitions,
    SubscriptionEventDefinitions,
    ThemeEventDefinitions,
    NavigationEventDefinitions,
    AuthEventDefinitions,
    UserEventDefinitions,
    NetworkEventDefinitions,
    AppEventDefinitions,
    ErrorEventDefinitions,
    FeatureEventDefinitions,
    FeedbackEventDefinitions,
    AnalyticsEventDefinitions,
    NotificationEventDefinitions,
    SettingsEventDefinitions,
    CacheEventDefinitions,
    StorageEventDefinitions,
    RewardEventDefinitions,
    RetentionEventDefinitions,
    ProgressionEventDefinitions,
    StreakEventDefinitions,
    EconomyEventDefinitions,
    ShopEventDefinitions,
    SocialEventDefinitions,
    SquadEventDefinitions,
    GuildEventDefinitions,
    DuelEventDefinitions,
    FeedEventDefinitions,
    RankingEventDefinitions,
    ChallengeEventDefinitions,
    MilestoneEventDefinitions,
    SessionEventDefinitions,
    InventoryEventDefinitions,
    AchievementEventDefinitions,
    BoostEventDefinitions,
    CoachEventDefinitions,
    IntegrationEventDefinitions,
    SeasonEventDefinitions,
    BossEventDefinitions,
    LeaderboardEventDefinitions,
    CosmeticsEventDefinitions,
    EventsEventDefinitions,
    WeeklyQuestEventDefinitions,
    FocusIdentityEventDefinitions,
    NeuroplasticityEventDefinitions,
    SessionStoryEventDefinitions,
    EmotionRetentionEventDefinitions,
    BattlePassEventDefinitions,
    ProductivityEventDefinitions {
  'accessibility:initialized': {
    preferences: unknown;
    timestamp: number;
  };
  'accessibility:preferences_updated': {
    oldPreferences: unknown;
    newPreferences: unknown;
    changes: unknown;
    timestamp: number;
  };
  [key: string]: unknown;
}

/**
 * Event channel names as union type
 */
export type EventChannel = keyof EventChannels;

/**
 * Event payload type helper
 */
export type EventPayload<T extends EventChannel> = EventChannels[T];

/**
 * Generic event with unknown data
 */
export interface GenericEvent {
  type: string;
  data: unknown;
  timestamp: number;
  source?: string;
}

