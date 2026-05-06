/**
 * Journey Map System - VEX 10/10 Transformation
 *
 * Replaces linear Battle Pass with branching paths:
 * - 3 paths: Purity, Speed, Social
 * - Users can switch paths but progress splits
 * - Milestone rewards at path intersections
 * - Creates meaningful choices and replayability
 *
 * @phase 2B - Progression Consolidation
 */

import { z } from "zod";

// ============================================================================
// Core Types
// ============================================================================

export const JourneyPathSchema = z.enum(["PURITY", "SPEED", "SOCIAL", "BALANCED"]);
export type JourneyPath = z.infer<typeof JourneyPathSchema>;

export const JOURNEY_PATHS: JourneyPath[] = ["PURITY", "SPEED", "SOCIAL", "BALANCED"];

export interface JourneyNode {
  id: string;
  path: JourneyPath;
  tier: number;
  name: string;
  description: string;
  xpRequired: number;

  // Position for visual layout (0-100)
  position: { x: number; y: number };

  // Connections
  prevNodeIds: string[];
  nextNodeIds: string[];

  // Rewards
  rewards: JourneyReward[];

  // Special properties
  isMilestone: boolean;
  isIntersection: boolean; // Where paths meet
  isPathStart: boolean;
  isPathEnd: boolean;

  // Requirements
  requiredMasteryLevel?: number;
  requiredTrack?: string;
  requiredTrackLevel?: number;
}

export interface JourneyReward {
  id: string;
  type: "COINS" | "GEMS" | "ITEM" | "COSMETIC" | "BOOST" | "TITLE" | "EMOTE" | "AVATAR_FRAME";
  amount?: number;
  itemId?: string;
  rarity: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";
  name: string;
  description: string;
}

export interface UserJourneyProgress {
  userId: string;
  seasonId: string;

  // Current position
  currentNodeId: string;
  currentPath: JourneyPath;

  // XP tracking (per path)
  pathXp: Record<JourneyPath, number>;
  totalXp: number;

  // Node completion
  completedNodes: string[];
  claimedRewards: string[];

  // Path switching
  pathSwitchHistory: Array<{
    from: JourneyPath;
    to: JourneyPath;
    atNodeId: string;
    switchedAt: number;
  }>;

  // Premium status
  isPremium: boolean;
  premiumPurchasedAt?: number;

  // Timestamps
  startedAt: number;
  lastUpdated: number;
}

// ============================================================================
// Path Themes & Bonuses
// ============================================================================

export const PATH_CONFIG: Record<
  JourneyPath,
  {
    name: string;
    description: string;
    color: string;
    icon: string;
    focus: string;
    xpBonusSource: string;
    uniqueRewardType: string;
  }
> = {
  PURITY: {
    name: "Path of the Purist",
    description: "For those who value unbroken focus above all",
    color: "#4ECDC4",
    icon: "💎",
    focus: "High-purity sessions",
    xpBonusSource: "95%+ purity sessions",
    uniqueRewardType: "purity_cosmetics",
  },
  SPEED: {
    name: "Path of the Speedster",
    description: "For those who move fast and break records",
    color: "#FF6B35",
    icon: "⚡",
    focus: "Quick sessions and speed runs",
    xpBonusSource: "Sub-30min boss defeats",
    uniqueRewardType: "speed_boosts",
  },
  SOCIAL: {
    name: "Path of the Connector",
    description: "For those who thrive in community",
    color: "#9B59B6",
    icon: "🤝",
    focus: "Squad activities and rivals",
    xpBonusSource: "Squad sessions and raid participation",
    uniqueRewardType: "social_cosmetics",
  },
  BALANCED: {
    name: "Path of the Harmonist",
    description: "For those who walk all paths equally",
    color: "#95A5A6",
    icon: "☯️",
    focus: "All playstyles",
    xpBonusSource: "Completing daily challenges in all modes",
    uniqueRewardType: "versatility_badges",
  },
};

// ============================================================================
// Journey Map Layout (Tier 1-50)
// ============================================================================

