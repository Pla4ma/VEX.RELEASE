/**
 * Focus Tower Investment System
 * Users build a persistent tower, one block per session
 * Higher towers grant permanent bonuses
 * Churn = abandon tower progress (powerful retention anchor)
 */

import { eventBus } from '../../events';
import * as Sentry from '@sentry/react-native';
import { z } from 'zod';

// ============================================================================
// Schemas
// ============================================================================

export const TowerBlockSchema = z.object({
  id: z.string().uuid(),
  tier: z.number().int().min(1),
  blockNumber: z.number().int().min(1),
  sessionId: z.string().uuid(),
  earnedAt: z.number(),
  bonusType: z.enum(['XP_BOOST', 'STREAK_RESISTANCE', 'ENERGY_REGEN', 'BOSS_DAMAGE', 'FOCUS_DURATION']),
  bonusValue: z.number(),
  isSpecial: z.boolean().default(false), // Milestone blocks
});

export const FocusTowerSchema = z.object({
  userId: z.string().uuid(),
  currentTier: z.number().int().min(1).default(1),
  totalBlocks: z.number().int().min(0).default(0),
  blocksThisTier: z.number().int().min(0).default(0),
  maxBlocksPerTier: z.number().int().default(10),
  totalHeight: z.number().default(0), // Visual height units
  towerName: z.string().default('Focus Tower'),
  lastBlockEarnedAt: z.number().nullable(),
  totalBonuses: z.object({
    xpBoostPercent: z.number().default(0),
    streakResistanceHours: z.number().default(0),
    energyRegenBonus: z.number().default(0),
    bossDamageBonus: z.number().default(0),
    focusDurationBonus: z.number().default(0),
  }),
  achievementsUnlocked: z.array(z.string()).default([]),
});

// ============================================================================
// Tower Configuration
// ============================================================================

const TIER_CONFIG = [
  { tier: 1, name: 'Foundation', maxBlocks: 10, bonusType: 'XP_BOOST', bonusPerBlock: 2, color: '#795548' },
  { tier: 2, name: 'Apprentice', maxBlocks: 10, bonusType: 'STREAK_RESISTANCE', bonusPerBlock: 0.5, color: '#607D8B' },
  { tier: 3, name: 'Journeyman', maxBlocks: 10, bonusType: 'ENERGY_REGEN', bonusPerBlock: 1, color: '#009688' },
  { tier: 4, name: 'Expert', maxBlocks: 10, bonusType: 'BOSS_DAMAGE', bonusPerBlock: 3, color: '#3F51B5' },
  { tier: 5, name: 'Master', maxBlocks: 10, bonusType: 'FOCUS_DURATION', bonusPerBlock: 5, color: '#9C27B0' },
  { tier: 6, name: 'Grandmaster', maxBlocks: 10, bonusType: 'XP_BOOST', bonusPerBlock: 5, color: '#FF9800' },
  { tier: 7, name: 'Legend', maxBlocks: 20, bonusType: 'STREAK_RESISTANCE', bonusPerBlock: 1, color: '#F44336' },
  { tier: 8, name: 'Mythic', maxBlocks: 50, bonusType: 'ENERGY_REGEN', bonusPerBlock: 2, color: '#E91E63' },
];

const MILESTONE_BLOCKS = [10, 25, 50, 100, 250, 500, 1000];

// ============================================================================
// Types
// ============================================================================

export type TowerBlock = z.infer<typeof TowerBlockSchema>;
export type FocusTower = z.infer<typeof FocusTowerSchema>;

// ============================================================================
// Tower Progression
// ============================================================================

