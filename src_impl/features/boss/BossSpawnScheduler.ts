/**
 * BossSpawnScheduler
 *
 * Daily Boss Prime Time Window system.
 * Every boss has a 2-hour "Prime Time" window daily where damage earns 2× XP.
 * Creates appointment mechanics - users know when to show up for max rewards.
 *
 * @phase 11.1
 */

import { z } from 'zod';
import { getSupabaseClient } from '../../config/supabase';
import { createDebugger } from '../../utils/debug';
import { dispatchUrgencyNotification, type NotificationContext } from '../notifications/service';

const debug = createDebugger('boss:spawn-scheduler');

// ============================================================================
// Configuration
// ============================================================================

const PRIME_TIME_DURATION_MINUTES = 120; // 2 hours
const PRE_NOTIFICATION_MINUTES = 30; // Notify 30 min before

// Boss-specific prime time windows (local time hours)
const BOSS_PRIME_TIME_WINDOWS: Record<number, { startHour: number; endHour: number }> = {
  1: { startHour: 9, endHour: 11 }, // Slacker - Morning
  2: { startHour: 14, endHour: 16 }, // Distraction Demon - Afternoon
  3: { startHour: 20, endHour: 22 }, // Infinite Scroller - Evening
  4: { startHour: 10, endHour: 12 }, // Master of Multitasking - Late morning
  5: { startHour: 15, endHour: 17 }, // Perfectionist - Afternoon
  6: { startHour: 19, endHour: 21 }, // Burnout Beast - Early evening
};

// ============================================================================
// Schemas
// ============================================================================
// ============================================================================
// Timezone Utilities
// ============================================================================

/**
 * Get today's date at a specific hour in user's timezone
 */
function getTodayAtHour(timezone: string, hour: number): Date {
  const now = new Date();
  const timeString = now.toLocaleString('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const [month, day, year] = timeString.split('/').map(Number);
  return new Date(year, month - 1, day, hour, 0, 0);
}

// ============================================================================
// Core Functions
// ============================================================================
// ============================================================================
// Notification Scheduling
// ============================================================================
// ============================================================================
// Hook for React Components
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

interface UsePrimeTimeResult {
  window: PrimeTimeWindow | null;
  isLoading: boolean;
  refresh: () => void;
}

export default {
  calculatePrimeTimeWindow,
  isPrimeTimeActive,
  formatTimeRemaining,
  getPrimeTimeStatusText,
  calculatePrimeTimeXP,
  checkAndSendPrimeTimeNotifications,
  usePrimeTime,
};

export * from "./BossSpawnScheduler.types";
export * from "./BossSpawnScheduler.types";
export * from "./BossSpawnScheduler.part1";
