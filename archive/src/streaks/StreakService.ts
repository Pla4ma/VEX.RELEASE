/**
 * Streak Service
 *
 * Deeply integrated streak system that connects to:
 * - Rewards (streak milestone rewards)
 * - Progression (streak XP bonuses)
 * - Social (streak leaderboards, friend comparisons)
 * - Analytics (streak tracking, comeback detection)
 * - Notifications (streak reminders, at-risk alerts)
 * - AI Coach (streak recovery plans)
 */

import { getMMKVStorageAdapter } from '../persistence/MMKVStorageAdapter';
import { eventBus } from '../events';
import { capture } from '../shared/analytics/analytics-service';
import { ProgressionEvents } from '../shared/analytics/analytics-events';
import { createDebugger } from '../utils/debug';
import { scheduleStreakReminderNotification } from '../features/ai-coach/services';
import {
  StreakStateSchema,
  type StreakState,
  type StreakMilestone,
  STREAK_MILESTONES,
} from './streak-config';

const debug = createDebugger('streaks');

// Re-export types for backward compatibility
export type { StreakState, StreakMilestone } from './streak-config';

export class StreakService {
  private userId: string | null = null;
  private state: StreakState;
  private checkInterval: ReturnType<typeof setInterval> | null = null;

  constructor(userId?: string) {
    this.userId = userId ?? null;
    this.state = StreakStateSchema.parse({});

    this.setupEventListeners();
    this.loadState();
    this.startRiskCheck();
  }

  setUserId(userId: string): void {
    if (userId === this.userId) {
      return;
    }

    if (this.userId) {
      this.clearLocalState(this.userId);
    }

    if (!userId) {
      this.userId = null;
      return;
    }

    this.userId = userId;
    this.loadState();
    debug.info('StreakService user set: %s', userId);
  }

  private clearLocalState(userId: string): void {
    this.state = StreakStateSchema.parse({});

    const storage = getMMKVStorageAdapter();
    void storage.removeItem(`streaks:${userId}`).catch((error: unknown) => {
      debug.error('Failed to clear streak local state', error as Error);
    });
  }

  private setupEventListeners(): void {
    eventBus.subscribe('app:day_changed', () => {
      void this.checkStreakStatus();
    });
  }

  async recordSession(): Promise<StreakState> {
    if (!this.userId) {
      throw new Error('StreakService: No user set');
    }

    const now = Date.now();
    const lastSession = this.state.lastSessionAt;

    if (!lastSession) {
      // First session ever
      this.state.currentStreak = 1;
      this.state.streakStartAt = now;
      this.state.longestStreak = 1;
    } else {
      const hoursSinceLastSession = (now - lastSession) / (1000 * 60 * 60);

      if (hoursSinceLastSession < 48) {
        // Within streak window (allowing for timezone flexibility)
        if (!this.isSameDay(lastSession, now)) {
          // New day, increment streak
          this.state.currentStreak++;
          this.state.comebackStreak = 0;

          // Update longest streak
          if (this.state.currentStreak > this.state.longestStreak) {
            this.state.longestStreak = this.state.currentStreak;
          }

          // Check for milestones
          this.checkMilestones();
        }
        // If same day, streak stays same (multiple sessions per day allowed)
      } else if (this.state.frozenUntil && now < this.state.frozenUntil) {
        // Streak is frozen, don't break
        debug.info('Session during streak freeze - streak maintained');
      } else if (this.state.graceUses < this.state.maxGraceUses) {
        // Use grace period
        this.state.graceUses++;
        debug.info('Used grace period %d/%d', this.state.graceUses, this.state.maxGraceUses);
      } else {
        // Streak broken - check for comeback
        const wasComeback = this.handleStreakBreak();

        if (wasComeback) {
          // Grant comeback bonus
          this.grantComebackReward();
        }
      }
    }

    this.state.lastSessionAt = now;
    this.state.isAtRisk = false;
    this.state.riskLevel = 'NONE';

    await this.saveState();
    this.publishUpdate();

    // Track streak updated analytics
    capture(ProgressionEvents.STREAK_UPDATED, {
      user_id: this.userId,
      streak_days: this.state.currentStreak,
      longest_streak: this.state.longestStreak,
      is_comeback: this.state.comebackStreak > 0,
    });

    return this.state;
  }

