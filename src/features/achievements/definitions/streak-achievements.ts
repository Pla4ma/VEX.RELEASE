/**
 * Streak Achievements (10)
 *
 * Achievements related to maintaining daily streaks.
 */

import type { Achievement } from "../types";
import { STREAK_ACHIEVEMENTS_CORE } from "./streak-achievements-core";
import { STREAK_ACHIEVEMENTS_ADVANCED } from "./streak-achievements-advanced";

export const STREAK_ACHIEVEMENTS: Achievement[] = [
  ...STREAK_ACHIEVEMENTS_CORE,
  ...STREAK_ACHIEVEMENTS_ADVANCED,
];

export { STREAK_ACHIEVEMENTS_CORE } from "./streak-achievements-core";
export { STREAK_ACHIEVEMENTS_ADVANCED } from "./streak-achievements-advanced";
