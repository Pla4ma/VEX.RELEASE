import { eventBus } from "../../events";


export const PRIME_TIME_DURATION_MS = 3 * 60 * 60 * 1000;

export const MIN_PRIME_TIME_DURATION_MS = 2 * 60 * 60 * 1000;

export const MAX_PRIME_TIME_DURATION_MS = 4 * 60 * 60 * 1000;

export const PRIME_TIME_DAMAGE_MULTIPLIER = 1.5;

export const PRIME_TIME_BONUS_LOOT_CHANCE = 0.25;

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

export function getPrimeTimeMultiplier(windows: PrimeTimeWindow[], currentTime: number = Date.now()): number {
  const status = checkPrimeTimeStatus(windows, currentTime);
  return status.damageMultiplier;
}

export function shouldSendPrimeTimeNotification(window: PrimeTimeWindow, currentTime: number = Date.now()): boolean {
  if (window.notificationSent) {
    return false;
  }

  const timeUntilStart = window.startTime - currentTime;
  const notifyThreshold = 30 * 60 * 1000; // 30 minutes before

  return timeUntilStart <= notifyThreshold && timeUntilStart > 0;
}

export function markNotificationSent(windows: PrimeTimeWindow[], windowId: string): void {
  const window = windows.find((w) => w.id === windowId);
  if (window) {
    window.notificationSent = true;
  }
}

export function getPrimeTimeNotificationMessage(bossName: string, hoursRemaining: number, damageMultiplier: number): { title: string; body: string } {
  return {
    title: `${bossName} is Vulnerable!`,
    body: `Prime Time active for ${hoursRemaining.toFixed(1)} more hours. Deal ${Math.round((damageMultiplier - 1) * 100)}% bonus damage!`,
  };
}

export function storePrimeTimeSchedule(schedule: PrimeTimeSchedule): void {
  primeTimeSchedules.set(schedule.encounterId, schedule);

  // Publish event for notification scheduling
  eventBus.publish('boss:prime_time_scheduled', {
    encounterId: schedule.encounterId,
    windows: schedule.windows,
  });
}

export function getPrimeTimeSchedule(encounterId: string): PrimeTimeSchedule | null {
  return primeTimeSchedules.get(encounterId) || null;
}

export function clearPrimeTimeSchedule(encounterId: string): void {
  primeTimeSchedules.delete(encounterId);
}

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

export function getPrimeTimeAnalytics(encounterId: string): PrimeTimeAnalytics | null {
  return analyticsMap.get(encounterId) || null;
}

export function formatTimeRemaining(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}