export function addTowerBlock(
  tower: FocusTower,
  sessionId: string,
  sessionQuality: number, // 0-100
  now: number = Date.now(),
): {
  updatedTower: FocusTower;
  newBlock: TowerBlock;
  tierUp: boolean;
  milestoneReached: number | null;
  totalBonuses: FocusTower['totalBonuses'];
} {
  const tierConfig = TIER_CONFIG[tower.currentTier - 1];

  // Determine if special block (milestone or quality)
  const isMilestone = MILESTONE_BLOCKS.includes(tower.totalBlocks + 1);
  const isHighQuality = sessionQuality >= 90;
  const isSpecial = isMilestone || isHighQuality;

  // Calculate bonus value
  let bonusValue = tierConfig.bonusPerBlock;
  if (isHighQuality) {
    bonusValue *= 1.5;
  } // 50% bonus for quality sessions

  // Create block
  const newBlock: TowerBlock = {
    id: crypto.randomUUID(),
    tier: tower.currentTier,
    blockNumber: tower.blocksThisTier + 1,
    sessionId,
    earnedAt: now,
    bonusType: tierConfig.bonusType as TowerBlock['bonusType'],
    bonusValue: Math.round(bonusValue * 10) / 10,
    isSpecial,
  };

  // Update tower state
  const newBlocksThisTier = tower.blocksThisTier + 1;
  const tierUp = newBlocksThisTier >= tierConfig.maxBlocks;
  const newTier = tierUp ? tower.currentTier + 1 : tower.currentTier;
  const newBlocksThisTierAfter = tierUp ? 0 : newBlocksThisTier;
  const newTotalBlocks = tower.totalBlocks + 1;

  // Calculate milestone
  const milestoneReached = isMilestone ? newTotalBlocks : null;

  // Calculate total bonuses
  const totalBonuses = calculateTotalBonuses(tower, newBlock);

  // Track achievements
  const newAchievements = [...tower.achievementsUnlocked];
  if (milestoneReached && milestoneReached === 100) {
    newAchievements.push('tower_100_blocks');
  }
  if (newTier > tower.currentTier) {
    newAchievements.push(`tower_tier_${newTier}`);
  }

  const updatedTower: FocusTower = {
    ...tower,
    currentTier: newTier,
    totalBlocks: newTotalBlocks,
    blocksThisTier: newBlocksThisTierAfter,
    maxBlocksPerTier: TIER_CONFIG[newTier - 1]?.maxBlocks || 50,
    totalHeight: tower.totalHeight + (isSpecial ? 1.5 : 1),
    lastBlockEarnedAt: now,
    totalBonuses,
    achievementsUnlocked: newAchievements,
  };

  // Publish events
  eventBus.publish('focus_tower:block_added', {
    userId: tower.userId,
    block: newBlock,
    newTotal: newTotalBlocks,
    tierUp,
    milestoneReached: milestoneReached || undefined,
  });

  if (tierUp) {
    eventBus.publish('focus_tower:tier_up', {
      userId: tower.userId,
      newTier,
      tierName: TIER_CONFIG[newTier - 1]?.name || 'Unknown',
    });
  }

  if (milestoneReached) {
    eventBus.publish('focus_tower:milestone', {
      userId: tower.userId,
      milestone: milestoneReached,
      totalBlocks: newTotalBlocks,
    });
  }

  return {
    updatedTower,
    newBlock,
    tierUp,
    milestoneReached,
    totalBonuses,
  };
}

function calculateTotalBonuses(tower: FocusTower, newBlock: TowerBlock): FocusTower['totalBonuses'] {
  const bonuses = { ...tower.totalBonuses };

  switch (newBlock.bonusType) {
    case 'XP_BOOST':
      bonuses.xpBoostPercent += newBlock.bonusValue;
      break;
    case 'STREAK_RESISTANCE':
      bonuses.streakResistanceHours += newBlock.bonusValue;
      break;
    case 'ENERGY_REGEN':
      bonuses.energyRegenBonus += newBlock.bonusValue;
      break;
    case 'BOSS_DAMAGE':
      bonuses.bossDamageBonus += newBlock.bonusValue;
      break;
    case 'FOCUS_DURATION':
      bonuses.focusDurationBonus += newBlock.bonusValue;
      break;
  }

  return bonuses;
}

// ============================================================================
// Churn Risk Calculation
// ============================================================================

