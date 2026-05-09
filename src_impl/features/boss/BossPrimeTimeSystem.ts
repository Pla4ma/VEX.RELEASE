/**
 * Boss Prime Time System
 *
 * Phase 3.1 - Boss Battle System Overhaul
 * Timed events where bosses have "Prime Time" windows
 * 2-4 hour windows where damage multiplier is higher
 * Creates urgency and scheduling intentionality
 *
 * Dependencies:
 * - Boss Service (encounter tracking)
 * - Notifications (push notifications for prime time)
 * - Session Integration (damage calculation)
 * - Analytics (engagement tracking)
 */

import { eventBus } from '../../events';

// ============================================================================
// Types
// ============================================================================

export interface PrimeTimeWindow {
  id: string;
  encounterId: string;
  startTime: number;
  endTime: number;
  damageMultiplier: number;
  bonusLootChance: number;
  description: string;
  notificationSent: boolean;
}

export interface PrimeTimeStatus {
  isPrimeTime: boolean;
  activeWindow: PrimeTimeWindow | null;
  nextWindow: PrimeTimeWindow | null;
  damageMultiplier: number;
  bonusLootChance: number;
  timeRemaining: number; // ms
  hoursUntilNext: number | null;
}

export interface PrimeTimeSchedule {
  encounterId: string;
  windows: PrimeTimeWindow[];
  timezone: string;
}

export type PrimeTimePattern = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT' | 'WEEKEND';

// ============================================================================
// Constants
// ============================================================================

export const PRIME_TIME_DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours default
export const MIN_PRIME_TIME_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours min
export const MAX_PRIME_TIME_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours max

export const PRIME_TIME_DAMAGE_MULTIPLIER = 1.5; // 50% bonus damage
export const PRIME_TIME_BONUS_LOOT_CHANCE = 0.25; // +25% loot chance

// Pattern time ranges (in hours from midnight)
const PATTERN_TIME_RANGES: Record<PrimeTimePattern, { start: number; end: number }> = {
  MORNING: { start: 6, end: 10 }, // 6 AM - 10 AM
  AFTERNOON: { start: 12, end: 16 }, // 12 PM - 4 PM
  EVENING: { start: 18, end: 22 }, // 6 PM - 10 PM
  NIGHT: { start: 20, end: 24 }, // 8 PM - 12 AM
  WEEKEND: { start: 10, end: 22 }, // All day on weekends
};

// ============================================================================
// Prime Time Generation
// ============================================================================

/**
 * Generate prime time windows for a boss encounter
 * Creates 1-2 windows within the encounter duration
 */
export function generatePrimeTimeWindows(encounterId: string, encounterStartTime: number, encounterDurationMs: number, pattern: PrimeTimePattern = 'EVENING', userTimezone: string = 'America/New_York'): PrimeTimeWindow[] {
  const windows: PrimeTimeWindow[] = [];
  const encounterEndTime = encounterStartTime + encounterDurationMs;

  // Get pattern time range
  const patternRange = PATTERN_TIME_RANGES[pattern];

  // Generate 1-2 windows based on encounter duration
  const windowCount = encounterDurationMs > 24 * 60 * 60 * 1000 ? 2 : 1;

  for (let i = 0; i < windowCount; i++) {
    // Calculate window start time
    const dayOffset = i * 24 * 60 * 60 * 1000; // Add days for longer encounters
    const windowStart = calculatePrimeTimeStart(encounterStartTime + dayOffset, patternRange.start, userTimezone);

    // Ensure window is within encounter duration
    if (windowStart >= encounterStartTime && windowStart < encounterEndTime) {
      const window: PrimeTimeWindow = {
        id: `prime-${encounterId}-${i}`,
        encounterId,
        startTime: windowStart,
        endTime: windowStart + PRIME_TIME_DURATION_MS,
        damageMultiplier: PRIME_TIME_DAMAGE_MULTIPLIER,
        bonusLootChance: PRIME_TIME_BONUS_LOOT_CHANCE,
        description: generatePrimeTimeDescription(pattern, i + 1),
        notificationSent: false,
      };
      windows.push(window);
    }
  }

  return windows;
}

