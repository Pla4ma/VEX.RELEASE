import { captureSilentFailure } from "../../utils/silent-failure";
/**
 * Tomorrow Preview Service
 *
 * PHASE 7.4 - Compute the most exciting thing happening tomorrow
 *
 * Computes ONE exciting preview from real data:
 * 1. Streak milestone tomorrow
 * 2. Boss near death (< 25% health)
 * 3. Rival gap closing opportunity
 * 4. Power Hour scheduled
 * 5. Challenge reset with XP available
 *
 * Stores preview in MMKV for display on Home screen
 *
 * @phase 7.4
 */

import { z } from "zod";
import * as Sentry from "@sentry/react-native";

// ============================================================================
// Schemas
// ============================================================================

export const TomorrowPreviewTypeSchema = z.enum([
  "STREAK_MILESTONE",
  "BOSS_NEAR_DEATH",
  "RIVAL_GAP",
  "POWER_HOUR",
  "CHALLENGE_RESET",
  "GENERIC", // Fallback - should rarely happen
]);

export const TomorrowPreviewDataSchema = z.object({
  type: TomorrowPreviewTypeSchema,
  priority: z.number().int().min(1).max(5), // 1 = highest priority
  headline: z.string().min(1).max(100),
  subtext: z.string().min(1).max(200),
  emoji: z.string().min(1).max(4),
  actionPrompt: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// ============================================================================
// Types
// ============================================================================

export type TomorrowPreviewType = z.infer<typeof TomorrowPreviewTypeSchema>;
export type TomorrowPreviewData = z.infer<typeof TomorrowPreviewDataSchema>;

// ============================================================================
// Input Types
// ============================================================================

export interface ComputeTomorrowPreviewInput {
  userId: string;
  currentStreakDays: number;
  streakWillContinue: boolean;
  bossData?: {
    bossName: string;
    healthPercent: number;
    canDefeatTomorrow: boolean;
  } | null;
  rivalData?: {
    rivalName: string;
    myMinutes: number;
    theirMinutes: number;
    gapMinutes: number;
  } | null;
  powerHourData?: {
    day: string;
    time: string;
  } | null;
  challengeData?: {
    xpAvailable: number;
    incompleteChallenges: number;
  } | null;
}

// ============================================================================
// Storage
// ============================================================================

const TOMORROW_PREVIEW_STORAGE_KEY = (userId: string) => `tomorrow_preview:${userId}`;

function getStorage() {
  try {
    const { storage } = require("../../store/mmkv-storage");
    return storage;
  } catch (error) {
    captureSilentFailure(error, { feature: "home-spine", operation: "network-fallback", type: "network" });
    return null;
  }
}

/**
 * Save tomorrow preview to storage for Home screen display
 */
export function saveTomorrowPreview(userId: string, preview: TomorrowPreviewData): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    const data = JSON.stringify({
      ...preview,
      savedAt: Date.now(),
    });
    storage.set(TOMORROW_PREVIEW_STORAGE_KEY(userId), data);
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: "tomorrow-preview", operation: "save" },
      extra: { userId },
    });
  }
}

/**
 * Load saved tomorrow preview
 */
export function loadTomorrowPreview(userId: string): (TomorrowPreviewData & { savedAt: number }) | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  try {
    const data = storage.getString(TOMORROW_PREVIEW_STORAGE_KEY(userId));
    if (!data) {
      return null;
    }

    const parsed = JSON.parse(data);
    return TomorrowPreviewDataSchema.extend({ savedAt: z.number() }).parse(parsed);
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: "tomorrow-preview", operation: "load" },
      extra: { userId },
    });
    return null;
  }
}

/**
 * Clear saved preview (after day passes)
 */
export function clearTomorrowPreview(userId: string): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.delete(TOMORROW_PREVIEW_STORAGE_KEY(userId));
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: "tomorrow-preview", operation: "clear" },
      extra: { userId },
    });
  }
}

// ============================================================================
// Priority Calculation
// ============================================================================

/**
 * Compute tomorrow preview from real data
 * Returns exactly ONE preview - the most exciting/impactful
 */