export function calculateTowerChurnRisk(
  tower: FocusTower,
  daysInactive: number,
): {
  riskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  daysUntilDecay: number;
  decayWarning: string;
  wouldLose: string;
} {
  // Tower decay starts after 3 days of inactivity
  const decayStartDays = 3;
  const criticalDecayDays = 7;

  if (daysInactive < decayStartDays) {
    return {
      riskLevel: 'NONE',
      daysUntilDecay: decayStartDays - daysInactive,
      decayWarning: '',
      wouldLose: '',
    };
  }

  if (daysInactive < criticalDecayDays) {
    const daysToCritical = criticalDecayDays - daysInactive;
    return {
      riskLevel: daysInactive > 5 ? 'MEDIUM' : 'LOW',
      daysUntilDecay: daysToCritical,
      decayWarning: `⚠️ Your tower weakens in ${daysToCritical} days!`,
      wouldLose: 'Recent progress bonus',
    };
  }

  // Critical - tower starts losing blocks
  const blocksLost = Math.min(
    Math.floor((daysInactive - criticalDecayDays) / 2),
    Math.floor(tower.totalBlocks * 0.1), // Max 10% loss
  );

  return {
    riskLevel: 'CRITICAL',
    daysUntilDecay: 0,
    decayWarning: `🚨 CRITICAL: You've lost ${blocksLost} blocks from inactivity!`,
    wouldLose: `${blocksLost} tower blocks and their bonuses`,
  };
}

// ============================================================================
// Tower Decay (for inactive users)
// ============================================================================

export function applyTowerDecay(
  tower: FocusTower,
  daysInactive: number,
): {
  updatedTower: FocusTower;
  blocksLost: number;
  bonusesLost: Partial<FocusTower['totalBonuses']>;
  canRestore: boolean;
  restoreCost: number; // Gems to restore
} {
  const decayStartDays = 7;

  if (daysInactive < decayStartDays) {
    return {
      updatedTower: tower,
      blocksLost: 0,
      bonusesLost: {},
      canRestore: false,
      restoreCost: 0,
    };
  }

  // Calculate blocks to lose (1 block per 2 days after threshold)
  const blocksLost = Math.min(
    Math.floor((daysInactive - decayStartDays) / 2),
    Math.max(1, Math.floor(tower.totalBlocks * 0.05)), // Min 1, max 5% per decay cycle
  );

  // Remove last N blocks
  const newTotalBlocks = Math.max(0, tower.totalBlocks - blocksLost);
  const newHeight = Math.max(0, tower.totalHeight - blocksLost * 0.8);

  // Recalculate bonuses (simplified - in real implementation, track block history)
  const decayFactor = newTotalBlocks / tower.totalBlocks;
  const bonusesLost: Partial<FocusTower['totalBonuses']> = {};

  const updatedTower: FocusTower = {
    ...tower,
    totalBlocks: newTotalBlocks,
    totalHeight: newHeight,
    totalBonuses: {
      xpBoostPercent: Math.floor(tower.totalBonuses.xpBoostPercent * decayFactor),
      streakResistanceHours: Math.floor(tower.totalBonuses.streakResistanceHours * decayFactor * 10) / 10,
      energyRegenBonus: Math.floor(tower.totalBonuses.energyRegenBonus * decayFactor * 10) / 10,
      bossDamageBonus: Math.floor(tower.totalBonuses.bossDamageBonus * decayFactor * 10) / 10,
      focusDurationBonus: Math.floor(tower.totalBonuses.focusDurationBonus * decayFactor * 10) / 10,
    },
  };

  const restoreCost = blocksLost * 25; // 25 gems per block to restore

  // Publish event
  eventBus.publish('focus_tower:decay', {
    userId: tower.userId,
    daysInactive,
    decayAmount: blocksLost,
  });

  return {
    updatedTower,
    blocksLost,
    bonusesLost,
    canRestore: true,
    restoreCost,
  };
}

// ============================================================================
// Tower Restoration (pay gems to recover lost blocks)
// ============================================================================

