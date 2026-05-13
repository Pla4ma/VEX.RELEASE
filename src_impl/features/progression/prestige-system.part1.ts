import { z } from "zod";
import type { UnifiedMasteryState } from "./unified-mastery";


export const PrestigeBonusSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(['XP_BOOST', 'COIN_BOOST', 'DROP_CHANCE', 'DAMAGE_BOOST', 'TIME_REDUCTION', 'SPECIAL']),
  value: z.number(), // Percent or flat value
  icon: z.string(),
  rarity: z.enum(['COMMON', 'RARE', 'EPIC', 'LEGENDARY']),
});

export const PRESTIGE_BONUSES: PrestigeBonus[] = [
  // Common bonuses (Prestige 1-3)
  {
    id: 'xp_boost_5',
    name: 'Wisdom of Experience',
    description: '+5% XP from all sessions',
    type: 'XP_BOOST',
    value: 5,
    icon: '🧠',
    rarity: 'COMMON',
  },
  {
    id: 'coin_boost_10',
    name: 'Golden Touch',
    description: '+10% coins from rewards',
    type: 'COIN_BOOST',
    value: 10,
    icon: '🪙',
    rarity: 'COMMON',
  },
  {
    id: 'drop_boost_5',
    name: "Fortune's Favor",
    description: '+5% rare drop chance',
    type: 'DROP_CHANCE',
    value: 5,
    icon: '🍀',
    rarity: 'COMMON',
  },

  // Rare bonuses (Prestige 4-6)
  {
    id: 'xp_boost_10',
    name: "Master's Insight",
    description: '+10% XP from all sessions',
    type: 'XP_BOOST',
    value: 10,
    icon: '👁️',
    rarity: 'RARE',
  },
  {
    id: 'damage_boost_10',
    name: 'Focused Fury',
    description: '+10% damage to bosses',
    type: 'DAMAGE_BOOST',
    value: 10,
    icon: '⚔️',
    rarity: 'RARE',
  },
  {
    id: 'time_reduction_10',
    name: 'Flow State',
    description: '-10% time to complete daily challenges',
    type: 'TIME_REDUCTION',
    value: 10,
    icon: '⏱️',
    rarity: 'RARE',
  },

  // Epic bonuses (Prestige 7-9)
  {
    id: 'xp_boost_15',
    name: 'Transcendent Mind',
    description: '+15% XP from all sessions',
    type: 'XP_BOOST',
    value: 15,
    icon: '🧘',
    rarity: 'EPIC',
  },
  {
    id: 'damage_boost_20',
    name: 'Unstoppable Force',
    description: '+20% damage to bosses',
    type: 'DAMAGE_BOOST',
    value: 20,
    icon: '💥',
    rarity: 'EPIC',
  },
  {
    id: 'drop_boost_15',
    name: 'Treasure Hunter',
    description: '+15% legendary drop chance',
    type: 'DROP_CHANCE',
    value: 15,
    icon: '💎',
    rarity: 'EPIC',
  },

  // Legendary bonuses (Prestige 10+)
  {
    id: 'xp_boost_25',
    name: 'Eternal Student',
    description: '+25% XP from all sessions',
    type: 'XP_BOOST',
    value: 25,
    icon: '📚',
    rarity: 'LEGENDARY',
  },
  {
    id: 'special_nightmare',
    name: 'Nightmare Walker',
    description: 'Unlock Nightmare difficulty permanently',
    type: 'SPECIAL',
    value: 0,
    icon: '👻',
    rarity: 'LEGENDARY',
  },
  {
    id: 'special_dual_path',
    name: 'Path Diverger',
    description: 'Progress on two journey paths simultaneously',
    type: 'SPECIAL',
    value: 0,
    icon: '🛤️',
    rarity: 'LEGENDARY',
  },
];

export function canPrestige(masteryState: UnifiedMasteryState, prestigeState: PrestigeState): { canPrestige: boolean; reason: string | null; recommended: boolean } {
  // Check if all tracks at max level
  const allMaxed = Object.values(masteryState.tracks).every((track) => track.level >= 50);

  if (!allMaxed) {
    const maxedTracks = Object.entries(masteryState.tracks)
      .filter(([_, t]) => t.level >= 50)
      .map(([name]) => name);

    return {
      canPrestige: false,
      reason: `Max all 5 tracks first. Maxed: ${maxedTracks.join(', ') || 'none'}`,
      recommended: false,
    };
  }

  // Check if user has unclaimed rewards
  // (Optional - could require claiming everything first)

  // After prestige 5, require minimum time between prestiges
  if (prestigeState.prestigeLevel >= 5) {
    const daysSinceLastPrestige = prestigeState.lastPrestigeAt ? (Date.now() - prestigeState.lastPrestigeAt) / (1000 * 60 * 60 * 24) : Infinity;

    if (daysSinceLastPrestige < 7) {
      return {
        canPrestige: false,
        reason: `Wait ${Math.ceil(7 - daysSinceLastPrestige)} more days between high-level prestiges`,
        recommended: false,
      };
    }
  }

  return {
    canPrestige: true,
    reason: null,
    recommended: true,
  };
}