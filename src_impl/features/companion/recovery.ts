/**
 * Emotional Recovery System
 *
 * When the user fails, the companion responds with understanding, not punishment.
 * This creates trust and encourages return instead of guilt-driven avoidance.
 *
 * Recovery mechanics:
 * - Streak break: companion says "I'm still here" not "funeral"
 * - Absence return: companion expresses genuine joy
 * - Session failure: companion focuses on what went well
 * - Burnout detection: suggests rest, not more work
 */

import { eventBus } from '../../events';

// ── Types ────────────────────────────────────────────────────────────────────

export type RecoveryScenario =
  | 'STREAK_BROKEN'
  | 'RETURN_AFTER_ABSENCE'
  | 'SESSION_FAILED'
  | 'SESSION_ABANDONED'
  | 'LOW_QUALITY_SESSION'
  | 'BURNOUT_DETECTED'
  | 'FIRST_SESSION_EVER';

export interface RecoveryResponse {
  scenario: RecoveryScenario;
  companionMessage: string;
  emotionalTone: 'warm' | 'encouraging' | 'gentle' | 'celebrating' | 'understanding';
  actionSuggestion: string | null;
  bonusApplied: RecoveryBonus | null;
}

export interface RecoveryBonus {
  type: 'XP_MULTIPLIER' | 'COIN_BONUS' | 'BOND_BOOST';
  value: number;
  duration: string;
}

// ── Recovery Messages ────────────────────────────────────────────────────────

const RECOVERY_MESSAGES: Record<RecoveryScenario, string[]> = {
  STREAK_BROKEN: [
    "I'm still here. That streak was impressive — and you can build another.",
    "Streaks end. The person who built it doesn't. Let's start again.",
    "I noticed the streak ended. I'm not going anywhere. Ready when you are.",
    "You showed up before. You'll show up again. I believe that.",
  ],
  RETURN_AFTER_ABSENCE: [
    "I missed you. Let's pick up where we left off.",
    "Welcome back. I was hoping you'd return.",
    "It's good to see you again. I've been waiting.",
    "You came back. That's what matters. Let's focus together.",
  ],
  SESSION_FAILED: [
    "That session didn't go as planned. But you started it — that takes courage.",
    "Not every session is perfect. But every session counts.",
    "I saw you try. That's more than most people do.",
    "Let's look at what went well, not just what didn't.",
  ],
  SESSION_ABANDONED: [
    "Sometimes you need to stop. That's okay. I'll be here next time.",
    "You made a choice to step back. That's self-awareness, not failure.",
    "I understand. Rest is part of the process.",
  ],
  LOW_QUALITY_SESSION: [
    "The quality wasn't there today. But you showed up. That's the foundation.",
    "Some days are harder than others. You did your best with what you had.",
    "I noticed it was a tough session. You're building resilience right now.",
  ],
  BURNOUT_DETECTED: [
    "I've noticed you're pushing hard. Maybe today is a rest day?",
    "Your focus has been declining. That's your mind asking for a break.",
    "Taking a day off isn't quitting. It's recharging. I'll be here when you're ready.",
  ],
  FIRST_SESSION_EVER: [
    "Welcome! I'm so glad you're here. Let's start this journey together.",
    "Your first session. I'll remember this. Let's make it count.",
    "I've been waiting for you. Let's focus together.",
  ],
};

// ── Recovery Engine ──────────────────────────────────────────────────────────
// ── Helpers ──────────────────────────────────────────────────────────────────

function getTone(scenario: RecoveryScenario): RecoveryResponse['emotionalTone'] {
  switch (scenario) {
    case 'STREAK_BROKEN': return 'understanding';
    case 'RETURN_AFTER_ABSENCE': return 'celebrating';
    case 'SESSION_FAILED': return 'encouraging';
    case 'SESSION_ABANDONED': return 'gentle';
    case 'LOW_QUALITY_SESSION': return 'warm';
    case 'BURNOUT_DETECTED': return 'gentle';
    case 'FIRST_SESSION_EVER': return 'celebrating';
  }
}

function getActionSuggestion(
  scenario: RecoveryScenario,
  context?: { daysAbsent?: number; sessionMinutes?: number },
): string | null {
  switch (scenario) {
    case 'STREAK_BROKEN':
      return "Try a 10-minute Sprint session — quick win to rebuild momentum.";
    case 'RETURN_AFTER_ABSENCE':
      if (context?.daysAbsent && context.daysAbsent >= 7) {
        return "Start with a short session. I'll give you a comeback bonus.";
      }
      return "Let's do a 15-minute Focus session. No pressure.";
    case 'BURNOUT_DETECTED':
      return "Take today off. Come back tomorrow refreshed. I'll be here.";
    case 'FIRST_SESSION_EVER':
      return "Try a 5-minute Starter session. Just to get comfortable.";
    default:
      return null;
  }
}

function getRecoveryBonus(
  scenario: RecoveryScenario,
  context?: { daysAbsent?: number; streakBefore?: number },
): RecoveryBonus | null {
  switch (scenario) {
    case 'RETURN_AFTER_ABSENCE': {
      const days = context?.daysAbsent ?? 3;
      const multiplier = days >= 30 ? 3.0 : days >= 7 ? 2.0 : 1.5;
      return { type: 'XP_MULTIPLIER', value: multiplier, duration: '3 sessions' };
    }
    case 'STREAK_BROKEN':
      return { type: 'BOND_BOOST', value: 5, duration: 'immediate' };
    case 'FIRST_SESSION_EVER':
      return { type: 'XP_MULTIPLIER', value: 2.0, duration: 'first session' };
    default:
      return null;
  }
}

// ── Event Integration ────────────────────────────────────────────────────────
export * from "./recovery.part1";