export function restoreTowerBlocks(
  tower: FocusTower,
  blocksToRestore: number,
  gemsSpent: number,
): {
  success: boolean;
  updatedTower: FocusTower;
  blocksRestored: number;
  error?: string;
} {
  const maxRestorable = Math.min(blocksToRestore, tower.totalBlocks); // Can't restore more than current
  const cost = maxRestorable * 25;

  if (gemsSpent < cost) {
    return {
      success: false,
      updatedTower: tower,
      blocksRestored: 0,
      error: `Need ${cost} gems to restore ${maxRestorable} blocks`,
    };
  }

  // In a real implementation, we'd need the block history to restore exact bonuses
  // For now, approximate the restoration
  const restoredBonuses = {
    xpBoostPercent: Math.floor(tower.totalBonuses.xpBoostPercent * (maxRestorable / tower.totalBlocks + 1)),
    streakResistanceHours: tower.totalBonuses.streakResistanceHours + maxRestorable * 0.5,
    energyRegenBonus: tower.totalBonuses.energyRegenBonus + maxRestorable * 1,
    bossDamageBonus: tower.totalBonuses.bossDamageBonus + maxRestorable * 3,
    focusDurationBonus: tower.totalBonuses.focusDurationBonus + maxRestorable * 5,
  };

  const updatedTower: FocusTower = {
    ...tower,
    totalBlocks: tower.totalBlocks + maxRestorable,
    totalHeight: tower.totalHeight + maxRestorable,
    totalBonuses: restoredBonuses,
  };

  (eventBus as any).publish('focus_tower:restored', {
    userId: tower.userId,
    blocksRestored: maxRestorable,
    gemsSpent: cost,
  });

  return {
    success: true,
    updatedTower,
    blocksRestored: maxRestorable,
  };
}

// ============================================================================
// UI Helpers
// ============================================================================

export function getTowerDisplay(tower: FocusTower): {
  height: string;
  tierName: string;
  tierColor: string;
  nextMilestone: number;
  progressToMilestone: number;
  totalBonusesText: string;
} {
  const tierConfig = TIER_CONFIG[tower.currentTier - 1] || TIER_CONFIG[TIER_CONFIG.length - 1];

  // Find next milestone
  const nextMilestone = MILESTONE_BLOCKS.find((m) => m > tower.totalBlocks) || 1000;
  const progressToMilestone = Math.floor(((tower.totalBlocks % nextMilestone) / nextMilestone) * 100);

  // Format bonuses
  const bonuses = [];
  if (tower.totalBonuses.xpBoostPercent > 0) {
    bonuses.push(`+${tower.totalBonuses.xpBoostPercent}% XP`);
  }
  if (tower.totalBonuses.streakResistanceHours > 0) {
    bonuses.push(`+${tower.totalBonuses.streakResistanceHours}h streak buffer`);
  }
  if (tower.totalBonuses.bossDamageBonus > 0) {
    bonuses.push(`+${tower.totalBonuses.bossDamageBonus}% boss damage`);
  }

  return {
    height: `${Math.floor(tower.totalHeight)}m`,
    tierName: tierConfig.name,
    tierColor: tierConfig.color,
    nextMilestone,
    progressToMilestone,
    totalBonusesText: bonuses.join(' • ') || 'Build your tower for bonuses!',
  };
}

export function formatTowerBlockVisual(block: TowerBlock): {
  icon: string;
  color: string;
  glow: boolean;
} {
  const tierConfig = TIER_CONFIG[block.tier - 1];

  return {
    icon: block.isSpecial ? '⭐' : '🧱',
    color: tierConfig?.color || '#757575',
    glow: block.isSpecial,
  };
}

export function getTowerHeightComparison(tower: FocusTower): string {
  const heights = [
    { blocks: 0, label: 'Foundation' },
    { blocks: 10, label: 'House' },
    { blocks: 50, label: 'Tower' },
    { blocks: 100, label: 'Skyscraper' },
    { blocks: 250, label: 'Mountain' },
    { blocks: 500, label: 'Cloud City' },
    { blocks: 1000, label: 'Space Station' },
  ];

  const current = heights.findLast((h) => tower.totalBlocks >= h.blocks) || heights[0];
  const next = heights.find((h) => tower.totalBlocks < h.blocks);

  if (!next) {
    return `🏆 ${current.label} - Maximum Height!`;
  }

  const remaining = next.blocks - tower.totalBlocks;
  return `🏗️ ${current.label} → ${next.label} (${remaining} blocks to go)`;
}

// ============================================================================
// Analytics
// ============================================================================

export function trackTowerProgress(tower: FocusTower, source: string): void {
  Sentry.addBreadcrumb({
    category: 'focus_tower',
    message: `Tower progress: ${tower.totalBlocks} blocks, tier ${tower.currentTier}`,
    data: {
      userId: tower.userId,
      totalBlocks: tower.totalBlocks,
      currentTier: tower.currentTier,
      totalBonuses: tower.totalBonuses,
      source,
    },
  });
}
