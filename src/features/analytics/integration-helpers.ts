import type { IntegrationState } from './integration-types';
import { stateCache, DEFAULT_INTEGRATION_STATE } from './integration-types';

export function updateIntegrationState(
  userId: string,
  updates: Partial<IntegrationState>,
): void {
  const current = stateCache.get(userId) || DEFAULT_INTEGRATION_STATE;
  stateCache.set(userId, {
    sessionCount: current.sessionCount + (updates.sessionCount || 0),
    totalFocusTime: current.totalFocusTime + (updates.totalFocusTime || 0),
    xpEarned: current.xpEarned + (updates.xpEarned || 0),
    streakDays: Math.max(current.streakDays, updates.streakDays || 0),
    lastSync: updates.lastSync || Date.now(),
  });
}

export function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 6) {return 'night';}
  if (hour < 12) {return 'morning';}
  if (hour < 18) {return 'afternoon';}
  return 'evening';
}
