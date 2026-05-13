import { eventBus } from "../../events";
import * as Sentry from "@sentry/react-native";
import { z } from "zod";


export const BossAttackPatternSchema = z.enum(['DISTRACTION_WAVE', 'PROCRASTINATION_BEAM', 'NOTIFICATION_BLAST', 'SOCIAL_MEDIA_TRAP', 'MULTITASKING_TEMPEST']);

export const BossPhaseSchema = z.enum(['CALM', 'AGITATED', 'ENRAGED', 'DESPERATE']);

export const CombatAbilitySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  focusEnergyCost: z.number().int().min(0),
  baseDamage: z.number().int().min(1),
  cooldownSeconds: z.number().int().min(0),
  requiresStreak: z.number().int().min(0),
  requiresLevel: z.number().int().min(1),
  icon: z.string(),
});

export const ActiveEncounterSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  bossId: z.string(),
  bossName: z.string(),
  bossAvatarUrl: z.string().nullable(),

  // Health
  bossMaxHealth: z.number().int(),
  bossCurrentHealth: z.number().int(),

  // Combat State
  currentPhase: BossPhaseSchema,
  currentAttackPattern: BossAttackPatternSchema.nullable(),
  attackPatternStartedAt: z.number().nullable(),
  attackPatternDurationMs: z.number().int(),

  // User Resources
  userMaxFocusEnergy: z.number().int().default(100),
  userCurrentFocusEnergy: z.number().int().default(100),
  userFocusEnergyRegenRate: z.number().default(1), // per second

  // Abilities & Cooldowns
  availableAbilities: z.array(CombatAbilitySchema),
  abilityCooldowns: z.record(z.number()), // abilityId -> availableAt timestamp

  // Timers
  encounterStartedAt: z.number(),
  expiresAt: z.number(),
  lastUserActionAt: z.number().nullable(),

  // Session Tracking
  sessionCount: z.number().int().default(0),
  totalDamageDealt: z.number().int().default(0),
  attacksDodged: z.number().int().default(0),
  attacksHit: z.number().int().default(0),

  status: z.enum(['ACTIVE', 'VICTORY', 'DEFEAT', 'TIMED_OUT']),
});

export const COMBAT_ABILITIES = [
  {
    id: 'focus_strike',
    name: 'Focus Strike',
    description: 'A concentrated attack dealing moderate damage',
    focusEnergyCost: 20,
    baseDamage: 15,
    cooldownSeconds: 5,
    requiresStreak: 0,
    requiresLevel: 1,
    icon: '⚔️',
  },
  {
    id: 'deep_dive',
    name: 'Deep Dive',
    description: 'High damage attack, costs more energy',
    focusEnergyCost: 40,
    baseDamage: 35,
    cooldownSeconds: 15,
    requiresStreak: 3,
    requiresLevel: 3,
    icon: '🌊',
  },
  {
    id: 'flow_state',
    name: 'Flow State',
    description: 'Massive damage but requires 7+ day streak',
    focusEnergyCost: 60,
    baseDamage: 60,
    cooldownSeconds: 30,
    requiresStreak: 7,
    requiresLevel: 5,
    icon: '🔥',
  },
  {
    id: 'pomodoro_barrage',
    name: 'Pomodoro Barrage',
    description: 'Rapid small attacks, good for building combos',
    focusEnergyCost: 10,
    baseDamage: 8,
    cooldownSeconds: 3,
    requiresStreak: 0,
    requiresLevel: 2,
    icon: '⏱️',
  },
  {
    id: 'distraction_purge',
    name: 'Distraction Purge',
    description: 'Bonus damage against DISTRACTION attacks',
    focusEnergyCost: 25,
    baseDamage: 20,
    cooldownSeconds: 10,
    requiresStreak: 5,
    requiresLevel: 4,
    icon: '🛡️',
  },
  {
    id: 'zen_strike',
    name: 'Zen Strike',
    description: 'Ultimate attack. Requires mastery.',
    focusEnergyCost: 100,
    baseDamage: 150,
    cooldownSeconds: 60,
    requiresStreak: 14,
    requiresLevel: 10,
    icon: '☯️',
  },
];

export function calculateBossPhase(currentHealth: number, maxHealth: number, timeElapsedMs: number, timeLimitMs: number): BossPhase {
  const healthPercent = currentHealth / maxHealth;
  const timePercent = timeElapsedMs / timeLimitMs;

  // Health-based phases
  if (healthPercent <= 0.15) {
    return 'DESPERATE';
  }
  if (healthPercent <= 0.4) {
    return 'ENRAGED';
  }
  if (healthPercent <= 0.7) {
    return 'AGITATED';
  }

  // Time-based urgency
  if (timePercent > 0.8) {
    return 'ENRAGED';
  }

  return 'CALM';
}

export function getPhaseMultiplier(phase: BossPhase): number {
  switch (phase) {
    case 'CALM':
      return 1.0;
    case 'AGITATED':
      return 1.2;
    case 'ENRAGED':
      return 1.5;
    case 'DESPERATE':
      return 2.0;
    default:
      return 1.0;
  }
}