import { eventBus } from "../../events";
import * as Sentry from "@sentry/react-native";
import { z } from "zod";


export function formatTowerBlockVisual(block: TowerBlock): {
  icon: string;
  color: string;
  glow: boolean;
} {
  const tierConfig = TIER_CONFIG[block.tier - 1];

  return {
    icon: block.isSpecial ? '⭐' : '🧱',
    color: tierConfig?.color || 'theme.colors.primary[500]',
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