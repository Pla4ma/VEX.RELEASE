import { eventBus } from "../../events";
import * as repository from "./repository";
import { applyBossDamageRules } from "./damage-rules";
import { CreateEncounterInputSchema, ApplyDamageInputSchema, CalculateDamageInputSchema, BossEncounterStatusSchema, type BossTemplate, type BossEncounter, type BossEncounterSummary, type BossDamageResult, type BossDefeatResult, type BossDefeatSummary, type CreateEncounterInput, type ApplyDamageInput, type CalculateDamageInput } from "./schemas";


export function calculateScaledHealth(baseHealth: number, healthScaling: number, userLevel: number, squadSize: number = 1): number {
  // Scale health based on user level
  const levelMultiplier = 1 + (userLevel - 1) * healthScaling;

  // Scale health for squad encounters
  const squadMultiplier = 1 + (squadSize - 1) * 0.2; // +20% per additional member

  return Math.floor(baseHealth * levelMultiplier * squadMultiplier);
}

export async function canUserFightBoss(userId: string, bossId: string, userLevel: number): Promise<{ allowed: boolean; reason: string | null }> {
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

export async function createEncounter(input: CreateEncounterInput): Promise<BossEncounter> {
  const validated = CreateEncounterInputSchema.parse(input);

  const template = await repository.fetchBossTemplate(validated.bossId);
  if (!template) {
    throw new Error(`Boss template not found: ${validated.bossId}`);
  }

  // Check if user can fight this boss
  const { allowed, reason } = await canUserFightBoss(validated.userId, validated.bossId, validated.userLevel);

  if (!allowed) {
    throw new Error(reason || 'Cannot fight this boss');
  }

  // Calculate scaled health
  const maxHealth = calculateScaledHealth(
    template.baseHealth,
    template.healthScaling,
    validated.userLevel,
    validated.squadId ? 2 : 1, // Assume squad of 2 for now, should fetch actual size
  );

  const encounter = await repository.createEncounter(validated.bossId, validated.squadId ? null : validated.userId, validated.squadId || null, maxHealth, template.timeLimit);

  return encounter;
}

export async function getActiveEncounter(userId: string, squadId?: string): Promise<BossEncounterSummary | null> {
  const encounter = await repository.fetchActiveEncounter(userId, squadId);

  if (!encounter) {
    return null;
  }

  // Check for timeout
  if (encounter.status === 'ACTIVE' && encounter.expiresAt < Date.now()) {
    await handleBossTimeout(encounter.id);
    return null;
  }

  const template = await repository.fetchBossTemplate(encounter.bossId);
  if (!template) {
    return null;
  }

  const timeRemaining = Math.max(0, encounter.expiresAt - Date.now());
  const percentHealth = Math.floor((encounter.healthRemaining / encounter.maxHealth) * 100);

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

export function calculateDamage(input: CalculateDamageInput): number {
  const validated = CalculateDamageInputSchema.parse(input);

  const durationMinutes = validated.sessionDuration / 60;
  const qualityMultiplier = Math.max(0, Math.min(1, validated.sessionQuality / 100));
  const streakMultiplier = validated.streakDays >= 7 ? 1.5 : 1;
  const baseDamage = Math.max(1, Math.round(durationMinutes * qualityMultiplier * streakMultiplier * validated.squadMultiplier));

  return applyBossDamageRules(baseDamage, validated);
}

export async function applyDamage(input: ApplyDamageInput): Promise<BossDamageResult> {
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

  const updated = await repository.updateEncounterHealth(validated.encounterId, newHealth, newDamageDealt, validated.sessionId);

  const percentComplete = Math.floor((newDamageDealt / encounter.maxHealth) * 100);

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