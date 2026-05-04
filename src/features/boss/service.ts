/**
 * Boss Service
 * Business logic for boss encounters, damage, and defeat
 *
 * Dependencies:
 * - Sessions (damage applied during sessions)
 * - Progression (level gates boss unlocks)
 * - Rewards (boss defeat rewards)
 * - Squads (squad boss encounters)
 */

import { eventBus } from '../../events';
import * as repository from './repository';
import { applyBossDamageRules } from './damage-rules';
import {
  CreateEncounterInputSchema,
  ApplyDamageInputSchema,
  CalculateDamageInputSchema,
  BossEncounterStatusSchema,
  type BossTemplate,
  type BossEncounter,
  type BossEncounterSummary,
  type BossDamageResult,
  type BossDefeatResult,
  type BossDefeatSummary,
  type CreateEncounterInput,
  type ApplyDamageInput,
  type CalculateDamageInput,
} from './schemas';

// ============================================================================
// Boss Health Scaling
// ============================================================================

export function calculateScaledHealth(
  baseHealth: number,
  healthScaling: number,
  userLevel: number,
  squadSize: number = 1
): number {
  // Scale health based on user level
  const levelMultiplier = 1 + (userLevel - 1) * healthScaling;

  // Scale health for squad encounters
  const squadMultiplier = 1 + (squadSize - 1) * 0.2; // +20% per additional member

  return Math.floor(baseHealth * levelMultiplier * squadMultiplier);
}

// ============================================================================
// Boss Unlock Logic
// ============================================================================

export async function canUserFightBoss(
  userId: string,
  bossId: string,
  userLevel: number
): Promise<{ allowed: boolean; reason: string | null }> {
  const template = await repository.fetchBossTemplate(bossId);

  if (!template) {
    return { allowed: false, reason: 'Boss not found' };
  }

  // Check level requirement
  if (userLevel < template.minLevel) {
    return {
      allowed: false,
      reason: `Requires level ${template.minLevel}`,
    };
  }

  // Check previous boss defeat requirement
  if (template.previousBossId) {
    const hasDefeatedPrevious = await repository.hasDefeatedBoss(userId, template.previousBossId);
    if (!hasDefeatedPrevious) {
      return {
        allowed: false,
        reason: 'Must defeat previous boss first',
      };
    }
  }

  // Check cooldown
  const onCooldown = await repository.isOnCooldown(userId, bossId);
  if (onCooldown) {
    return {
      allowed: false,
      reason: 'Boss on cooldown',
    };
  }

  return { allowed: true, reason: null };
}

// ============================================================================
// Encounter Management
// ============================================================================

export async function createEncounter(
  input: CreateEncounterInput
): Promise<BossEncounter> {
  const validated = CreateEncounterInputSchema.parse(input);

  const template = await repository.fetchBossTemplate(validated.bossId);
  if (!template) {
    throw new Error(`Boss template not found: ${validated.bossId}`);
  }

  // Check if user can fight this boss
  const { allowed, reason } = await canUserFightBoss(
    validated.userId,
    validated.bossId,
    validated.userLevel
  );

  if (!allowed) {
    throw new Error(reason || 'Cannot fight this boss');
  }

  // Calculate scaled health
  const maxHealth = calculateScaledHealth(
    template.baseHealth,
    template.healthScaling,
    validated.userLevel,
    validated.squadId ? 2 : 1 // Assume squad of 2 for now, should fetch actual size
  );

  const encounter = await repository.createEncounter(
    validated.bossId,
    validated.squadId ? null : validated.userId,
    validated.squadId || null,
    maxHealth,
    template.timeLimit
  );

  return encounter;
}

export async function getActiveEncounter(
  userId: string,
  squadId?: string
): Promise<BossEncounterSummary | null> {
  const encounter = await repository.fetchActiveEncounter(userId, squadId);

  if (!encounter) {return null;}

  // Check for timeout
  if (encounter.status === 'ACTIVE' && encounter.expiresAt < Date.now()) {
    await handleBossTimeout(encounter.id);
    return null;
  }

  const template = await repository.fetchBossTemplate(encounter.bossId);
  if (!template) {return null;}

  const timeRemaining = Math.max(0, encounter.expiresAt - Date.now());
  const percentHealth = Math.floor(
    (encounter.healthRemaining / encounter.maxHealth) * 100
  );

  return {
    id: encounter.id,
    bossId: encounter.bossId,
    bossName: template.name,
    bossAvatarUrl: template.avatarUrl,
    healthRemaining: encounter.healthRemaining,
    maxHealth: encounter.maxHealth,
    percentHealthRemaining: percentHealth,
    status: encounter.status,
    expiresAt: encounter.expiresAt,
    timeRemaining,
  };
}

// ============================================================================
// Damage Calculation and Application
// ============================================================================