export function generateJourneyMap(seasonId: string): JourneyNode[] {
  const nodes: JourneyNode[] = [];
  const nodeId = (path: JourneyPath, tier: number) => `${seasonId}_${path}_${tier}`;

  // Starting hub (Tier 0) - All paths start here
  const startNode: JourneyNode = {
    id: nodeId("BALANCED", 0),
    path: "BALANCED",
    tier: 0,
    name: "The Crossroads",
    description: "Choose your path",
    xpRequired: 0,
    position: { x: 50, y: 0 },
    prevNodeIds: [],
    nextNodeIds: [nodeId("PURITY", 1), nodeId("SPEED", 1), nodeId("SOCIAL", 1), nodeId("BALANCED", 1)],
    rewards: [],
    isMilestone: false,
    isIntersection: true,
    isPathStart: true,
    isPathEnd: false,
  };
  nodes.push(startNode);

  // Generate each path tiers 1-50
  for (const path of JOURNEY_PATHS) {
    for (let tier = 1; tier <= 50; tier++) {
      const isMilestone = tier % 10 === 0;
      const isIntersection = tier === 25 || tier === 50;

      const node: JourneyNode = {
        id: nodeId(path, tier),
        path,
        tier,
        name: generateNodeName(path, tier),
        description: generateNodeDescription(path, tier),
        xpRequired: calculateNodeXp(tier),
        position: calculateNodePosition(path, tier),
        prevNodeIds: tier === 1 ? [nodeId("BALANCED", 0)] : [nodeId(path, tier - 1)],
        nextNodeIds: isIntersection ? [nodeId("PURITY", tier + 1), nodeId("SPEED", tier + 1), nodeId("SOCIAL", tier + 1), nodeId("BALANCED", tier + 1)].filter((id) => id !== nodeId(path, tier + 1) || tier < 50) : tier < 50 ? [nodeId(path, tier + 1)] : [],
        rewards: generateNodeRewards(path, tier, isMilestone),
        isMilestone,
        isIntersection,
        isPathStart: tier === 1,
        isPathEnd: tier === 50,
        requiredMasteryLevel: tier >= 40 ? 25 : tier >= 30 ? 15 : tier >= 20 ? 10 : undefined,
      };

      nodes.push(node);
    }
  }

  // Add cross-path connections at intersections
  const tier25Nodes = nodes.filter((n) => n.tier === 25);
  for (const node of tier25Nodes) {
    node.nextNodeIds = tier25Nodes.map((n) => n.id).filter((id) => id !== node.id);
  }

  return nodes;
}

// ============================================================================
// Node Generation Helpers
// ============================================================================

function generateNodeName(path: JourneyPath, tier: number): string {
  const names: Record<JourneyPath, string[]> = {
    PURITY: ["Crystal Clear", "Focused Mind", "Deep State", "Unbroken Chain", "Enlightenment"],
    SPEED: ["Quick Start", "Rapid Progress", "Velocity", "Momentum", "Lightspeed"],
    SOCIAL: ["First Connection", "Growing Circle", "Community", "Leadership", "Legend"],
    BALANCED: ["First Steps", "Steady Pace", "Equilibrium", "Mastery", "Transcendence"],
  };

  const tierGroup = Math.floor((tier - 1) / 10);
  const nameIndex = Math.min(tierGroup, names[path].length - 1);
  return `${names[path][nameIndex]} ${tier}`;
}

function generateNodeDescription(path: JourneyPath, tier: number): string {
  const descriptions: Record<JourneyPath, string> = {
    PURITY: `Tier ${tier} on the Path of Purity. Maintain high focus to advance.`,
    SPEED: `Tier ${tier} on the Path of Speed. Complete sessions quickly to advance.`,
    SOCIAL: `Tier ${tier} on the Path of Social. Engage with your squad to advance.`,
    BALANCED: `Tier ${tier} on the Path of Balance. Master all techniques to advance.`,
  };
  return descriptions[path];
}

function calculateNodeXp(tier: number): number {
  // Tier 1: 500 XP, Tier 50: 5000 XP
  return 500 + (tier - 1) * 100;
}

function calculateNodePosition(path: JourneyPath, tier: number): { x: number; y: number } {
  // Visual layout: 4 paths diverging from center
  const pathOffsets: Record<JourneyPath, number> = {
    PURITY: -30,
    SPEED: -10,
    SOCIAL: 10,
    BALANCED: 30,
  };

  const x = 50 + pathOffsets[path];
  const y = tier * 2; // Vertical progression

  return { x, y };
}

