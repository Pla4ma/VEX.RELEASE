export interface EventMetadata {
  correlationId?: string;
  source?: string;
  timestamp: number;
}

export interface DeviceInfo {
  appVersion?: string;
  platform?: string;
}

export interface BaseSessionCompletionEvent {
  data: Record<string, unknown>;
  metadata?: EventMetadata;
  sessionId: string;
  type: string;
  userId: string;
}

export interface SessionCompletedEvent extends BaseSessionCompletionEvent {
  type: 'session_completed';
}
export interface SessionAbortedEvent extends BaseSessionCompletionEvent {
  type: 'session_aborted';
}
export interface SessionTimeoutEvent extends BaseSessionCompletionEvent {
  type: 'session_timeout';
}
export interface SessionPerformanceCalculatedEvent extends BaseSessionCompletionEvent {
  type: 'session_performance_calculated';
}
export interface SessionMilestoneReachedEvent extends BaseSessionCompletionEvent {
  type: 'session_milestone_reached';
}
export interface SessionRecordBrokenEvent extends BaseSessionCompletionEvent {
  type: 'session_record_broken';
}
export interface SessionAchievementUnlockedEvent extends BaseSessionCompletionEvent {
  type: 'session_achievement_unlocked';
}
export interface SessionAchievementProgressUpdatedEvent extends BaseSessionCompletionEvent {
  type: 'session_achievement_progress_updated';
}
export interface SessionAnalyticsGeneratedEvent extends BaseSessionCompletionEvent {
  type: 'session_analytics_generated';
}
export interface SessionPerformanceReportEvent extends BaseSessionCompletionEvent {
  type: 'session_performance_report';
}
