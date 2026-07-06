import { z } from 'zod';

export const RecommendationTypeSchema = z.enum([
  'OPTIMAL_TIME',
  'STREAK_PROTECTION',
  'COMEBACK_BUILDER',
  'DIFFICULTY_ADJUST',
  'CHALLENGE_SYNC',
  'BOSS_PREP',
  'HABIT_BUILDER',
  'ENERGY_BASED',
]);

export const RecommendationSourceSchema = z.enum([
  'HISTORICAL_PATTERN',
  'STREAK_DATA',
  'LEVEL_PROGRESS',
  'CHALLENGE_DEADLINE',
  'BOSS_STATUS',
  'ENERGY_LEVEL',
  'TIME_OF_DAY',
]);

export const RecommendationStatusSchema = z.enum([
  'ACTIVE',
  'ACCEPTED',
  'REJECTED',
  'EXPIRED',
]);

export const ReminderTypeSchema = z.enum([
  'STREAK_WARNING',
  'STREAK_CHECK',
  'OPTIMAL_SESSION_TIME',
  'CHALLENGE_DEADLINE',
  'BOSS_TIMEOUT',
  'COMEBACK_OPPORTUNITY',
  'MILESTONE_APPROACHING',
  'PERSONALIZED_MOTIVATION',
  'BREAK_REMINDER',
]);

export const ComebackStatusSchema = z.enum([
  'OFFERED',
  'ACTIVE',
  'COMPLETED',
  'EXPIRED',
  'DECLINED',
]);

export const CoachUserStateSchema = z.enum([
  'COLD_START',
  'LOW_CONFIDENCE',
  'HIGH_CONFIDENCE',
  'STREAK_AT_RISK',
  'COMEBACK_MODE',
  'POST_FAILURE_SUPPORT',
  'MILESTONE_HYPE',
  'OVERLOAD_PROTECTION',
  'MUTED_MODE',
]);

export type RecommendationType = z.infer<typeof RecommendationTypeSchema>;
export type RecommendationSource = z.infer<typeof RecommendationSourceSchema>;
export type RecommendationStatus = z.infer<typeof RecommendationStatusSchema>;
export type ReminderType = z.infer<typeof ReminderTypeSchema>;
export type ComebackStatus = z.infer<typeof ComebackStatusSchema>;
export type CoachUserState = z.infer<typeof CoachUserStateSchema>;