export function calculateDamage(input: CalculateDamageInput): number {
  const validated = CalculateDamageInputSchema.parse(input);

  const durationMinutes = validated.sessionDuration / 60;
  const qualityMultiplier = Math.max(0, Math.min(1, validated.sessionQuality / 100));
  const streakMultiplier = validated.streakDays >= 7 ? 1.5 : 1;
  const baseDamage = Math.max(
    1,
    Math.round(durationMinutes * qualityMultiplier * streakMultiplier * validated.squadMultiplier)
  );

  return applyBossDamageRules(baseDamage, validated);
}

export async function applyDamage(
  input: ApplyDamageInput
): Promise<BossDamageResult> {
  const validated = ApplyDamageInputSchema.parse(input);

  const encounter = await repository.fetchEncounterById(validated.encounterId);
  if (!encounter) {
    throw new Error('No active encounter found');
  }

  if (encounter.status !== 'ACTIVE') {
    throw new Error(`Cannot damage boss in ${encounter.status} state`);
  }

  // Check for timeout
  if (encounter.expiresAt < Date.now()) {
    await handleBossTimeout(encounter.id);
    throw new Error('Boss encounter timed out');
  }

  const newHealth = Math.max(0, encounter.healthRemaining - validated.damage);
  const newDamageDealt = encounter.damageDealt + validated.damage;
  const isDefeated = newHealth === 0;

  const updated = await repository.updateEncounterHealth(
    validated.encounterId,
    newHealth,
    newDamageDealt,
    validated.sessionId
  );

  const percentComplete = Math.floor(
    (newDamageDealt / encounter.maxHealth) * 100
  );

  if (isDefeated) {
    await handleBossDefeat(validated.encounterId);
  }

  return {
    damageDealt: validated.damage,
    healthRemaining: newHealth,
    maxHealth: encounter.maxHealth,
    isDefeated,
    percentComplete,
    criticalHit: false, // Critical is calculated before this call
  };
}

// ============================================================================
// Boss Defeat Handling
// ============================================================================

async function handleBossDefeat(encounterId: string): Promise<BossDefeatResult> {
  const encounter = await repository.markEncounterDefeated(encounterId);
  const template = await repository.fetchBossTemplate(encounter.bossId);

  if (!template) {
    throw new Error(`Boss template not found: ${encounter.bossId}`);
  }

  // Get contributors
  const contributors = encounter.userId
    ? [encounter.userId]
    : []; // For squad encounters, fetch all members

  // Create rewards for each contributor
  const rewards = contributors.map((userId) => ({
    userId,
    type: template.rewardType,
    amount: template.rewardAmount,
    itemId: template.rewardItemId,
  }));

  // Record defeat for each contributor
  for (const userId of contributors) {
    await repository.recordBossDefeat(userId, encounter.bossId, encounterId, encounter.damageDealt);
  }

  // Unlock next boss for contributors
  let nextBossId: string | null = null;
  const templates = await repository.fetchBossTemplates();
  const currentIndex = templates.findIndex((t) => t.id === encounter.bossId);
  if (currentIndex >= 0 && currentIndex < templates.length - 1) {
    nextBossId = templates[currentIndex + 1].id;
  }

  const result = {
    encounterId,
    bossId: encounter.bossId,
    defeatedAt: Date.now(),
    contributors,
    rewards,
    unlockedNextBoss: nextBossId,
  };

  eventBus.publish('boss:defeated', {
    userId: encounter.userId ?? contributors[0] ?? '',
    bossId: encounter.bossId,
    damageDealt: encounter.damageDealt,
    won: true,
    rewards: {
      xp: template.rewardType === 'XP' ? template.rewardAmount : 0,
      coins: template.rewardType === 'COINS' ? template.rewardAmount : 0,
      items: template.rewardType === 'ITEM' && template.rewardItemId ? [template.rewardItemId] : [],
    },
    participants: contributors,
  });

  return result;
}

async function handleBossTimeout(encounterId: string): Promise<void> {
  await repository.markEncounterTimeout(encounterId);
}

// ============================================================================
// Boss Defeat Summary
// ============================================================================

export async function getDefeatSummary(
  encounterId: string
): Promise<BossDefeatSummary | null> {
  // This would fetch detailed defeat information
  // For now, return null as we need to implement the defeat history query
  return null;
}

// ============================================================================
// Boss Templates and Listing
// ============================================================================

export async function getAvailableBosses(userId: string, userLevel: number): Promise<
  Array<{
    template: BossTemplate;
    unlocked: boolean;
    lockedReason: string | null;
    defeated: boolean;
  }>
> {
  const templates = await repository.fetchBossTemplates();

  const results = await Promise.all(
    templates.map(async (template) => {
      const { allowed, reason } = await canUserFightBoss(userId, template.id, userLevel);
      const defeated = await repository.hasDefeatedBoss(userId, template.id);

      return {
        template,
        unlocked: allowed,
        lockedReason: reason,
        defeated,
      };
    })
  );

  return results;
}
