/**
 * Home Priority Schemas (Phase 4)
 *
 * Zod schemas for the Home Decision Engine priority model.
 * Home answers "why start now?" in 3 seconds.
 *
 * @phase 4
 */

import { z } from 'zod';

// ============================================================================
// Home Priority Schema
// ============================================================================

export const HomePriorityTypeSchema = z.enum([
  'FIRST_SESSION',
  'STREAK_CRITICAL',
  'BOSS_FINAL_STRIKE',
  'COMEBACK',
  'STUDY_PLAN_DUE',
  'COACH_INTERVENTION',
  'DAILY_GOAL',
]);

export type HomePriorityType = z.infer<typeof HomePriorityTypeSchema>;

export const HomePriorityCTAActionSchema = z.enum([
  'START_SESSION',
  'VIEW_BOSS',
  'CLAIM_REWARD',
  'VIEW_STREAK',
  'VIEW_STUDY_PLAN',
  'VIEW_COACH',
]);

export type HomePriorityCTAAction = z.infer<typeof HomePriorityCTAActionSchema>;

export const HomePriorityCTASchema = z.object({
  text: z.string(),
  action: HomePriorityCTAActionSchema,
  params: z.record(z.unknown()).optional(),
}).strict();

export type HomePriorityCTA = z.infer<typeof HomePriorityCTASchema>;

export const HomePrimaryPrioritySchema = z.object({
  type: HomePriorityTypeSchema,
  urgency: z.number().min(0).max(100),
  reason: z.string(),
  cta: HomePriorityCTASchema,
}).strict();

export type HomePrimaryPriority = z.infer<typeof HomePrimaryPrioritySchema>;

export const HomeStakesSchema = z.object({
  what: z.string(),
  atRisk: z.string().optional(),
  potentialGain: z.string().optional(),
}).strict();

export type HomeStakes = z.infer<typeof HomeStakesSchema>;

export const HomeProgressSchema = z.object({
  todayMinutes: z.number(),
  dailyGoalMinutes: z.number(),
  streakDays: z.number(),
}).strict();

export type HomeProgress = z.infer<typeof HomeProgressSchema>;

export const HomeSecondaryActionSchema = z.object({
  type: z.string(),
  title: z.string(),
  onPress: z.function(),
}).strict();

export type HomeSecondaryAction = z.infer<typeof HomeSecondaryActionSchema>;

export const HomePrioritySchema = z.object({
  primary: HomePrimaryPrioritySchema,
  stakes: HomeStakesSchema,
  progress: HomeProgressSchema,
  secondary: z.array(HomeSecondaryActionSchema).max(3),
}).strict();

export type HomePriority = z.infer<typeof HomePrioritySchema>;

// ============================================================================
// Context Snapshot Schema (for priority calculation)
// ============================================================================

export const HomeContextSnapshotSchema = z.object({
  userId: z.string().uuid(),
  timestamp: z.number(),

  // Onboarding status
  onboarding: z.object({
    isComplete: z.boolean(),
    firstSessionCompleted: z.boolean(),
  }),

  // Streak status
  streak: z.object({
    currentDays: z.number(),
    isAtRisk: z.boolean(),
    hoursRemaining: z.number().optional(),
    isComeback: z.boolean(),
  }),

  // Boss status
  boss: z.object({
    hasActiveEncounter: z.boolean(),
    healthRemaining: z.number().optional(),
    maxHealth: z.number().optional(),
    isFinalStrike: z.boolean(),
  }),

  // Study plan status
  studyPlan: z.object({
    hasActivePlan: z.boolean(),
    dueToday: z.boolean(),
    itemsDue: z.number(),
  }),

  // Coach status
  coach: z.object({
    hasIntervention: z.boolean(),
    interventionType: z.string().optional(),
    hoursRemaining: z.number().optional(),
  }),

  // Daily progress
  daily: z.object({
    minutesFocused: z.number(),
    goalMinutes: z.number(),
    sessionsCompleted: z.number(),
  }),
}).strict();

export type HomeContextSnapshot = z.infer<typeof HomeContextSnapshotSchema>;