function generateNodeRewards(path: JourneyPath, tier: number, isMilestone: boolean): JourneyReward[] {
  const rewards: JourneyReward[] = [];

  // Base reward every tier
  rewards.push({
    id: `tier_${tier}_base`,
    type: "COINS",
    amount: 100 + tier * 10,
    rarity: "COMMON",
    name: `${PATH_CONFIG[path].name} Token`,
    description: "Standard path progression reward",
  });

  // Milestone rewards
  if (isMilestone) {
    const rarity: JourneyReward["rarity"] = tier >= 40 ? "LEGENDARY" : tier >= 30 ? "EPIC" : tier >= 20 ? "RARE" : "UNCOMMON";

    rewards.push({
      id: `milestone_${tier}_special`,
      type: tier % 20 === 0 ? "COSMETIC" : "BOOST",
      rarity,
      name: `${PATH_CONFIG[path].icon} Milestone ${tier} Reward`,
      description: `Special reward for reaching tier ${tier} on the ${PATH_CONFIG[path].name}`,
    });

    // Path-specific reward at tier 25 and 50
    if (tier === 25 || tier === 50) {
      rewards.push({
        id: `path_exclusive_${tier}`,
        type: path === "SOCIAL" ? "TITLE" : path === "SPEED" ? "EMOTE" : path === "PURITY" ? "AVATAR_FRAME" : "ITEM",
        rarity: tier === 50 ? "LEGENDARY" : "EPIC",
        name: `${PATH_CONFIG[path].icon} ${PATH_CONFIG[path].name} ${tier === 50 ? "Grandmaster" : "Adept"}`,
        description: `Exclusive to those who reach tier ${tier} on this path`,
      });
    }
  }

  return rewards;
}

// ============================================================================
// XP Advancement Logic
// ============================================================================

export interface AdvanceXpResult {
  newProgress: UserJourneyProgress;
  nodesCompleted: JourneyNode[];
  rewardsUnlocked: JourneyReward[];
  pathSwitched: boolean;
  oldPath: JourneyPath | null;
  newPath: JourneyPath | null;
}

export function advanceJourneyXp(progress: UserJourneyProgress, nodes: JourneyNode[], xpAmount: number, _source: string): AdvanceXpResult {
  const newProgress = { ...progress };
  const nodesCompleted: JourneyNode[] = [];
  const rewardsUnlocked: JourneyReward[] = [];

  // Add XP to current path
  newProgress.pathXp[newProgress.currentPath] += xpAmount;
  newProgress.totalXp += xpAmount;

  // Check for node completion
  let currentNode = nodes.find((n) => n.id === newProgress.currentNodeId);
  if (!currentNode) {
    return { newProgress, nodesCompleted, rewardsUnlocked, pathSwitched: false, oldPath: progress.currentPath, newPath: null };
  }

  // Check if we can advance to next node
  while (currentNode && newProgress.pathXp[newProgress.currentPath] >= currentNode.xpRequired) {
    // Complete current node
    if (!newProgress.completedNodes.includes(currentNode.id)) {
      newProgress.completedNodes.push(currentNode.id);
      nodesCompleted.push(currentNode);

      // Collect unclaimed rewards
      for (const reward of currentNode.rewards) {
        if (!newProgress.claimedRewards.includes(reward.id)) {
          rewardsUnlocked.push(reward);
        }
      }
    }

    // Find next node
    const nextNodeId: string | undefined = currentNode.nextNodeIds[0];
    if (!nextNodeId) {
      break; // End of journey
    }

    const nextNode: JourneyNode | undefined = nodes.find((n) => n.id === nextNodeId);
    if (!nextNode) {
      break; // End of journey
    }

    newProgress.currentNodeId = nextNode.id;

    // Check if we switched paths
    if (nextNode.path !== newProgress.currentPath) {
      // Record switch
      newProgress.pathSwitchHistory.push({
        from: newProgress.currentPath,
        to: nextNode.path,
        atNodeId: currentNode.id,
        switchedAt: Date.now(),
      });
      newProgress.currentPath = nextNode.path;
    }

    currentNode = nextNode;
  }

  newProgress.lastUpdated = Date.now();

  return {
    newProgress,
    nodesCompleted,
    rewardsUnlocked,
    pathSwitched: newProgress.currentPath !== progress.currentPath,
    oldPath: progress.currentPath,
    newPath: newProgress.currentPath,
  };
}

// ============================================================================
// Path Switching Logic
// ============================================================================

export interface PathSwitchResult {
  success: boolean;
  newProgress: UserJourneyProgress | null;
  error: string | null;
  resetXp: number; // XP lost in the switch (split penalty)
}

