import type { PrestigeBonus, PrestigeState } from "./prestige-types";

export const PRESTIGE_BONUSES: PrestigeBonus[] = [
  {
    id: "xp_boost_5",
    name: "Wisdom of Experience",
    description: "+5% XP from all sessions",
    type: "XP_BOOST",
    value: 5,
    icon: "🧠",
    rarity: "COMMON",
  },
  {
    id: "coin_boost_10",
    name: "Golden Touch",
    description: "+10% coins from rewards",
    type: "COIN_BOOST",
    value: 10,
    icon: "🪙",
    rarity: "COMMON",
  },
  {
    id: "drop_boost_5",
    name: "Fortune's Favor",
    description: "+5% rare drop chance",
    type: "DROP_CHANCE",
    value: 5,
    icon: "🍀",
    rarity: "COMMON",
  },
  {
    id: "xp_boost_10",
    name: "Master's Insight",
    description: "+10% XP from all sessions",
    type: "XP_BOOST",
    value: 10,
    icon: "👁️",
    rarity: "RARE",
  },
  {
    id: "damage_boost_10",
    name: "Focused Fury",
    description: "+10% damage to bosses",
    type: "DAMAGE_BOOST",
    value: 10,
    icon: "⚔️",
    rarity: "RARE",
  },
  {
    id: "time_reduction_10",
    name: "Flow State",
    description: "-10% time to complete daily challenges",
    type: "TIME_REDUCTION",
    value: 10,
    icon: "⏱️",
    rarity: "RARE",
  },
  {
    id: "xp_boost_15",
    name: "Transcendent Mind",
    description: "+15% XP from all sessions",
    type: "XP_BOOST",
    value: 15,
    icon: "🧘",
    rarity: "EPIC",
  },
  {
    id: "damage_boost_20",
    name: "Unstoppable Force",
    description: "+20% damage to bosses",
    type: "DAMAGE_BOOST",
    value: 20,
    icon: "💥",
    rarity: "EPIC",
  },
  {
    id: "drop_boost_15",
    name: "Treasure Hunter",
    description: "+15% legendary drop chance",
    type: "DROP_CHANCE",
    value: 15,
    icon: "💎",
    rarity: "EPIC",
  },
  {
    id: "xp_boost_25",
    name: "Eternal Student",
    description: "+25% XP from all sessions",
    type: "XP_BOOST",
    value: 25,
    icon: "📚",
    rarity: "LEGENDARY",
  },
  {
    id: "special_nightmare",
    name: "Nightmare Walker",
    description: "Unlock Nightmare difficulty permanently",
    type: "SPECIAL",
    value: 0,
    icon: "👻",
    rarity: "LEGENDARY",
  },
  {
    id: "special_dual_path",
    name: "Path Diverger",
    description: "Progress on two journey paths simultaneously",
    type: "SPECIAL",
    value: 0,
    icon: "🛤️",
    rarity: "LEGENDARY",
  },
];

export function calculatePrestigeBonuses(
  prestigeLevel: number,
  _totalXp: number,
): PrestigeBonus[] {
  const bonuses: PrestigeBonus[] = [];
  const availableBonuses = PRESTIGE_BONUSES.filter((b) => {
    if (b.rarity === "COMMON") return prestigeLevel >= 1;
    if (b.rarity === "RARE") return prestigeLevel >= 4;
    if (b.rarity === "EPIC") return prestigeLevel >= 7;
    if (b.rarity === "LEGENDARY") return prestigeLevel >= 10;
    return false;
  });
  const bonusCount = Math.min(3, 1 + Math.floor(prestigeLevel / 3));
  for (let i = 0; i < bonusCount && i < availableBonuses.length; i++) {
    const index = (prestigeLevel * 7 + i * 13) % availableBonuses.length;
    bonuses.push(availableBonuses[index]!);
  }
  return bonuses;
}

export function applyPrestigeBonuses(
  baseValue: number,
  bonusType: PrestigeBonus["type"],
  prestigeState: PrestigeState,
): number {
  const relevantBonuses = PRESTIGE_BONUSES.filter(
    (b) => prestigeState.activeBonuses.includes(b.id) && b.type === bonusType,
  );
  let multiplier = 1;
  for (const bonus of relevantBonuses) {
    multiplier += bonus.value / 100;
  }
  return Math.floor(baseValue * multiplier);
}

export function getTotalBonusPercent(
  bonusType: PrestigeBonus["type"],
  prestigeState: PrestigeState,
): number {
  return PRESTIGE_BONUSES.filter(
    (b) => prestigeState.activeBonuses.includes(b.id) && b.type === bonusType,
  ).reduce((sum, b) => sum + b.value, 0);
}
