/**
 * Basic Solo Boss Service
 * 
 * Simplified boss system for PHASE 8 launch scope.
 * Focuses on solo boss battles only.
 */

import { eventBus } from "../../events";
import * as repository from "./repository";
import { 
  BossTemplateSchema, 
  BossEncounterSchema, 
  CalculateDamageInputSchema,
  type BossTemplate, 
  type BossEncounter, 
  type BossEncounterSummary, 
  type BossDamageResult 
} from "./schemas";

// ============================================================================
// Basic Solo Boss Configuration
// ============================================================================

interface BasicBossConfig {
  soloBossId: string;
  baseHealth: number;
  timeLimitHours: number;
  rewardXp: number;
  rewardCoins: number;
}

const BASIC_BOSS_CONFIG: BasicBossConfig = {
  soloBossId: "basic-solo-boss-001",
  baseHealth: 1000,
  timeLimitHours: 24,
  rewardXp: 50,
  rewardCoins: 25,
};

// ============================================================================
// Simple Damage Calculation
// ============================================================================

export function calculateBasicSoloBossDamage(input: {
  sessionDurationMinutes: number;
  sessionQuality: number;
  streakDays: number;
}): number {
  const { sessionDurationMinutes, sessionQuality, streakDays } = input;
  
  // Simple deterministic formula
  const baseDamage = Math.max(1, Math.round(sessionDurationMinutes * 0.8));
  const qualityMultiplier = Math.max(0.5, sessionQuality / 100);
  const streakBonus = streakDays >= 3 ? 1.2 : 1.0;
  
  return Math.round(baseDamage * qualityMultiplier * streakBonus);
}

// ============================================================================
// Basic Solo Boss Management
// ============================================================================

export async function getOrCreateBasicSoloBossEncounter(userId: string): Promise<BossEncounterSummary | null> {
  // Check for existing active encounter
  const existing = await repository.fetchActiveEncounter(userId);
  if (existing) {
    // Check if expired
    if (existing.expiresAt < Date.now()) {
      await repository.markEncounterTimeout(existing.id);
      return null;
    }
    
    const template = await repository.fetchBossTemplate(existing.bossId);
    if (!template) return null;
    
    const timeRemaining = Math.max(0, existing.expiresAt - Date.now());
    const percentHealth = Math.floor((existing.healthRemaining / existing.maxHealth) * 100);
    
    return {
      id: existing.id,
      bossId: existing.bossId,
      bossName: template.name,
      bossAvatarUrl: template.avatarUrl,
      healthRemaining: existing.healthRemaining,
      maxHealth: existing.maxHealth,
      percentHealthRemaining: percentHealth,
      status: existing.status,
      expiresAt: existing.expiresAt,
      timeRemaining,
    };
  }
  
  // Create new encounter
  return await createBasicSoloBossEncounter(userId);
}

async function createBasicSoloBossEncounter(userId: string): Promise<BossEncounterSummary | null> {
  // Use basic boss template or create default
  let template = await repository.fetchBossTemplate(BASIC_BOSS_CONFIG.soloBossId);
  
  if (!template) {
    // Create a basic template if it doesn't exist
    template = {
      id: BASIC_BOSS_CONFIG.soloBossId,
      name: "Focus Guardian",
      description: "A guardian that tests your focus consistency",
      avatarUrl: null,
      tier: 1,
      baseHealth: BASIC_BOSS_CONFIG.baseHealth,
      healthScaling: 0.1,
      minLevel: 1,
      previousBossId: null,
      timeLimit: BASIC_BOSS_CONFIG.timeLimitHours * 3600, // Convert to seconds
      rewardType: "XP",
      rewardAmount: BASIC_BOSS_CONFIG.rewardXp,
      rewardItemId: null,
    };
  }
  
  const encounter = await repository.createEncounter(
    template.id,
    userId,
    null, // No squad ID for solo boss
    template.baseHealth,
    template.timeLimit
  );
  
  const timeRemaining = Math.max(0, encounter.expiresAt - Date.now());
  
  return {
    id: encounter.id,
    bossId: encounter.bossId,
    bossName: template.name,
    bossAvatarUrl: template.avatarUrl,
    healthRemaining: encounter.healthRemaining,
    maxHealth: encounter.maxHealth,
    percentHealthRemaining: 100,
    status: encounter.status,
    expiresAt: encounter.expiresAt,
    timeRemaining,
  };
}

