/**
 * Challenge Bank Expansion
 *
 * Phase 11.2 — 50+ new challenge templates across all types
 * Personal challenges that feel tailored to the user
 */

import type { ChallengeDifficulty } from './schemas';

// Challenge bank expansion - no external type dependencies

// Extended challenge template for challenge bank entries
// ============================================================================
// Personal Challenge Templates (Feel tailored to user)
// ============================================================================

const PERSONAL_CHALLENGES: ChallengeBankTemplate[] = [
  // Morning Focus Challenges
  {
    id: 'challenge-morning-early-bird',
    name: 'Early Bird',
    description: 'Complete {{target}} focus sessions between 6:00 AM and 10:00 AM',
    type: 'SESSION_COUNT',
    difficulty: 'EASY',
    target: 3,
    timeLimit: 24 * 60 * 60 * 1000, // 24 hours
    rewardType: 'COINS',
    rewardAmount: 50,
    tags: ['morning', 'routine', 'productivity'],
    seasonal: false,
  },
  {
    id: 'challenge-morning-power-hour',
    name: 'Power Hour Master',
    description: 'Focus for {{target}} minutes during morning hours (6-10 AM)',
    type: 'FOCUS_TIME',
    difficulty: 'NORMAL',
    target: 60,
    timeLimit: 24 * 60 * 60 * 1000,
    rewardType: 'COINS',
    rewardAmount: 75,
    tags: ['morning', 'focus', 'deep-work'],
    seasonal: false,
  },
  {
    id: 'challenge-morning-streak',
    name: 'Morning Streak Builder',
    description: 'Complete a session before 9 AM for {{target}} consecutive days',
    type: 'STREAK',
    difficulty: 'NORMAL',
    target: 3,
    timeLimit: 7 * 24 * 60 * 60 * 1000, // 7 days
    rewardType: 'COINS',
    rewardAmount: 100,
    tags: ['morning', 'habit', 'consistency'],
    seasonal: false,
  },

  // Personal Record Challenges
  {
    id: 'challenge-beat-daily-record',
    name: 'Personal Best Pursuer',
    description: 'Beat your daily focus record of {{comparison}} minutes by completing {{target}} minutes today',
    type: 'FOCUS_TIME',
    difficulty: 'CHALLENGING',
    target: 180,
    timeLimit: 24 * 60 * 60 * 1000,
    rewardType: 'COINS',
    rewardAmount: 150,
    tags: ['personal-best', 'record', 'achievement'],
    seasonal: false,
  },
  {
    id: 'challenge-session-duration-record',
    name: 'Endurance Test',
    description: 'Complete a single session longer than your personal best ({{comparison}}+ minutes)',
    type: 'FOCUS_TIME',
    difficulty: 'CHALLENGING',
    target: 60,
    timeLimit: 24 * 60 * 60 * 1000,
    rewardType: 'COINS',
    rewardAmount: 125,
    tags: ['endurance', 'personal-best', 'focus'],
    seasonal: false,
  },

  // Social Challenges
  {
    id: 'challenge-squad-sync',
    name: 'Squad Sync',
    description: 'Complete a session at the same time as a squad member',
    type: 'SOCIAL',
    difficulty: 'EASY',
    target: 1,
    timeLimit: 7 * 24 * 60 * 60 * 1000,
    rewardType: 'COINS',
    rewardAmount: 75,
    tags: ['squad', 'social', 'together'],
    seasonal: false,
  },
  {
    id: 'challenge-squad-warrior',
    name: 'Squad War Contributor',
    description: 'Contribute {{target}} focus minutes to your squad during an active war',
    type: 'FOCUS_TIME',
    difficulty: 'NORMAL',
    target: 120,
    timeLimit: 7 * 24 * 60 * 60 * 1000,
    rewardType: 'COINS',
    rewardAmount: 150,
    tags: ['squad-war', 'team', 'competitive'],
    seasonal: false,
  },
  {
    id: 'challenge-recruit-friend',
    name: 'Focus Ambassador',
    description: 'Recruit a friend to complete their first session',
    type: 'SOCIAL',
    difficulty: 'NORMAL',
    target: 1,
    timeLimit: 30 * 24 * 60 * 60 * 1000, // 30 days
    rewardType: 'COINS',
    rewardAmount: 200,
    tags: ['recruit', 'social', 'growth'],
    seasonal: false,
  },

  // Boss Damage Challenges
  {
    id: 'challenge-boss-berserker',
    name: 'Boss Berserker',
    description: 'Deal {{target}} damage to any boss in a single session',
    type: 'BOSS_DAMAGE',
    difficulty: 'CHALLENGING',
    target: 500,
    timeLimit: 24 * 60 * 60 * 1000,
    rewardType: 'COINS',
    rewardAmount: 125,
    tags: ['boss', 'damage', 'combat'],
    seasonal: false,
  },
  {
    id: 'challenge-multi-boss',
    name: 'Boss Slayer',
    description: 'Defeat {{target}} different bosses this week',
    type: 'BOSS_DAMAGE',
    difficulty: 'PUSH',
    target: 3,
    timeLimit: 7 * 24 * 60 * 60 * 1000,
    rewardType: 'COINS',
    rewardAmount: 250,
    tags: ['boss', 'multiple', 'weekly'],
    seasonal: false,
  },

  // Quality Challenges
  {
    id: 'challenge-s-grade',
    name: 'Perfectionist',
    description: 'Complete {{target}} S-grade (95+ quality) sessions',
    type: 'SESSION_COUNT',
    difficulty: 'CHALLENGING',
    target: 2,
    timeLimit: 7 * 24 * 60 * 60 * 1000,
    rewardType: 'COINS',
    rewardAmount: 150,
    tags: ['quality', 's-grade', 'excellence'],
    seasonal: false,
  },
  {
    id: 'challenge-a-grade-streak',
    name: 'Quality Streak',
    description: 'Complete {{target}} consecutive A-grade or better sessions',
    type: 'STREAK',
    difficulty: 'NORMAL',
    target: 5,
    timeLimit: 7 * 24 * 60 * 60 * 1000,
    rewardType: 'COINS',
    rewardAmount: 100,
    tags: ['quality', 'streak', 'consistency'],
    seasonal: false,
  },

  // Evening/Night Challenges
  {
    id: 'challenge-evening-wind-down',
    name: 'Evening Wind-Down',
    description: 'Complete {{target}} sessions between 6 PM and 10 PM',
    type: 'SESSION_COUNT',
    difficulty: 'EASY',
    target: 2,
    timeLimit: 24 * 60 * 60 * 1000,
    rewardType: 'COINS',
    rewardAmount: 50,
    tags: ['evening', 'routine', 'wind-down'],
    seasonal: false,
  },
  {
    id: 'challenge-night-owl',
    name: 'Night Owl',
    description: 'Focus for {{target}} minutes after 10 PM',
    type: 'FOCUS_TIME',
    difficulty: 'NORMAL',
    target: 45,
    timeLimit: 24 * 60 * 60 * 1000,
    rewardType: 'COINS',
    rewardAmount: 75,
    tags: ['night', 'late', 'owl'],
    seasonal: false,
  },

  // Weekend Challenges
  {
    id: 'challenge-weekend-warrior',
    name: 'Weekend Warrior',
    description: 'Complete {{target}} sessions on Saturday and Sunday combined',
    type: 'SESSION_COUNT',
    difficulty: 'NORMAL',
    target: 4,
    timeLimit: 2 * 24 * 60 * 60 * 1000, // Weekend
    rewardType: 'COINS',
    rewardAmount: 100,
    tags: ['weekend', 'warrior', 'off-day'],
    seasonal: false,
  },
  {
    id: 'challenge-sunday-prep',
    name: 'Sunday Prep',
    description: 'Focus for {{target}} minutes on Sunday to prepare for the week',
    type: 'FOCUS_TIME',
    difficulty: 'EASY',
    target: 60,
    timeLimit: 24 * 60 * 60 * 1000,
    rewardType: 'COINS',
    rewardAmount: 75,
    tags: ['sunday', 'prep', 'planning'],
    seasonal: false,
  },
];

