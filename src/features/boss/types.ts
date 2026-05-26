/**
 * Boss Feature - Domain Types
 *
 * Dependencies:
 * - Sessions (damage applied during sessions)
 * - Progression (level gates boss unlocks)
 * - Rewards (boss defeat rewards)
 * - Squads (squad boss encounters)
 * - Analytics (boss events tracked)
 */

// ============================================================================
// Boss Template Types
// ============================================================================

export interface BossTemplate {
  id: string;
  name: string;
  description: string;
  avatarUrl: string | null;
  tier: number;
  baseHealth: number;
  healthScaling: number;
  minLevel: number;
  previousBossId: string | null;
  timeLimit: number;
  rewardType: BossRewardType;
  rewardAmount: number;
  rewardItemId: string | null;
  /** Boss personality taunts shown at different health thresholds */
  taunts?: {
    spawn: string; // shown when boss appears
    halfHealth: string; // shown at 50% health
    nearDeath: string; // shown at 25% health
  };
}

export type BossRewardType = 'XP' | 'COINS' | 'GEMS' | 'ITEM' | 'COSMETIC' | 'STREAK_SHIELD';

export type BossRewardTypeBehavioral = 'XP' | 'ITEM' | 'COSMETIC';

// ============================================================================
// Boss Encounter Types
// ============================================================================

export interface BossEncounter {
  id: string;
  bossId: string;
  userId: string | null;
  squadId: string | null;
  healthRemaining: number;
  maxHealth: number;
  damageDealt: number;
  status: BossEncounterStatus;
  startedAt: number;
  expiresAt: number;
  defeatedAt: number | null;
  contributingSessionIds: string[];
  createdAt: number;
}

export type BossEncounterStatus = 'ACTIVE' | 'DEFEATED' | 'TIMEOUT' | 'ABANDONED';

export interface BossEncounterSummary {
  id: string;
  bossId: string;
  bossName: string;
  bossAvatarUrl: string | null;
  healthRemaining: number;
  maxHealth: number;
  percentHealthRemaining: number;
  status: BossEncounterStatus;
  expiresAt: number;
  timeRemaining: number;
}

// ============================================================================
// Boss Damage Types
// ============================================================================

export interface BossDamageResult {
  damageDealt: number;
  healthRemaining: number;
  maxHealth: number;
  isDefeated: boolean;
  percentComplete: number;
  criticalHit: boolean;
}

export interface DamageCalculationInput {
  baseDamage: number;
  sessionQuality: number;
  streakDays: number;
  squadMultiplier: number;
  equippedItems: BossDamageItem[];
}

export interface BossDamageItem {
  id: string;
  effect: 'BOSS_DAMAGE' | 'CRITICAL_CHANCE' | 'CRITICAL_DAMAGE';
  bonusPercent: number;
}

// ============================================================================
// Boss Unlock Types
// ============================================================================

export interface BossUnlockRequirement {
  bossId: string;
  minLevel: number;
  previousBossId: string | null;
  defeatedPrevious: boolean;
}

export interface BossUnlockStatus {
  bossId: string;
  locked: boolean;
  reason: string | null;
  minLevel: number;
  requiredBossId: string | null;
}

// ============================================================================
// Boss Defeat Types
// ============================================================================

export interface BossDefeatResult {
  encounterId: string;
  bossId: string;
  defeatedAt: number;
  contributors: string[];
  rewards: BossReward[];
  unlockedNextBoss: string | null;
}

export interface BossReward {
  userId: string;
  type: BossRewardType;
  amount: number;
  itemId: string | null;
}

export interface BossDefeatSummary {
  encounterId: string;
  bossName: string;
  defeatedAt: number;
  totalDamage: number;
  contributors: Array<{
    userId: string;
    damageDealt: number;
    sessions: number;
  }>;
  rewards: BossReward[];
}

// ============================================================================
// Squad Boss Types
// ============================================================================

export interface SquadBossEncounter extends BossEncounter {
  squadId: string;
  memberDamage: Array<{
    userId: string;
    damageDealt: number;
    sessions: number;
  }>;
}

// ============================================================================
// Boss Cooldown Types
// ============================================================================

export interface BossCooldown {
  bossId: string;
  userId: string;
  expiresAt: number;
  reason: 'TIMEOUT' | 'MANUAL';
}
