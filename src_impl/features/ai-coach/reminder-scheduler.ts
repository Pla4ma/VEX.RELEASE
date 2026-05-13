/**
 * Reminder Scheduler
 * Business logic for scheduling reminders, managing comebacks, and difficulty
 *
 * Dependencies:
 * - Repository (data access)
 * - Persona Manager (coach state updates)
 * - Message Generator (message generation)
 * - Schemas (validation)
 */

import * as repository from './repository';
import { ScheduleReminderInputSchema, ActivateComebackInputSchema, AdjustDifficultyInputSchema, type ReminderPlan, type ReminderType, type ComebackPlan, type ComebackStatus, type DifficultyProfile, type MessageCategory, type ScheduleReminderInput, type ActivateComebackInput, type AdjustDifficultyInput } from './schemas';
import { getOrCreateCoachState, updateCoachState } from './persona-manager';
import { generateMessage } from './message-generator';

// ============================================================================
// Constants
// ============================================================================

const MUTE_DURATION_HOURS = 24;
const COMEBACK_BONUS_MULTIPLIER = 2.0;
const COMEBACK_TARGET_SESSIONS = 3;
const COMEBACK_EXPIRY_DAYS = 7;

// ============================================================================
// Reminder Planner
// ============================================================================

function reminderTypeToCategory(reminderType: ReminderType): MessageCategory {
  const mapping: Record<ReminderType, MessageCategory> = {
    STREAK_WARNING: 'STREAK_RISK',
    STREAK_CHECK: 'STREAK_RISK',
    OPTIMAL_SESSION_TIME: 'SESSION_SUGGESTION',
    CHALLENGE_DEADLINE: 'CHALLENGE_PROMPT',
    BOSS_TIMEOUT: 'CHALLENGE_PROMPT',
    COMEBACK_OPPORTUNITY: 'COMEBACK_SUPPORT',
    MILESTONE_APPROACHING: 'MILESTONE_HYPE',
    PERSONALIZED_MOTIVATION: 'MOTIVATION_BOOST',
    BREAK_REMINDER: 'BREAK_SUGGESTION',
  };

  return mapping[reminderType];
}

// ============================================================================
// Comeback Engine
// ============================================================================

function generateComebackMessages(): Array<{ id: string; day: number; content: string; sent: boolean; sentAt: number | null }> {
  const messages = [
    { day: 1, content: 'Welcome back! 💪 Your comeback story starts today. First session gets {{bonusMultiplier}}x XP!' },
    { day: 2, content: "Day 2 of your comeback! 🔥 You're rebuilding stronger than before. Keep it up!" },
    { day: 3, content: "Comeback complete! 🎉 You've earned your full {{bonusMultiplier}}x bonus. Your streak is back on track!" },
  ];

  return messages.map((m) => ({
    id: crypto.randomUUID(),
    day: m.day,
    content: m.content,
    sent: false,
    sentAt: null,
  }));
}

// ============================================================================
// Adaptive Difficulty
// ============================================================================
// Export constants for use in other modules
export { COMEBACK_BONUS_MULTIPLIER, COMEBACK_TARGET_SESSIONS, MUTE_DURATION_HOURS };
export * from "./reminder-scheduler.part1";
