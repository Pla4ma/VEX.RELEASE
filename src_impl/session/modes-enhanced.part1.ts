import { SessionMode, SessionModeConfig, SESSION_MODE_CONFIG } from "./modes";


export const ENHANCED_SESSION_MODE_CONFIG: Partial<Record<SessionMode, EnhancedSessionModeConfig>> = {
  [SessionMode.FLOW]: {
    ...SESSION_MODE_CONFIG[SessionMode.FLOW],
    bossConfig: {
      damageMultiplier: 0.75,
      weakness: SessionMode.RECOVERY,
      resistance: SessionMode.CHALLENGE,
      phases: [
        {
          phaseThreshold: 0.5,
          mechanic: 'REGENERATION',
          intensity: 0.3,
          playerRisk: false,
        },
      ],
      specialRewardType: 'streak_items',
    },
    rewardBias: {
      primaryCurrency: 'COINS',
      secondaryDrops: ['consumables', 'streak_boosters'],
      rarityBoost: 0.1,
      guaranteedDropAtStreak: 7,
    },
    scoringFocus: {
      primaryMetric: 'CONSISTENCY',
      secondaryMetric: 'DURATION',
      primaryWeight: 0.5,
      secondaryWeight: 0.3,
      penaltyFor: ['EARLY_EXIT'],
    },
    description: 'Gentle focus sessions with forgiving mechanics. Perfect for building habits.',
    tacticalNote: 'Boss regenerates health if you pause. Stay consistent!',
    idealFor: ['Beginners', 'Building habits', 'Low-energy days'],
  },

  [SessionMode.CHALLENGE]: {
    ...SESSION_MODE_CONFIG[SessionMode.CHALLENGE],
    bossConfig: {
      damageMultiplier: 1.5,
      weakness: SessionMode.CREATIVE,
      resistance: SessionMode.FLOW,
      phases: [
        {
          phaseThreshold: 0.5,
          mechanic: 'FOCUS_SHIELD',
          intensity: 0.5,
          playerRisk: true,
        },
        {
          phaseThreshold: 0.25,
          mechanic: 'FOCUS_SHIELD',
          intensity: 0.8,
          playerRisk: true,
        },
      ],
      specialRewardType: 'xp_boosters',
    },
    rewardBias: {
      primaryCurrency: 'COINS',
      secondaryDrops: ['equipment', 'xp_scrolls'],
      rarityBoost: 0.2,
      guaranteedDropAtStreak: 5,
    },
    scoringFocus: {
      primaryMetric: 'PURITY',
      secondaryMetric: 'DURATION',
      primaryWeight: 0.6,
      secondaryWeight: 0.2,
      penaltyFor: ['PAUSE', 'LOW_PURITY'],
    },
    description: 'Uninterrupted deep focus. High risk, high reward.',
    tacticalNote: 'Boss enters shield phase at 50% and 25%. Maintain 85%+ purity or take damage!',
    idealFor: ['Hard problems', 'Flow state', 'Maximum XP gains'],
  },

  [SessionMode.RECOVERY]: {
    ...SESSION_MODE_CONFIG[SessionMode.RECOVERY],
    bossConfig: {
      damageMultiplier: 0.8,
      weakness: SessionMode.FLOW,
      resistance: SessionMode.CHALLENGE,
      phases: [
        {
          phaseThreshold: 0.75,
          mechanic: 'COUNTDOWN',
          intensity: 0.4,
          playerRisk: false,
        },
      ],
      specialRewardType: 'coin_multipliers',
    },
    rewardBias: {
      primaryCurrency: 'COINS',
      secondaryDrops: ['consumables', 'speed_boosters'],
      rarityBoost: 0.15,
      guaranteedDropAtStreak: 7,
    },
    scoringFocus: {
      primaryMetric: 'SPEED',
      secondaryMetric: 'PURITY',
      primaryWeight: 0.5,
      secondaryWeight: 0.3,
      penaltyFor: [],
    },
    description: 'Short, intense bursts. Speed kills.',
    tacticalNote: 'Timer pressure increases at 75% boss health. Move fast!',
    idealFor: ['Quick tasks', 'Pomodoro style', 'Time pressure'],
  },

  [SessionMode.CREATIVE]: {
    ...SESSION_MODE_CONFIG[SessionMode.CREATIVE],
    bossConfig: {
      damageMultiplier: 1.0,
      weakness: SessionMode.FLOW,
      resistance: SessionMode.FLOW,
      phases: [
        {
          phaseThreshold: 0.6,
          mechanic: 'IDEA_ORBS',
          intensity: 0.5,
          playerRisk: false,
        },
      ],
      specialRewardType: 'cosmetics',
    },
    rewardBias: {
      primaryCurrency: 'TOKENS',
      secondaryDrops: ['cosmetics', 'creative_tools'],
      rarityBoost: 0.25,
      guaranteedDropAtStreak: 10,
    },
    scoringFocus: {
      primaryMetric: 'DURATION',
      secondaryMetric: 'CONSISTENCY',
      primaryWeight: 0.45,
      secondaryWeight: 0.35,
      penaltyFor: ['EARLY_EXIT'],
    },
    description: 'Flow-state creativity. Orbs of inspiration appear mid-session.',
    tacticalNote: 'Idea Orbs appear at 40% boss health. Tap them for bonus damage!',
    idealFor: ['Writing', 'Design', 'Brainstorming', 'Art'],
  },

  };

export function getEnhancedModeConfig(mode: SessionMode): EnhancedSessionModeConfig {
  return ENHANCED_SESSION_MODE_CONFIG[mode] ?? ENHANCED_SESSION_MODE_CONFIG[SessionMode.FLOW]!;
}

export function calculateModeBonusDamage(
  mode: SessionMode,
  targetWeakness: SessionMode | null,
  targetResistance: SessionMode | null
): number {
  const config = getEnhancedModeConfig(mode).bossConfig;
  let multiplier = config.damageMultiplier;

  if (targetWeakness === mode) {
    multiplier *= 1.5; // 50% bonus for weakness
  }
  if (targetResistance === mode) {
    multiplier *= 0.5; // 50% penalty for resistance
  }

  return multiplier;
}