/**
 * Calculate prime time start based on pattern hour
 */
function calculatePrimeTimeStart(baseTime: number, patternHour: number, timezone: string): number {
  const baseDate = new Date(baseTime);

  // Create date at pattern hour in user's timezone
  const primeTimeDate = new Date(baseDate);
  primeTimeDate.setHours(patternHour, 0, 0, 0);

  // If the time has already passed today, move to tomorrow
  if (primeTimeDate.getTime() < baseTime) {
    primeTimeDate.setDate(primeTimeDate.getDate() + 1);
  }

  return primeTimeDate.getTime();
}

/**
 * Generate description for prime time window
 */
function generatePrimeTimeDescription(pattern: PrimeTimePattern, windowNumber: number): string {
  const descriptions: Record<PrimeTimePattern, string> = {
    MORNING: 'Morning Focus Window - Start your day strong!',
    AFTERNOON: 'Afternoon Power Hour - Beat the midday slump!',
    EVENING: 'Evening Champion Time - Your peak performance window!',
    NIGHT: 'Night Owl Advantage - Quiet focus bonus!',
    WEEKEND: 'Weekend Warrior Bonus - Extended power window!',
  };

  return windowNumber > 1 ? `${descriptions[pattern]} (Part ${windowNumber})` : descriptions[pattern];
}

// ============================================================================
// Prime Time Status
// ============================================================================

/**
 * Check current prime time status for an encounter
 */
export function checkPrimeTimeStatus(windows: PrimeTimeWindow[], currentTime: number = Date.now()): PrimeTimeStatus {
  // Find active window
  const activeWindow = windows.find((w) => currentTime >= w.startTime && currentTime < w.endTime);

  // Find next upcoming window
  const futureWindows = windows.filter((w) => w.startTime > currentTime);
  const nextWindow = futureWindows.length > 0 ? futureWindows.reduce((closest, w) => (w.startTime < closest.startTime ? w : closest)) : null;

  if (activeWindow) {
    return {
      isPrimeTime: true,
      activeWindow,
      nextWindow: futureWindows[0] || null,
      damageMultiplier: activeWindow.damageMultiplier,
      bonusLootChance: activeWindow.bonusLootChance,
      timeRemaining: activeWindow.endTime - currentTime,
      hoursUntilNext: nextWindow ? (nextWindow.startTime - currentTime) / (1000 * 60 * 60) : null,
    };
  }

  return {
    isPrimeTime: false,
    activeWindow: null,
    nextWindow,
    damageMultiplier: 1.0,
    bonusLootChance: 0,
    timeRemaining: 0,
    hoursUntilNext: nextWindow ? (nextWindow.startTime - currentTime) / (1000 * 60 * 60) : null,
  };
}

/**
 * Get damage multiplier for current time
 */
export function getPrimeTimeMultiplier(windows: PrimeTimeWindow[], currentTime: number = Date.now()): number {
  const status = checkPrimeTimeStatus(windows, currentTime);
  return status.damageMultiplier;
}

// ============================================================================
// Notification Scheduling
// ============================================================================

/**
 * Schedule prime time notification
 * Should be called when window is approaching (30 min before)
 */
export function shouldSendPrimeTimeNotification(window: PrimeTimeWindow, currentTime: number = Date.now()): boolean {
  if (window.notificationSent) {
    return false;
  }

  const timeUntilStart = window.startTime - currentTime;
  const notifyThreshold = 30 * 60 * 1000; // 30 minutes before

  return timeUntilStart <= notifyThreshold && timeUntilStart > 0;
}

/**
 * Mark notification as sent
 */
export function markNotificationSent(windows: PrimeTimeWindow[], windowId: string): void {
  const window = windows.find((w) => w.id === windowId);
  if (window) {
    window.notificationSent = true;
  }
}

/**
 * Get notification message for prime time
 */
export function getPrimeTimeNotificationMessage(bossName: string, hoursRemaining: number, damageMultiplier: number): { title: string; body: string } {
  return {
    title: `${bossName} is Vulnerable!`,
    body: `Prime Time active for ${hoursRemaining.toFixed(1)} more hours. Deal ${Math.round((damageMultiplier - 1) * 100)}% bonus damage!`,
  };
}