export function computeTomorrowPreview(input: ComputeTomorrowPreviewInput): TomorrowPreviewData {
  const { userId, currentStreakDays, streakWillContinue, bossData, rivalData, powerHourData, challengeData } = input;

  const candidates: TomorrowPreviewData[] = [];

  // Priority 1: Streak milestone (if streak will continue)
  if (streakWillContinue) {
    const milestoneDays = [7, 14, 30, 60, 100, 180, 365];
    const nextMilestone = milestoneDays.find((d) => d > currentStreakDays);

    if (nextMilestone && nextMilestone === currentStreakDays + 1) {
      const badgeName = getMilestoneBadgeName(nextMilestone);
      candidates.push({
        type: "STREAK_MILESTONE",
        priority: 1, // Highest priority
        headline: `${nextMilestone}-Day Streak!`,
        subtext: `Tomorrow: Day ${nextMilestone}. Claim your ${badgeName} badge.`,
        emoji: "🔥",
        actionPrompt: "Don't break the chain!",
        metadata: { milestoneDays: nextMilestone, badgeName },
      });
    }
  }

  // Priority 2: Boss near death
  if (bossData && bossData.healthPercent < 25) {
    candidates.push({
      type: "BOSS_NEAR_DEATH",
      priority: 2,
      headline: bossData.canDefeatTomorrow ? `${bossData.bossName} Will Fall!` : "Boss Almost Defeated!",
      subtext: bossData.canDefeatTomorrow ? "One good session tomorrow defeats the boss!" : `${bossData.bossName} at ${bossData.healthPercent.toFixed(0)}% — squad needs your help!`,
      emoji: "👹",
      actionPrompt: bossData.canDefeatTomorrow ? "Prepare to strike!" : "Join the squad!",
      metadata: { bossName: bossData.bossName, healthPercent: bossData.healthPercent },
    });
  }

  // Priority 3: Rival gap closing opportunity
  if (rivalData && rivalData.gapMinutes > 0) {
    const gapClosed = Math.min(rivalData.gapMinutes, 30); // Assume ~30 min session
    const willOvertake = rivalData.myMinutes + gapClosed > rivalData.theirMinutes;

    candidates.push({
      type: "RIVAL_GAP",
      priority: 3,
      headline: willOvertake ? "Overtake Your Rival!" : "Close the Gap!",
      subtext: willOvertake ? `One session tomorrow puts you ahead of ${rivalData.rivalName}!` : `${rivalData.rivalName} is ${rivalData.gapMinutes} min ahead. Catch up tomorrow!`,
      emoji: "⚔️",
      actionPrompt: "Show them who's boss!",
      metadata: { rivalName: rivalData.rivalName, gapMinutes: rivalData.gapMinutes },
    });
  }

  // Priority 4: Power Hour
  if (powerHourData) {
    candidates.push({
      type: "POWER_HOUR",
      priority: 4,
      headline: "Power Hour Tomorrow!",
      subtext: `${powerHourData.day} at ${powerHourData.time} — Triple XP for 1 hour!`,
      emoji: "🌟",
      actionPrompt: "Set a reminder!",
      metadata: { day: powerHourData.day, time: powerHourData.time },
    });
  }

  // Priority 5: Challenge reset
  if (challengeData && challengeData.incompleteChallenges > 0) {
    candidates.push({
      type: "CHALLENGE_RESET",
      priority: 5,
      headline: `${challengeData.incompleteChallenges} Challenges Reset`,
      subtext: `+${challengeData.xpAvailable} XP available in tomorrow's challenges.`,
      emoji: "📋",
      actionPrompt: "Complete them all!",
      metadata: { xpAvailable: challengeData.xpAvailable, count: challengeData.incompleteChallenges },
    });
  }

  // Sort by priority and return the highest
  const bestPreview = candidates.sort((a, b) => a.priority - b.priority)[0];

  if (bestPreview) {
    // Save to storage for Home screen display
    saveTomorrowPreview(userId, bestPreview);
    return bestPreview;
  }

  // Fallback (should rarely happen) - return generic but still meaningful
  const fallback: TomorrowPreviewData = {
    type: "GENERIC",
    priority: 6,
    headline: streakWillContinue ? "Streak Continues!" : "New Day, New Focus",
    subtext: streakWillContinue ? `Keep your ${currentStreakDays + 1}-day streak alive tomorrow!` : "Tomorrow is a fresh start. Build your streak!",
    emoji: streakWillContinue ? "🔥" : "✨",
  };

  saveTomorrowPreview(userId, fallback);
  return fallback;
}

/**
 * Get badge name for milestone
 */
function getMilestoneBadgeName(days: number): string {
  const badgeNames: Record<number, string> = {
    7: "Phoenix",
    14: "Griffin",
    30: "Dragon",
    60: "Titan",
    100: "Centurion",
    180: "Immortal",
    365: "Legend",
  };
  return badgeNames[days] || "Milestone";
}

// ============================================================================
// Session Integration
// ============================================================================

/**
 * Hook to get tomorrow preview for session completion screen
 * Always returns a preview (never null)
 */
export function useTomorrowPreviewForSession(userId: string, data: ComputeTomorrowPreviewInput): TomorrowPreviewData {
  return computeTomorrowPreview({ ...data, userId });
}

/**
 * Hook to get saved preview for Home screen
 */
export function useSavedTomorrowPreview(userId: string): TomorrowPreviewData | null {
  const saved = loadTomorrowPreview(userId);

  // Check if saved preview is still valid (from today)
  if (saved) {
    const now = new Date();
    const savedDate = new Date(saved.savedAt);

    // If saved from a different day, it's stale
    if (now.getDate() !== savedDate.getDate() || now.getMonth() !== savedDate.getMonth() || now.getFullYear() !== savedDate.getFullYear()) {
      clearTomorrowPreview(userId);
      return null;
    }

    // Return the preview data without the savedAt timestamp
    const { savedAt: _, ...preview } = saved;
    return preview;
  }

  return null;
}
