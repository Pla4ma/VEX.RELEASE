import type {
  SessionHistoryEntry,
  InterruptionRecord,
  AntiCheatFlag,
  RecoveryRecord,
} from '../types';

export interface SessionAnalyticsEvent {
  eventName: string;
  userId: string;
  sessionId?: string;
  timestamp: number;
  properties: Record<string, unknown>;
}

export interface EngagementMetrics {
  totalSessions: number;
  completedSessions: number;
  abandonedSessions: number;
  completionRate: number;
  avgSessionDuration: number;
  totalFocusTime: number;
}

export interface PatternMetrics {
  bestTimeOfDay: number;
  bestDayOfWeek: number;
  avgInterruptionsPerSession: number;
  recoverySuccessRate: number;
  avgFocusQuality: number;
}
