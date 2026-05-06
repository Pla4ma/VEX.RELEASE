/**
 * Active Boss Combat System
 * Replaces passive damage with active gameplay mechanics
 * Bosses have attack patterns, users have abilities, combat requires skill
 */

import { eventBus } from "../../events";
import * as Sentry from "@sentry/react-native";
import { z } from "zod";

// ============================================================================
// Schemas
// ============================================================================

export const BossAttackPatternSchema = z.enum(["DISTRACTION_WAVE", "PROCRASTINATION_BEAM", "NOTIFICATION_BLAST", "SOCIAL_MEDIA_TRAP", "MULTITASKING_TEMPEST"]);

export const BossPhaseSchema = z.enum(["CALM", "AGITATED", "ENRAGED", "DESPERATE"]);

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

  status: z.enum(["ACTIVE", "VICTORY", "DEFEAT", "TIMED_OUT"]),
});

// ============================================================================
// Combat Abilities Database
// ============================================================================

export const COMBAT_ABILITIES = [
  {
    id: "focus_strike",
    name: "Focus Strike",
    description: "A concentrated attack dealing moderate damage",
    focusEnergyCost: 20,
    baseDamage: 15,
    cooldownSeconds: 5,
    requiresStreak: 0,
    requiresLevel: 1,
    icon: "⚔️",
  },
  {
    id: "deep_dive",
    name: "Deep Dive",
    description: "High damage attack, costs more energy",
    focusEnergyCost: 40,
    baseDamage: 35,
    cooldownSeconds: 15,
    requiresStreak: 3,
    requiresLevel: 3,
    icon: "🌊",
  },
  {
    id: "flow_state",
    name: "Flow State",
    description: "Massive damage but requires 7+ day streak",
    focusEnergyCost: 60,
    baseDamage: 60,
    cooldownSeconds: 30,
    requiresStreak: 7,
    requiresLevel: 5,
    icon: "🔥",
  },
  {
    id: "pomodoro_barrage",
    name: "Pomodoro Barrage",
    description: "Rapid small attacks, good for building combos",
    focusEnergyCost: 10,
    baseDamage: 8,
    cooldownSeconds: 3,
    requiresStreak: 0,
    requiresLevel: 2,
    icon: "⏱️",
  },
  {
    id: "distraction_purge",
    name: "Distraction Purge",
    description: "Bonus damage against DISTRACTION attacks",
    focusEnergyCost: 25,
    baseDamage: 20,
    cooldownSeconds: 10,
    requiresStreak: 5,
    requiresLevel: 4,
    icon: "🛡️",
  },
  {
    id: "zen_strike",
    name: "Zen Strike",
    description: "Ultimate attack. Requires mastery.",
    focusEnergyCost: 100,
    baseDamage: 150,
    cooldownSeconds: 60,
    requiresStreak: 14,
    requiresLevel: 10,
    icon: "☯️",
  },
];

// ============================================================================
// Boss Attack Patterns
// ============================================================================

const ATTACK_PATTERNS: Record<
  string,
  {
    name: string;
    durationMs: number;
    damageOnHit: number;
    description: string;
    dodgeMechanic: string;
  }
> = {
  DISTRACTION_WAVE: {
    name: "Distraction Wave",
    durationMs: 30000, // 30 seconds
    damageOnHit: 15,
    description: "Boss emits waves of distraction!",
    dodgeMechanic: "Complete a 5-minute focus sprint",
  },
  PROCRASTINATION_BEAM: {
    name: "Procrastination Beam",
    durationMs: 60000, // 60 seconds
    damageOnHit: 25,
    description: "A beam of procrastination sweeps across!",
    dodgeMechanic: "Do not pause for 10 minutes",
  },
  NOTIFICATION_BLAST: {
    name: "Notification Blast",
    durationMs: 20000, // 20 seconds
    damageOnHit: 10,
    description: "Notification spam incoming!",
    dodgeMechanic: "Ignore all notifications for 20 seconds",
  },
  SOCIAL_MEDIA_TRAP: {
    name: "Social Media Trap",
    durationMs: 45000, // 45 seconds
    damageOnHit: 20,
    description: "Boss sets a social media trap!",
    dodgeMechanic: "Stay in app without backgrounding",
  },
  MULTITASKING_TEMPEST: {
    name: "Multitasking Tempest",
    durationMs: 90000, // 90 seconds
    damageOnHit: 30,
    description: "The tempest of multitasking swirls!",
    dodgeMechanic: "Complete session without switching apps",
  },
};

// ============================================================================
// Types
// ============================================================================

export type BossAttackPattern = z.infer<typeof BossAttackPatternSchema>;
export type BossPhase = z.infer<typeof BossPhaseSchema>;
export type CombatAbility = z.infer<typeof CombatAbilitySchema>;
export type ActiveEncounter = z.infer<typeof ActiveEncounterSchema>;

// ============================================================================
// Encounter Management
// ============================================================================

