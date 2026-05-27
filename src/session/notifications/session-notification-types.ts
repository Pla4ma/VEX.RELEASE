export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: string;
  priority?: "high" | "normal" | "low";
}

export interface StreakMilestoneResult {
  title: string;
  body: string;
}

export interface AntiCheatWarningResult {
  title: string;
  body: string;
}