// ============================================================================
// Prime Time Storage (in-memory with persistence helper)
// ============================================================================

const primeTimeSchedules = new Map<string, PrimeTimeSchedule>();

/**
 * Store prime time schedule for encounter
 */
export function storePrimeTimeSchedule(schedule: PrimeTimeSchedule): void {
  primeTimeSchedules.set(schedule.encounterId, schedule);

  // Publish event for notification scheduling
  eventBus.publish('boss:prime_time_scheduled', {
    encounterId: schedule.encounterId,
    windows: schedule.windows,
  });
}

/**
 * Get prime time schedule for encounter
 */
export function getPrimeTimeSchedule(encounterId: string): PrimeTimeSchedule | null {
  return primeTimeSchedules.get(encounterId) || null;
}

/**
 * Clear prime time schedule
 */
export function clearPrimeTimeSchedule(encounterId: string): void {
  primeTimeSchedules.delete(encounterId);
}

/**
 * Get all active prime time windows across all encounters
 */
export function getAllActivePrimeTimeWindows(currentTime: number = Date.now()): PrimeTimeWindow[] {
  const active: PrimeTimeWindow[] = [];

  for (const schedule of primeTimeSchedules.values()) {
    for (const window of schedule.windows) {
      if (currentTime >= window.startTime && currentTime < window.endTime) {
        active.push(window);
      }
    }
  }

  return active;
}

// ============================================================================
// Prime Time Analytics
// ============================================================================

export interface PrimeTimeAnalytics {
  totalWindowsGenerated: number;
  totalWindowsUtilized: number;
  averageDamageDuringPrimeTime: number;
  averageDamageNormalTime: number;
  primeTimeConversionRate: number; // % of windows where damage was dealt
}

const analyticsMap = new Map<string, PrimeTimeAnalytics>();

/**
 * Record prime time damage for analytics
 */
export function recordPrimeTimeDamage(encounterId: string, damage: number, isPrimeTime: boolean): void {
  let analytics = analyticsMap.get(encounterId);
  if (!analytics) {
    analytics = {
      totalWindowsGenerated: 0,
      totalWindowsUtilized: 0,
      averageDamageDuringPrimeTime: 0,
      averageDamageNormalTime: 0,
      primeTimeConversionRate: 0,
    };
    analyticsMap.set(encounterId, analytics);
  }

  if (isPrimeTime) {
    analytics.averageDamageDuringPrimeTime = (analytics.averageDamageDuringPrimeTime + damage) / 2;
  } else {
    analytics.averageDamageNormalTime = (analytics.averageDamageNormalTime + damage) / 2;
  }
}

/**
 * Get prime time analytics
 */
export function getPrimeTimeAnalytics(encounterId: string): PrimeTimeAnalytics | null {
  return analyticsMap.get(encounterId) || null;
}

// ============================================================================
// Prime Time UI Helpers
// ============================================================================

/**
 * Format time remaining for display
 */
export function formatTimeRemaining(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Get prime time badge text
 */
export function getPrimeTimeBadgeText(status: PrimeTimeStatus): string | null {
  if (status.isPrimeTime) {
    return `⚡ ${Math.round((status.damageMultiplier - 1) * 100)}% Bonus Damage`;
  }
  if (status.hoursUntilNext && status.hoursUntilNext <= 2) {
    return `⏰ Prime Time in ${Math.round(status.hoursUntilNext * 10) / 10}h`;
  }
  return null;
}

/**
 * Get recommended attack time message
 */
export function getRecommendedAttackMessage(status: PrimeTimeStatus): string {
  if (status.isPrimeTime) {
    return `🔥 PRIME TIME ACTIVE! Deal bonus damage for ${formatTimeRemaining(status.timeRemaining)}`;
  }
  if (status.nextWindow && status.hoursUntilNext && status.hoursUntilNext <= 4) {
    return `⏰ Prime Time starts in ${Math.round(status.hoursUntilNext * 10) / 10}h`;
  }
  return 'Attack anytime - focus is always powerful!';
}

// ============================================================================
// Exports (types already exported above)
// ============================================================================