export function calculateBossPhase(currentHealth: number, maxHealth: number, timeElapsedMs: number, timeLimitMs: number): BossPhase {
  const healthPercent = currentHealth / maxHealth;
  const timePercent = timeElapsedMs / timeLimitMs;

  // Health-based phases
  if (healthPercent <= 0.15) {
    return "DESPERATE";
  }
  if (healthPercent <= 0.4) {
    return "ENRAGED";
  }
  if (healthPercent <= 0.7) {
    return "AGITATED";
  }

  // Time-based urgency
  if (timePercent > 0.8) {
    return "ENRAGED";
  }

  return "CALM";
}

export function getPhaseMultiplier(phase: BossPhase): number {
  switch (phase) {
    case "CALM":
      return 1.0;
    case "AGITATED":
      return 1.2;
    case "ENRAGED":
      return 1.5;
    case "DESPERATE":
      return 2.0;
    default:
      return 1.0;
  }
}

export function selectAttackPattern(currentPhase: BossPhase, userLevel: number): BossAttackPattern {
  const patterns = Object.keys(ATTACK_PATTERNS) as BossAttackPattern[];

  // Weight patterns based on phase
  let weights: number[];
  switch (currentPhase) {
    case "CALM":
      weights = [0.5, 0.2, 0.2, 0.1, 0.0]; // Easier patterns
      break;
    case "AGITATED":
      weights = [0.3, 0.3, 0.2, 0.2, 0.0];
      break;
    case "ENRAGED":
      weights = [0.1, 0.3, 0.2, 0.3, 0.1];
      break;
    case "DESPERATE":
      weights = [0.0, 0.2, 0.2, 0.3, 0.3]; // Hardest patterns
      break;
  }

  // Weighted random selection
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < patterns.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return patterns[i];
    }
  }

  return patterns[0];
}

// ============================================================================
// Combat Actions
// ============================================================================

export interface CombatActionResult {
  success: boolean;
  damageDealt: number;
  energyConsumed: number;
  bossHealthRemaining: number;
  newPhase: BossPhase;
  comboBonus: number;
  message: string;
}

export function executeCombatAbility(encounter: ActiveEncounter, abilityId: string, userStreakDays: number, now: number = Date.now()): CombatActionResult {
  const ability = encounter.availableAbilities.find((a) => a.id === abilityId);

  if (!ability) {
    return {
      success: false,
      damageDealt: 0,
      energyConsumed: 0,
      bossHealthRemaining: encounter.bossCurrentHealth,
      newPhase: encounter.currentPhase,
      comboBonus: 0,
      message: "Ability not available",
    };
  }

  // Check cooldown
  const cooldownEnds = encounter.abilityCooldowns[abilityId] || 0;
  if (now < cooldownEnds) {
    return {
      success: false,
      damageDealt: 0,
      energyConsumed: 0,
      bossHealthRemaining: encounter.bossCurrentHealth,
      newPhase: encounter.currentPhase,
      comboBonus: 0,
      message: "Ability on cooldown",
    };
  }

  // Check energy
  if (encounter.userCurrentFocusEnergy < ability.focusEnergyCost) {
    return {
      success: false,
      damageDealt: 0,
      energyConsumed: 0,
      bossHealthRemaining: encounter.bossCurrentHealth,
      newPhase: encounter.currentPhase,
      comboBonus: 0,
      message: "Not enough Focus Energy!",
    };
  }

  // Check requirements
  if (userStreakDays < ability.requiresStreak) {
    return {
      success: false,
      damageDealt: 0,
      energyConsumed: 0,
      bossHealthRemaining: encounter.bossCurrentHealth,
      newPhase: encounter.currentPhase,
      comboBonus: 0,
      message: `Requires ${ability.requiresStreak} day streak`,
    };
  }

  // Calculate damage with phase multiplier
  const phaseMultiplier = getPhaseMultiplier(encounter.currentPhase);
  const damageDealt = Math.floor(ability.baseDamage * phaseMultiplier);

  // Apply damage
  const newHealth = Math.max(0, encounter.bossCurrentHealth - damageDealt);
  const newPhase = calculateBossPhase(newHealth, encounter.bossMaxHealth, now - encounter.encounterStartedAt, encounter.expiresAt - encounter.encounterStartedAt);

  // Update cooldown
  const updatedCooldowns = {
    ...encounter.abilityCooldowns,
    [abilityId]: now + ability.cooldownSeconds * 1000,
  };

  // Calculate combo (multiple hits in succession)
  const timeSinceLastAction = encounter.lastUserActionAt ? now - encounter.lastUserActionAt : Infinity;
  const comboBonus = timeSinceLastAction < 10000 ? 0.2 : 0; // 20% bonus for <10s between actions

  // Publish event
  eventBus.publish("boss:ability_used", {
    userId: encounter.userId,
    encounterId: encounter.id,
    abilityId,
    damageDealt,
    newHealth,
    comboBonus,
  });

  return {
    success: true,
    damageDealt,
    energyConsumed: ability.focusEnergyCost,
    bossHealthRemaining: newHealth,
    newPhase,
    comboBonus,
    message: `${ability.name} dealt ${damageDealt} damage!`,
  };
}