  private handleStreakBreak(): boolean {
    const oldStreak = this.state.currentStreak;
    const now = Date.now();

    // Reset streak
    this.state.currentStreak = 1;
    this.state.streakStartAt = now;
    this.state.graceUses = 0;
    this.state.lastStreakDiedAt = now;
    this.state.streakFuneralShown = false;

    // Check if this is a comeback (previous streak was significant)
    const isComeback = oldStreak >= 7;

    const userId = this.userId;
    if (!userId) {return isComeback;}

    if (isComeback) {
      this.state.comebackStreak = 1;

      // Publish comeback event
      eventBus.publish('streak:comeback', {
        userId,
        previousStreak: oldStreak,
        comebackDay: 1,
      });

      debug.info('Streak comeback started! Previous: %d', oldStreak);
    } else {
      this.state.comebackStreak = 0;
    }

    // Publish break event
    eventBus.publish('streak:broken', {
      userId,
      previousStreak: oldStreak,
      wasComeback: isComeback,
      diedAt: now,
    });

    // Track streak broken analytics
    capture(ProgressionEvents.STREAK_BROKEN, {
      user_id: userId,
      previous_streak: oldStreak,
      was_comeback: isComeback,
    });

    return isComeback;
  }

  private grantComebackReward(): void {
    const userId = this.userId;
    if (!userId) {return;}

    debug.info('Comeback reward granted', {
      userId,
      comebackStreak: this.state.comebackStreak,
    });

    // Also notify AI coach for comeback plan
    eventBus.publish('coach:comeback_detected', {
      userId,
      comebackStreak: this.state.comebackStreak,
    });
  }

  private checkMilestones(): void {
    const milestone = STREAK_MILESTONES.find(m => m.days === this.state.currentStreak);

    if (!milestone || !this.userId) {return;}

    // Now TypeScript knows this.userId is string
    const userIdStr: string = this.userId;

    debug.info('Milestone reward granted', {
      userId: userIdStr,
      streak: this.state.currentStreak,
      reward: milestone.reward,
    });

    // Unlock badge if applicable
    if (milestone.badgeId) {
      eventBus.publish('achievement:unlock', {
        achievementId: milestone.badgeId,
        userId: userIdStr,
      });
    }

    // Milestone XP bonus to progression
    eventBus.publish('streak:apply_bonus', {
      userId: userIdStr,
      bonus: milestone.reward.type === 'XP' ? milestone.reward.amount : 0,
    });

    // Social sharing
    eventBus.publish('social:streak_milestone', {
      userId: userIdStr,
      streak: this.state.currentStreak,
      milestone: milestone.days,
    });

    // Track streak milestone analytics
    capture(ProgressionEvents.STREAK_MILESTONE_REACHED, {
      user_id: userIdStr,
      streak_days: this.state.currentStreak,
      milestone: milestone.days,
      reward_type: milestone.reward.type,
      reward_amount: milestone.reward.amount,
    });

    debug.info('Streak milestone reached: %d days!', milestone.days);
  }

  private startRiskCheck(): void {
    // Check every hour for streak risk
    this.checkInterval = setInterval(() => {
      void this.checkStreakStatus();
    }, 60 * 60 * 1000);
  }

  private async checkStreakStatus(): Promise<void> {
    if (!this.state.lastSessionAt || this.state.currentStreak === 0) {
      return;
    }

    const now = Date.now();
    const hoursSinceLastSession = (now - this.state.lastSessionAt) / (1000 * 60 * 60);

    // Check if it's a new day and no session yet
    const lastSessionDay = new Date(this.state.lastSessionAt).getDate();
    const today = new Date(now).getDate();

    if (lastSessionDay !== today && hoursSinceLastSession > 20) {
      // Streak is at risk
      this.state.isAtRisk = true;
      this.state.riskLevel = this.calculateStreakRisk(hoursSinceLastSession);

      if (this.state.riskLevel === 'HIGH') {
        await this.scheduleSameDayRiskReminder(now);
      }

      // Send notification based on risk level
      this.sendRiskNotification();

      await this.saveState();
      this.publishUpdate();
    }
  }

  private calculateStreakRisk(hoursSinceLastSession: number): StreakState['riskLevel'] {
    if (hoursSinceLastSession < 24) {
      return 'LOW';
    }

    if (hoursSinceLastSession < 36) {
      return 'MEDIUM';
    }

    if (hoursSinceLastSession < 42) {
      return 'HIGH';
    }

    return 'CRITICAL';
  }

