import { analyticsService } from '../../shared/analytics/analytics-service';
import { useSettingsStore } from './store';

export function applyAnalyticsPreference(enabled: boolean): void {
  useSettingsStore.getState().setPreference('analyticsEnabled', enabled);
  analyticsService.setEnabled(enabled);
  if (enabled) void analyticsService.initialize();
}

export function initializeAnalyticsPreference(): Promise<boolean> {
  const enabled = useSettingsStore.getState().analyticsEnabled;
  analyticsService.setEnabled(enabled);
  return analyticsService.initialize();
}
