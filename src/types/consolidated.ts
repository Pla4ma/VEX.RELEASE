/**
 * Consolidated Types — Barrel re-export
 *
 * Split into session-types.ts and boss-types.ts by domain.
 */

export {
  SessionStatusSchema,
  type SessionStatus,
  SessionPhaseSchema,
  type SessionPhase,
  SessionConfigSchema,
  type SessionConfig,
  type SessionState,
  type SessionSummary,
  type LegacySessionState,
} from "./session-types";

export {
  BossTierSchema,
  type BossTier,
  BossPhaseSchema,
  type BossPhase,
  BossAttackPatternSchema,
  type BossAttackPattern,
  CombatAbilitySchema,
  type CombatAbility,
  type BossEncounter,
  type BossState,
  type DamageCalculation,
  type KillEstimate,
  type CombatActionResult,
  type ActiveEncounter,
  type LegacyBossState,
  type LegacyBossEncounter,
} from "./boss-types";
