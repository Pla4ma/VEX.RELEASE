import { z } from "zod";

export const XpSourceSchema = z.enum([
  "SESSION_COMPLETE",
  "MOMENTUM_BONUS",
  "BLOCKER_RESOLVED",
  "COLLABORATION_BONUS",
  "PERFECT_SESSION_BONUS",
  "RECOVERY_BONUS",
  "DAILY_ENGAGEMENT",
  "INSIGHT_EARNED",
  "INSIGHT_BONUS",
  "MILESTONE_BONUS",
  "COMMUNITY_BONUS",
  "EVENT_BONUS",
  "BOOST_BONUS",
  "SEASON_BONUS",
  "AI_COACH_BONUS",
  "LEVEL_MILESTONE",
  "MILESTONE_REWARD",
  "PROMOTIONAL",
  "EVENT_PARTICIPATION",
  "AI_COACH_GOAL",
  // ── Legacy gamification sources — deprecated, kept for DB compatibility ──
  /** @deprecated Use MOMENTUM_BONUS */
  "STREAK_BONUS",
  /** @deprecated Use BLOCKER_RESOLVED */
  "BOSS_BONUS",
  /** @deprecated Use COLLABORATION_BONUS */
  "SQUAD_BONUS",
  /** @deprecated Use RECOVERY_BONUS */
  "COMEBACK_BONUS",
  /** @deprecated Use DAILY_ENGAGEMENT */
  "DAILY_LOGIN",
  /** @deprecated Use INSIGHT_EARNED */
  "ACHIEVEMENT_UNLOCK",
  /** @deprecated Use INSIGHT_BONUS */
  "ACHIEVEMENT_BONUS",
  /** @deprecated Use MILESTONE_BONUS */
  "CHALLENGE_BONUS",
  /** @deprecated Use COMMUNITY_BONUS */
  "SOCIAL_BONUS",
  /** @deprecated Use LEVEL_MILESTONE */
  "LEVEL_UP_REWARD",
]);
