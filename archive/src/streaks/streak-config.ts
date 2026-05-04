/**
 * Streak Configuration
 * Milestones and constants for the streak system
 */

import { z } from 'zod';

// Validation schemas
export const StreakStateSchema = z.object({
  currentStreak: z.number().min(0).default(0),
  longestStreak: z.number().min(0).default(0),
  lastSessionAt: z.number().optional(),
  streakStartAt: z.number().optional(),
  graceUses: z.number().min(0).default(0),
  maxGraceUses: z.number().min(0).default(3),
  frozenUntil: z.number().optional(),
  freezeUses: z.number().min(0).default(0),
  comebackStreak: z.number().min(0).default(0),
  isAtRisk: z.boolean().default(false),
  riskLevel: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('NONE'),
  timezone: z.string().default('UTC'),
  lastStreakDiedAt: z.number().optional(),
  streakFuneralShown: z.boolean().default(false),
});

export const StreakMilestoneSchema = z.object({
  days: z.number(),
  reward: z.object({
    type: z.enum(['XP', 'CURRENCY', 'BADGE', 'BOOST']),
    amount: z.number(),
  }),
  badgeId: z.string().optional(),
});

export type StreakState = z.infer<typeof StreakStateSchema>;
export type StreakMilestone = z.infer<typeof StreakMilestoneSchema>;

// Milestone definitions
export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 3, reward: { type: 'XP', amount: 100 }, badgeId: 'streak-3' },
  { days: 7, reward: { type: 'CURRENCY', amount: 50 }, badgeId: 'streak-7' },
  { days: 14, reward: { type: 'XP', amount: 500 }, badgeId: 'streak-14' },
  { days: 30, reward: { type: 'CURRENCY', amount: 200 }, badgeId: 'streak-30' },
  { days: 60, reward: { type: 'BOOST', amount: 2 }, badgeId: 'streak-60' },
  { days: 90, reward: { type: 'BADGE', amount: 1 }, badgeId: 'streak-90' },
  { days: 180, reward: { type: 'CURRENCY', amount: 1000 }, badgeId: 'streak-180' },
  { days: 365, reward: { type: 'BADGE', amount: 1 }, badgeId: 'streak-365' },
];