export function switchPath(progress: UserJourneyProgress, targetPath: JourneyPath, nodes: JourneyNode[]): PathSwitchResult {
  // Can only switch at intersection nodes
  const currentNode = nodes.find((n) => n.id === progress.currentNodeId);
  if (!currentNode) {
    return { success: false, newProgress: null, error: "Invalid current node", resetXp: 0 };
  }

  if (!currentNode.isIntersection) {
    return { success: false, newProgress: null, error: "Can only switch paths at intersections (Tiers 25 & 50)", resetXp: 0 };
  }

  // Find target node at same tier on new path
  const targetNode = nodes.find((n) => n.tier === currentNode.tier && n.path === targetPath);
  if (!targetNode) {
    return { success: false, newProgress: null, error: "Target path not available", resetXp: 0 };
  }

  // Calculate XP penalty (50% of current path XP is lost/split)
  const currentPathXp = progress.pathXp[progress.currentPath];
  const resetXp = Math.floor(currentPathXp * 0.5);

  const newProgress: UserJourneyProgress = {
    ...progress,
    currentNodeId: targetNode.id,
    currentPath: targetPath,
    pathXp: {
      ...progress.pathXp,
      [progress.currentPath]: resetXp, // Keep half on old path
      [targetPath]: progress.pathXp[targetPath] || 0,
    },
    pathSwitchHistory: [
      ...progress.pathSwitchHistory,
      {
        from: progress.currentPath,
        to: targetPath,
        atNodeId: currentNode.id,
        switchedAt: Date.now(),
      },
    ],
    lastUpdated: Date.now(),
  };

  return {
    success: true,
    newProgress,
    error: null,
    resetXp,
  };
}

// ============================================================================
// Progress Queries
// ============================================================================

export function getJourneyProgressPercent(progress: UserJourneyProgress, nodes: JourneyNode[]): { pathPercent: number; overallPercent: number; estimatedDaysRemaining: number } {
  const currentNode = nodes.find((n) => n.id === progress.currentNodeId);
  if (!currentNode) {
    return { pathPercent: 0, overallPercent: 0, estimatedDaysRemaining: 0 };
  }

  // Path progress
  const pathNodes = nodes.filter((n) => n.path === progress.currentPath && n.tier > 0);
  const completedPathNodes = pathNodes.filter((n) => progress.completedNodes.includes(n.id));
  const pathPercent = (completedPathNodes.length / pathNodes.length) * 100;

  // Overall progress (all paths)
  const allProgressNodes = nodes.filter((n) => n.tier > 0);
  const completedAllNodes = allProgressNodes.filter((n) => progress.completedNodes.includes(n.id));
  const overallPercent = (completedAllNodes.length / allProgressNodes.length) * 100;

  // Estimate days remaining (assuming 500 XP per day average)
  const remainingNodes = pathNodes.filter((n) => n.tier > currentNode.tier);
  const remainingXp = remainingNodes.reduce((sum, n) => sum + n.xpRequired, 0);
  const estimatedDaysRemaining = Math.ceil(remainingXp / 500);

  return { pathPercent, overallPercent, estimatedDaysRemaining };
}

export function getRecommendedPath(userStats: { avgPurity: number; avgSessionDuration: number; squadSessions: number; soloSessions: number }): JourneyPath {
  const purityScore = userStats.avgPurity;
  const speedScore = userStats.avgSessionDuration < 30 ? 100 : 50;
  const socialScore = (userStats.squadSessions / (userStats.soloSessions + userStats.squadSessions)) * 100;

  const scores: Record<JourneyPath, number> = {
    PURITY: purityScore,
    SPEED: speedScore,
    SOCIAL: socialScore,
    BALANCED: (purityScore + speedScore + socialScore) / 3,
  };

  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] as JourneyPath;
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createInitialJourneyProgress(userId: string, seasonId: string, initialPath: JourneyPath = "BALANCED"): UserJourneyProgress {
  return {
    userId,
    seasonId,
    currentNodeId: `${seasonId}_BALANCED_0`,
    currentPath: initialPath,
    pathXp: {
      PURITY: 0,
      SPEED: 0,
      SOCIAL: 0,
      BALANCED: 0,
    },
    totalXp: 0,
    completedNodes: [`${seasonId}_BALANCED_0`],
    claimedRewards: [],
    pathSwitchHistory: [],
    isPremium: false,
    startedAt: Date.now(),
    lastUpdated: Date.now(),
  };
}
