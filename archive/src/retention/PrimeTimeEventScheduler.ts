/**
 * Prime Time Event Scheduler
 *
 * Phase 5: Retention Systems
 * Creates daily "appointment mechanics" - scheduled windows with bonuses
 * that users plan their day around.
 *
 * Prime Time Windows:
 * - Morning Rally (6-9 AM): 2x XP - for commuters
 * - Power Hour (2-3 PM): Squad energy recharge - for students
 * - Evening Windfall (8-10 PM): 2x Boss damage - for night owls
 * - Weekend Warrior (Sat-Sun): Special boss raids - for heavy users
 *
 * Dependencies:
 * - feature-flags (gradual rollout)
 * - notifications (push notifications 15 min before)
 * - events (eventBus for window start/end)
 */

import { z } from 'zod';
import { featureFlags } from '../feature-flags/FeatureFlagEngine';
import { eventBus } from '../events';

// ============================================================================
// Prime Time Window Types
// ============================================================================

export type PrimeTimeWindowType =
  | 'MORNING_RALLY'
  | 'POWER_HOUR'
  | 'EVENING_WINDFALL'
  | 'WEEKEND_WARRIOR';

export interface PrimeTimeWindowConfig {
  type: PrimeTimeWindowType;
  name: string;
  description: string;
  icon: string;
  color: string;

  // Schedule (local time)
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  daysOfWeek: number[]; // 0 = Sunday, 6 = Saturday

  // Bonuses
  xpMultiplier: number;
  coinMultiplier: number;
  bossDamageMultiplier: number;
  squadEnergyRegenBonus: number;

  // Targeting
  targetUserTypes: ('commuter' | 'student' | 'night_owl' | 'heavy_user' | 'casual')[];
}

// ============================================================================
// Window Configurations
// ============================================================================

export const PRIME_TIME_WINDOWS: PrimeTimeWindowConfig[] = [
  {
    type: 'MORNING_RALLY',
    name: 'Morning Rally',
    description: 'Start your day with 2x XP!',
    icon: '🌅',
    color: '#F59E0B', // amber
    startHour: 6,
    startMinute: 0,
    endHour: 9,
    endMinute: 0,
    daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
    xpMultiplier: 2.0,
    coinMultiplier: 1.0,
    bossDamageMultiplier: 1.0,
    squadEnergyRegenBonus: 0,
    targetUserTypes: ['commuter', 'casual'],
  },
  {
    type: 'POWER_HOUR',
    name: 'Power Hour',
    description: 'Squad sessions get bonus energy recharge!',
    icon: '⚡',
    color: '#3B82F6', // blue
    startHour: 14,
    startMinute: 0,
    endHour: 15,
    endMinute: 0,
    daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
    xpMultiplier: 1.0,
    coinMultiplier: 1.0,
    bossDamageMultiplier: 1.0,
    squadEnergyRegenBonus: 50, // +50 energy per completion
    targetUserTypes: ['student'],
  },
  {
    type: 'EVENING_WINDFALL',
    name: 'Evening Windfall',
    description: '2x Boss damage during night sessions!',
    icon: '🌙',
    color: '#7C3AED', // violet
    startHour: 20,
    startMinute: 0,
    endHour: 22,
    endMinute: 0,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Daily
    xpMultiplier: 1.0,
    coinMultiplier: 1.0,
    bossDamageMultiplier: 2.0,
    squadEnergyRegenBonus: 0,
    targetUserTypes: ['night_owl', 'heavy_user'],
  },
  {
    type: 'WEEKEND_WARRIOR',
    name: 'Weekend Warrior',
    description: 'Special boss raids all weekend!',
    icon: '🏆',
    color: '#EF4444', // red
    startHour: 0,
    startMinute: 0,
    endHour: 23,
    endMinute: 59,
    daysOfWeek: [0, 6], // Sat-Sun
    xpMultiplier: 1.5,
    coinMultiplier: 1.5,
    bossDamageMultiplier: 1.5,
    squadEnergyRegenBonus: 25,
    targetUserTypes: ['heavy_user'],
  },
];

// ============================================================================
// Active Window State
// ============================================================================

export interface ActivePrimeTimeWindow {
  config: PrimeTimeWindowConfig;
  startedAt: number;
  endsAt: number;
  timeRemainingSeconds: number;
  isEndingSoon: boolean; // < 15 minutes remaining
}

export interface UpcomingWindow {
  config: PrimeTimeWindowConfig;
  startsAt: number;
  minutesUntilStart: number;
}

// ============================================================================
// Scheduler Service
// ============================================================================

