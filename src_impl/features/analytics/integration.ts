/**
 * Analytics Integration Layer
 * Cross-system integration with events, analytics tracking, and feature coordination
 */

import { eventBus } from '../../events';
import * as Sentry from '@sentry/react-native';
import { TTLCache } from '../../shared/hardening';
import * as repository from './repository';
import * as service from './service';
import { generateInsights } from './service';

// Cache for integration state to prevent duplicate processing
const integrationCache = new TTLCache<{ processed: boolean }>(60000);

// Integration state tracking
interface IntegrationState {
  sessionCount: number;
  totalFocusTime: number;
  xpEarned: number;
  streakDays: number;
  lastSync: number;
}

const stateCache = new TTLCache<IntegrationState>(300000); // 5 minutes
// Helper functions
function updateIntegrationState(userId: string, updates: Partial<IntegrationState>): void {
  const current = stateCache.get(userId) || {
    sessionCount: 0,
    totalFocusTime: 0,
    xpEarned: 0,
    streakDays: 0,
    lastSync: 0,
  };

  stateCache.set(userId, {
    sessionCount: current.sessionCount + (updates.sessionCount || 0),
    totalFocusTime: current.totalFocusTime + (updates.totalFocusTime || 0),
    xpEarned: current.xpEarned + (updates.xpEarned || 0),
    streakDays: Math.max(current.streakDays, updates.streakDays || 0),
    lastSync: updates.lastSync || Date.now(),
  });
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 6) {
    return 'night';
  }
  if (hour < 12) {
    return 'morning';
  }
  if (hour < 18) {
    return 'afternoon';
  }
  return 'evening';
}

export * from "./integration.types";
export * from "./integration.types";
export * from "./integration.part1";
export * from "./integration.part2";
export * from "./integration.part3";
