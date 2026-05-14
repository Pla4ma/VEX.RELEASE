/**
 * SGradeStreakTracker
 *
 * Tracks consecutive S-grade (perfect) sessions for skill expression.
 * Stores data in MMKV for fast local access.
 *
 * Milestones:
 * - 3 consecutive: emit mastery:s_grade_streak event with { count: 3 }
 * - 5 consecutive: achievement unlocked
 * - 10 consecutive: title cosmetic awarded
 */

import { z } from 'zod';
import { captureSilentFailure } from '../../utils/silent-failure';
import { getMMKVStorage } from '../../persistence/MMKVStorage';

// Storage key for MMKV
const SGRADE_STREAK_KEY = 'vex:mastery:s-grade-streak';

// Schema for S-grade streak data
const SGradeStreakDataSchema = z.object({
  count: z.number().int().min(0).default(0),
  lastSessionId: z.string().uuid().optional(),
  lastUpdatedAt: z.number().optional(),
});

type SGradeStreakData = z.infer<typeof SGradeStreakDataSchema>;

// Event emitter type definition
interface SGradeStreakEvent {
  userId: string;
  count: number;
  milestone?: 3 | 5 | 10;
}

/**
 * Track an S-grade session completion
 * - If S grade: increment streak
 * - If not S grade: reset streak to 0
 * - Emit event at milestone counts (3, 5, 10)
 *
 * @param userId - User identifier
 * @param gradeLetter - Session grade ('S', 'A', 'B', etc.)
 * @param sessionId - Unique session identifier
 * @param eventBus - Event bus for emitting streak events
 */
export async function trackSGradeSession(
  userId: string,
  gradeLetter: string,
  sessionId: string,
  eventBus?: { emit: (event: string, payload: SGradeStreakEvent) => void }
): Promise<{ count: number; milestone?: 3 | 5 | 10 }> {
  try {
    // Read current streak from storage
    const currentData = await readSGradeStreak();

    let newCount: number;
    let milestone: 3 | 5 | 10 | undefined;

    if (gradeLetter === 'S') {
      // Increment streak for S grade
      newCount = currentData.count + 1;

      // Check for milestones
      if (newCount === 3) {milestone = 3;}
      else if (newCount === 5) {milestone = 5;}
      else if (newCount === 10) {milestone = 10;}
    } else {
      // Reset streak for non-S grades
      newCount = 0;
    }

    // Save updated streak data
    const newData: SGradeStreakData = {
      count: newCount,
      lastSessionId: sessionId,
      lastUpdatedAt: Date.now(),
    };

    await saveSGradeStreak(newData);

    // Emit event if milestone reached or streak continued
    if (milestone && eventBus) {
      eventBus.emit('mastery:s_grade_streak', {
        userId,
        count: newCount,
        milestone,
      });
    }

    return { count: newCount, milestone };
  } catch (error) {
    captureSilentFailure(error instanceof Error ? error : new Error(String(error)), {
      feature: 'mastery',
      operation: 'track-s-grade',
      type: 'data',
    });
    // Return safe default on error
    return { count: 0 };
  }
}

/**
 * Read current S-grade streak from MMKV
 * Returns validated data or default if corrupted/missing
 */
async function readSGradeStreak(): Promise<SGradeStreakData> {
  try {
    const storage = getMMKVStorage();
    await storage.initialize();
    const raw = await storage.getItem(SGRADE_STREAK_KEY);

    if (!raw) {
      return { count: 0 };
    }

    const parsed = JSON.parse(raw);
    const result = SGradeStreakDataSchema.safeParse(parsed);

    if (result.success) {
      return result.data;
    }

    // Invalid data - reset to default
    return { count: 0 };
  } catch (error) {
    captureSilentFailure(error instanceof Error ? error : new Error(String(error)), {
      feature: 'mastery',
      operation: 'read-s-grade-streak',
      type: 'data',
    });
    return { count: 0 };
  }
}

/**
 * Save S-grade streak data to MMKV
 */
async function saveSGradeStreak(data: SGradeStreakData): Promise<void> {
  try {
    const storage = getMMKVStorage();
    await storage.initialize();
    await storage.setItem(SGRADE_STREAK_KEY, JSON.stringify(data));
  } catch (error) {
    captureSilentFailure(error instanceof Error ? error : new Error(String(error)), {
      feature: 'mastery',
      operation: 'save-s-grade-streak',
      type: 'data',
    });
  }
}

/**
 * Get current S-grade streak count (for UI display)
 */
export async function getSGradeStreak(): Promise<number> {
  const data = await readSGradeStreak();
  return data.count;
}

/**
 * Reset S-grade streak (e.g., when user opts to start fresh)
 */
export async function resetSGradeStreak(): Promise<void> {
  await saveSGradeStreak({ count: 0 });
}

/**
 * Check if a streak milestone was reached
 */
export function isSGradeMilestone(count: number): 3 | 5 | 10 | null {
  if (count === 3) {return 3;}
  if (count === 5) {return 5;}
  if (count === 10) {return 10;}
  return null;
}
