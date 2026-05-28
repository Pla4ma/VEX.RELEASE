import { useEffect, useRef } from "react";
import { analyticsService } from "./analytics-service";
import {
  ProgressionEvents,
  SessionEvents,
} from "./analytics-events";
import { useAnalytics } from "./use-analytics-core";

export function useScreenTracking(
  screenName: string,
  properties?: Record<string, string | number | boolean>,
): void {
  const serviceRef = useRef(analyticsService);
  const hasTracked = useRef(false);
  useEffect(() => {
    if (!hasTracked.current) {
      serviceRef.current.screen(screenName, properties);
      hasTracked.current = true;
    }
  }, [screenName, properties]);
}

export function useProgressionTracking(
  level: number,
  streak: number,
  xp: number,
): void {
  const previousLevel = useRef(level);
  const previousStreak = useRef(streak);
  const { trackProgression } = useAnalytics();
  useEffect(() => {
    if (level > previousLevel.current) {
      trackProgression(ProgressionEvents.LEVEL_UP, {
        previous_level: previousLevel.current,
        new_level: level,
      });
      previousLevel.current = level;
    }
    if (streak !== previousStreak.current) {
      trackProgression(ProgressionEvents.STREAK_UPDATED, {
        previous_streak: previousStreak.current,
        streak_days: streak,
      });
      previousStreak.current = streak;
    }
  }, [level, streak, xp, trackProgression]);
}

export function useSessionTracking(
  sessionId: string | null,
  isActive: boolean,
  sessionType: "focus" | "boss" | "challenge",
): void {
  const { trackSession } = useAnalytics();
  const startTime = useRef<number | null>(null);
  const wasActive = useRef(false);
  useEffect(() => {
    if (isActive && !wasActive.current && sessionId) {
      startTime.current = Date.now();
      trackSession(SessionEvents.SESSION_STARTED, {
        session_id: sessionId,
        session_type: sessionType,
      });
      wasActive.current = true;
    } else if (!isActive && wasActive.current && sessionId) {
      const duration = startTime.current
        ? (Date.now() - startTime.current) / 1000
        : 0;
      trackSession(SessionEvents.SESSION_COMPLETED, {
        session_id: sessionId,
        session_type: sessionType,
        duration_seconds: duration,
      });
      wasActive.current = false;
      startTime.current = null;
    }
  }, [isActive, sessionId, sessionType, trackSession]);
}