  private async scheduleSameDayRiskReminder(now: number): Promise<void> {
    if (!this.userId) {
      return;
    }

    const scheduledTime = this.getSameDayReminderTime(now);
    if (!scheduledTime) {
      return;
    }

    await scheduleStreakReminderNotification(
      this.userId,
      this.state.currentStreak,
      scheduledTime
    );
  }

  private getSameDayReminderTime(now: number): Date | null {
    const reminderTime = new Date(now + 60 * 60 * 1000);
    const latestSameDayReminder = new Date(now);
    latestSameDayReminder.setHours(21, 0, 0, 0);

    if (this.isSameDay(reminderTime.getTime(), now)) {
      return reminderTime <= latestSameDayReminder ? reminderTime : latestSameDayReminder;
    }

    return now < latestSameDayReminder.getTime() ? latestSameDayReminder : null;
  }

  private sendRiskNotification(): void {
    if (!this.state.isAtRisk) {return;}

    const messages: Record<string, string> = {
      LOW: 'Don\'t forget to maintain your streak today!',
      MEDIUM: 'Your streak is at risk! Complete a session soon.',
      HIGH: 'Your streak will break soon! Last chance to save it.',
      CRITICAL: 'CRITICAL: Complete a session NOW to save your streak!',
    };

    eventBus.publish('notification:send', {
      userId: this.userId ?? undefined,
      type: 'streak_risk',
      title: 'Streak Alert!',
      body: messages[this.state.riskLevel],
      priority: this.state.riskLevel === 'CRITICAL' ? 'high' : 'normal',
      data: {
        currentStreak: this.state.currentStreak,
        riskLevel: this.state.riskLevel,
        hoursRemaining: Math.max(0, 48 - (Date.now() - (this.state.lastSessionAt || 0)) / (1000 * 60 * 60)),
      },
    });

    // Also notify AI coach for intervention
    if ((this.state.riskLevel === 'HIGH' || this.state.riskLevel === 'CRITICAL') && this.userId) {
      eventBus.publish('coach:streak_at_risk', {
        userId: this.userId,
        streak: this.state.currentStreak,
        riskLevel: this.state.riskLevel,
      });
    }
  }

  private async loadState(): Promise<void> {
    if (!this.userId) {return;}

    try {
      const key = `streaks:${this.userId}`;
      const storage = getMMKVStorageAdapter();
      const data = await storage.getItem(key);

      if (data) {
        const parsed = JSON.parse(data);
        this.state = StreakStateSchema.parse({
          ...this.state,
          ...parsed,
        });

        debug.info('Loaded streak state: %d days', this.state.currentStreak);
      }
    } catch (error) {
      debug.error('Failed to load streak state', error as Error);
    }
  }

  private async saveState(): Promise<void> {
    if (!this.userId) {return;}

    try {
      const key = `streaks:${this.userId}`;
      const storage = getMMKVStorageAdapter();
      await storage.setItem(key, JSON.stringify(this.state));
    } catch (error) {
      debug.error('Failed to save streak state', error as Error);
    }
  }

  freezeStreak(hours: number = 24): boolean {
    if (!this.userId) {return false;}

    const now = Date.now();
    this.state.frozenUntil = now + (hours * 60 * 60 * 1000);
    this.state.freezeUses++;

    debug.info('Streak frozen for %d hours', hours);
    return true;
  }

  private isSameDay(timestamp1: number, timestamp2: number): boolean {
    const d1 = new Date(timestamp1);
    const d2 = new Date(timestamp2);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  private publishUpdate(): void {
    if (!this.userId) {return;}

    eventBus.publish('streak:updated', {
      userId: this.userId,
      state: this.state,
    });
  }

  destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  getState(): StreakState {
    return this.state;
  }

  markFuneralShown(): void {
    this.state.streakFuneralShown = true;
    this.saveState();

    if (this.userId) {
      eventBus.publish('streak:funeral_shown', {
        userId: this.userId,
        previousStreak: this.state.currentStreak,
        diedAt: this.state.lastStreakDiedAt ?? Date.now(),
      });
    }
  }
}

let streakServiceInstance: StreakService | null = null;

export function getStreakService(userId?: string): StreakService {
  if (!streakServiceInstance) {
    streakServiceInstance = new StreakService(userId);
  } else if (userId) {
    streakServiceInstance.setUserId(userId);
  }
  return streakServiceInstance;
}
