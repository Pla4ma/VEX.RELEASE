import { PostHog, PostHogProvider } from 'posthog-react-native';
import { Platform } from 'react-native';
import { createDebugger } from '../../utils/debug';
import {
  sanitizeAnalyticsProperties,
  sanitizeEventName,
  sanitizeUserTraits,
  type SafeAnalyticsProperties,
} from './privacy';

const debug = createDebugger('analytics');
const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
const ANALYTICS_DISABLED =
  process.env.EXPO_PUBLIC_ANALYTICS_DISABLED === 'true';
const FORCE_DEV_ANALYTICS =
  process.env.EXPO_PUBLIC_ANALYTICS_FORCE_ENABLE === 'true';
const CAN_INITIALIZE_POSTHOG = Platform.OS !== 'web';

interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
}

export type UserTraits = Record<string, unknown>;

class AnalyticsService {
  private client: PostHog | null = null;
  private config: AnalyticsConfig;
  private initialized = false;
  private currentUserId: string | null = null;

  constructor() {
    this.config = {
      enabled:
        Boolean(POSTHOG_API_KEY) &&
        CAN_INITIALIZE_POSTHOG &&
        !ANALYTICS_DISABLED &&
        (!__DEV__ || FORCE_DEV_ANALYTICS),
      debug: __DEV__,
    };
  }

  async initialize(): Promise<boolean> {
    if (this.initialized) {
      return this.isEnabled();
    }

    if (!this.config.enabled || !POSTHOG_API_KEY) {
      debug.info('[Analytics] Provider disabled or not configured');
      return false;
    }

    try {
      this.client = new PostHog(POSTHOG_API_KEY, {
        host: POSTHOG_HOST,
        flushAt: 20,
        flushInterval: 10000,
      });
      this.initialized = true;
      return true;
    } catch (error) {
      debug.error('[Analytics] Provider initialization failed', toError(error));
      this.client = null;
      return false;
    }
  }

  isEnabled(): boolean {
    return this.config.enabled && this.initialized && this.client !== null;
  }

  setEnabled(enabled: boolean): void {
    this.config.enabled =
      enabled && Boolean(POSTHOG_API_KEY) && (!__DEV__ || FORCE_DEV_ANALYTICS);
    if (!this.config.enabled) {
      this.client = null;
      this.initialized = false;
    }
  }

  capture(eventName: string, properties: object = {}): void {
    if (!this.isEnabled()) {
      return;
    }

    const safeEventName = sanitizeEventName(eventName);
    const safeProperties = this.buildEventProperties(properties);

    try {
      this.client?.capture(safeEventName, safeProperties);
      debug.debug('[Analytics] Event captured: %s', safeEventName);
    } catch (error) {
      debug.error('[Analytics] Event capture failed', toError(error));
    }
  }

  identify(userId: string, traits: UserTraits = {}): void {
    if (!this.isEnabled()) {
      return;
    }

    const safeTraits = sanitizeUserTraits(traits);
    this.currentUserId = userId;

    try {
      this.client?.identify(userId, safeTraits);
    } catch (error) {
      debug.error('[Analytics] Identify failed', toError(error));
    }
  }

  reset(): void {
    this.currentUserId = null;
    try {
      this.client?.reset();
    } catch (error) {
      debug.error('[Analytics] Reset failed', toError(error));
    }
  }

  updateUserProperties(traits: UserTraits): void {
    if (!this.currentUserId) {
      return;
    }

    this.identify(this.currentUserId, traits);
  }

  screen(screenName: string, properties: object = {}): void {
    this.capture('screen_viewed', {
      screen_name: screenName,
      ...properties,
    });
  }

  async flush(): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    try {
      await this.client?.flush();
    } catch (error) {
      debug.error('[Analytics] Flush failed', toError(error));
    }
  }

  getFeatureFlag(key: string): boolean | string | undefined {
    if (!this.isEnabled()) {
      return undefined;
    }

    return this.client?.getFeatureFlag(key);
  }

  isFeatureEnabled(key: string): boolean {
    if (!this.isEnabled()) {
      return false;
    }

    return this.client?.isFeatureEnabled(key) ?? false;
  }

  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  private buildEventProperties(properties: object): SafeAnalyticsProperties {
    return {
      ...sanitizeAnalyticsProperties(properties),
      platform: 'mobile',
      app_version: process.env.EXPO_PUBLIC_APP_VERSION || require('../../../app.json').version || '0.0.0',
    };
  }
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

export const analyticsService = new AnalyticsService();
export { PostHogProvider };

export {
  capture,
  identify,
  reset,
  screen,
  updateUserProperties,
  isFeatureEnabled,
  getFeatureFlag,
} from './analytics-shorthand';

export type PurchaseEvent = string;
export const RetentionEvents = { RETURN_SESSION: 'return_session' as const, COMEBACK_TRIGGERED: 'comeback_triggered' as const };
