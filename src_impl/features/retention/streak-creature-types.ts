import { z } from 'zod';

export const CreatureStageSchema = z.enum(['EGG', 'BABY', 'TEEN', 'ADULT', 'EPIC']);
export const PersonalityTraitSchema = z.enum(['EARLY_BIRD', 'NIGHT_OWL', 'STEADY', 'INTENSE', 'SOCIAL', 'EXPLORER']);

export const StreakCreatureSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  nickname: z.string().optional(),
  stage: CreatureStageSchema,
  level: z.number().default(1),
  experience: z.number().default(0),
  evolutionProgress: z.number().default(0),
  currentStreak: z.number().default(0),
  bestStreak: z.number().default(0),
  totalSessions: z.number().default(0),
  happiness: z.number().default(50),
  health: z.number().default(100),
  bond: z.number().default(0),
  primaryTrait: PersonalityTraitSchema.nullable().default(null),
  secondaryTrait: PersonalityTraitSchema.nullable().default(null),
  abilities: z.array(z.string()).default([]),
  unlockedAbilities: z.array(z.string()).default([]),
  lastFedAt: z.number().nullable().default(null),
  lastPlayedAt: z.number().nullable().default(null),
  lastTrainedAt: z.number().nullable().default(null),
  lastGroomedAt: z.number().nullable().default(null),
  sessionPatterns: z.record(z.number()).default({}),
  color: z.string().default('#E8F4FD'),
  accessories: z.array(z.string()).default([]),
  createdAt: z.number(),
  updatedAt: z.number(),
  lastEvolutionAt: z.number().nullable().default(null),
});

export const CreatureCareActionSchema = z.object({
  id: z.string(),
  creatureId: z.string(),
  userId: z.string(),
  action: z.enum(['FEED', 'PLAY', 'TRAIN', 'GROOM']),
  performedAt: z.number(),
  effect: z.record(z.number()),
  cost: z.record(z.number()),
});

export const CreatureAbilitySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  stage: CreatureStageSchema,
  effect: z.record(z.unknown()),
  cooldown: z.number(),
  uses: z.number().default(0),
  maxUses: z.number(),
});

export type CreatureStage = z.infer<typeof CreatureStageSchema>;
export type PersonalityTrait = z.infer<typeof PersonalityTraitSchema>;
export type StreakCreature = z.infer<typeof StreakCreatureSchema>;
export type CreatureCareAction = z.infer<typeof CreatureCareActionSchema>;
export type CreatureAbility = z.infer<typeof CreatureAbilitySchema>;

export interface CreatureEvolutionResult {
  evolved: boolean;
  newStage?: CreatureStage;
  newAbilities?: string[];
  message: string;
}

export interface CreatureStats {
  stage: CreatureStage;
  level: number;
  experience: number;
  happiness: number;
  health: number;
  bond: number;
  abilities: string[];
  personality: PersonalityTrait[];
  nextEvolution: {
    stage: CreatureStage;
    progress: number;
    requirements: Record<string, number>;
  };
}

export const CREATURE_CONFIG = {
  EVOLUTION_STAGES: {
    EGG: { name: 'Focus Egg', minStreak: 0, maxStreak: 2, description: 'A mysterious egg that hatches with consistent focus', abilities: ['potential'], personality: ['mysterious'], emoji: '\uD83E\uDD5A', color: '#E8F4FD' },
    BABY: { name: 'Focus Sprout', minStreak: 3, maxStreak: 7, description: 'A curious young creature learning to focus', abilities: ['encouragement'], personality: ['playful', 'curious'], emoji: '\uD83C\uDF31', color: '#C8E6C9' },
    TEEN: { name: 'Focus Companion', minStreak: 8, maxStreak: 14, description: 'An energetic companion that loves challenges', abilities: ['motivation_boost', 'focus_aid'], personality: ['energetic', 'loyal'], emoji: '\uD83E\uDD8A', color: '#FFE0B2' },
    ADULT: { name: 'Focus Guardian', minStreak: 15, maxStreak: 29, description: 'A wise guardian that protects your focus', abilities: ['streak_protection', 'deep_focus', 'wisdom'], personality: ['wise', 'protective', 'calm'], emoji: '\uD83E\uDD89', color: '#E1BEE7' },
    EPIC: { name: 'Focus Master', minStreak: 30, maxStreak: 999, description: 'A legendary master of focus and discipline', abilities: ['time_bending', 'perfect_clarity', 'enlightenment'], personality: ['legendary', 'enlightened', 'transcendent'], emoji: '\uD83D\uDC09', color: '#FFD700' },
  },
  PERSONALITY_TRAITS: {
    EARLY_BIRD: { name: 'Early Bird', description: 'Loves morning sessions', trigger: 'morning_sessions', emoji: '\uD83C\uDF05' },
    NIGHT_OWL: { name: 'Night Owl', description: 'Thrives in evening sessions', trigger: 'evening_sessions', emoji: '\uD83C\uDF19' },
    STEADY: { name: 'Steady', description: 'Very consistent session times', trigger: 'consistent_timing', emoji: '\u23F0' },
    INTENSE: { name: 'Intense', description: 'Prefers long, deep sessions', trigger: 'long_sessions', emoji: '\uD83D\uDD25' },
    SOCIAL: { name: 'Social', description: 'Enjoys squad sessions', trigger: 'squad_sessions', emoji: '\uD83D\uDC65' },
    EXPLORER: { name: 'Explorer', description: 'Loves trying different modes', trigger: 'variety_seeker', emoji: '\uD83E\uDDED' },
  },
  CARE_ACTIONS: {
    FEED: { name: 'Feed', description: 'Give your creature focus energy', cost: { focusPoints: 10 }, effect: 'happiness +20', cooldown: 4 * 60 * 60 * 1000 },
    PLAY: { name: 'Play', description: 'Play with your creature', cost: { coins: 25 }, effect: 'bond +15', cooldown: 6 * 60 * 60 * 1000 },
    TRAIN: { name: 'Train', description: "Train your creature's abilities", cost: { gems: 5 }, effect: 'experience +30', cooldown: 8 * 60 * 60 * 1000 },
    GROOM: { name: 'Groom', description: 'Keep your creature healthy', cost: { coins: 10 }, effect: 'health +25', cooldown: 12 * 60 * 60 * 1000 },
  },
  MAX_HAPPINESS: 100,
  MAX_HEALTH: 100,
  MAX_BOND: 100,
  MAX_EXPERIENCE: 1000,
  EVOLUTION_REQUIREMENTS: {
    BABY: { streak: 3, totalSessions: 5, avgPurity: 70 },
    TEEN: { streak: 8, totalSessions: 15, avgPurity: 75 },
    ADULT: { streak: 15, totalSessions: 35, avgPurity: 80 },
    EPIC: { streak: 30, totalSessions: 75, avgPurity: 85 },
  },
} as const;

export const EVOLUTION_REQUIREMENTS: Record<string, { streak: number; totalSessions: number; avgPurity: number }> = CREATURE_CONFIG.EVOLUTION_REQUIREMENTS;
