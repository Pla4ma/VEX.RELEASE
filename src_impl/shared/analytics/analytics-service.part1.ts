import { PostHog, PostHogProvider } from "posthog-react-native";
import { createDebugger } from "../../utils/debug";
import { sanitizeAnalyticsProperties, sanitizeEventName, sanitizeUserTraits, type SafeAnalyticsProperties } from "./privacy";


export const analyticsService = new AnalyticsService();

export const capture = (eventName: string, properties?: object): void => {
  analyticsService.capture(eventName, properties);
};

export const identify = (userId: string, traits?: UserTraits): void => {
  analyticsService.identify(userId, traits);
};

export const reset = (): void => {
  analyticsService.reset();
};

export const screen = (screenName: string, properties?: object): void => {
  analyticsService.screen(screenName, properties);
};

export const updateUserProperties = (traits: UserTraits): void => {
  analyticsService.updateUserProperties(traits);
};

export const isFeatureEnabled = (key: string): boolean => analyticsService.isFeatureEnabled(key);

export const getFeatureFlag = (key: string): boolean | string | undefined =>
  analyticsService.getFeatureFlag(key);