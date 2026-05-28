export type {
  BaseSessionCompletionEvent,
  EventMetadata,
  DeviceInfo,
} from "./base-event-types";

export type {
  SessionCompletedEvent,
  SessionAbortedEvent,
  SessionTimeoutEvent,
} from "./session-lifecycle-events";

export type {
  SessionPerformanceCalculatedEvent,
  SessionAnalyticsGeneratedEvent,
  SessionPerformanceReportEvent,
} from "./performance-events";

export type {
  SessionMilestoneReachedEvent,
  SessionRecordBrokenEvent,
  SessionAchievementUnlockedEvent,
  SessionAchievementProgressUpdatedEvent,
} from "./achievement-events";

export type {
  SessionRewardsCalculatedEvent,
  SessionRewardsClaimedEvent,
  SessionRewardMultiplierActivatedEvent,
} from "./reward-events";

export type {
  SessionFeedbackRequestedEvent,
  SessionFeedbackSubmittedEvent,
  SessionSharedEvent,
  SessionComparedEvent,
} from "./feedback-social-events";

export type {
  SessionSystemMaintenanceEvent,
  SessionSystemErrorEvent,
} from "./system-events";

import type {
  SessionCompletedEvent,
  SessionAbortedEvent,
  SessionTimeoutEvent,
} from "./session-lifecycle-events";
import type {
  SessionPerformanceCalculatedEvent,
  SessionAnalyticsGeneratedEvent,
  SessionPerformanceReportEvent,
} from "./performance-events";
import type {
  SessionMilestoneReachedEvent,
  SessionRecordBrokenEvent,
  SessionAchievementUnlockedEvent,
  SessionAchievementProgressUpdatedEvent,
} from "./achievement-events";
import type {
  SessionRewardsCalculatedEvent,
  SessionRewardsClaimedEvent,
  SessionRewardMultiplierActivatedEvent,
} from "./reward-events";
import type {
  SessionFeedbackRequestedEvent,
  SessionFeedbackSubmittedEvent,
  SessionSharedEvent,
  SessionComparedEvent,
} from "./feedback-social-events";
import type {
  SessionSystemMaintenanceEvent,
  SessionSystemErrorEvent,
} from "./system-events";

export type SessionCompletionEventType =
  | SessionCompletedEvent
  | SessionAbortedEvent
  | SessionTimeoutEvent
  | SessionPerformanceCalculatedEvent
  | SessionMilestoneReachedEvent
  | SessionRecordBrokenEvent
  | SessionRewardsCalculatedEvent
  | SessionRewardsClaimedEvent
  | SessionRewardMultiplierActivatedEvent
  | SessionAchievementUnlockedEvent
  | SessionAchievementProgressUpdatedEvent
  | SessionAnalyticsGeneratedEvent
  | SessionPerformanceReportEvent
  | SessionFeedbackRequestedEvent
  | SessionFeedbackSubmittedEvent
  | SessionSharedEvent
  | SessionComparedEvent
  | SessionSystemMaintenanceEvent
  | SessionSystemErrorEvent;
