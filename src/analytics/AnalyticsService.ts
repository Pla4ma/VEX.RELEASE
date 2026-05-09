import {
  analyticsService,
  capture,
  identify,
  reset,
  screen,
  updateUserProperties,
} from '../shared/analytics/analytics-service';

export interface AnalyticsEvent {
  id: string;
  name: string;
  properties: Record<string, unknown>;
  timestamp: number;
  userId?: string;
  sessionId: string;
  platform: string;
  appVersion: string;
}

export interface UserProperties {
  userId: string;
  [key: string]: unknown;
}

export interface AnalyticsConfig {
  enabled?: boolean;
  debug?: boolean;
  bufferSize?: number;
  flushInterval?: number;
  sampleRate?: number;
  excludedEvents?: string[];
  storageKey?: string;
}

export class AnalyticsService {
  async initialize(): Promise<void> {
    await analyticsService.initialize();
  }

  setUserId(userId: string): void {
    identify(userId);
  }

  clearUser(): void {
    reset();
  }

  setUserProperties(properties: Record<string, unknown>): void {
    updateUserProperties(properties);
  }

  track(eventName: string, properties: Record<string, unknown> = {}): void {
    capture(eventName, properties);
  }

  screen(screenName: string, properties: Record<string, unknown> = {}): void {
    screen(screenName, properties);
  }

  async flush(): Promise<void> {
    await analyticsService.flush();
  }

  getQueueLength(): number {
    return 0;
  }

  getQueuedEvents(): AnalyticsEvent[] {
    return [];
  }

  async clearQueue(): Promise<void> {
    return Promise.resolve();
  }

  setEnabled(enabled: boolean): void {
    analyticsService.setEnabled(enabled);
  }

  cleanup(): void {
    void analyticsService.flush();
  }
}

let analyticsServiceInstance: AnalyticsService | null = null;

export function getAnalyticsService(config?: AnalyticsConfig): AnalyticsService {
  if (!analyticsServiceInstance) {
    analyticsServiceInstance = new AnalyticsService();
  }

  if (config?.enabled !== undefined) {
    analyticsServiceInstance.setEnabled(config.enabled);
  }

  return analyticsServiceInstance;
}