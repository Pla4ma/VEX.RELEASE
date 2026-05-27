/**
 * Retention Loop Analytics
 *
 * Tracks the 18 key retention-product events for the first-week loop.
 * Used for product learning — not spam tracking.
 */
import * as Sentry from "@sentry/react-native";
import { getAnalyticsService } from "../../analytics/AnalyticsService";

const analytics = getAnalyticsService();

// ── Onboarding funnel ─────────────────────────────────────────────────

export function trackOnboardingStarted(userId: string): void {
  analytics.track("onboarding_started", { userId });
  Sentry.addBreadcrumb({
    category: "retention",
    level: "info",
    message: "onboarding_started",
  });
}

export function trackModeRecommended(
  userId: string,
  lane: string,
  confidence: number,
): void {
  analytics.track("mode_recommended", { userId, lane, confidence });
}

export function trackModeAccepted(userId: string, lane: string): void {
  analytics.track("mode_accepted", { userId, lane });
}

export function trackModeChanged(
  userId: string,
  fromLane: string,
  toLane: string,
): void {
  analytics.track("mode_changed", { userId, fromLane, toLane });
}

// ── Session start / complete ──────────────────────────────────────────

export function trackFirstSessionStarted(userId: string, lane: string): void {
  analytics.track("first_session_started", { userId, lane });
  Sentry.addBreadcrumb({
    category: "retention",
    level: "info",
    message: "first_session_started",
    data: { lane },
  });
}

export function trackFirstSessionCompleted(
  userId: string,
  lane: string,
  durationSeconds: number,
): void {
  analytics.track("first_session_completed", {
    userId,
    lane,
    durationSeconds,
  });
  Sentry.addBreadcrumb({
    category: "retention",
    level: "info",
    message: "first_session_completed",
    data: { lane, durationSeconds },
  });
}

export function trackCompletionReflectionSaved(
  userId: string,
  reflectionLength: number,
): void {
  analytics.track("completion_reflection_saved", {
    userId,
    reflectionLength,
  });
}

// ── Memory / insight moments ──────────────────────────────────────────

export function trackMemoryInsightViewed(userId: string, itemCount: number): void {
  analytics.track("memory_insight_viewed", { userId, itemCount });
}

export function trackMemoryHiddenOrDeleted(
  userId: string,
  itemId: string,
  action: "hidden" | "deleted",
): void {
  analytics.track("memory_hidden_or_deleted", { userId, itemId, action });
}

// ── Rescue funnel ─────────────────────────────────────────────────────

export function trackRescueOffered(
  userId: string,
  lane: string,
  trigger: string,
): void {
  analytics.track("rescue_offered", { userId, lane, trigger });
}

export function trackRescueStarted(
  userId: string,
  planId: string,
  reason: string,
): void {
  analytics.track("rescue_started", { userId, planId, reason });
}

export function trackRescueCompleted(
  userId: string,
  planId: string,
  outcome: string,
  durationSeconds: number,
): void {
  analytics.track("rescue_completed", {
    userId,
    planId,
    outcome,
    durationSeconds,
  });
}

// ── Day milestones ────────────────────────────────────────────────────

export function trackDay1Returned(userId: string, lane: string): void {
  analytics.track("day1_returned", { userId, lane });
  Sentry.addBreadcrumb({
    category: "retention",
    level: "info",
    message: "day1_returned",
    data: { lane },
  });
}

export function trackDay3MemorySeen(userId: string, itemCount: number): void {
  analytics.track("day3_memory_seen", { userId, itemCount });
}

export function trackDay7WeeklyInsightSeen(
  userId: string,
  lane: string,
  itemCount: number,
): void {
  analytics.track("day7_weekly_insight_seen", { userId, lane, itemCount });
}

// ── Premium funnel ────────────────────────────────────────────────────

export function trackPremiumActionTapped(
  userId: string,
  action: string,
  lane: string,
): void {
  analytics.track("premium_action_tapped", { userId, action, lane });
}

export function trackPaywallViewed(
  userId: string,
  context: string,
  lane: string,
): void {
  analytics.track("paywall_viewed", { userId, context, lane });
}

export function trackSubscriptionStarted(
  userId: string,
  productId: string,
  lane: string,
): void {
  analytics.track("subscription_started", { userId, productId, lane });
}
