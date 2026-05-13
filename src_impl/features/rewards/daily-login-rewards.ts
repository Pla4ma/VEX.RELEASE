/**
 * Daily Login Rewards System
 * Progressive D1-D7 ladder with escalating rewards
 * Break streak = reset to Day 1 (creates urgency)
 * Core retention mechanic for 10/10 product
 */

import { eventBus } from '../../events';
import * as Sentry from '@sentry/react-native';
import { z } from 'zod';

// ============================================================================
// Schemas
// ============================================================================
// ============================================================================
// Reward Configuration
// ============================================================================

const REWARD_LADDER: Array<{
  day: number;
  tier: string;
  freeRewards: Array<{ type: string; amount: number }>;
  premiumRewards: Array<{ type: string; amount: number }>;
  bonusDescription: string;
}> = [
  {
    day: 1,
    tier: 'DAY_1',
    freeRewards: [{ type: 'COINS', amount: 100 }],
    premiumRewards: [
      { type: 'COINS', amount: 200 },
      { type: 'GEMS', amount: 5 },
    ],
    bonusDescription: 'Welcome back!',
  },
  {
    day: 2,
    tier: 'DAY_2',
    freeRewards: [{ type: 'COINS', amount: 200 }],
    premiumRewards: [
      { type: 'COINS', amount: 400 },
      { type: 'GEMS', amount: 10 },
    ],
    bonusDescription: 'Building momentum!',
  },
  {
    day: 3,
    tier: 'DAY_3',
    freeRewards: [
      { type: 'COINS', amount: 300 },
      { type: 'STREAK_SHIELD', amount: 1 },
    ],
    premiumRewards: [
      { type: 'COINS', amount: 600 },
      { type: 'GEMS', amount: 15 },
      { type: 'STREAK_SHIELD', amount: 2 },
    ],
    bonusDescription: 'Halfway to weekly bonus!',
  },
  {
    day: 4,
    tier: 'DAY_4',
    freeRewards: [{ type: 'COINS', amount: 400 }],
    premiumRewards: [
      { type: 'COINS', amount: 800 },
      { type: 'GEMS', amount: 20 },
    ],
    bonusDescription: 'So close!',
  },
  {
    day: 5,
    tier: 'DAY_5',
    freeRewards: [
      { type: 'COINS', amount: 500 },
      { type: 'CHEST', amount: 1 },
    ],
    premiumRewards: [
      { type: 'COINS', amount: 1000 },
      { type: 'GEMS', amount: 25 },
      { type: 'CHEST', amount: 2 },
    ],
    bonusDescription: 'Weekend warrior bonus!',
  },
  {
    day: 6,
    tier: 'DAY_6',
    freeRewards: [{ type: 'COINS', amount: 600 }],
    premiumRewards: [
      { type: 'COINS', amount: 1200 },
      { type: 'GEMS', amount: 30 },
    ],
    bonusDescription: 'One more day!',
  },
  {
    day: 7,
    tier: 'DAY_7',
    freeRewards: [
      { type: 'COINS', amount: 1000 },
      { type: 'GEMS', amount: 50 },
      { type: 'CHEST', amount: 1 },
    ],
    premiumRewards: [
      { type: 'COINS', amount: 2000 },
      { type: 'GEMS', amount: 100 },
      { type: 'CHEST', amount: 3 },
      { type: 'ITEM', amount: 1 },
    ],
    bonusDescription: '🎉 WEEKLY BONUS UNLOCKED!',
  },
];

const STREAK_WINDOW_MS = 48 * 60 * 60 * 1000; // 48 hours to claim before streak resets
const CLAIM_WINDOW_MS = 24 * 60 * 60 * 1000; // Must claim within 24 hours of it becoming available

// ============================================================================
// Types
// ============================================================================
// ============================================================================
// Reward State Management
// ============================================================================
// ============================================================================
// Claim Logic
// ============================================================================
// ============================================================================
// UI Helpers
// ============================================================================
// ============================================================================
// Background Job: Streak Reset Check
// ============================================================================
export * from "./daily-login-rewards.types";
export * from "./daily-login-rewards.part1";
export * from "./daily-login-rewards.part2";
