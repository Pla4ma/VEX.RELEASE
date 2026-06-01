import * as Sentry from '@sentry/react-native';
import { eventBus } from '../../events';
import {
  TIER_CONFIG,
  MILESTONE_BLOCKS,
  getTierConfig,
} from './tower-constants';
import type { TowerBlock, FocusTower } from './tower-constants';

export type { TowerBlock, FocusTower } from './tower-constants';
export { TowerBlockSchema, FocusTowerSchema } from './tower-constants';

function calculateTotalBonuses(
  tower: FocusTower,
  newBlock: TowerBlock,
): FocusTower['totalBonuses'] {
  const bonuses = { ...tower.totalBonuses };
  switch (newBlock.bonusType) {
    case 'PROGRESS_ACCELERATION':
    case 'XP_BOOST':
      bonuses.progressAcceleration += newBlock.bonusValue;
      break;
    case 'MOMENTUM_RESISTANCE':
    case 'STREAK_RESISTANCE':
      bonuses.momentumResistanceHours += newBlock.bonusValue;
      break;
    case 'ENERGY_REGEN':
      bonuses.energyRegenBonus += newBlock.bonusValue;
      break;
    case 'FOCUS_RESILIENCE':
    case 'BOSS_DAMAGE':
      bonuses.focusResilienceBonus += newBlock.bonusValue;
      break;
    case 'FOCUS_DURATION':
      bonuses.focusDurationBonus += newBlock.bonusValue;
      break;
  }
  return bonuses;
}

export function addTowerBlock(
  tower: FocusTower,
  sessionId: string,
  sessionQuality: number,
  now: number = Date.now(),
): {
  updatedTower: FocusTower;
  newBlock: TowerBlock;
  tierUp: boolean;
  milestoneReached: number | null;
  totalBonuses: FocusTower['totalBonuses'];
} {
  const tierConfig = getTierConfig(tower.currentTier);
  const isMilestone = MILESTONE_BLOCKS.includes(tower.totalBlocks + 1);
  const isHighQuality = sessionQuality >= 90;
  const isSpecial = isMilestone || isHighQuality;
  let bonusValue = tierConfig.bonusPerBlock;
  if (isHighQuality) {
    bonusValue *= 1.5;
  }
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
  const newBlocksThisTier = tower.blocksThisTier + 1;
  const tierUp = newBlocksThisTier >= tierConfig.maxBlocks;
  const newTier = tierUp ? tower.currentTier + 1 : tower.currentTier;
  const newBlocksThisTierAfter = tierUp ? 0 : newBlocksThisTier;
  const newTotalBlocks = tower.totalBlocks + 1;
  const milestoneReached = isMilestone ? newTotalBlocks : null;
  const totalBonuses = calculateTotalBonuses(tower, newBlock);
  const newAchievements = [...tower.achievementsUnlocked];
  if (milestoneReached === 100) {
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
    maxBlocksPerTier: getTierConfig(newTier).maxBlocks,
    totalHeight: tower.totalHeight + (isSpecial ? 1.5 : 1),
    lastBlockEarnedAt: now,
    totalBonuses,
    achievementsUnlocked: newAchievements,
  };
  eventBus.publish('focus_tower:block_added', {
    userId: tower.userId,
    block: newBlock,
    newTotal: newTotalBlocks,
    tierUp,
    milestoneReached: milestoneReached ?? undefined,
  });
  if (tierUp) {
    eventBus.publish('focus_tower:tier_up', {
      userId: tower.userId,
      newTier,
      tierName: getTierConfig(newTier).name,
    });
  }
  if (milestoneReached) {
    eventBus.publish('focus_tower:milestone', {
      userId: tower.userId,
      milestone: milestoneReached,
      totalBlocks: newTotalBlocks,
    });
  }
  return { updatedTower, newBlock, tierUp, milestoneReached, totalBonuses };
}

export function getTowerDisplay(tower: FocusTower): {
  height: string;
  tierName: string;
  tierColor: string;
  nextMilestone: number;
  progressToMilestone: number;
  totalBonusesText: string;
} {
  const tierConfig = getTierConfig(tower.currentTier);
  const nextMilestone =
    MILESTONE_BLOCKS.find((m) => m > tower.totalBlocks) ?? 1000;
  const progressToMilestone = Math.floor(
    ((tower.totalBlocks % nextMilestone) / nextMilestone) * 100,
  );
  const bonuses: string[] = [];
  if (tower.totalBonuses.progressAcceleration > 0) {
    bonuses.push(`+${tower.totalBonuses.progressAcceleration}% faster progress`);
  }
  if (tower.totalBonuses.momentumResistanceHours > 0) {
    bonuses.push(`+${tower.totalBonuses.momentumResistanceHours}h momentum buffer`);
  }
  if (tower.totalBonuses.focusResilienceBonus > 0) {
    bonuses.push(`+${tower.totalBonuses.focusResilienceBonus}% focus resilience`);
  }
  return {
    height: `${Math.floor(tower.totalHeight)}m`,
    tierName: tierConfig.name,
    tierColor: tierConfig.color,
    nextMilestone,
    progressToMilestone,
    totalBonusesText: bonuses.join(' | ') || 'Build your tower for bonuses!',
  };
}

export function formatTowerBlockVisual(block: TowerBlock): {
  icon: string;
  color: string;
  glow: boolean;
} {
  const tierConfig = getTierConfig(block.tier);
  return {
    icon: block.isSpecial ? 'star' : 'block',
    color: tierConfig.color,
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
  const current =
    heights.findLast((h) => tower.totalBlocks >= h.blocks) ?? heights[0]!;
  const next = heights.find((h) => tower.totalBlocks < h.blocks);
  if (!next) {
    return `${current.label} - Maximum Height!`;
  }
  const remaining = next.blocks - tower.totalBlocks;
  return `${current.label} -> ${next.label} (${remaining} blocks to go)`;
}
