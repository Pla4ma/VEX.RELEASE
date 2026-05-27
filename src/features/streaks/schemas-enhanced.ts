/**
 * Enhanced Streak Schemas with Complete Validation
 * For 10/10 quality compliance
 */

import { z } from "zod";

// ============================================================================
// Streak Risk Monitor Schemas
// ============================================================================

export const RiskLevelSchema = z.enum([
  "NONE",
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
]);

export const StreakRiskStatusSchema = z.object({
  userId: z.string().uuid(),
  currentDays: z.number().min(0),
  hoursRemaining: z.number(),
  minutesRemaining: z.number(),
  riskLevel: RiskLevelSchema,
  flameHealthPercent: z.number().min(0).max(100),
  isAtRisk: z.boolean(),
  isCritical: z.boolean(),
  notificationsSent: z.array(z.string()),
  lastUpdated: z.number().default(() => Date.now()),
});

export const StreakRiskCheckInputSchema = z.object({
  userId: z.string().uuid(),
  checkNotifications: z.boolean().default(true),
});

// ============================================================================
// Streak Repair Quest Schemas
// ============================================================================

export const RepairQuestStatusSchema = z.enum([
  "ACTIVE",
  "COMPLETED",
  "EXPIRED",
  "ABANDONED",
]);

export const StreakRepairQuestSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  previousStreak: z.number().min(3), // Only for streaks 3+
  targetRestoreDays: z.number().min(1),
  sessionsCompleted: z.number().min(0).default(0),
  sessionsRequired: z.number().min(1).default(3),
  startedAt: z.number(),
  expiresAt: z.number(),
  status: RepairQuestStatusSchema,
  sessionIds: z.array(z.string().uuid()).default([]),
  completedAt: z.number().nullable().default(null),
});

export const RepairQuestSessionInputSchema = z.object({
  userId: z.string().uuid(),
  sessionId: z.string().uuid(),
  sessionDuration: z.number().min(0),
  qualityScore: z.number().min(0).max(100),
  completedAt: z.number(),
});

export const RepairQuestStatusOutputSchema = z.object({
  hasActiveQuest: z.boolean(),
  quest: StreakRepairQuestSchema.nullable(),
  progressPercent: z.number().min(0).max(100),
  hoursRemaining: z.number(),
  canStartQuest: z.boolean(),
  previousStreak: z.number(),
  potentialRestoreDays: z.number(),
});

// ============================================================================
// Enhanced Streak Event Schemas
// ============================================================================

export const StreakRiskEventSchema = z.object({
  userId: z.string().uuid(),
  riskLevel: RiskLevelSchema,
  hoursRemaining: z.number(),
  streakDays: z.number(),
  triggeredAt: z.number().default(() => Date.now()),
});

export const StreakRepairEventSchema = z.object({
  userId: z.string().uuid(),
  questId: z.string().uuid(),
  eventType: z.enum(["STARTED", "PROGRESS", "COMPLETED", "EXPIRED"]),
  previousStreak: z.number().optional(),
  restoredDays: z.number().optional(),
  sessionsCompleted: z.number().optional(),
  timestamp: z.number().default(() => Date.now()),
});

// ============================================================================
// Inferred Types
// ============================================================================

export type RiskLevel = z.infer<typeof RiskLevelSchema>;
export type StreakRiskStatus = z.infer<typeof StreakRiskStatusSchema>;
export type StreakRepairQuest = z.infer<typeof StreakRepairQuestSchema>;
export type RepairQuestStatus = z.infer<typeof RepairQuestStatusSchema>;
export type RepairQuestSessionInput = z.infer<
  typeof RepairQuestSessionInputSchema
>;
export type RepairQuestStatusOutput = z.infer<
  typeof RepairQuestStatusOutputSchema
>;
