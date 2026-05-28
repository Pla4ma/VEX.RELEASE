/**
 * Event Definitions — Central Registry
 *
 * Composes all domain-specific event types into the unified EventType union,
 * EventRegistry map, and EventPayload utility type.
 */

import type {
  SessionEventType, SessionCreatedEvent, SessionStartedEvent,
  SessionPausedEvent, SessionResumedEvent, SessionCompletedEvent,
  SessionAbandonedEvent, SessionPurityChangedEvent,
  SessionPerfectFocusEarnedEvent,
} from "./session";
import type {
  EconomyEventType, EconomyGrantEvent, EconomySpendEvent,
  EconomyTransactionEvent, EconomyPurchaseCompleteEvent,
} from "./economy";
import type {
  ProgressionEventType, ProgressionXpEarnedEvent, ProgressionLevelUpEvent,
  ProgressionAchievementUnlockedEvent, ProgressionMilestoneReachedEvent,
} from "./progression";
import type {
  StreakEventType, StreakUpdatedEvent, StreakBrokenEvent,
  StreakAtRiskEvent, StreakFreezeUsedEvent,
} from "./streak";
import type {
  SocialEventType, SocialActivityEvent, SocialSquadActivityEvent,
  SocialGuildActivityEvent, SocialDuelChallengeEvent,
} from "./social";
import type {
  ChallengesEventType, ChallengesCheckProgressEvent,
  ChallengesCompletedEvent, ChallengesProgressUpdatedEvent,
} from "./challenges";
import type {
  CoachEventType, CoachTriggerEvent, CoachSessionFeedbackEvent,
  CoachComebackEvent,
} from "./coach";
import type {
  NotificationEventType, NotificationSendEvent, NotificationOpenedEvent,
} from "./notification";
import type {
  AnalyticsEventType, AnalyticsTrackEvent, AnalyticsScreenViewEvent,
} from "./analytics";
import type {
  IntegrationEventType, IntegrationSessionRewardsEvent,
  IntegrationSessionChallengesEvent, IntegrationSessionSocialEvent,
  IntegrationEconomyProgressionEvent,
} from "./integration";

/** Union of all event type strings across every domain. */
export type EventType =
  | SessionEventType
  | EconomyEventType
  | ProgressionEventType
  | StreakEventType
  | SocialEventType
  | ChallengesEventType
  | CoachEventType
  | NotificationEventType
  | AnalyticsEventType
  | IntegrationEventType;

/** Maps every EventType string to its corresponding payload interface. */
export interface EventRegistry {
  "session:created": SessionCreatedEvent;
  "session:started": SessionStartedEvent;
  "session:paused": SessionPausedEvent;
  "session:resumed": SessionResumedEvent;
  "session:completed": SessionCompletedEvent;
  "session:abandoned": SessionAbandonedEvent;
  "session:purity_changed": SessionPurityChangedEvent;
  "session:perfect_focus_earned": SessionPerfectFocusEarnedEvent;
  "economy:grant": EconomyGrantEvent;
  "economy:spend": EconomySpendEvent;
  "economy:transaction": EconomyTransactionEvent;
  "economy:purchase_complete": EconomyPurchaseCompleteEvent;
  "progression:xp_earned": ProgressionXpEarnedEvent;
  "progression:level_up": ProgressionLevelUpEvent;
  "progression:achievement_unlocked": ProgressionAchievementUnlockedEvent;
  "progression:milestone_reached": ProgressionMilestoneReachedEvent;
  "streak:updated": StreakUpdatedEvent;
  "streak:broken": StreakBrokenEvent;
  "streak:at_risk": StreakAtRiskEvent;
  "streak:freeze_used": StreakFreezeUsedEvent;
  "social:activity": SocialActivityEvent;
  "social:squad_activity": SocialSquadActivityEvent;
  "social:guild_activity": SocialGuildActivityEvent;
  "social:duel_challenge": SocialDuelChallengeEvent;
  "challenges:check_progress": ChallengesCheckProgressEvent;
  "challenges:completed": ChallengesCompletedEvent;
  "challenges:progress_updated": ChallengesProgressUpdatedEvent;
  "coach:trigger": CoachTriggerEvent;
  "coach:session_feedback": CoachSessionFeedbackEvent;
  "coach:comeback": CoachComebackEvent;
  "notification:send": NotificationSendEvent;
  "notification:opened": NotificationOpenedEvent;
  "analytics:track": AnalyticsTrackEvent;
  "analytics:screen_view": AnalyticsScreenViewEvent;
  "integration:session_rewards": IntegrationSessionRewardsEvent;
  "integration:session_challenges": IntegrationSessionChallengesEvent;
  "integration:session_social": IntegrationSessionSocialEvent;
  "integration:economy_progression": IntegrationEconomyProgressionEvent;
}

/** Resolves the payload type for a given EventType key. */
export type EventPayload<T extends keyof EventRegistry> = EventRegistry[T];

// Re-export all domain types for consumers
export type {
  SessionEventType, SessionCreatedEvent, SessionStartedEvent,
  SessionPausedEvent, SessionResumedEvent, SessionCompletedEvent,
  SessionAbandonedEvent, SessionPurityChangedEvent,
  SessionPerfectFocusEarnedEvent,
  EconomyEventType, EconomyGrantEvent, EconomySpendEvent,
  EconomyTransactionEvent, EconomyPurchaseCompleteEvent,
  ProgressionEventType, ProgressionXpEarnedEvent, ProgressionLevelUpEvent,
  ProgressionAchievementUnlockedEvent, ProgressionMilestoneReachedEvent,
  StreakEventType, StreakUpdatedEvent, StreakBrokenEvent,
  StreakAtRiskEvent, StreakFreezeUsedEvent,
  SocialEventType, SocialActivityEvent, SocialSquadActivityEvent,
  SocialGuildActivityEvent, SocialDuelChallengeEvent,
  ChallengesEventType, ChallengesCheckProgressEvent,
  ChallengesCompletedEvent, ChallengesProgressUpdatedEvent,
  CoachEventType, CoachTriggerEvent, CoachSessionFeedbackEvent,
  CoachComebackEvent,
  NotificationEventType, NotificationSendEvent, NotificationOpenedEvent,
  AnalyticsEventType, AnalyticsTrackEvent, AnalyticsScreenViewEvent,
  IntegrationEventType, IntegrationSessionRewardsEvent,
  IntegrationSessionChallengesEvent, IntegrationSessionSocialEvent,
  IntegrationEconomyProgressionEvent,
};
