/**
 * Streak Risk Monitor
 * Tracks streak deadlines and triggers notifications at critical thresholds
 * Visual "flame health" depletes over 24 hours
 */

import { eventBus } from '../../events';
import { createDebugger } from '../../utils/debug';
import * as repository from './repository';
import type { Streak, RiskLevel } from './schemas';

const debug = createDebugger('streak-risk-monitor');

// ============================================================================
// Constants
// ============================================================================

const NOTIFICATION_THRESHOLDS = [
  { hoursRemaining: 20, urgency: 'MEDIUM', message: 'A quick 10-minute session keeps your streak alive. You have got this.' },
  { hoursRemaining: 22, urgency: 'HIGH', message: 'Your streak is within reach. A short session today keeps your momentum going.' },
  { hoursRemaining: 23, urgency: 'CRITICAL', message: 'One small session today preserves your streak. Start small and keep building.' },
  { hoursRemaining: 23.5, urgency: 'CRITICAL', message: 'A 10-minute Recovery session keeps the chain alive. You are stronger than the gap.' },
];

const FLAME_HEALTH_SEGMENTS = 24; // One segment per hour

// ============================================================================
// Types
// ============================================================================
// ============================================================================
// Risk Calculation
// ============================================================================
// ============================================================================
// Notification System
// ============================================================================
// ============================================================================
// Batch Risk Check (for background job)
// ============================================================================
// ============================================================================
// Streak Break Check (midnight cron job)
// ============================================================================

async function breakStreakInternal(userId: string, streak: Streak): Promise<void> {
  const brokenDays = streak.currentDays;

  // Update streak record
  await repository.updateStreak(userId, {
    currentDays: 0,
    gracePeriodUsed: false,
    lastQualifyingSessionAt: null,
    currentDayCompletedAt: null,
  });

  // Publish events
  eventBus.publish('streak:broken', {
    userId,
    previousStreak: brokenDays,
    canRepair: true, // Offer repair quest
  } as any);

  // Send supportive notification
  eventBus.publish('notification:send', {
    userId,
    type: 'STREAK_BROKEN',
    title: 'You missed a few days',
    body: `Start small and rebuild momentum. Your ${brokenDays}-day streak shows what you are capable of.`,
    data: {
      previousStreak: brokenDays,
      action: 'START_REPAIR_QUEST',
    },
  });
}

export * from "./streak-risk-monitor.types";
export * from "./streak-risk-monitor.part1";