// ============================================================================
// Attack Pattern Resolution
// ============================================================================

export function resolveAttackPattern(
  encounter: ActiveEncounter,
  userCompletedSprint: boolean,
  userDidNotPause: boolean,
  now: number = Date.now(),
): {
  hit: boolean;
  damageTaken: number;
  dodged: boolean;
  message: string;
} {
  if (!encounter.currentAttackPattern) {
    return { hit: false, damageTaken: 0, dodged: false, message: "" };
  }

  const pattern = ATTACK_PATTERNS[encounter.currentAttackPattern];

  // Check if pattern duration expired
  const patternElapsed = encounter.attackPatternStartedAt ? now - encounter.attackPatternStartedAt : 0;

  if (patternElapsed < pattern.durationMs) {
    return { hit: false, damageTaken: 0, dodged: false, message: pattern.description };
  }

  // Determine if user dodged based on mechanic
  let dodged = false;
  switch (encounter.currentAttackPattern) {
    case "DISTRACTION_WAVE":
      dodged = userCompletedSprint;
      break;
    case "PROCRASTINATION_BEAM":
      dodged = userDidNotPause;
      break;
    // Add other pattern logic...
    default:
      dodged = Math.random() > 0.5; // Fallback
  }

  if (dodged) {
    return {
      hit: false,
      damageTaken: 0,
      dodged: true,
      message: `Dodged ${pattern.name}!`,
    };
  }

  return {
    hit: true,
    damageTaken: pattern.damageOnHit,
    dodged: false,
    message: `Hit by ${pattern.name}! -${pattern.damageOnHit} Focus Energy`,
  };
}

// ============================================================================
// Victory/Defeat Handling
// ============================================================================

export function checkEncounterEnd(
  encounter: ActiveEncounter,
  now: number = Date.now(),
): {
  ended: boolean;
  victory: boolean;
  reason: "DEFEATED" | "TIMED_OUT" | "ABANDONED" | "ACTIVE";
  rewards: Array<{ type: string; amount: number }>;
} {
  // Check victory
  if (encounter.bossCurrentHealth <= 0) {
    return {
      ended: true,
      victory: true,
      reason: "DEFEATED",
      rewards: calculateVictoryRewards(encounter),
    };
  }

  // Check timeout
  if (now > encounter.expiresAt) {
    return {
      ended: true,
      victory: false,
      reason: "TIMED_OUT",
      rewards: [],
    };
  }

  // Check user focus energy depletion (defeat condition)
  if (encounter.userCurrentFocusEnergy <= 0) {
    return {
      ended: true,
      victory: false,
      reason: "ABANDONED",
      rewards: [{ type: "CONSOLATION_XP", amount: Math.floor(encounter.totalDamageDealt / 10) }],
    };
  }

  return {
    ended: false,
    victory: false,
    reason: "ACTIVE",
    rewards: [],
  };
}

function calculateVictoryRewards(encounter: ActiveEncounter): Array<{ type: string; amount: number }> {
  const baseXp = 100;
  const damageBonus = Math.floor(encounter.totalDamageDealt / 5);
  const dodgeBonus = encounter.attacksDodged * 25;

  const rewards = [
    { type: "XP", amount: baseXp + damageBonus + dodgeBonus },
    { type: "COINS", amount: 50 + Math.floor(encounter.totalDamageDealt / 10) },
  ];

  // Chance for gem drop
  if (encounter.attacksDodged >= 3) {
    rewards.push({ type: "GEMS", amount: 10 });
  }

  return rewards;
}

// ============================================================================
// UI Helpers
// ============================================================================

export function formatCombatStatus(encounter: ActiveEncounter): {
  bossHealthBar: string;
  energyBar: string;
  phaseIndicator: string;
  timeRemaining: string;
  activeAttack: string | null;
} {
  const bossPercent = Math.floor((encounter.bossCurrentHealth / encounter.bossMaxHealth) * 100);
  const energyPercent = Math.floor((encounter.userCurrentFocusEnergy / encounter.userMaxFocusEnergy) * 100);

  const bossBar = "█".repeat(bossPercent / 5) + "░".repeat(20 - bossPercent / 5);
  const energyBar = "█".repeat(energyPercent / 5) + "░".repeat(20 - energyPercent / 5);

  const timeMs = encounter.expiresAt - Date.now();
  const timeMinutes = Math.floor(timeMs / 60000);

  return {
    bossHealthBar: `${bossBar} ${bossPercent}%`,
    energyBar: `${energyBar} ${energyPercent}%`,
    phaseIndicator: encounter.currentPhase,
    timeRemaining: timeMinutes > 0 ? `${timeMinutes}m` : "EXPIRING!",
    activeAttack: encounter.currentAttackPattern ? ATTACK_PATTERNS[encounter.currentAttackPattern]?.name : null,
  };
}