// ============================================================================
// Volume Challenges (Raw numbers)
// ============================================================================

const VOLUME_CHALLENGES: ChallengeBankTemplate[] = [
  // Focus Time Challenges
  {
    id: 'challenge-focus-30',
    name: 'Half Hour Hero',
    description: 'Focus for {{target}} minutes total',
    type: 'FOCUS_TIME',
    difficulty: 'EASY',
    target: 30,
    timeLimit: 24 * 60 * 60 * 1000,
    rewardType: 'COINS',
    rewardAmount: 25,
    tags: ['volume', 'quick-win'],
    seasonal: false,
  },
  {
    id: 'challenge-focus-120',
    name: 'Double Hour',
    description: 'Focus for {{target}} minutes total today',
    type: 'FOCUS_TIME',
    difficulty: 'NORMAL',
    target: 120,
    timeLimit: 24 * 60 * 60 * 1000,
    rewardType: 'COINS',
    rewardAmount: 75,
    tags: ['volume', 'daily'],
    seasonal: false,
  },
  {
    id: 'challenge-focus-240',
    name: 'Four Hour Focus',
    description: 'Focus for {{target}} minutes total today',
    type: 'FOCUS_TIME',
    difficulty: 'CHALLENGING',
    target: 240,
    timeLimit: 24 * 60 * 60 * 1000,
    rewardType: 'COINS',
    rewardAmount: 150,
    tags: ['volume', 'heavy', 'intense'],
    seasonal: false,
  },
  {
    id: 'challenge-focus-480-week',
    name: '8-Hour Week',
    description: 'Focus for {{target}} minutes total this week',
    type: 'FOCUS_TIME',
    difficulty: 'CHALLENGING',
    target: 480,
    timeLimit: 7 * 24 * 60 * 60 * 1000,
    rewardType: 'COINS',
    rewardAmount: 200,
    tags: ['volume', 'weekly', 'consistent'],
    seasonal: false,
  },

  // Session Count Challenges
  {
    id: 'challenge-sessions-3',
    name: 'Triple Threat',
    description: 'Complete {{target}} focus sessions today',
    type: 'SESSION_COUNT',
    difficulty: 'EASY',
    target: 3,
    timeLimit: 24 * 60 * 60 * 1000,
    rewardType: 'COINS',
    rewardAmount: 40,
    tags: ['count', 'daily', 'quick'],
    seasonal: false,
  },
  {
    id: 'challenge-sessions-5',
    name: 'High Five',
    description: 'Complete {{target}} focus sessions today',
    type: 'SESSION_COUNT',
    difficulty: 'NORMAL',
    target: 5,
    timeLimit: 24 * 60 * 60 * 1000,
    rewardType: 'COINS',
    rewardAmount: 75,
    tags: ['count', 'daily', 'intense'],
    seasonal: false,
  },
  {
    id: 'challenge-sessions-10',
    name: 'Decade of Focus',
    description: 'Complete {{target}} focus sessions today',
    type: 'SESSION_COUNT',
    difficulty: 'PUSH',
    target: 10,
    timeLimit: 24 * 60 * 60 * 1000,
    rewardType: 'COINS',
    rewardAmount: 200,
    tags: ['count', 'daily', 'extreme'],
    seasonal: false,
  },
  {
    id: 'challenge-sessions-20-week',
    name: 'Session Machine',
    description: 'Complete {{target}} sessions this week',
    type: 'SESSION_COUNT',
    difficulty: 'CHALLENGING',
    target: 20,
    timeLimit: 7 * 24 * 60 * 60 * 1000,
    rewardType: 'COINS',
    rewardAmount: 175,
    tags: ['count', 'weekly', 'consistent'],
    seasonal: false,
  },
];

