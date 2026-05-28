import * as Sentry from "@sentry/react-native";
import { getAnalyticsService } from "@/analytics/AnalyticsService";

export const NEAR_MISS_THRESHOLD = 75;
export const COMPLETE_THRESHOLD = 100;

export function getNearMissMessage(progress: number): string {
  if (progress >= 95) {
    return "So close! Just a tiny bit more!";
  }
  if (progress >= 90) {
    return "Almost had it! Next time for sure!";
  }
  if (progress >= 85) {
    return "Great effort! You're getting close!";
  }
  if (progress >= 80) {
    return "Good progress! Keep pushing!";
  }
  return "Not bad! You'll nail it next time!";
}

export function formatTimeUntil(hours: number): string {
  if (hours <= 1) {
    return "Less than an hour";
  }
  if (hours < 24) {
    return `${Math.ceil(hours)} hours`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = Math.ceil(hours % 24);
  if (remainingHours === 0) {
    return `${days} day${days > 1 ? "s" : ""}`;
  }
  return `${days}d ${remainingHours}h`;
}

export function trackChallengeNearMiss(
  challengeId: string,
  progressPercent: number,
): void {
  Sentry.addBreadcrumb({
    category: "challenges",
    message: "Challenge near-miss recorded",
    level: "info",
    data: {
      challengeId,
      progressPercent,
      threshold: NEAR_MISS_THRESHOLD,
      type: "near_miss",
    },
  });
  getAnalyticsService().track("challenge_near_miss", {
    challenge_id: challengeId,
    progress_percent: progressPercent,
    miss_by_percent: 100 - progressPercent,
  });
}

export function useIsNearMiss(
  progressPercent: number,
  status: "completed" | "expired" | "failed",
): boolean {
  return (
    status === "expired" &&
    progressPercent >= NEAR_MISS_THRESHOLD &&
    progressPercent < COMPLETE_THRESHOLD
  );
}
