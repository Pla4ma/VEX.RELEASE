/**
 * Content Study Analytics Service
 *
 * Singleton service managing event tracking, offline queueing,
 * and metrics persistence for the content study feature.
 */

import { captureSilentFailure } from '../../utils/silent-failure';
import type {
  ContentStudyAnalyticsEvent,
  ContentStudyAnalyticsEventName,
  ContentStudyMetrics,
} from './types';
import { CONTENT_STUDY_CONSTANTS } from './types';
import { getDefaultStorageAdapter } from '../../persistence/MMKVStorageAdapter';
import { createDebugger } from '../../utils/debug';

const getStorage = () => getDefaultStorageAdapter();
const debug = createDebugger('content-study:analytics');

export interface AnalyticsProvider {
  track: (event: string, properties: Record<string, unknown>) => void;
  identify: (userId: string, traits?: Record<string, unknown>) => void;
}

export class ContentStudyAnalyticsService {
  private static instance: ContentStudyAnalyticsService;
  private userId: string | null = null;
  private sessionId: string | null = null;
  private queue: ContentStudyAnalyticsEvent[] = [];
  private isOnline = true;
  private analyticsProvider?: AnalyticsProvider;

  static getInstance(): ContentStudyAnalyticsService {
    if (!ContentStudyAnalyticsService.instance) {
      ContentStudyAnalyticsService.instance =
        new ContentStudyAnalyticsService();
    }
    return ContentStudyAnalyticsService.instance;
  }

  initialize(userId: string, provider?: AnalyticsProvider): void {
    this.userId = userId;
    this.analyticsProvider = provider;
    this.sessionId = this.generateSessionId();
    if (provider) {
      provider.identify(userId, { feature: 'content-study' });
    }
    this.flushQueue();
  }

  setOnlineStatus(isOnline: boolean): void {
    this.isOnline = isOnline;
    if (isOnline) {
      this.flushQueue();
    }
  }

  track(
    eventName: ContentStudyAnalyticsEventName,
    properties: Record<string, unknown> = {},
  ): void {
    if (!this.userId) {
      return;
    }
    const event: ContentStudyAnalyticsEvent = {
      eventName,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId || undefined,
      properties,
      context: {
        appVersion: '1.0.0',
        platform: 'mobile',
        screenSize: 'default',
        isOnline: this.isOnline,
      },
    };
    if (this.isOnline && this.analyticsProvider) {
      this.sendToProvider(event);
    } else {
      this.queue.push(event);
      this.persistQueue();
    }
  }

  private sendToProvider(event: ContentStudyAnalyticsEvent): void {
    if (!this.analyticsProvider) {
      return;
    }
    try {
      this.analyticsProvider.track(event.eventName, {
        ...event.properties,
        timestamp: event.timestamp,
        sessionId: event.sessionId,
        context: event.context,
      });
    } catch (error: unknown) {
      debug.error('Analytics tracking error:', error instanceof Error ? error : new Error(String(error)));
      this.queue.push(event);
    }
  }

  private async persistQueue(): Promise<void> {
    try {
      await getStorage().setItem(
        `${CONTENT_STUDY_CONSTANTS.LOCAL_STORAGE_KEY}:analytics-queue`,
        JSON.stringify(this.queue),
      );
    } catch (error: unknown) {
      debug.error('Failed to persist analytics queue:', error instanceof Error ? error : new Error(String(error)));
    }
  }

  private async flushQueue(): Promise<void> {
    if (!this.analyticsProvider || this.queue.length === 0) {
      return;
    }
    const failed: ContentStudyAnalyticsEvent[] = [];
    for (const event of this.queue) {
      try {
        this.sendToProvider(event);
      } catch (error: unknown) {
        captureSilentFailure(error, {
          feature: 'content-study',
          operation: 'ui-fallback',
          type: 'ui',
        });
        failed.push(event);
      }
    }
    this.queue = failed;
    await this.persistQueue();
  }

  private generateSessionId(): string {
    return `cs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private metrics: Partial<ContentStudyMetrics> = {};

  updateMetrics(updates: Partial<ContentStudyMetrics>): void {
    this.metrics = { ...this.metrics, ...updates };
  }

  getMetrics(): Partial<ContentStudyMetrics> {
    return this.metrics;
  }

  async loadPersistedMetrics(): Promise<void> {
    try {
      const data = await getStorage().getItem(
        `${CONTENT_STUDY_CONSTANTS.LOCAL_STORAGE_KEY}:metrics`,
      );
      if (data) {
        this.metrics = JSON.parse(data) as Partial<ContentStudyMetrics>;
      }
    } catch (error: unknown) {
      captureSilentFailure(error, {
        feature: 'content-study',
        operation: 'ui-fallback',
        type: 'ui',
      });
    }
  }

  async persistMetrics(): Promise<void> {
    try {
      await getStorage().setItem(
        `${CONTENT_STUDY_CONSTANTS.LOCAL_STORAGE_KEY}:metrics`,
        JSON.stringify(this.metrics),
      );
    } catch (error: unknown) {
      captureSilentFailure(error, {
        feature: 'content-study',
        operation: 'ui-fallback',
        type: 'ui',
      });
    }
  }
}

export const contentStudyAnalytics = ContentStudyAnalyticsService.getInstance();
