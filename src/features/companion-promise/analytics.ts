import * as Sentry from "@sentry/react-native";
import { capture } from "../../shared/analytics/analytics-service";
import type { CompanionPromise } from "./types";

export const CompanionPromiseAnalyticsEvents = {
  CREATED: "companion_promise_created",
  FULFILLED: "companion_promise_fulfilled",
  MISSED: "companion_promise_missed",
  RECOVERED: "companion_promise_recovered",
  VIEWED: "companion_promise_viewed",
} as const;

function track(
  event: string,
  message: string,
  promise: CompanionPromise,
  extra: Record<string, unknown> = {},
): void {
  Sentry.addBreadcrumb({
    category: "companion-promise",
    data: { promiseId: promise.id, status: promise.status, ...extra },
    level: "info",
    message,
  });
  capture(event, {
    promise_id: promise.id,
    status: promise.status,
    target_date: promise.targetDate,
    target_duration_minutes: promise.targetDurationMinutes,
    target_mode: promise.targetMode,
    user_id: promise.userId,
    ...extra,
  });
}

export function trackPromiseCreated(promise: CompanionPromise): void {
  track(
    CompanionPromiseAnalyticsEvents.CREATED,
    "Companion promise created",
    promise,
  );
}

export function trackPromiseViewed(
  promise: CompanionPromise,
  surface: string,
): void {
  track(
    CompanionPromiseAnalyticsEvents.VIEWED,
    "Companion promise viewed",
    promise,
    { surface },
  );
}

export function trackPromiseFulfilled(promise: CompanionPromise): void {
  track(
    CompanionPromiseAnalyticsEvents.FULFILLED,
    "Companion promise fulfilled",
    promise,
  );
}

export function trackPromiseMissed(promise: CompanionPromise): void {
  track(
    CompanionPromiseAnalyticsEvents.MISSED,
    "Companion promise missed",
    promise,
  );
}

export function trackPromiseRecovered(promise: CompanionPromise): void {
  track(
    CompanionPromiseAnalyticsEvents.RECOVERED,
    "Companion promise recovery started",
    promise,
  );
}
