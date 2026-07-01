// Barrel re-exports for analytics — keeps analytics-service.ts under 200 lines
import { analyticsService } from './analytics-service';
import type { UserTraits } from './analytics-types';

export type { UserTraits, PurchaseEvent } from './analytics-types';
export { RetentionEvents } from './analytics-types';

export const capture = (eventName: string, properties?: object): void =>
  analyticsService.capture(eventName, properties);
export const identify = (userId: string, traits?: UserTraits): void =>
  analyticsService.identify(userId, traits);
export const reset = (): void => analyticsService.reset();
export const screen = (screenName: string, properties?: object): void =>
  analyticsService.screen(screenName, properties);
export const updateUserProperties = (traits: UserTraits): void =>
  analyticsService.updateUserProperties(traits);
export const isFeatureEnabled = (key: string): boolean =>
  analyticsService.isFeatureEnabled(key);
export const getFeatureFlag = (key: string): boolean | string | undefined =>
  analyticsService.getFeatureFlag(key);
