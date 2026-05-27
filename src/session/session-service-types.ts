import type { SessionConfig, SessionPreset, TimerConfig } from "./types";

export interface SessionServiceOptions {
  autoSave?: boolean;
  enableNotifications?: boolean;
  enableAnalytics?: boolean;
  enableAntiCheat?: boolean;
  timerConfig?: Partial<TimerConfig>;
}

export interface SessionStatsResult {
  totalSessions: number;
  completedSessions: number;
  abandonedSessions: number;
  totalFocusTime: number;
  averageSessionDuration: number;
  currentStreak: number;
  longestStreak: number;
}

export interface CreateCustomPresetInput {
  name: string;
  duration: number;
  breakDuration?: number;
  intervals?: number;
  category?: string;
  strictMode?: boolean;
  dndEnabled?: boolean;
  description?: string;
}
