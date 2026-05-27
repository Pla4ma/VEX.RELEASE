import { eventBus } from "../../events";
import type { SessionConfig } from "../types";
import type { NotificationPayload } from "./session-notification-types";
export type { NotificationPayload } from "./session-notification-types";
import {
  buildInterruptionPayload,
  buildRecoveryPayload,
  buildStreakWarningPayload,
  buildDailyReminderPayload,
  buildBreakReminderPayload,
  buildRewardPayload,
  buildStreakMilestoneResult,
  getAntiCheatWarning,
} from "./session-notification-templates";

export class SessionNotifications {
  private userId: string | null = null;
  private scheduledNotifications: Map<string, number> = new Map();
  private enabled: boolean = true;

  setUserId(userId: string): void { this.userId = userId; }
  setEnabled(enabled: boolean): void { this.enabled = enabled; }

  async scheduleSessionStart(
    sessionId: string,
    config: SessionConfig,
    startTime: number,
    countdownSeconds?: number,
  ): Promise<void> {
    if (!this.enabled) return;
    const countdown = countdownSeconds || 0;
    if (countdown > 0) {
      this.scheduleNotification(
        `session_start_${sessionId}`,
        {
          title: "Session Starting Soon",
          body: `Your ${config.duration / 60} minute session starts in ${countdown} seconds`,
          data: { sessionId, type: "countdown" },
          priority: "normal",
        },
        startTime - countdown * 1000,
      );
    }
  }

  async scheduleSessionEnd(
    sessionId: string,
    endTime: number,
    sessionName?: string,
  ): Promise<void> {
    if (!this.enabled) return;
    this.scheduleNotification(
      `session_end_${sessionId}`,
      {
        title: "🎉 Session Complete!",
        body: `Great job! Your ${sessionName || "focus session"} has ended.`,
        data: { sessionId, type: "completion" },
        sound: "completion.mp3",
        priority: "high",
      },
      endTime,
    );
  }

  async sendInterruptionWarning(
    sessionId: string,
    severity: string,
    _timeRemaining: number,
  ): Promise<void> {
    if (!this.enabled) return;
    this.showNotification(buildInterruptionPayload(sessionId, severity));
  }

  async sendRecoveryReminder(sessionId: string, minutesElapsed: number): Promise<void> {
    if (!this.enabled) return;
    this.showNotification(buildRecoveryPayload(sessionId, minutesElapsed));
  }

  async sendStreakWarning(streakDays: number, hoursRemaining: number): Promise<void> {
    if (!this.enabled) return;
    this.showNotification(buildStreakWarningPayload(streakDays, hoursRemaining));
  }

  async scheduleDailyReminder(hour: number, minute: number): Promise<void> {
    if (!this.enabled) return;
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(hour, minute, 0, 0);
    if (reminderTime <= now) reminderTime.setDate(reminderTime.getDate() + 1);
    this.scheduleNotification("daily_reminder", buildDailyReminderPayload(), reminderTime.getTime());
  }

  async sendBreakReminder(breakDuration: number): Promise<void> {
    if (!this.enabled) return;
    this.showNotification(buildBreakReminderPayload(breakDuration));
  }

  async sendRewardNotification(xp: number, coins: number, gems: number): Promise<void> {
    if (!this.enabled) return;
    const payload = buildRewardPayload(xp, coins, gems);
    if (payload) this.showNotification(payload);
  }

  async sendStreakMilestone(streakDays: number): Promise<void> {
    if (!this.enabled) return;
    const { title, body } = buildStreakMilestoneResult(streakDays);
    this.showNotification({
      title,
      body,
      data: { type: "streak_milestone", streakDays },
      sound: "achievement.mp3",
      priority: "high",
    });
  }

  async sendAntiCheatWarning(violationType: string): Promise<void> {
    if (!this.enabled) return;
    const warning = getAntiCheatWarning(violationType);
    this.showNotification({
      ...warning,
      data: { type: "anti_cheat_warning", violationType },
      priority: "high",
    });
  }

  async cancelSessionNotifications(sessionId: string): Promise<void> {
    const prefixes = [`session_start_${sessionId}`, `session_end_${sessionId}`];
    for (const [key, timeoutId] of this.scheduledNotifications) {
      if (prefixes.some((p) => key.startsWith(p))) {
        clearTimeout(timeoutId);
        this.scheduledNotifications.delete(key);
      }
    }
  }

  async clearAllNotifications(): Promise<void> {
    for (const [_key, timeoutId] of this.scheduledNotifications) {
      clearTimeout(timeoutId);
    }
    this.scheduledNotifications.clear();
  }

  private scheduleNotification(id: string, payload: NotificationPayload, timestamp: number): void {
    const delay = timestamp - Date.now();
    if (delay <= 0) { this.showNotification(payload); return; }
    const timeoutId = window.setTimeout(() => {
      this.showNotification(payload);
      this.scheduledNotifications.delete(id);
    }, delay);
    const existing = this.scheduledNotifications.get(id);
    if (existing) clearTimeout(existing);
    this.scheduledNotifications.set(id, timeoutId);
  }

  private showNotification(payload: NotificationPayload): void {
    if (!this.enabled) return;
    eventBus.publish("notification:send", {
      type: (payload.data?.type as string) || "session",
      title: payload.title,
      body: payload.body,
      priority: payload.priority || "normal",
      data: payload.data,
    });
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(payload.title, {
        body: payload.body,
        icon: "/icon.png",
        badge: "/badge.png",
        tag: (payload.data?.sessionId as string) || "session",
        requireInteraction: payload.priority === "high",
      });
    }
  }
}

let sessionNotifications: SessionNotifications | null = null;
export function getSessionNotifications(): SessionNotifications {
  if (!sessionNotifications) sessionNotifications = new SessionNotifications();
  return sessionNotifications;
}
export default SessionNotifications;
