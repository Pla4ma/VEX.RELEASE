import { TTLCache } from '../../shared/hardening';

export interface IntegrationState {
  sessionCount: number;
  totalFocusTime: number;
  xpEarned: number;
  streakDays: number;
  lastSync: number;
}

export const integrationCache = new TTLCache<{ processed: boolean }>(60000);
export const stateCache = new TTLCache<IntegrationState>(300000);

export const DEFAULT_INTEGRATION_STATE: IntegrationState = {
  sessionCount: 0,
  totalFocusTime: 0,
  xpEarned: 0,
  streakDays: 0,
  lastSync: 0,
};
