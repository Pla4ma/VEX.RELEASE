/**
 * Comeback Quest Configuration
 *
 * Quest parameters and reward definitions.
 */

export const COMEBACK_QUEST_CONFIG = {
  minDaysAbsent: 3, // Must be absent 3+ days to trigger
  quest1: {
    name: 'First Step',
    description: 'Welcome back! Complete any session to begin your comeback.',
    duration: 15, // minutes
    grade: undefined, // any grade
  },
  quest2: {
    name: 'Getting Back Into It',
    description: 'You\'re finding your rhythm. Complete a 30-minute session with an A grade or better.',
    duration: 30,
    grade: 'A',
  },
  quest3: {
    name: 'Full Comeback',
    description: 'You\'re back! Complete a 45-minute session at A grade.',
    duration: 45,
    grade: 'A',
  },
  rewards: {
    streakRestored: 1, // Fresh start at day 1
    coins: 250,
    xpBonus: 100,
    phoenixBadge: 'Phoenix Rising', // Cosmetic badge name
  },
} as const;
