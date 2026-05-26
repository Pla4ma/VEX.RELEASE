/**
 * Mission Utilities
 *
 * Utility functions for daily mission management.
 */

import {
  DailyMissionSchema,
  type DailyMission,
} from './schemas';

/**
 * Updates mission progress and completion status
 */
export function updateMissionProgress(
  mission: DailyMission,
  progress: number,
  isCompleted: boolean = false
): DailyMission {
  return DailyMissionSchema.parse({
    ...mission,
    progress: Math.max(0, Math.min(1, progress)),
    isCompleted,
  });
}

/**
 * Checks if a mission is expired
 */
export function isMissionExpired(mission: DailyMission): boolean {
  return Date.now() > mission.expiresAt;
}

/**
 * Gets the remaining time in hours for a mission
 */
export function getMissionRemainingHours(mission: DailyMission): number {
  const remaining = mission.expiresAt - Date.now();
  return Math.max(0, Math.ceil(remaining / (1000 * 60 * 60)));
}
