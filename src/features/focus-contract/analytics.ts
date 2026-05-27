import * as Sentry from "@sentry/react-native";
import { capture } from "../../shared/analytics/analytics-service";
import type { ReflectionStatus } from "./types";

export const FocusContractAnalyticsEvents = {
  CREATED: "focus_contract_created",
  REFLECTED: "focus_contract_reflected",
  SKIPPED: "focus_contract_skipped",
  COMPLETION_RATE: "focus_contract_completion_rate",
} as const;

export function trackContractCreated(
  userId: string,
  sessionId: string,
  hasTask: boolean,
): void {
  Sentry.addBreadcrumb({
    category: "focus-contract",
    message: "Focus contract created",
    level: "info",
    data: { userId, sessionId, hasTask },
  });
  capture(FocusContractAnalyticsEvents.CREATED, {
    user_id: userId,
    session_id: sessionId,
    has_task: hasTask,
  });
}

export function trackContractReflected(
  userId: string,
  status: ReflectionStatus,
  sessionDuration: number,
): void {
  Sentry.addBreadcrumb({
    category: "focus-contract",
    message: "Focus contract reflected",
    level: "info",
    data: { userId, status, sessionDuration },
  });
  capture(FocusContractAnalyticsEvents.REFLECTED, {
    user_id: userId,
    status,
    session_duration: sessionDuration,
  });
}

export function trackContractSkipped(userId: string, sessionId: string): void {
  Sentry.addBreadcrumb({
    category: "focus-contract",
    message: "Focus contract skipped",
    level: "info",
    data: { userId, sessionId },
  });
  capture(FocusContractAnalyticsEvents.SKIPPED, {
    user_id: userId,
    session_id: sessionId,
  });
}

export function trackContractCompletionRate(
  userId: string,
  rate: number,
  windowDays: number,
): void {
  capture(FocusContractAnalyticsEvents.COMPLETION_RATE, {
    user_id: userId,
    rate,
    window_days: windowDays,
  });
}
