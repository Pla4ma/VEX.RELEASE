/**
 * Basic Solo Boss Service
 * Simplified boss system for PHASE 8 launch scope.
 *
 * Dependencies:
 * - repository: persistence layer for boss encounters
 * - events: event bus for cross-system communication
 * - analytics: Sentry breadcrumbs and tracking
 * - constants/calculator: core logic
 */

import { eventBus } from '../../events';
import * as repository from './repository';
import { trackBossError, trackBossDamageApplied } from './analytics';
import { BASIC_BOSS_CONFIG } from './basic-solo-boss-constants';
import { calculateBasicSoloBossDamage } from './basic-solo-boss-calculator';
import { type BossEncounterSummary, type BossDamageResult } from './schemas';

export async function getOrCreateBasicSoloBossEncounter(userId: string): Promise<BossEncounterSummary | null> {
  try {
    const existing = await repository.fetchActiveEncounter(userId);
    if (existing) {
      if (existing.expiresAt < Date.now()) {
        await repository.markEncounterTimeout(existing.id);
        return null;
      }
      const template = await repository.fetchBossTemplate(existing.bossId);
      if (!template) {return null;}
      const timeRemaining = Math.max(0, existing.expiresAt - Date.now());
      const percentHealth = Math.floor((existing.healthRemaining / existing.maxHealth) * 100);
      return {
        id: existing.id, bossId: existing.bossId, bossName: template.name,
        bossAvatarUrl: template.avatarUrl, healthRemaining: existing.healthRemaining,
        maxHealth: existing.maxHealth, percentHealthRemaining: percentHealth,
        status: existing.status, expiresAt: existing.expiresAt, timeRemaining,
      };
    }
    return await createBasicSoloBossEncounter(userId);
  } catch (error) {
    trackBossError('getOrCreateBasicSoloBossEncounter', error, userId);
    return null;
  }
}

async function createBasicSoloBossEncounter(userId: string): Promise<BossEncounterSummary | null> {
  let template = await repository.fetchBossTemplate(BASIC_BOSS_CONFIG.soloBossId);
  if (!template) {
    template = {
      id: BASIC_BOSS_CONFIG.soloBossId, name: 'Focus Guardian',
      description: 'A guardian that tests your focus consistency',
      avatarUrl: null, tier: 1, baseHealth: BASIC_BOSS_CONFIG.baseHealth,
      healthScaling: 0.1, minLevel: 1, previousBossId: null,
      timeLimit: BASIC_BOSS_CONFIG.timeLimitHours * 3600,
      rewardType: 'XP', rewardAmount: BASIC_BOSS_CONFIG.rewardXp, rewardItemId: null,
    };
  }
  const encounter = await repository.createEncounter(
    template.id, userId, null, template.baseHealth, template.timeLimit
  );
  return {
    id: encounter.id, bossId: encounter.bossId, bossName: template.name,
    bossAvatarUrl: template.avatarUrl, healthRemaining: encounter.healthRemaining,
    maxHealth: encounter.maxHealth, percentHealthRemaining: 100,
    status: encounter.status, expiresAt: encounter.expiresAt,
    timeRemaining: Math.max(0, encounter.expiresAt - Date.now()),
  };
}

export async function applyBasicSoloBossDamage(
  encounterId: string, sessionId: string, damage: number
): Promise<BossDamageResult> {
  const encounter = await repository.fetchEncounterById(encounterId);
  if (!encounter || encounter.status !== 'ACTIVE') {
    throw new Error('No active boss encounter found');
  }
  if (encounter.expiresAt < Date.now()) {
    await repository.markEncounterTimeout(encounterId);
    throw new Error('Boss encounter has expired');
  }
  const newHealth = Math.max(0, encounter.healthRemaining - damage);
  const totalDamageDealt = encounter.damageDealt + damage;
  const isDefeated = newHealth === 0;
  await repository.updateEncounterHealth(encounterId, newHealth, totalDamageDealt, sessionId);
  trackBossDamageApplied(encounterId, damage, newHealth, isDefeated);
  if (isDefeated) {
    await handleBasicSoloBossDefeat(encounterId, encounter.userId!);
  }
  return {
    damageDealt: damage, healthRemaining: newHealth, maxHealth: encounter.maxHealth,
    isDefeated, percentComplete: Math.floor((totalDamageDealt / encounter.maxHealth) * 100),
    criticalHit: false,
  };
}

async function handleBasicSoloBossDefeat(encounterId: string, userId: string): Promise<void> {
  const encounter = await repository.markEncounterDefeated(encounterId);
  const template = await repository.fetchBossTemplate(encounter.bossId);
  if (!template) {throw new Error(`Boss template not found: ${encounter.bossId}`);}
  await repository.recordBossDefeat(userId, encounter.bossId, encounterId, encounter.damageDealt);
  eventBus.publish('boss:defeated', {
    userId, bossId: encounter.bossId, damageDealt: encounter.damageDealt,
    won: true, rewards: {
      xp: template.rewardType === 'XP' ? template.rewardAmount : 0,
      coins: template.rewardType === 'COINS' ? template.rewardAmount : 0,
      items: [],
    },
    participants: [userId],
  });
}

export async function handleBasicSoloBossTimeout(encounterId: string): Promise<void> {
  await repository.markEncounterTimeout(encounterId);
  eventBus.publish('boss:timeout', {
    userId: 'system', bossId: 'basic-solo', encounterId,
    damageDealt: 0, maxHealth: 0, timestamp: Date.now(),
  });
}

export async function getBasicSoloBossStatus(userId: string) {
  const existing = await repository.fetchActiveEncounter(userId);
  if (existing && existing.expiresAt < Date.now()) {
    await repository.markEncounterTimeout(existing.id);
    return { hasActiveEncounter: false, canStartNewEncounter: true, nextAvailableTime: null };
  }
  return {
    hasActiveEncounter: !!existing,
    canStartNewEncounter: !existing,
    nextAvailableTime: existing?.expiresAt ?? null,
  };
}

export { calculateBasicSoloBossDamage };
