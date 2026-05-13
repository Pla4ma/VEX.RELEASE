import { eventBus } from "../../events";
import * as Sentry from "@sentry/react-native";
import { z } from "zod";


export function checkEncounterEnd(
  encounter: ActiveEncounter,
  now: number = Date.now(),
): {
  ended: boolean;
  victory: boolean;
  reason: 'DEFEATED' | 'TIMED_OUT' | 'ABANDONED' | 'ACTIVE';
  rewards: Array<{ type: string; amount: number }>;
} {
  // Check victory
  if (encounter.bossCurrentHealth <= 0) {
    return {
      ended: true,
      victory: true,
      reason: 'DEFEATED',
      rewards: calculateVictoryRewards(encounter),
    };
  }

  // Check timeout
  if (now > encounter.expiresAt) {
    return {
      ended: true,
      victory: false,
      reason: 'TIMED_OUT',
      rewards: [],
    };
  }

  // Check user focus energy depletion (defeat condition)
  if (encounter.userCurrentFocusEnergy <= 0) {
    return {
      ended: true,
      victory: false,
      reason: 'ABANDONED',
      rewards: [{ type: 'CONSOLATION_XP', amount: Math.floor(encounter.totalDamageDealt / 10) }],
    };
  }

  return {
    ended: false,
    victory: false,
    reason: 'ACTIVE',
    rewards: [],
  };
}

export function formatCombatStatus(encounter: ActiveEncounter): {
  bossHealthBar: string;
  energyBar: string;
  phaseIndicator: string;
  timeRemaining: string;
  activeAttack: string | null;
} {
  const bossPercent = Math.floor((encounter.bossCurrentHealth / encounter.bossMaxHealth) * 100);
  const energyPercent = Math.floor((encounter.userCurrentFocusEnergy / encounter.userMaxFocusEnergy) * 100);

  const bossBar = '█'.repeat(bossPercent / 5) + '░'.repeat(20 - bossPercent / 5);
  const energyBar = '█'.repeat(energyPercent / 5) + '░'.repeat(20 - energyPercent / 5);

  const timeMs = encounter.expiresAt - Date.now();
  const timeMinutes = Math.floor(timeMs / 60000);

  return {
    bossHealthBar: `${bossBar} ${bossPercent}%`,
    energyBar: `${energyBar} ${energyPercent}%`,
    phaseIndicator: encounter.currentPhase,
    timeRemaining: timeMinutes > 0 ? `${timeMinutes}m` : 'EXPIRING!',
    activeAttack: encounter.currentAttackPattern ? ATTACK_PATTERNS[encounter.currentAttackPattern]?.name : null,
  };
}