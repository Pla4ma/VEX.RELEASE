import { eventBus } from "../../events";
import * as Sentry from "@sentry/react-native";
import { z } from "zod";


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