// ============================================================================
// Streak Challenges
// ============================================================================

const STREAK_CHALLENGES: ChallengeBankTemplate[] = [
  {
    id: 'challenge-streak-3',
    name: "Three's Company",
    description: 'Maintain a {{target}}-day streak',
    type: 'STREAK',
    difficulty: 'EASY',
    target: 3,
    timeLimit: 7 * 24 * 60 * 60 * 1000,
    rewardType: 'COINS',
    rewardAmount: 50,
    tags: ['streak', 'consistency', 'beginner'],
    seasonal: false,
  },
  {
    id: 'challenge-streak-7',
    name: 'Week Warrior',
    description: 'Maintain a {{target}}-day streak',
    type: 'STREAK',
    difficulty: 'NORMAL',
    target: 7,
    timeLimit: 14 * 24 * 60 * 60 * 1000,
    rewardType: 'COINS',
    rewardAmount: 100,
    tags: ['streak', 'week', 'consistent'],
    seasonal: false,
  },
  {
    id: 'challenge-streak-14',
    name: 'Fortnight Focus',
    description: 'Maintain a {{target}}-day streak',
    type: 'STREAK',
    difficulty: 'CHALLENGING',
    target: 14,
    timeLimit: 21 * 24 * 60 * 60 * 1000,
    rewardType: 'COINS',
    rewardAmount: 200,
    tags: ['streak', 'two-weeks', 'dedicated'],
    seasonal: false,
  },
  {
    id: 'challenge-streak-30',
    name: 'Monthly Master',
    description: 'Maintain a {{target}}-day streak',
    type: 'STREAK',
    difficulty: 'PUSH',
    target: 30,
    timeLimit: 45 * 24 * 60 * 60 * 1000,
    rewardType: 'COINS',
    rewardAmount: 500,
    tags: ['streak', 'month', 'elite'],
    seasonal: false,
  },
  {
    id: 'challenge-perfect-week',
    name: 'Perfect Week',
    description: 'Complete at least one session every day for {{target}} days',
    type: 'STREAK',
    difficulty: 'NORMAL',
    target: 7,
    timeLimit: 10 * 24 * 60 * 60 * 1000,
    rewardType: 'COINS',
    rewardAmount: 125,
    tags: ['streak', 'perfect', 'daily'],
    seasonal: false,
  },
];

