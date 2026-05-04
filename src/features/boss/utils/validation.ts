/**
 * Boss Validation Utilities
 *
 * Validates boss balancing, damage calculations, and defeat conditions.
 *
 * @phase 11 - Deepening: Boss balancing validation
 */

import { z } from 'zod';
import { createDebugger } from '../../../utils/debug';
import { eventBus } from '../../../events';

const debug = createDebugger('boss:validation');

// ============================================================================
// Schemas
// ============================================================================

export const BossDifficultySchema = z.enum(['EASY', 'MEDIUM', 'HARD', 'NIGHTMARE']);

export const BossAttackSchema = z.object({
  playerId: z.string(),
  damage: z.number().min(0),
  timestamp: z.number(),
  attackType: z.enum(['NORMAL', 'CRITICAL', 'SPECIAL']),
  sessionDuration: z.number().min(0), // seconds
});

export type BossAttack = z.infer<typeof BossAttackSchema>;

// ============================================================================
// Damage Validation
// ============================================================================

export interface DamageValidationResult {
  valid: boolean;
  errors: string[];
  suspicious: boolean;
  expectedDamageRange?: { min: number; max: number };
}

/**
 * Validate boss attack damage
 */
export function validateBossAttack(
  attack: BossAttack,
  boss: {
    id: string;
    difficulty: string;
    maxHealth: number;
    expectedDps: number; // damage per second
  },
  playerHistory: {
    avgDamage: number;
    avgSessionDuration: number;
    previousAttacks: BossAttack[];
  }
): DamageValidationResult {
  const result: DamageValidationResult = {
    valid: true,
    errors: [],
    suspicious: false,
  };

  // Calculate expected damage based on session duration
  const expectedDamage = attack.sessionDuration * boss.expectedDps;
  const deviation = attack.damage / Math.max(expectedDamage, 1);

  // Check 1: Impossible damage
  const MAX_DEVIATION = 3; // 3x expected damage max
  if (deviation > MAX_DEVIATION) {
    result.errors.push(`Suspicious damage: ${attack.damage} (${deviation.toFixed(1)}x expected)`);
    result.suspicious = true;
    result.expectedDamageRange = {
      min: expectedDamage * 0.5,
      max: expectedDamage * MAX_DEVIATION,
    };
  }

  // Check 2: Zero damage with long session
  if (attack.damage === 0 && attack.sessionDuration > 300) {
    result.errors.push('Zero damage despite long session');
    result.valid = false;
  }

  // Check 3: Compare to player history
  if (playerHistory.avgDamage > 0) {
    const historyRatio = attack.damage / playerHistory.avgDamage;
    if (historyRatio > 5) {
      result.errors.push(`Damage ${historyRatio.toFixed(1)}x player's average`);
      result.suspicious = true;
    }
  }

  // Check 4: Session duration consistency
  if (attack.sessionDuration < 60) {
    result.errors.push('Session too short for meaningful damage');
  }

  // Check 5: Rapid attacks (possible automation)
  if (playerHistory.previousAttacks.length > 0) {
    const lastAttack = playerHistory.previousAttacks[playerHistory.previousAttacks.length - 1];
    const timeSinceLast = attack.timestamp - lastAttack.timestamp;

    if (timeSinceLast < 10000) { // 10 seconds
      result.errors.push('Attacking too frequently');
      result.suspicious = true;
    }
  }

  // Check 6: Critical hit rate
  const recentAttacks = playerHistory.previousAttacks.slice(-20);
  const critCount = recentAttacks.filter(a => a.attackType === 'CRITICAL').length;
  const critRate = critCount / recentAttacks.length;

  if (recentAttacks.length >= 10 && critRate > 0.5) {
    result.errors.push(`Suspicious crit rate: ${(critRate * 100).toFixed(0)}%`);
    result.suspicious = true;
  }

  if (result.suspicious) {
    eventBus.publish('analytics:track', {
      event: 'boss_suspicious_attack',
      properties: {
        bossId: boss.id,
        playerId: attack.playerId,
        damage: attack.damage,
        deviation,
      },
    });
  }

  return result;
}

// ============================================================================
// Boss Balancing
// ============================================================================

export interface BossBalanceMetrics {
  avgDefeatTime: number; // seconds
  defeatCount: number;
  attemptCount: number;
  avgPlayerCount: number;
  healEfficiency: number;
}

/**
 * Analyze boss difficulty and suggest balancing
 */
export function analyzeBossBalance(
  metrics: BossBalanceMetrics,
  boss: {
    id: string;
    targetDuration: number;
    minPlayers: number;
    maxPlayers: number;
  }
): { balanced: boolean; recommendations: string[]; healthAdjustment: number } {
  const recommendations: string[] = [];
  let healthAdjustment = 0;

  const completionRate = metrics.defeatCount / Math.max(metrics.attemptCount, 1);

  // Check defeat time
  const timeRatio = metrics.avgDefeatTime / boss.targetDuration;
  if (timeRatio < 0.5) {
    recommendations.push('Boss defeated too quickly - increase health');
    healthAdjustment += 0.3;
  } else if (timeRatio > 2) {
    recommendations.push('Boss takes too long - decrease health');
    healthAdjustment -= 0.3;
  }

  // Check completion rate
  if (completionRate < 0.1) {
    recommendations.push('Very low completion rate - consider nerfing');
    healthAdjustment -= 0.2;
  } else if (completionRate > 0.9) {
    recommendations.push('Too easy - consider buffing');
    healthAdjustment += 0.2;
  }

  // Check player count
  if (metrics.avgPlayerCount < boss.minPlayers) {
    recommendations.push('Not enough players engaging');
  }

  // Check heal efficiency
  if (metrics.healEfficiency < 0.3) {
    recommendations.push('Healing not effective - review heal mechanics');
  }

  return {
    balanced: recommendations.length === 0,
    recommendations,
    healthAdjustment,
  };
}

// ============================================================================
// Defeat Validation
// ============================================================================

export function validateBossDefeat(
  bossId: string,
  participants: { userId: string; damage: number; joinTime: number }[],
  defeatTime: number,
  bossStartTime: number
): { valid: boolean; error?: string; contributionPercentages: Record<string, number> } {
  // Calculate total damage
  const totalDamage = participants.reduce((sum, p) => sum + p.damage, 0);
  const contributionPercentages: Record<string, number> = {};

  participants.forEach(p => {
    contributionPercentages[p.userId] = p.damage / totalDamage;
  });

  // Check participation duration
  const duration = defeatTime - bossStartTime;
  for (const participant of participants) {
    const participationTime = defeatTime - participant.joinTime;
    const minParticipation = duration * 0.1; // Must participate 10% of time

    if (participationTime < minParticipation) {
      return {
        valid: false,
        error: 'Participant joined too late for credit',
        contributionPercentages,
      };
    }
  }

  // Check damage contribution minimum (1%)
  for (const [userId, percentage] of Object.entries(contributionPercentages)) {
    if (percentage < 0.01) {
      return {
        valid: false,
        error: `User ${userId} contributed less than 1% damage`,
        contributionPercentages,
      };
    }
  }

  return { valid: true, contributionPercentages };
}

// ============================================================================
// Export
// ============================================================================

export const BossValidation = {
  validateBossAttack,
  analyzeBossBalance,
  validateBossDefeat,
  BossAttackSchema,
};

export default BossValidation;
