/**
 * Streak Service
 *
 * Handles user streaks, streak calculations, and streak-related features.
 * Direct service implementation replacing archived system.
 */

import { createDebugger } from '../utils/debug';
import { capture } from '../shared/analytics/analytics-service';
import { StreakEvents } from '../shared/analytics/analytics-events';

const debug = createDebugger('streak-service');

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string | null;
  streakHistory: {
    date: string;
    sessionsCompleted: number;
    maintained: boolean;
  }[];
  isAtRisk: boolean;
  hoursRemaining: number;
}

export interface StreakUpdate {
  newStreak: number;
  streakMaintained: boolean;
  streakBroken: boolean;
  newLongestStreak: boolean;
}

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

  /**
   * Set the current user ID
   */
  setUserId(userId: string): void {
    this.userId = userId;
    debug.info('Streak service initialized for user:', userId);
  }

  /**
   * Get current streak data
   */
  getStreakData(): StreakData {
    return { ...this.streakData };
  }

  /**
   * Update streak based on session completion
   */
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

    const today = new Date();
    const sessionDateTime = sessionDate ? new Date(sessionDate) : today;
    const previousStreak = this.streakData.currentStreak;

    try {
      const update = this.calculateStreakUpdate(sessionDateTime);
      
      // Update streak data
      this.streakData.currentStreak = update.newStreak;
      this.streakData.lastSessionDate = sessionDateTime.toISOString();
      
      if (update.newLongestStreak) {
        this.streakData.longestStreak = update.newStreak;
      }

      // Add to history
      this.addToStreakHistory(sessionDateTime, update.streakMaintained);

      // Update risk status
      this.updateRiskStatus();

      // Track analytics
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

  /**
   * Calculate streak update based on session date
   */
  private calculateStreakUpdate(sessionDate: Date): StreakUpdate {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sessionDay = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());
    const lastSessionDay = this.streakData.lastSessionDate 
      ? new Date(new Date(this.streakData.lastSessionDate).getFullYear(), new Date(this.streakData.lastSessionDate).getMonth(), new Date(this.streakData.lastSessionDate).getDate())
      : null;

    let newStreak = this.streakData.currentStreak;
    let streakMaintained = false;
    let streakBroken = false;
    let newLongestStreak = false;

    // If no previous session, start new streak
    if (!lastSessionDay) {
      newStreak = 1;
      streakMaintained = true;
    }
    // If session is today
    else if (sessionDay.getTime() === today.getTime()) {
      newStreak = this.streakData.currentStreak;
      streakMaintained = true;
    }
    // If session is yesterday (maintained streak)
    else if (sessionDay.getTime() === today.getTime() - (24 * 60 * 60 * 1000)) {
      newStreak = this.streakData.currentStreak + 1;
      streakMaintained = true;
    }
    // If session is more than 1 day ago (streak broken)
    else if (sessionDay.getTime() < today.getTime() - (24 * 60 * 60 * 1000)) {
      const daysSinceLastSession = Math.floor((today.getTime() - lastSessionDay.getTime()) / (24 * 60 * 60 * 1000));
      
      if (daysSinceLastSession > 1) {
        // Streak broken, start new one
        newStreak = 1;
        streakBroken = true;
        streakMaintained = false;
      } else {
        // Session from yesterday, maintain streak
        newStreak = this.streakData.currentStreak + 1;
        streakMaintained = true;
      }
    }
    // If session is in the future (invalid)
    else if (sessionDay.getTime() > today.getTime()) {
      debug.warn('Session date is in the future, ignoring');
      return {
        newStreak: this.streakData.currentStreak,
        streakMaintained: false,
        streakBroken: false,
        newLongestStreak: false,
      };
    }

    // Check for new longest streak
    newLongestStreak = newStreak > this.streakData.longestStreak;

    return {
      newStreak,
      streakMaintained,
      streakBroken,
      newLongestStreak,
    };
  }

  /**
   * Add entry to streak history
   */
  private addToStreakHistory(sessionDate: Date, maintained: boolean): void {
    const dateStr = sessionDate.toISOString().split('T')[0];
    
    // Remove existing entry for this date if present
    this.streakData.streakHistory = this.streakData.streakHistory.filter(
      entry => entry.date !== dateStr
    );

    // Add new entry
    this.streakData.streakHistory.unshift({
      date: dateStr,
      sessionsCompleted: 1,
      maintained,
    });

    // Keep only last 30 days
    if (this.streakData.streakHistory.length > 30) {
      this.streakData.streakHistory = this.streakData.streakHistory.slice(0, 30);
    }
  }

  /**
   * Update risk status based on last session
   */
  private updateRiskStatus(): void {
    if (!this.streakData.lastSessionDate) {
      this.streakData.isAtRisk = false;
      this.streakData.hoursRemaining = 24;
      return;
    }

    const now = new Date();
    const lastSession = new Date(this.streakData.lastSessionDate);
    const hoursSinceLastSession = (now.getTime() - lastSession.getTime()) / (1000 * 60 * 60);

    // User is at risk if they haven't completed a session in the last 20 hours
    this.streakData.isAtRisk = hoursSinceLastSession > 20 && this.streakData.currentStreak > 0;
    
    // Calculate hours remaining until streak breaks (24 hours from last session)
    this.streakData.hoursRemaining = Math.max(0, 24 - hoursSinceLastSession);
  }

  /**
   * Get streak summary for UI display
   */
  getStreakSummary() {
    return {
      currentStreak: this.streakData.currentStreak,
      longestStreak: this.streakData.longestStreak,
      isAtRisk: this.streakData.isAtRisk,
      hoursRemaining: Math.ceil(this.streakData.hoursRemaining),
      lastSessionDate: this.streakData.lastSessionDate,
      streakHistory: this.streakData.streakHistory.slice(0, 7), // Last 7 days
    };
  }

  /**
   * Check if user can claim streak freeze
   */
  canClaimStreakFreeze(): boolean {
    return this.streakData.isAtRisk && this.streakData.currentStreak >= 3;
  }

  /**
   * Apply streak freeze (extends streak by 24 hours)
   */
  async applyStreakFreeze(): Promise<boolean> {
    if (!this.canClaimStreakFreeze()) {
      debug.warn('Cannot apply streak freeze - conditions not met');
      return false;
    }

    try {
      // Extend last session date by 24 hours
      if (this.streakData.lastSessionDate) {
        const extendedDate = new Date(this.streakData.lastSessionDate);
        extendedDate.setHours(extendedDate.getHours() + 24);
        this.streakData.lastSessionDate = extendedDate.toISOString();
      }

      // Update risk status
      this.updateRiskStatus();

      // Track analytics
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

  /**
   * Reset user data (for logout)
   */
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

// Singleton instance
export const streakService = new StreakService();