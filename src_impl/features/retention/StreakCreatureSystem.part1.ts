import { z } from "zod";
import { featureFlags } from "../../feature-flags/FeatureFlagEngine";
import { eventBus } from "../../events";


export const CREATURE_CONFIG = {
  // Evolution stages
  EVOLUTION_STAGES: {
    EGG: {
      name: 'Focus Egg',
      minStreak: 0,
      maxStreak: 2,
      description: 'A mysterious egg that hatches with consistent focus',
      abilities: ['potential'],
      personality: ['mysterious'],
      emoji: '🥚',
      color: '#E8F4FD',
    },
    BABY: {
      name: 'Focus Sprout',
      minStreak: 3,
      maxStreak: 7,
      description: 'A curious young creature learning to focus',
      abilities: ['encouragement'],
      personality: ['playful', 'curious'],
      emoji: '🌱',
      color: '#C8E6C9',
    },
    TEEN: {
      name: 'Focus Companion',
      minStreak: 8,
      maxStreak: 14,
      description: 'An energetic companion that loves challenges',
      abilities: ['motivation_boost', 'focus_aid'],
      personality: ['energetic', 'loyal'],
      emoji: '🦊',
      color: '#FFE0B2',
    },
    ADULT: {
      name: 'Focus Guardian',
      minStreak: 15,
      maxStreak: 29,
      description: 'A wise guardian that protects your focus',
      abilities: ['streak_protection', 'deep_focus', 'wisdom'],
      personality: ['wise', 'protective', 'calm'],
      emoji: '🦉',
      color: '#E1BEE7',
    },
    EPIC: {
      name: 'Focus Master',
      minStreak: 30,
      maxStreak: 999,
      description: 'A legendary master of focus and discipline',
      abilities: ['time_bending', 'perfect_clarity', 'enlightenment'],
      personality: ['legendary', 'enlightened', 'transcendent'],
      emoji: '🐉',
      color: '#FFD700',
    },
  },

  // Personality traits (determined by session patterns)
  PERSONALITY_TRAITS: {
    // Morning person
    EARLY_BIRD: {
      name: 'Early Bird',
      description: 'Loves morning sessions',
      trigger: 'morning_sessions',
      emoji: '🌅',
    },
    // Night owl
    NIGHT_OWL: {
      name: 'Night Owl',
      description: 'Thrives in evening sessions',
      trigger: 'evening_sessions',
      emoji: '🌙',
    },
    // Consistent
    STEADY: {
      name: 'Steady',
      description: 'Very consistent session times',
      trigger: 'consistent_timing',
      emoji: '⏰',
    },
    // Intense
    INTENSE: {
      name: 'Intense',
      description: 'Prefers long, deep sessions',
      trigger: 'long_sessions',
      emoji: '🔥',
    },
    // Social
    SOCIAL: {
      name: 'Social',
      description: 'Enjoys squad sessions',
      trigger: 'squad_sessions',
      emoji: '👥',
    },
    // Explorer
    EXPLORER: {
      name: 'Explorer',
      description: 'Loves trying different modes',
      trigger: 'variety_seeker',
      emoji: '🧭',
    },
  },

  // Care mechanics
  CARE_ACTIONS: {
    FEED: {
      name: 'Feed',
      description: 'Give your creature focus energy',
      cost: { focusPoints: 10 },
      effect: 'happiness +20',
      cooldown: 4 * 60 * 60 * 1000, // 4 hours
    },
    PLAY: {
      name: 'Play',
      description: 'Play with your creature',
      cost: { coins: 25 },
      effect: 'bond +15',
      cooldown: 6 * 60 * 60 * 1000, // 6 hours
    },
    TRAIN: {
      name: 'Train',
      description: "Train your creature's abilities",
      cost: { gems: 5 },
      effect: 'experience +30',
      cooldown: 8 * 60 * 60 * 1000, // 8 hours
    },
    GROOM: {
      name: 'Groom',
      description: 'Keep your creature healthy',
      cost: { coins: 10 },
      effect: 'health +25',
      cooldown: 12 * 60 * 60 * 1000, // 12 hours
    },
  },

  // Stats
  MAX_HAPPINESS: 100,
  MAX_HEALTH: 100,
  MAX_BOND: 100,
  MAX_EXPERIENCE: 1000,

  // Evolution requirements
  EVOLUTION_REQUIREMENTS: {
    BABY: { streak: 3, totalSessions: 5, avgPurity: 70 },
    TEEN: { streak: 8, totalSessions: 15, avgPurity: 75 },
    ADULT: { streak: 15, totalSessions: 35, avgPurity: 80 },
    EPIC: { streak: 30, totalSessions: 75, avgPurity: 85 },
  },
} as const;

export const CreatureStageSchema = z.enum(['EGG', 'BABY', 'TEEN', 'ADULT', 'EPIC']);

export const PersonalityTraitSchema = z.enum(['EARLY_BIRD', 'NIGHT_OWL', 'STEADY', 'INTENSE', 'SOCIAL', 'EXPLORER']);

export const StreakCreatureSchema = z.object({
  id: z.string(),
  userId: z.string(),

  // Basic info
  name: z.string(),
  nickname: z.string().optional(),
  stage: CreatureStageSchema,
  level: z.number().default(1),
  experience: z.number().default(0),

  // Evolution progress
  evolutionProgress: z.number().default(0), // 0-100
  currentStreak: z.number().default(0),
  bestStreak: z.number().default(0),
  totalSessions: z.number().default(0),

  // Stats
  happiness: z.number().default(50),
  health: z.number().default(100),
  bond: z.number().default(0),

  // Personality
  primaryTrait: PersonalityTraitSchema.nullable().default(null),
  secondaryTrait: PersonalityTraitSchema.nullable().default(null),

  // Abilities
  abilities: z.array(z.string()).default([]),
  unlockedAbilities: z.array(z.string()).default([]),

  // Care tracking
  lastFedAt: z.number().nullable().default(null),
  lastPlayedAt: z.number().nullable().default(null),
  lastTrainedAt: z.number().nullable().default(null),
  lastGroomedAt: z.number().nullable().default(null),

  // Session patterns
  sessionPatterns: z.record(z.number()).default({}), // pattern -> count

  // Appearance customization
  color: z.string().default('#E8F4FD'),
  accessories: z.array(z.string()).default([]),

  // Metadata
  createdAt: z.number(),
  updatedAt: z.number(),
  lastEvolutionAt: z.number().nullable().default(null),
});