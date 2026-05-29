/**
 * Retention Analytics
 *
 * Phase 6.2 - Analytics & Experimentation
 * Tracks and calculates user retention metrics.
 */

import { MMKV } from "react-native-mmkv";
import type { RetentionCohort } from "./types";

const retentionStorage = new MMKV({ id: "retention" });
const retentionCohorts = new Map<string, RetentionCohort>();

function loadCohortsFromStorage(): void {
  try {
    const stored = retentionStorage.getString("retention_cohorts");
    if (!stored) return;
    const parsed = JSON.parse(stored) as Record<string, RetentionCohort>;
    for (const [key, value] of Object.entries(parsed)) {
      retentionCohorts.set(key, value);
    }
  } catch {
    // Storage corruption — start fresh
  }
}

function persistCohorts(): void {
  try {
    const obj: Record<string, RetentionCohort> = {};
    for (const [key, value] of retentionCohorts) {
      obj[key] = value;
    }
    retentionStorage.set("retention_cohorts", JSON.stringify(obj));
  } catch {
    // Persistence failure is non-fatal for retention tracking
  }
}

// Initialize from persisted storage
loadCohortsFromStorage();

export function trackRetentionEvent(
  userId: string,
  event: "first_open" | "session" | "return",
): void {
  const todayParts = new Date().toISOString().split("T");
  const today = todayParts[0];
  if (!today) return;

  if (event === "first_open") {
    // Check if user already has a first-open date stored
    const storedDate = getUserFirstOpen(userId);
    if (storedDate) return; // Already tracked

    const existing = retentionCohorts.get(today);
    const cohort: RetentionCohort = existing ?? {
      cohortDate: today,
      cohortSize: 0,
      day1: 0,
      day7: 0,
      day30: 0,
    };
    cohort.cohortSize++;
    retentionCohorts.set(today, cohort);
    storeUserFirstOpen(userId, today);
    persistCohorts();
    return;
  }

  const userFirstOpen = getUserFirstOpen(userId);
  if (!userFirstOpen) return;

  const daysSince = daysBetween(userFirstOpen, today);
  const cohort = retentionCohorts.get(userFirstOpen);
  if (!cohort) return;

  if (daysSince === 1) {
    cohort.day1++;
  }
  if (daysSince === 7) {
    cohort.day7++;
  }
  if (daysSince === 30) {
    cohort.day30++;
  }
  persistCohorts();
}

function getUserFirstOpen(userId: string): string | null {
  return retentionStorage.getString(`first_open:${userId}`) ?? null;
}

function storeUserFirstOpen(userId: string, date: string): void {
  retentionStorage.set(`first_open:${userId}`, date);
}

function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

export function calculateRetentionRates(): {
  day1: number;
  day7: number;
  day30: number;
} {
  const cohorts = Array.from(retentionCohorts.values());
  if (cohorts.length === 0) {
    return { day1: 0, day7: 0, day30: 0 };
  }

  const matureCohorts = cohorts.filter((c) => {
    const cohortDate = new Date(c.cohortDate);
    const daysSince =
      (Date.now() - cohortDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= 30;
  });

  if (matureCohorts.length === 0) {
    return { day1: 0, day7: 0, day30: 0 };
  }

  const totalSize = matureCohorts.reduce((sum, c) => sum + c.cohortSize, 0);
  if (totalSize === 0) {
    return { day1: 0, day7: 0, day30: 0 };
  }

  return {
    day1: matureCohorts.reduce((sum, c) => sum + c.day1, 0) / totalSize,
    day7: matureCohorts.reduce((sum, c) => sum + c.day7, 0) / totalSize,
    day30: matureCohorts.reduce((sum, c) => sum + c.day30, 0) / totalSize,
  };
}
