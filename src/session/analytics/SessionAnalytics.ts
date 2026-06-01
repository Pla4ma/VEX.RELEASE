import type {
  SessionHistoryEntry,
  InterruptionRecord,
  AntiCheatFlag,
  RecoveryRecord,
} from "../types";
import { eventBus } from "../../events";
import { createDebugger } from "../../utils/debug";
import type {
  SessionAnalyticsEvent,
  EngagementMetrics,
  PatternMetrics,
} from "./session-analytics-types";
import { setupAnalyticsEventListeners } from "./session-analytics-listeners";
import { calculatePatternMetricsFromHistory } from "./session-analytics-helpers";
import {
  setOrchestratorHandlesCompletion,
  getOrchestratorHandlesCompletion,
} from "./session-analytics-state";

export { setOrchestratorHandlesCompletion, getOrchestratorHandlesCompletion };

const debug = createDebugger("session:analytics");

export class SessionAnalytics {
  private userId: string | null = null;
  private eventQueue: SessionAnalyticsEvent[] = [];
  private metrics: EngagementMetrics | null = null;
  private patterns: PatternMetrics | null = null;
  private cleanupListeners: (() => void) | null = null;

  setUserId(userId: string): void {
    this.userId = userId;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.userId) {
      return;
    }
    if (this.cleanupListeners) {
      this.cleanupListeners();
    }
    this.cleanupListeners = setupAnalyticsEventListeners(this.userId, (eventName, properties) =>
      this.track(eventName, properties),
    );
  }

  private track(eventName: string, properties: Record<string, unknown>): void {
    if (!this.userId) {
      return;
    }
    const event: SessionAnalyticsEvent = {
      eventName,
      userId: this.userId,
      sessionId: properties.sessionId as string,
      timestamp: Date.now(),
      properties,
    };
    this.eventQueue.push(event);
    if (this.eventQueue.length >= 50) {
      this.flush();
    }
    eventBus.publish("analytics:track", {
      event: eventName,
      properties: { ...properties, userId: this.userId },
    });
  }

  async calculateEngagementMetrics(
    history: SessionHistoryEntry[],
  ): Promise<EngagementMetrics> {
    const totalSessions = history.length;
    const completedSessions = history.filter(
      (h) => h.status === "COMPLETED",
    ).length;
    const abandonedSessions = history.filter(
      (h) => h.status === "ABANDONED",
    ).length;
    const totalFocusTime = history.reduce((acc, h) => {
      return acc + (h.summary?.effectiveDuration || 0);
    }, 0);
    const avgSessionDuration =
      totalSessions > 0 ? totalFocusTime / totalSessions : 0;
    this.metrics = {
      totalSessions,
      completedSessions,
      abandonedSessions,
      completionRate:
        totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
      avgSessionDuration,
      totalFocusTime,
    };
    return this.metrics;
  }

  async calculatePatternMetrics(
    history: SessionHistoryEntry[],
    recoveries: RecoveryRecord[],
  ): Promise<PatternMetrics> {
    this.patterns = await calculatePatternMetricsFromHistory(
      history,
      recoveries,
    );
    return this.patterns;
  }

  trackMilestone(
    sessionId: string,
    milestone: string,
    data: Record<string, unknown>,
  ): void {
    this.track(`milestone_${milestone}`, { sessionId, ...data });
  }

  trackAntiCheatIncident(flag: AntiCheatFlag): void {
    this.track("anti_cheat_incident", {
      sessionId: flag.sessionId,
      type: flag.type,
      severity: flag.severity,
      actionTaken: flag.actionTaken,
      score: flag.score,
    });
  }

  trackInterruptionImpact(interruption: InterruptionRecord): void {
    this.track("interruption_impact", {
      sessionId: interruption.sessionId,
      type: interruption.type,
      severity: interruption.severity,
      timeLost: interruption.impact.timeLost,
      scoreImpact: interruption.impact.scoreImpact,
      autoRecovered: interruption.autoRecovered,
    });
  }

  trackFunnelStep(
    step: string,
    sessionId: string,
    success: boolean,
    duration?: number,
  ): void {
    this.track("funnel_step", {
      step,
      sessionId,
      success,
      duration,
      timestamp: Date.now(),
    });
  }

  flush(): void {
    if (this.eventQueue.length === 0) {
      return;
    }
    const events = [...this.eventQueue];
    this.eventQueue = [];
    debug.info("[Analytics Batch]", {
      userId: this.userId,
      events,
      timestamp: Date.now(),
    });
  }

  getQueuedEvents(): SessionAnalyticsEvent[] {
    return [...this.eventQueue];
  }

  getMetrics(): EngagementMetrics | null {
    return this.metrics;
  }

  getPatterns(): PatternMetrics | null {
    return this.patterns;
  }
}

let sessionAnalytics: SessionAnalytics | null = null;

export function getSessionAnalytics(): SessionAnalytics {
  if (!sessionAnalytics) {
    sessionAnalytics = new SessionAnalytics();
  }
  return sessionAnalytics;
}

export default SessionAnalytics;