// ============================================================================
// Seasonal Challenges
// ============================================================================

const SEASONAL_CHALLENGES: ChallengeBankTemplate[] = [
  // New Year (January)
  {
    id: 'challenge-new-year-resolution',
    name: 'Resolution Starter',
    description: 'Complete {{target}} sessions in the first week of January',
    type: 'SESSION_COUNT',
    difficulty: 'NORMAL',
    target: 7,
    timeLimit: 7 * 24 * 60 * 60 * 1000,
    rewardType: 'COINS',
    rewardAmount: 150,
    tags: ['new-year', 'january', 'resolution'],
    seasonal: true,
    seasonWindow: { startMonth: 0, endMonth: 0 }, // January only
  },

  // Valentine's Day (February)
  {
    id: 'challenge-focus-buddy',
    name: 'Focus Buddy',
    description: 'Complete {{target}} sessions with a friend this February',
    type: 'SOCIAL',
    difficulty: 'NORMAL',
    target: 5,
    timeLimit: 28 * 24 * 60 * 60 * 1000,
    rewardType: 'COINS',
    rewardAmount: 125,
    tags: ['february', 'social', 'valentine'],
    seasonal: true,
    seasonWindow: { startMonth: 1, endMonth: 1 },
  },

  // Spring (March-May)
  {
    id: 'challenge-spring-cleaning',
    name: 'Mental Spring Cleaning',
    description: 'Clear your mind with {{target}} hours of focus this spring',
    type: 'FOCUS_TIME',
    difficulty: 'NORMAL',
    target: 600,
    timeLimit: 30 * 24 * 60 * 60 * 1000,
    rewardType: 'COINS',
    rewardAmount: 200,
    tags: ['spring', 'cleaning', 'renewal'],
    seasonal: true,
    seasonWindow: { startMonth: 2, endMonth: 4 },
  },

  // Summer (June-August)
  {
    id: 'challenge-summer-heat',
    name: 'Summer Heat',
    description: 'Stay focused despite the heat: {{target}} sessions in July',
    type: 'SESSION_COUNT',
    difficulty: 'CHALLENGING',
    target: 20,
    timeLimit: 31 * 24 * 60 * 60 * 1000,
    rewardType: 'COINS',
    rewardAmount: 250,
    tags: ['summer', 'july', 'heat'],
    seasonal: true,
    seasonWindow: { startMonth: 6, endMonth: 6 },
  },

  // Fall/Back to School (September)
  {
    id: 'challenge-back-to-routine',
    name: 'Back to Routine',
    description: 'Establish your fall routine: {{target}} consecutive days',
    type: 'STREAK',
    difficulty: 'NORMAL',
    target: 14,
    timeLimit: 21 * 24 * 60 * 60 * 1000,
    rewardType: 'COINS',
    rewardAmount: 175,
    tags: ['fall', 'september', 'routine', 'school'],
    seasonal: true,
    seasonWindow: { startMonth: 8, endMonth: 9 },
  },

  // Holiday/December
  {
    id: 'challenge-holiday-hustle',
    name: 'Holiday Hustle',
    description: 'Stay productive during the holidays: {{target}} minutes in December',
    type: 'FOCUS_TIME',
    difficulty: 'CHALLENGING',
    target: 1000,
    timeLimit: 31 * 24 * 60 * 60 * 1000,
    rewardType: 'COINS',
    rewardAmount: 300,
    tags: ['december', 'holiday', 'end-of-year'],
    seasonal: true,
    seasonWindow: { startMonth: 11, endMonth: 11 },
  },
];

// ============================================================================
// Combine All Challenges
// ============================================================================
// Total count verification
// ============================================================================
// Helper Functions
// ============================================================================
// ============================================================================
// Exports
// ============================================================================

export { PERSONAL_CHALLENGES, VOLUME_CHALLENGES, STREAK_CHALLENGES, SEASONAL_CHALLENGES };

export type { ChallengeBankTemplate };
export * from "./challenge-bank-expansion.types";
export * from "./challenge-bank-expansion.part1";
