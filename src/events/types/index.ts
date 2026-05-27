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
import type { SocialEventDefinitions } from './social';
import type { SquadEventDefinitions } from './squad';
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
import type { BossEventDefinitions } from './boss';
import type { EventsEventDefinitions } from './events';
import type { FocusIdentityEventDefinitions } from './focus-identity';
import type { SessionStoryEventDefinitions } from './session-story';
import type { CompanionPromiseEventDefinitions } from './companion-promise';
import type { FocusContractEventDefinitions } from './focus-contract';

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
export * from './social';
export * from './squad';
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
export * from './boss';
export * from './events';
export * from './focus-identity';
export * from './session-story';
export * from './companion-promise';
export * from './focus-contract';

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
    SocialEventDefinitions,
    SquadEventDefinitions,
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
    BossEventDefinitions,
    EventsEventDefinitions,
    FocusIdentityEventDefinitions,
    SessionStoryEventDefinitions,
    CompanionPromiseEventDefinitions,
    FocusContractEventDefinitions {
  [key: string]: unknown;
}

export type EventChannel = keyof EventChannels;

export type EventPayload<T extends EventChannel> = EventChannels[T];

export interface GenericEvent {
  type: string;
  data: unknown;
  timestamp: number;
  source?: string;
}
