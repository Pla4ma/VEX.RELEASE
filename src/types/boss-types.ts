import { z } from "zod";

export const BossTierSchema = z.enum([
  "COMMON",
  "UNCOMMON",
  "RARE",
  "EPIC",
  "LEGENDARY",
]);
export type BossTier = z.infer<typeof BossTierSchema>;

export const BossPhaseSchema = z.enum([
  "CALM",
  "AGITATED",
  "ENRAGED",
  "DESPERATE",
]);
export type BossPhase = z.infer<typeof BossPhaseSchema>;

export const BossAttackPatternSchema = z.enum([
  "DISTRACTION_WAVE",
  "PROCRASTINATION_BEAM",
  "NOTIFICATION_BLAST",
  "SOCIAL_MEDIA_TRAP",
  "MULTITASKING_TEMPEST",
]);
export type BossAttackPattern = z.infer<typeof BossAttackPatternSchema>;

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
export type CombatAbility = z.infer<typeof CombatAbilitySchema>;

export interface BossEncounter {
  id: string;
  userId: string;
  bossId: string;
  bossName: string;
  bossAvatarUrl: string | null;
  bossMaxHealth: number;
  bossCurrentHealth: number;
  percentHealthRemaining: number;
  currentPhase: BossPhase;
  currentAttackPattern: BossAttackPattern | null;
  attackPatternStartedAt: number | null;
  attackPatternDurationMs: number;
  userMaxFocusEnergy: number;
  userCurrentFocusEnergy: number;
  userFocusEnergyRegenRate: number;
  availableAbilities: CombatAbility[];
  abilityCooldowns: Record<string, number>;
  encounterStartedAt: number;
  expiresAt: number;
  lastUserActionAt: number | null;
  sessionCount: number;
  totalDamageDealt: number;
  attacksDodged: number;
  attacksHit: number;
  status: "ACTIVE" | "VICTORY" | "DEFEAT" | "TIMED_OUT";
  tier: BossTier;
}

export interface BossState {
  encounter: BossEncounter | null;
  damageThisSession: DamageCalculation;
  estimatedKill: KillEstimate;
  combatState:
    | "ENCOUNTER_START"
    | "COMBAT_ACTIVE"
    | "BOSS_RAGE"
    | "NEAR_DEATH"
    | "VICTORY";
  showDamageFlash: boolean;
  recentDamage: number;
  isLoading: boolean;
  error: Error | null;
}

export interface DamageCalculation {
  baseDamage: number;
  purityMultiplier: number;
  streakMultiplier: number;
  totalDamage: number;
  damagePerMinute: number;
}

export interface KillEstimate {
  willDefeat: boolean;
  sessionsRemaining: number;
  minutesRemaining: number;
  percentDamage: number;
}

export interface CombatActionResult {
  success: boolean;
  damageDealt: number;
  energyConsumed: number;
  bossHealthRemaining: number;
  newPhase: BossPhase;
  comboBonus: number;
  message: string;
}

export interface ActiveEncounter {
  id: string;
  userId: string;
  bossId: string;
  bossName: string;
  bossAvatarUrl: string | null;
  bossMaxHealth: number;
  bossCurrentHealth: number;
  currentPhase: BossPhase;
  currentAttackPattern: BossAttackPattern | null;
  attackPatternStartedAt: number | null;
  attackPatternDurationMs: number;
  userMaxFocusEnergy: number;
  userCurrentFocusEnergy: number;
  userFocusEnergyRegenRate: number;
  availableAbilities: CombatAbility[];
  abilityCooldowns: Record<string, number>;
  encounterStartedAt: number;
  expiresAt: number;
  lastUserActionAt: number | null;
  sessionCount: number;
  totalDamageDealt: number;
  attacksDodged: number;
  attacksHit: number;
  status: "ACTIVE" | "VICTORY" | "DEFEAT" | "TIMED_OUT";
}

export type LegacyBossState = BossState;
export type LegacyBossEncounter = BossEncounter;
