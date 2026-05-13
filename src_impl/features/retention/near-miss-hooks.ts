/**
 * Near Miss Psychology Hooks
 * Interventions at critical abandonment moments
 * Uses psychological triggers to retain users
 */

import { eventBus } from '../../events';
import * as Sentry from '@sentry/react-native';
import { z } from 'zod';

// ============================================================================
// Schemas
// ============================================================================
// ============================================================================
// Intervention Templates
// ============================================================================

const INTERVENTION_TEMPLATES: Record<
  string,
  Array<{
    headline: string;
    body: string;
    primaryAction: string;
    incentive?: { type: string; amount: number };
    urgency: string;
  }>
> = {
  SESSION_ABANDON_80_PERCENT: [
    {
      headline: 'So close! 🎯',
      body: "You're at 80% completion. Finish now for a 2x XP Comeback Bonus!",
      primaryAction: 'Complete Session',
      incentive: { type: 'XP_BONUS', amount: 2.0 },
      urgency: 'HIGH',
    },
    {
      headline: "Don't let it slip! 💪",
      body: 'Only a few minutes left. Your streak thanks you for finishing!',
      primaryAction: 'Push Through',
      urgency: 'MEDIUM',
    },
  ],
  STREAK_ABOUT_TO_BREAK: [
    {
      headline: '🚨 STREAK EMERGENCY!',
      body: 'Your streak expires in 30 minutes! Start a 5-minute Sprint Save now!',
      primaryAction: 'Sprint Save (5 min)',
      incentive: { type: 'STREAK_SAVE', amount: 1 },
      urgency: 'CRITICAL',
    },
    {
      headline: 'Your streak needs you! 🔥',
      body: 'Hours left to save your streak. One quick session is all it takes!',
      primaryAction: 'Quick Session',
      urgency: 'HIGH',
    },
  ],
  APP_BACKGROUND_LONG: [
    {
      headline: 'Missed you! 👋',
      body: "You left mid-session. Come back and we'll add +50% XP as a welcome back bonus!",
      primaryAction: 'Resume Session',
      incentive: { type: 'XP_BONUS', amount: 1.5 },
      urgency: 'MEDIUM',
    },
  ],
  CHALLENGE_ABANDON: [
    {
      headline: 'Challenge slipping away! 🏃',
      body: "You're so close to completing your challenge. Finish it now for bonus gems!",
      primaryAction: 'Complete Challenge',
      incentive: { type: 'GEM_BONUS', amount: 10 },
      urgency: 'HIGH',
    },
  ],
  BOSS_FLEE_WARNING: [
    {
      headline: 'Boss is escaping! 👹',
      body: 'The boss flees in 2 hours! One more hit defeats it. +25 gems if you win!',
      primaryAction: 'Defeat Boss',
      incentive: { type: 'GEM_BONUS', amount: 25 },
      urgency: 'CRITICAL',
    },
  ],
  DAILY_REWARD_MISSED: [
    {
      headline: 'Comeback Bonus! 🎁',
      body: "You missed a day, but we're giving you 2x rewards today to catch up!",
      primaryAction: 'Claim 2x Reward',
      incentive: { type: 'COMEBACK_BOOST', amount: 2.0 },
      urgency: 'MEDIUM',
    },
  ],
};

// ============================================================================
// Types
// ============================================================================
// ============================================================================
// Trigger Detection
// ============================================================================
// ============================================================================
// Intervention Generation
// ============================================================================

function personalizeMessage(
  template: string,
  personalization: {
    userName?: string;
    streakDays?: number;
    sessionCount?: number;
  },
): string {
  let message = template;

  if (personalization.userName) {
    message = message.replace('{{name}}', personalization.userName);
  }

  if (personalization.streakDays) {
    message = message.replace('{{streak}}', personalization.streakDays.toString());
  }

  if (personalization.sessionCount) {
    message = message.replace('{{sessions}}', personalization.sessionCount.toString());
  }

  return message;
}

// ============================================================================
// Intervention Actions
// ============================================================================
// ============================================================================
// Session Abandonment Prevention (80% Rule)
// ============================================================================
// ============================================================================
// Streak Emergency (Last 30 Minutes)
// ============================================================================
// ============================================================================
// Background Return Bonus
// ============================================================================
// ============================================================================
// Analytics & Effectiveness
// ============================================================================
// ============================================================================
// Batch Processing (for cron jobs)
// ============================================================================
export * from "./near-miss-hooks.types";
export * from "./near-miss-hooks.part1";
export * from "./near-miss-hooks.part2";
