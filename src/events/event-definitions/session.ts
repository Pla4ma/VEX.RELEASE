/**
 * Session Event Definitions
 *
 * Event interfaces for session lifecycle: created, started, paused, resumed,
 * completed, abandoned, purity changes, and perfect focus.
 */

import type { SessionSummary, SessionConfig } from "../../session/types";

export type SessionEventType =
  | "session:created"
  | "session:started"
  | "session:paused"
  | "session:resumed"
  | "session:completed"
  | "session:abandoned"
  | "session:failed"
  | "session:tick"
  | "session:purity_changed"
  | "session:perfect_focus_earned";

export interface SessionCreatedEvent {
  sessionId: string;
  userId: string;
  config: SessionConfig;
  timestamp: number;
}

export interface SessionStartedEvent {
  sessionId: string;
  userId: string;
  startedAt: number;
  phase: string;
}

export interface SessionPausedEvent {
  sessionId: string;
  userId: string;
  pausedAt: number;
  reason?: string;
}

export interface SessionResumedEvent {
  sessionId: string;
  userId: string;
  resumedAt: number;
  pausedDuration: number;
}

export interface SessionCompletedEvent {
  sessionId: string;
  userId: string;
  summary: SessionSummary;
  chestResult?: unknown;
  timestamp: number;
  crossSystemData: {
    progressionSnapshot: {
      previousLevel: number;
      newLevel: number;
      xpGained: number;
      totalXp: number;
    };
    economySnapshot: {
      coinsEarned: number;
      gemsEarned: number;
      bonusItemGranted: boolean;
    };
    streakSnapshot: { days: number; increased: boolean; maintained: boolean };
    socialSnapshot: {
      sharedToFeed: boolean;
      squadNotified: boolean;
      guildNotified: boolean;
    };
  };
}

export interface SessionAbandonedEvent {
  sessionId: string;
  userId: string;
  abandonedAt: number;
  elapsedTime: number;
  canRecover: boolean;
  reason?: string;
}

export interface SessionPurityChangedEvent {
  sessionId: string;
  userId: string;
  purityScore: number;
  purityLabel: "Elite" | "Good" | "Okay" | "Distracted";
  previousLabel: "Elite" | "Good" | "Okay" | "Distracted";
  streakMultiplier: number;
}

export interface SessionPerfectFocusEarnedEvent {
  sessionId: string;
  userId: string;
  purityScore: number;
  streakMultiplier: number;
  duration: number;
}
