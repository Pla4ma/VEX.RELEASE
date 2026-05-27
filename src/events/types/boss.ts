/**
 * @deprecated BLOCKED by VEX Phase 14. Old economy event definitions.
 * Kept for event payload type compatibility only. No new code should publish these events.
 */
/**
 * Boss Events
 */

export interface BossEventDefinitions {
  "boss:defeated": {
    userId: string;
    bossId: string;
    encounterId?: string;
    damageDealt: number;
    maxHealth?: number;
    contributors?: Array<{
      userId: string;
      displayName: string;
      damageContribution: number;
    }>;
    won: boolean;
    rewards: {
      xp: number;
      coins: number;
      items: string[];
    };
    participants: string[];
    timestamp?: number;
  };
  "boss:spawned": {
    userId: string;
    bossId: string;
    encounterId: string;
    maxHealth: number;
    timeLimit: number;
    timestamp: number;
  };
  "boss:damage_dealt": {
    userId: string;
    bossId: string;
    encounterId: string;
    damage: number;
    healthRemaining: number;
    maxHealth: number;
    timestamp: number;
  };
  "boss:timeout": {
    userId: string;
    bossId: string;
    encounterId: string;
    damageDealt: number;
    maxHealth: number;
    timestamp: number;
  };
  "boss:phase_changed": {
    userId?: string;
    bossId?: string;
    encounterId: string;
    previousPhase: string;
    newPhase: string;
    healthPercent?: number;
    timestamp?: number;
  };
  "boss:prime_time_scheduled": {
    encounterId: string;
    windows: Array<{ startTime: number; endTime: number }>;
  };
  "boss:ability_used": {
    userId: string;
    encounterId: string;
    abilityId: string;
    damageDealt: number;
    newHealth: number;
    comboBonus: number;
  };
  "boss:phase": {
    encounterId: string;
    userId: string;
    event: string;
    timestamp: number;
    data: Record<string, unknown>;
  };
  "boss:squad_encounter_created": {
    encounterId: string;
    squadId: string;
    bossId: string;
    memberCount: number;
  };
  "boss:squad_damage_dealt": {
    encounterId: string;
    userId: string;
    damage: number;
    healthRemaining: number;
  };
  "boss:squad_victory": {
    encounterId: string;
    squadId: string;
    bossId: string;
    totalDamage: number;
  };
  "boss:squad_member_joined": {
    encounterId: string;
    userId: string;
    displayName: string;
  };
  "boss:damage": {
    encounterId: string;
    userId: string;
    damage: number;
    abilityUsed?: string;
    timestamp: number;
  };
  "boss:regen": {
    encounterId: string;
    bossId: string;
    healthRestored: number;
    timestamp: number;
  };
  "boss:phase_change": {
    encounterId: string;
    bossId: string;
    previousPhase: string;
    newPhase: string;
    timestamp: number;
  };
  // Adaptive Difficulty Events
  "adaptive_difficulty:profile_initialized": {
    userId: string;
    profileId: string;
    timestamp: number;
  };
  "adaptive_difficulty:encounter_created": {
    userId: string;
    encounterId: string;
    bossId: string;
    difficulty: number;
    timestamp: number;
  };
  "adaptive_difficulty:real_time_adjustment": {
    userId: string;
    encounterId: string;
    adjustment: number;
    reason: string;
    timestamp: number;
  };
  "adaptive_difficulty:encounter_completed": {
    userId: string;
    encounterId: string;
    bossId: string;
    finalDifficulty: number;
    timestamp: number;
  };
  // Weekly Raid Events
  "raid:damage_contributed": {
    userId: string;
    raidId: string;
    encounterId: string;
    damage: number;
    timestamp: number;
  };
  "raid:activated": {
    userId: string;
    raidId: string;
    startTime: number;
    endTime: number;
    timestamp: number;
  };
  "raid:defeated": {
    userId: string;
    raidId: string;
    endTime: number;
    totalDamage: number;
    timestamp: number;
  };
  "raid:timeout": {
    userId: string;
    raidId: string;
    endTime: number;
    reason: string;
    timestamp: number;
  };
}
