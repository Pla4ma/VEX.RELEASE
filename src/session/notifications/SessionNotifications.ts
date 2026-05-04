/**
 * Session Notifications
 *
 * Push notification management for session events.
 * Handles local notifications for reminders, completion, and warnings.
 */

import { eventBus } from '../../events';
import type { SessionConfig } from '../types';

// ============================================================================
// Notification Types
// ============================================================================

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: string;
  priority?: 'high' | 'normal' | 'low';
}

// ============================================================================
// Session Notifications Service
// ============================================================================

export class SessionNotifications {
  private userId: string | null = null;
  private scheduledNotifications: Map<string, number> = new Map();
  private enabled: boolean = true;

  setUserId(userId: string): void {
    this.userId = userId;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  // ============================================================================
  // Session Notifications
  // ============================================================================

  async scheduleSessionStart(sessionId: string, config: SessionConfig, startTime: number, countdownSeconds?: number): Promise<void> {
    if (!this.enabled) {return;}

    // Schedule countdown notification (if any)
    const countdown = countdownSeconds || 0;
    if (countdown > 0) {
      this.scheduleNotification(
        `session_start_${sessionId}`,
        {
          title: 'Session Starting Soon',
          body: `Your ${config.duration / 60} minute session starts in ${countdown} seconds`,
          data: { sessionId, type: 'countdown' },
          priority: 'normal',
        },
        startTime - countdown * 1000
      );
    }
  }

  async scheduleSessionEnd(sessionId: string, endTime: number, sessionName?: string): Promise<void> {
    if (!this.enabled) {return;}

    this.scheduleNotification(
      `session_end_${sessionId}`,
      {
        title: '🎉 Session Complete!',
        body: `Great job! Your ${sessionName || 'focus session'} has ended.`,
        data: { sessionId, type: 'completion' },
        sound: 'completion.mp3',
        priority: 'high',
      },
      endTime
    );
  }

  async sendInterruptionWarning(sessionId: string, severity: string, timeRemaining: number): Promise<void> {
    if (!this.enabled) {return;}

    const titles: Record<string, string> = {
      'CRITICAL': '⚠️ Session at Risk!',
      'MAJOR': '⚡ Interruption Detected',
      'MODERATE': '⏸️ Session Paused',
      'MINOR': 'Session Paused',
    };

    const bodies: Record<string, string> = {
      'CRITICAL': 'Resume immediately or lose your session progress!',
      'MAJOR': 'Your session is at risk. Tap to resume.',
      'MODERATE': 'Your focus session has been paused.',
      'MINOR': 'Brief pause detected. Ready when you are.',
    };

    this.showNotification({
      title: titles[severity] || 'Session Update',
      body: bodies[severity] || 'Your session status has changed.',
      data: { sessionId, type: 'interruption', severity },
      priority: severity === 'CRITICAL' ? 'high' : 'normal',
    });
  }

  async sendRecoveryReminder(sessionId: string, minutesElapsed: number): Promise<void> {
    if (!this.enabled) {return;}

    this.showNotification({
      title: '🔄 Recovery Available',
      body: `You can still recover your session. ${minutesElapsed} minutes have passed.`,
      data: { sessionId, type: 'recovery_reminder' },
      priority: 'normal',
    });
  }

  async sendStreakWarning(streakDays: number, hoursRemaining: number): Promise<void> {
    if (!this.enabled) {return;}

    this.showNotification({
      title: '🔥 Streak at Risk!',
      body: `Your ${streakDays}-day streak ends in ${hoursRemaining} hours. Start a session now!`,
      data: { type: 'streak_warning', streakDays, hoursRemaining },
      priority: 'high',
    });
  }

  // ============================================================================
  // Reminder Notifications
  // ============================================================================

  async scheduleDailyReminder(hour: number, minute: number): Promise<void> {
    if (!this.enabled) {return;}

    // In real implementation, this would schedule a recurring local notification
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(hour, minute, 0, 0);

    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    this.scheduleNotification(
      'daily_reminder',
      {
        title: '📅 Daily Focus Reminder',
        body: 'Time to start your daily focus session and keep your streak going!',
        data: { type: 'daily_reminder' },
        priority: 'normal',
      },
      reminderTime.getTime()
    );
  }

  async sendBreakReminder(breakDuration: number): Promise<void> {
    if (!this.enabled) {return;}

    this.showNotification({
      title: '☕ Break Time',
      body: `Take a ${breakDuration / 60} minute break. You've earned it!`,
      data: { type: 'break_reminder', breakDuration },
      priority: 'normal',
    });
  }

  // ============================================================================
  // Achievement & Reward Notifications
  // ============================================================================

  async sendRewardNotification(xp: number, coins: number, gems: number): Promise<void> {
    if (!this.enabled) {return;}

    const parts: string[] = [];
    if (xp > 0) {parts.push(`${xp} XP`);}
    if (coins > 0) {parts.push(`${coins} coins`);}
    if (gems > 0) {parts.push(`${gems} gems`);}

    if (parts.length === 0) {return;}

    this.showNotification({
      title: '🎉 Rewards Earned!',
      body: `You earned: ${parts.join(', ')}`,
      data: { type: 'rewards', xp, coins, gems },
      priority: 'normal',
    });
  }

  async sendStreakMilestone(streakDays: number): Promise<void> {
    if (!this.enabled) {return;}

    let title = '🔥 Streak Milestone!';
    let body = `You've maintained focus for ${streakDays} days straight!`;

    if (streakDays === 7) {
      title = '🏆 One Week Streak!';
      body = 'Amazing dedication! You\'ve focused for 7 days straight!';
    } else if (streakDays === 30) {
      title = '🌟 Month-Long Streak!';
      body = 'Incredible! A full month of daily focus sessions!';
    } else if (streakDays === 100) {
      title = '💯 Century Streak!';
      body = 'Legendary! 100 days of unwavering focus!';
    }

    this.showNotification({
      title,
      body,
      data: { type: 'streak_milestone', streakDays },
      sound: 'achievement.mp3',
      priority: 'high',
    });
  }

  // ============================================================================
  // Anti-Cheat Notifications
  // ============================================================================

  async sendAntiCheatWarning(violationType: string): Promise<void> {
    if (!this.enabled) {return;}

    const warnings: Record<string, { title: string; body: string }> = {
      'TIME_MANIPULATION': {
        title: '⚠️ Time Anomaly Detected',
        body: 'System time changes were detected. Please keep system time accurate.',
      },
      'DEVICE_CHANGE': {
        title: '⚠️ Device Change',
        body: 'Session continued on different device. Monitoring for consistency.',
      },
      'RAPID_COMPLETION': {
        title: '⚠️ Suspicious Activity',
        body: 'Unusually rapid session completion detected.',
      },
    };

    const warning = warnings[violationType] || {
      title: '⚠️ Session Warning',
      body: 'An issue was detected with your session.',
    };

    this.showNotification({
      ...warning,
      data: { type: 'anti_cheat_warning', violationType },
      priority: 'high',
    });
  }

  // ============================================================================
  // Cancel/Clear Notifications
  // ============================================================================

  async cancelSessionNotifications(sessionId: string): Promise<void> {
    // Cancel all notifications for this session
    const prefixes = [`session_start_${sessionId}`, `session_end_${sessionId}`];

    for (const [key, timeoutId] of this.scheduledNotifications) {
      if (prefixes.some(p => key.startsWith(p))) {
        clearTimeout(timeoutId);
        this.scheduledNotifications.delete(key);
      }
    }
  }

  async clearAllNotifications(): Promise<void> {
    // Clear all scheduled notifications
    for (const [key, timeoutId] of this.scheduledNotifications) {
      clearTimeout(timeoutId);
    }
    this.scheduledNotifications.clear();
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private scheduleNotification(id: string, payload: NotificationPayload, timestamp: number): void {
    const delay = timestamp - Date.now();

    if (delay <= 0) {
      // Already past, show immediately
      this.showNotification(payload);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      this.showNotification(payload);
      this.scheduledNotifications.delete(id);
    }, delay);

    // Cancel any existing notification with same ID
    const existing = this.scheduledNotifications.get(id);
    if (existing) {
      clearTimeout(existing);
    }

    this.scheduledNotifications.set(id, timeoutId);
  }

  private showNotification(payload: NotificationPayload): void {
    if (!this.enabled) {return;}

    // Emit to notification system
    eventBus.publish('notification:send', {
      type: payload.data?.type as string || 'session',
      title: payload.title,
      body: payload.body,
      priority: payload.priority || 'normal',
      data: payload.data,
    });

    // Also try native notifications if available
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(payload.title, {
        body: payload.body,
        icon: '/icon.png',
        badge: '/badge.png',
        tag: payload.data?.sessionId as string || 'session',
        requireInteraction: payload.priority === 'high',
      });
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let sessionNotifications: SessionNotifications | null = null;

export function getSessionNotifications(): SessionNotifications {
  if (!sessionNotifications) {
    sessionNotifications = new SessionNotifications();
  }
  return sessionNotifications;
}

export default SessionNotifications;
