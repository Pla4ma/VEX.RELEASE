/**
 * Focus Identity Events
 *
 * Event definitions for focus identity system.
 */

import { eventBus } from "../../events/EventBus";

export interface MonthlyReportViewedEvent {
  userId: string;
  month: string;
  grade: string;
  change: number;
  timestamp: number;
}

export interface MonthlyReportSharedEvent {
  userId: string;
  month: string;
  grade: string;
  platform?: string;
  timestamp: number;
}

export interface MonthlyReportDismissedEvent {
  userId: string;
  month: string;
  timestamp: number;
}

/**
 * Publish monthly report viewed event
 */
export function publishMonthlyReportViewed(
  userId: string,
  month: string,
  grade: string,
  change: number,
): void {
  eventBus.publish("MONTHLY_REPORT_VIEWED", {
    userId,
    month,
    grade,
    change,
    timestamp: Date.now(),
  });
}

/**
 * Publish monthly report shared event
 */
export function publishMonthlyReportShared(
  userId: string,
  month: string,
  grade: string,
  platform?: string,
): void {
  eventBus.publish("MONTHLY_REPORT_SHARED", {
    userId,
    month,
    grade,
    platform,
    timestamp: Date.now(),
  });
}

/**
 * Publish monthly report dismissed event
 */
export function publishMonthlyReportDismissed(
  userId: string,
  month: string,
): void {
  eventBus.publish("MONTHLY_REPORT_DISMISSED", {
    userId,
    month,
    timestamp: Date.now(),
  });
}
