import { captureSilentFailure } from "../../utils/silent-failure";
import type { ContentStudyAnalyticsEvent, ContentStudyAnalyticsEventName, ContentStudyMetrics, ContentSourceType, ContentStudyErrorCode } from "./types";
import { CONTENT_STUDY_CONSTANTS } from "./types";
import { getDefaultStorageAdapter } from "../../persistence";
import { createDebugger } from "../../utils/debug";
import { useCallback, useRef } from "react";


export class ContentStudyAnalyticsService {
  private static instance: ContentStudyAnalyticsService;
  private userId: string | null = null;
  private sessionId: string | null = null;
  private queue: ContentStudyAnalyticsEvent[] = [];
  private isOnline = true;

  private analyticsProvider?: {
    track: (event: string, properties: Record<string, unknown>) => void;
    identify: (userId: string, traits?: Record<string, unknown>) => void;
  };

  static getInstance(): ContentStudyAnalyticsService {
    if (!ContentStudyAnalyticsService.instance) {
      ContentStudyAnalyticsService.instance = new ContentStudyAnalyticsService();
    }
    return ContentStudyAnalyticsService.instance;
  }

  initialize(
    userId: string,
    provider?: {
      track: (event: string, properties: Record<string, unknown>) => void;
      identify: (userId: string, traits?: Record<string, unknown>) => void;
    },
  ): void {
    this.userId = userId;
    this.analyticsProvider = provider;
    this.sessionId = this.generateSessionId();

    // Identify user with traits
    if (provider) {
      provider.identify(userId, {
        feature: 'content-study',
      });
    }

    // Flush any queued events
    this.flushQueue();
  }

  setOnlineStatus(isOnline: boolean): void {
    this.isOnline = isOnline;
    if (isOnline) {
      this.flushQueue();
    }
  }

  track(eventName: ContentStudyAnalyticsEventName, properties: Record<string, unknown> = {}): void {
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
        appVersion: '1.0.0', // Should be from config
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
    } catch (e) {
      debug.error('Analytics tracking error:', e as Error);
      this.queue.push(event);
    }
  }

  private async persistQueue(): Promise<void> {
    try {
      await getStorage().setItem(`${CONTENT_STUDY_CONSTANTS.LOCAL_STORAGE_KEY}:analytics-queue`, JSON.stringify(this.queue));
    } catch (e) {
      debug.error('Failed to persist analytics queue:', e as Error);
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
      } catch (error) {
        captureSilentFailure(error, { feature: 'content-study', operation: 'ui-fallback', type: 'ui' });
        failed.push(event);
      }
    }

    this.queue = failed;
    await this.persistQueue();
  }

  private generateSessionId(): string {
    return `cs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Metrics tracking
  private metrics: Partial<ContentStudyMetrics> = {};

  updateMetrics(updates: Partial<ContentStudyMetrics>): void {
    this.metrics = { ...this.metrics, ...updates };
  }

  getMetrics(): Partial<ContentStudyMetrics> {
    return this.metrics;
  }

  async loadPersistedMetrics(): Promise<void> {
    try {
      const data = await getStorage().getItem(`${CONTENT_STUDY_CONSTANTS.LOCAL_STORAGE_KEY}:metrics`);
      if (data) {
        this.metrics = JSON.parse(data);
      }
    } catch (error) {
      captureSilentFailure(error, { feature: 'content-study', operation: 'ui-fallback', type: 'ui' });
      // Ignore load errors
    }
  }

  async persistMetrics(): Promise<void> {
    try {
      await getStorage().setItem(`${CONTENT_STUDY_CONSTANTS.LOCAL_STORAGE_KEY}:metrics`, JSON.stringify(this.metrics));
    } catch (error) {
      captureSilentFailure(error, { feature: 'content-study', operation: 'ui-fallback', type: 'ui' });
      // Ignore persist errors
    }
  }
}