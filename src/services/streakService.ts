import { createDebugger } from '../utils/debug';
import { capture } from '../shared/analytics/analytics-service';
import { StreakEvents } from '../shared/analytics/analytics-events';
import type { StreakData, StreakUpdate } from './streak-types';
import { calculateStreakUpdate } from './streak-calculations';

export type { StreakData, StreakUpdate };

const debug = createDebugger('streak-service');

class StreakService {
  private userId: string = '';
  private streakData: StreakData = {
    currentStreak: 0,
    longestStreak: 0,
    lastSessionDate: null,
    streakHistory: [],
    isAtRisk: false,
    hoursRemaining: 24,
  };

  setUserId(userId: string): void {
    this.userId = userId;
    debug.info('Streak service initialized for user:', userId);
  }

  getStreakData(): StreakData {
    return { ...this.streakData };
  }

  async updateStreak(sessionDate?: string): Promise<StreakUpdate> {
    if (!this.userId) {
      debug.error('No user ID set for streak service');
      return {
        newStreak: 0,
        streakMaintained: false,
        streakBroken: false,
        newLongestStreak: false,
      };
    }
    const sessionDateTime = sessionDate ? new Date(sessionDate) : new Date();
    const previousStreak = this.streakData.currentStreak;
    try {
      const update = calculateStreakUpdate(this.streakData, sessionDateTime);
      this.streakData.currentStreak = update.newStreak;
      this.streakData.lastSessionDate = sessionDateTime.toISOString();
      if (update.newLongestStreak) {
        this.streakData.longestStreak = update.newStreak;
      }
      this.addToStreakHistory(sessionDateTime, update.streakMaintained);
      this.updateRiskStatus();
      capture(StreakEvents.STREAK_UPDATED, {
        user_id: this.userId,
        previous_streak: previousStreak,
        new_streak: update.newStreak,
        streak_maintained: update.streakMaintained,
        streak_broken: update.streakBroken,
        new_longest_streak: update.newLongestStreak,
      });
      debug.info('Streak updated successfully', {
        previousStreak,
        newStreak: update.newStreak,
        maintained: update.streakMaintained,
        broken: update.streakBroken,
      });
      return update;
    } catch (error) {
      debug.error('Failed to update streak:', error);
      return {
        newStreak: previousStreak,
        streakMaintained: false,
        streakBroken: false,
        newLongestStreak: false,
      };
    }
  }

  private addToStreakHistory(sessionDate: Date, maintained: boolean): void {
    const dateStr = sessionDate.toISOString().split('T')[0]!;
    this.streakData.streakHistory = this.streakData.streakHistory.filter(
      (entry) => entry.date !== dateStr,
    );
    this.streakData.streakHistory.unshift({
      date: dateStr,
      sessionsCompleted: 1,
      maintained,
    });
    if (this.streakData.streakHistory.length > 30) {
      this.streakData.streakHistory = this.streakData.streakHistory.slice(0, 30);
    }
  }

  private updateRiskStatus(): void {
    if (!this.streakData.lastSessionDate) {
      this.streakData.isAtRisk = false;
      this.streakData.hoursRemaining = 24;
      return;
    }
    const now = new Date();
    const lastSession = new Date(this.streakData.lastSessionDate);
    const hoursSinceLastSession =
      (now.getTime() - lastSession.getTime()) / (1000 * 60 * 60);
    this.streakData.isAtRisk =
      hoursSinceLastSession > 20 && this.streakData.currentStreak > 0;
    this.streakData.hoursRemaining = Math.max(0, 24 - hoursSinceLastSession);
  }

  getStreakSummary() {
    return {
      currentStreak: this.streakData.currentStreak,
      longestStreak: this.streakData.longestStreak,
      isAtRisk: this.streakData.isAtRisk,
      hoursRemaining: Math.ceil(this.streakData.hoursRemaining),
      lastSessionDate: this.streakData.lastSessionDate,
      streakHistory: this.streakData.streakHistory.slice(0, 7),
    };
  }

  canClaimStreakFreeze(): boolean {
    return this.streakData.isAtRisk && this.streakData.currentStreak >= 3;
  }

  async applyStreakFreeze(): Promise<boolean> {
    if (!this.canClaimStreakFreeze()) {
      debug.warn('Cannot apply streak freeze - conditions not met');
      return false;
    }
    try {
      if (this.streakData.lastSessionDate) {
        const extendedDate = new Date(this.streakData.lastSessionDate);
        extendedDate.setHours(extendedDate.getHours() + 24);
        this.streakData.lastSessionDate = extendedDate.toISOString();
      }
      this.updateRiskStatus();
      capture(StreakEvents.STREAK_FREEZE_USED, {
        user_id: this.userId,
        streak_length: this.streakData.currentStreak,
      });
      debug.info('Streak freeze applied successfully');
      return true;
    } catch (error) {
      debug.error('Failed to apply streak freeze:', error);
      return false;
    }
  }

  reset(): void {
    this.userId = '';
    this.streakData = {
      currentStreak: 0,
      longestStreak: 0,
      lastSessionDate: null,
      streakHistory: [],
      isAtRisk: false,
      hoursRemaining: 24,
    };
    debug.info('Streak service reset');
  }
}

export const streakService = new StreakService();