// ============================================================================
// Damage Application
// ============================================================================

export async function applyBasicSoloBossDamage(
  encounterId: string,
  sessionId: string,
  damage: number
): Promise<BossDamageResult> {
  const encounter = await repository.fetchEncounterById(encounterId);
  if (!encounter) {
    throw new Error("No active boss encounter found");
  }
  
  if (encounter.status !== "ACTIVE") {
    throw new Error(`Cannot damage boss in ${encounter.status} state`);
  }
  
  // Check for timeout
  if (encounter.expiresAt < Date.now()) {
    await repository.markEncounterTimeout(encounterId);
    throw new Error("Boss encounter has expired");
  }
  
  const newHealth = Math.max(0, encounter.healthRemaining - damage);
  const totalDamageDealt = encounter.damageDealt + damage;
  const isDefeated = newHealth === 0;
  
  const updated = await repository.updateEncounterHealth(
    encounterId, 
    newHealth, 
    totalDamageDealt, 
    sessionId
  );
  
  const percentComplete = Math.floor((totalDamageDealt / encounter.maxHealth) * 100);
  
  if (isDefeated) {
    await handleBasicSoloBossDefeat(encounterId, encounter.userId!);
  }
  
  return {
    damageDealt: damage,
    healthRemaining: newHealth,
    maxHealth: encounter.maxHealth,
    isDefeated,
    percentComplete,
    criticalHit: false, // No critical hits in basic version
  };
}

// ============================================================================
// Boss Defeat Handling
// ============================================================================

async function handleBasicSoloBossDefeat(encounterId: string, userId: string): Promise<void> {
  const encounter = await repository.markEncounterDefeated(encounterId);
  const template = await repository.fetchBossTemplate(encounter.bossId);
  
  if (!template) {
    throw new Error(`Boss template not found: ${encounter.bossId}`);
  }
  
  // Record defeat
  await repository.recordBossDefeat(userId, encounter.bossId, encounterId, encounter.damageDealt);
  
  // Emit defeat event for reward processing
  eventBus.publish("boss:defeated", {
    userId,
    bossId: encounter.bossId,
    damageDealt: encounter.damageDealt,
    won: true,
    rewards: {
      xp: template.rewardType === "XP" ? template.rewardAmount : 0,
      coins: template.rewardType === "COINS" ? template.rewardAmount : 0,
      items: [],
    },
    participants: [userId],
  });
  
  // No next boss unlock in basic version - user needs to wait for next day
}

// ============================================================================
// Timeout Handling
// ============================================================================

export async function handleBasicSoloBossTimeout(encounterId: string): Promise<void> {
  await repository.markEncounterTimeout(encounterId);
  
  // No fear monetization - just a simple timeout
  eventBus.publish("boss:timeout", {
    userId: "system",
    bossId: "basic-solo",
    encounterId,
    damageDealt: 0,
    maxHealth: 0,
    timestamp: Date.now(),
  });
}

// ============================================================================
// Boss Status
// ============================================================================

export async function getBasicSoloBossStatus(userId: string): Promise<{
  hasActiveEncounter: boolean;
  canStartNewEncounter: boolean;
  nextAvailableTime: number | null;
}> {
  const existing = await repository.fetchActiveEncounter(userId);
  
  if (existing) {
    if (existing.expiresAt < Date.now()) {
      await repository.markEncounterTimeout(existing.id);
      return {
        hasActiveEncounter: false,
        canStartNewEncounter: true,
        nextAvailableTime: null,
      };
    }
    
    return {
      hasActiveEncounter: true,
      canStartNewEncounter: false,
      nextAvailableTime: existing.expiresAt,
    };
  }
  
  return {
    hasActiveEncounter: false,
    canStartNewEncounter: true,
    nextAvailableTime: null,
  };
}