export class PrimeTimeScheduler {
  private activeWindows: Map<string, ActivePrimeTimeWindow> = new Map();
  private userTimezones: Map<string, string> = new Map();
  private checkInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Check if prime time events are enabled
   */
  static isEnabled(): boolean {
    return featureFlags.isEnabled('prime_time_events');
  }

  /**
   * Start the scheduler
   */
  start(): void {
    if (!PrimeTimeScheduler.isEnabled()) {
      console.log('[PrimeTimeScheduler] Disabled via feature flag');
      return;
    }

    // Check every minute
    this.checkInterval = setInterval(() => {
      this.checkWindows();
    }, 60000);

    // Initial check
    this.checkWindows();

    console.log('[PrimeTimeScheduler] Started');
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Set user's timezone
   */
  setUserTimezone(userId: string, timezone: string): void {
    this.userTimezones.set(userId, timezone);
  }

  /**
   * Get active windows for a user (respecting their timezone)
   */
  getActiveWindows(userId: string): ActivePrimeTimeWindow[] {
    const userWindows: ActivePrimeTimeWindow[] = [];
    const now = new Date();

    for (const config of PRIME_TIME_WINDOWS) {
      const windowId = `${userId}_${config.type}`;
      const activeWindow = this.activeWindows.get(windowId);

      if (activeWindow) {
        // Update time remaining
        activeWindow.timeRemainingSeconds = Math.max(
          0,
          Math.floor((activeWindow.endsAt - Date.now()) / 1000)
        );
        activeWindow.isEndingSoon = activeWindow.timeRemainingSeconds < 900; // 15 min

        userWindows.push(activeWindow);
      }
    }

    return userWindows;
  }

  /**
   * Get upcoming windows for a user
   */
  getUpcomingWindows(userId: string, nextHours = 24): UpcomingWindow[] {
    const timezone = this.userTimezones.get(userId) || 'UTC';
    const now = new Date();
    const upcoming: UpcomingWindow[] = [];

    for (const config of PRIME_TIME_WINDOWS) {
      const nextOccurrence = this.getNextOccurrence(config, now, timezone);

      if (nextOccurrence) {
        const minutesUntil = Math.floor((nextOccurrence.getTime() - now.getTime()) / 60000);

        if (minutesUntil <= nextHours * 60) {
          upcoming.push({
            config,
            startsAt: nextOccurrence.getTime(),
            minutesUntilStart: minutesUntil,
          });
        }
      }
    }

    return upcoming.sort((a, b) => a.minutesUntilStart - b.minutesUntilStart);
  }

  /**
   * Check if a specific bonus is active for a user
   */
  isBonusActive(
    userId: string,
    bonusType: 'xp' | 'coins' | 'boss_damage' | 'squad_energy'
  ): { active: boolean; multiplier: number; windowName?: string } {
    const windows = this.getActiveWindows(userId);

    for (const window of windows) {
      switch (bonusType) {
        case 'xp':
          if (window.config.xpMultiplier > 1) {
            return { active: true, multiplier: window.config.xpMultiplier, windowName: window.config.name };
          }
          break;
        case 'coins':
          if (window.config.coinMultiplier > 1) {
            return { active: true, multiplier: window.config.coinMultiplier, windowName: window.config.name };
          }
          break;
        case 'boss_damage':
          if (window.config.bossDamageMultiplier > 1) {
            return { active: true, multiplier: window.config.bossDamageMultiplier, windowName: window.config.name };
          }
          break;
        case 'squad_energy':
          if (window.config.squadEnergyRegenBonus > 0) {
            return { active: true, multiplier: 1 + (window.config.squadEnergyRegenBonus / 100), windowName: window.config.name };
          }
          break;
      }
    }

    return { active: false, multiplier: 1 };
  }

  /**
   * Get all active multipliers for a user
   */
  getAllMultipliers(userId: string): {
    xp: number;
    coins: number;
    bossDamage: number;
    squadEnergy: number;
    activeWindows: string[];
  } {
    const windows = this.getActiveWindows(userId);

    let xp = 1;
    let coins = 1;
    let bossDamage = 1;
    let squadEnergy = 1;
    const activeWindowNames: string[] = [];

    for (const window of windows) {
      xp = Math.max(xp, window.config.xpMultiplier);
      coins = Math.max(coins, window.config.coinMultiplier);
      bossDamage = Math.max(bossDamage, window.config.bossDamageMultiplier);
      if (window.config.squadEnergyRegenBonus > 0) {
        squadEnergy = 1 + (window.config.squadEnergyRegenBonus / 100);
      }
      activeWindowNames.push(window.config.name);
    }

    return { xp, coins, bossDamage, squadEnergy, activeWindows: activeWindowNames };
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private checkWindows(): void {
    const now = new Date();

    for (const config of PRIME_TIME_WINDOWS) {
      this.checkWindow(config, now);
    }
  }

  private checkWindow(config: PrimeTimeWindowConfig, now: Date): void {
    const dayOfWeek = now.getDay();

    // Check if this window applies today
    if (!config.daysOfWeek.includes(dayOfWeek)) {
      return;
    }

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const startTime = config.startHour * 60 + config.startMinute;
    const endTime = config.endHour * 60 + config.endMinute;
    const currentTime = currentHour * 60 + currentMinute;

    // Check if window should be active
    if (currentTime >= startTime && currentTime < endTime) {
      // Window should be active
      for (const [userId] of this.userTimezones) {
        this.activateWindow(userId, config);
      }
    } else {
      // Window should not be active - deactivate if active
      for (const [userId] of this.userTimezones) {
        this.deactivateWindow(userId, config.type);
      }
    }

    // Send upcoming notifications (15 minutes before)
    const minutesUntilStart = startTime - currentTime;
    if (minutesUntilStart === 15) {
      this.sendUpcomingNotifications(config);
    }
  }

  private activateWindow(userId: string, config: PrimeTimeWindowConfig): void {
    const windowId = `${userId}_${config.type}`;

    if (this.activeWindows.has(windowId)) {
      return; // Already active
    }

    const now = Date.now();
    const endTime = new Date();
    endTime.setHours(config.endHour, config.endMinute, 0, 0);

    const activeWindow: ActivePrimeTimeWindow = {
      config,
      startedAt: now,
      endsAt: endTime.getTime(),
      timeRemainingSeconds: Math.floor((endTime.getTime() - now) / 1000),
      isEndingSoon: false,
    };

    this.activeWindows.set(windowId, activeWindow);

    // Emit event
    eventBus.publish('primetime:window_started', {
      userId,
      windowType: config.type,
      windowName: config.name,
      bonuses: {
        xp: config.xpMultiplier,
        coins: config.coinMultiplier,
        bossDamage: config.bossDamageMultiplier,
        squadEnergy: config.squadEnergyRegenBonus,
      },
    });

    // Send notification
    this.sendWindowStartedNotification(userId, config);
  }

  private deactivateWindow(userId: string, windowType: PrimeTimeWindowType): void {
    const windowId = `${userId}_${windowType}`;
    const window = this.activeWindows.get(windowId);

    if (!window) return;

    this.activeWindows.delete(windowId);

    // Emit event
    eventBus.publish('primetime:window_ended', {
      userId,
      windowType,
      windowName: window.config.name,
    });
  }

  private getNextOccurrence(config: PrimeTimeWindowConfig, fromDate: Date, timezone: string): Date | null {
    const dayOfWeek = fromDate.getDay();

    // Find next applicable day
    let daysToAdd = 0;
    let found = false;

    for (let i = 0; i < 7; i++) {
      const checkDay = (dayOfWeek + i) % 7;
      if (config.daysOfWeek.includes(checkDay)) {
        if (i === 0) {
          // Today - check if window already passed
          const currentTime = fromDate.getHours() * 60 + fromDate.getMinutes();
          const windowEnd = config.endHour * 60 + config.endMinute;
          if (currentTime < windowEnd) {
            found = true;
            break;
          }
        } else {
          daysToAdd = i;
          found = true;
          break;
        }
      }
    }

    if (!found) return null;

    const nextDate = new Date(fromDate);
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    nextDate.setHours(config.startHour, config.startMinute, 0, 0);

    return nextDate;
  }

  private sendUpcomingNotifications(config: PrimeTimeWindowConfig): void {
    for (const [userId] of this.userTimezones) {
      eventBus.publish('notification:send', {
        userId,
        title: `${config.name} starts in 15 minutes!`,
        body: config.description,
        data: { type: 'PRIME_TIME_UPCOMING', windowType: config.type },
      });
    }
  }

  private sendWindowStartedNotification(userId: string, config: PrimeTimeWindowConfig): void {
    eventBus.publish('notification:send', {
      userId,
      title: `${config.name} is now active!`,
      body: `Get ${config.xpMultiplier}x XP and other bonuses now!`,
      data: { type: 'PRIME_TIME_STARTED', windowType: config.type },
    });
  }
}

// ============================================================================
// Factory & Singleton
// ============================================================================

let scheduler: PrimeTimeScheduler | null = null;

export function getPrimeTimeScheduler(): PrimeTimeScheduler {
  if (!scheduler) {
    scheduler = new PrimeTimeScheduler();
  }
  return scheduler;
}
