/**
 * Boss Roster Expansion
 *
 * Phase 11.1 — 6 new bosses with distinct personalities and mechanics
 * These bosses provide variety and different challenges for users
 */

import { type BossTemplate, type BossRewardType } from './types';

// ============================================================================
// Extended Boss Interface (includes Phase 11 expansion properties)
// ============================================================================

export interface ExpansionBossTemplate extends BossTemplate {
  // Extended properties for Phase 11 bosses
  damageType: string;
  unlockRequirement: {
    type: string;
    value: number;
    description: string;
  };
  spawnConditions: {
    timeOfDay: string | null;
    dayOfWeek: string | null;
    specialCondition: string | null;
  };
  flavorText: string[];
  artworkDescription: string;
  mechanics: {
    specialAbility: string;
    abilityDescription: string;
    damageMultiplier: {
      condition: string;
      multiplier: number;
      description: string;
    };
  };
}

// ============================================================================
// New Boss Definitions
// ============================================================================

export const EXPANSION_BOSSES: ExpansionBossTemplate[] = [
  {
    id: 'boss-doomscroller',
    name: 'The Doomscroller',
    description: 'An insidious entity that feeds on endless scrolling and distracted attention. It grows stronger with every notification checked during focus time.',
    avatarUrl: null,
    tier: 3,
    baseHealth: 1500,
    healthScaling: 1.2,
    minLevel: 10,
    previousBossId: null,
    timeLimit: 72 * 60 * 60 * 1000, // 72 hours
    rewardType: 'COINS' as BossRewardType,
    rewardAmount: 150,
    rewardItemId: 'focus-shield',
    taunts: {
      spawn: "You'll check your phone eventually... they all do.",
      halfHealth: 'My notifications hunger for your attention...',
      nearDeath: 'NO! I need... just... one... more... scroll...',
    },
    // Phase 11 extended properties
    damageType: 'DISTRACTION',
    unlockRequirement: {
      type: 'SESSION_QUALITY',
      value: 80,
      description: 'Complete a session with 80+ quality score while resisting phone distractions',
    },
    spawnConditions: {
      timeOfDay: null,
      dayOfWeek: null,
      specialCondition: 'USER_HAS_DISTRACTION_HISTORY',
    },
    flavorText: [
      '"Just one more scroll..." it whispers, feeding on your fractured attention.',
      'The Doomscroller grows fatter with every notification you check.',
      'Your focus is its feast. Your discipline is its poison.',
    ],
    artworkDescription: 'A shadowy figure with multiple phone screens emanating from its body, eyes glowing with notification badges. Dark purple and black color scheme with notification bubble motifs.',
    mechanics: {
      specialAbility: 'NOTIFICATION_SPAWN',
      abilityDescription: 'Spawns distracting notification pop-ups during battle. User takes damage if they interact with them.',
      damageMultiplier: {
        condition: 'PHONE_DISTRACTION_DETECTED',
        multiplier: 2.0,
        description: 'Double damage if user checks phone during session',
      },
    },
  },

  {
    id: 'boss-burnout-beast',
    name: 'Burnout Beast',
    description: 'A massive creature formed from exhaustion and overwork. It can only be defeated through coordinated squad efforts.',
    avatarUrl: null,
    tier: 5,
    baseHealth: 5000,
    healthScaling: 1.5,
    minLevel: 20,
    previousBossId: null,
    timeLimit: 120 * 60 * 60 * 1000, // 120 hours
    rewardType: 'ITEM' as BossRewardType,
    rewardAmount: 500,
    rewardItemId: 'coordinated-focus-crystal',
    taunts: {
      spawn: 'One warrior cannot defeat me. You need your squad...',
      halfHealth: 'Your coordination wavers... I feel your exhaustion!',
      nearDeath: 'IMPOSSIBLE! A squad in perfect sync... cannot... fall...',
    },
    damageType: 'SQUAD_COOPERATIVE',
    unlockRequirement: {
      type: 'SQUAD_SESSIONS',
      value: 3,
      description: 'Complete 3 simultaneous squad sessions to unlock',
    },
    spawnConditions: {
      timeOfDay: null,
      dayOfWeek: null,
      specialCondition: 'SQUAD_ONLY',
    },
    flavorText: [
      'The Burnout Beast feeds on isolated struggle. Together, you are stronger.',
      'One warrior cannot defeat this beast. But a squad in sync? Unstoppable.',
      'It whispers: "Rest alone." But you answer: "Rise together."',
    ],
    artworkDescription: 'A massive, lumbering creature made of smoke and exhaustion symbols. Multiple arms reaching out, each holding a clock showing different times. Requires 4 squad members to surround it in the artwork.',
    mechanics: {
      specialAbility: 'SYNCHRONIZED_STRIKE',
      abilityDescription: 'All squad members must start sessions within 5 minutes of each other to deal damage.',
      damageMultiplier: {
        condition: 'SQUAD_SYNCHRONIZED',
        multiplier: 3.0,
        description: 'Triple damage when 3+ squad members session simultaneously',
      },
    },
  },

  {
    id: 'boss-monday-demon',
    name: 'The Monday Demon',
    description: 'A notorious entity that emerges every Monday with boosted health and aggression. The start of the week is its domain.',
    avatarUrl: null,
    tier: 4,
    baseHealth: 2500,
    healthScaling: 1.3,
    minLevel: 15,
    previousBossId: null,
    timeLimit: 24 * 60 * 60 * 1000, // 24 hours (Monday only)
    rewardType: 'ITEM' as BossRewardType,
    rewardAmount: 200,
    rewardItemId: 'motivation-amulet',
    taunts: {
      spawn: 'Monday is my kingdom. Your motivation is my prey.',
      halfHealth: "Getting harder to resist the dread, isn't it?",
      nearDeath: "NO! This can't be happening... not on MY day!",
    },
    damageType: 'TEMPORAL',
    unlockRequirement: {
      type: 'MONDAY_SESSIONS',
      value: 5,
      description: 'Complete 5 Monday sessions to unlock this boss',
    },
    spawnConditions: {
      timeOfDay: null,
      dayOfWeek: 'MONDAY',
      specialCondition: null,
    },
    flavorText: [
      'Monday is its kingdom. Your motivation is its enemy.',
      '"Case of the Mondays?" No — case of the DEMONS.',
      'It feeds on dread and Monday morning procrastination. Show it no mercy.',
    ],
    artworkDescription: 'A demonic figure with a calendar crown showing only Mondays. Red and orange color scheme with alarm clock motifs. Carries a massive coffee cup as a weapon.',
    mechanics: {
      specialAbility: 'MONDAY_BOOST',
      abilityDescription: 'Has 50% more health on Mondays. Deals 25% more damage before noon.',
      damageMultiplier: {
        condition: 'MONDAY_MORNING',
        multiplier: 1.5,
        description: '1.5x damage before 12 PM on Mondays',
      },
    },
  },

  {
    id: 'boss-perfectionist',
    name: 'The Perfectionist',
    description: 'A pristine, crystalline entity that demands nothing less than excellence. Only S-grade sessions can damage it.',
    avatarUrl: null,
    tier: 4,
    baseHealth: 2000,
    healthScaling: 1.0,
    minLevel: 18,
    previousBossId: null,
    timeLimit: 96 * 60 * 60 * 1000, // 96 hours
    rewardType: 'ITEM' as BossRewardType,
    rewardAmount: 300,
    rewardItemId: 'crystal-of-excellence',
    taunts: {
      spawn: 'Good enough? NEVER. I accept only EXCELLENCE.',
      halfHealth: 'Your perfection falters... show me true mastery!',
      nearDeath: 'Perfection... shattered... how... imperfect...',
    },
    damageType: 'QUALITY_GATE',
    unlockRequirement: {
      type: 'S_GRADE_SESSIONS',
      value: 3,
      description: 'Complete 3 S-grade (95+ quality) sessions to unlock',
    },
    spawnConditions: {
      timeOfDay: null,
      dayOfWeek: null,
      specialCondition: 'USER_HAS_HIGH_QUALITY_HISTORY',
    },
    flavorText: [
      'Good enough? NEVER. The Perfectionist accepts only EXCELLENCE.',
      '"Aim for perfection" it demands. Show it your best.',
      'Mediocrity bounces off its crystalline form. Only mastery matters.',
    ],
    artworkDescription: 'A crystalline, geometric figure with sharp angles and mirror-like surfaces. Reflects perfect golden ratios. White, gold, and light blue color scheme.',
    mechanics: {
      specialAbility: 'QUALITY_SHIELD',
      abilityDescription: 'Takes NO damage from sessions below S-grade (95+ quality).',
      damageMultiplier: {
        condition: 'S_GRADE_SESSION',
        multiplier: 1.0,
        description: 'Normal damage only on S-grade (95+) sessions. 0 damage otherwise.',
      },
    },
  },

  {
    id: 'boss-midnight-procrastinator',
    name: 'Midnight Procrastinator',
    description: 'A shadowy figure that thrives in the late hours when sleep should come. It tempts you with "just one more" distraction.',
    avatarUrl: null,
    tier: 2,
    baseHealth: 1200,
    healthScaling: 1.1,
    minLevel: 8,
    previousBossId: null,
    timeLimit: 4 * 60 * 60 * 1000, // 4 hours (limited night window)
    rewardType: 'ITEM' as BossRewardType,
    rewardAmount: 120,
    rewardItemId: 'midnight-focus-charm',
    taunts: {
      spawn: "Just one more video... sleep can wait, can't it?",
      halfHealth: 'The night grows long... your discipline wavers...',
      nearDeath: 'No... the dawn... approaches... too... soon...',
    },
    damageType: 'NOCTURNAL',
    unlockRequirement: {
      type: 'LATE_NIGHT_SESSIONS',
      value: 2,
      description: 'Complete 2 sessions between 10 PM and 2 AM to unlock',
    },
    spawnConditions: {
      timeOfDay: '22:00-02:00',
      dayOfWeek: null,
      specialCondition: null,
    },
    flavorText: [
      '"Just one more video..." it hisses as midnight passes.',
      'Sleep? Who needs sleep when there are distractions? it whispers.',
      'The night is long, but your discipline is longer.',
    ],
    artworkDescription: 'A shadowy, ghost-like figure with glowing eyes and a clock showing midnight. Dark blue and black color scheme with moon and star motifs.',
    mechanics: {
      specialAbility: 'SLEEP_DEPRIVATION',
      abilityDescription: 'Appears only between 10 PM - 2 AM. Deals bonus damage the later it gets.',
      damageMultiplier: {
        condition: 'POST_MIDNIGHT',
        multiplier: 1.3,
        description: '1.3x damage between midnight and 2 AM',
      },
    },
  },

  {
    id: 'boss-comparison-trap',
    name: 'The Comparison Trap',
    description: 'An insidious entity that feeds on envy and self-doubt. Its health grows when you compare yourself to others.',
    avatarUrl: null,
    tier: 3,
    baseHealth: 1800,
    healthScaling: 1.15,
    minLevel: 12,
    previousBossId: null,
    timeLimit: 72 * 60 * 60 * 1000, // 72 hours
    rewardType: 'ITEM' as BossRewardType,
    rewardAmount: 180,
    rewardItemId: 'mirror-of-self-worth',
    taunts: {
      spawn: "They're doing better than you... comparison is inevitable.",
      halfHealth: 'Your envy feeds me... look at their progress again!',
      nearDeath: 'How... how can you succeed... without... comparing...',
    },
    damageType: 'RELATIVE',
    unlockRequirement: {
      type: 'RIVAL_BATTLES',
      value: 5,
      description: 'Complete 5 rival widget interactions to unlock',
    },
    spawnConditions: {
      timeOfDay: null,
      dayOfWeek: null,
      specialCondition: 'USER_VIEWS_RIVAL_PROFILE',
    },
    flavorText: [
      '"They\'re doing better than you..." it whispers. LIES.',
      'Comparison is the thief of joy. This beast is the thief of focus.',
      'Your only competition is who you were yesterday.',
    ],
    artworkDescription: 'A mirror-like entity that reflects twisted versions of the user. Purple and green color scheme with mirror fragments and shadow motifs.',
    mechanics: {
      specialAbility: 'ENVY_GROWTH',
      abilityDescription: 'Health increases by 10% each time user checks rival stats. Resets when user beats their own previous best.',
      damageMultiplier: {
        condition: 'PERSONAL_RECORD_BROKEN',
        multiplier: 2.0,
        description: 'Double damage when user beats their own personal record',
      },
    },
  },
];

// ============================================================================
// Boss Utilities
// ============================================================================

/**
 * Get all expansion bosses
 */
export function getExpansionBosses(): ExpansionBossTemplate[] {
  return EXPANSION_BOSSES;
}

/**
 * Get boss by ID
 */
export function getBossById(bossId: string): ExpansionBossTemplate | undefined {
  return EXPANSION_BOSSES.find((boss) => boss.id === bossId);
}

/**
 * Get available bosses based on user progress and current time
 */
export function getAvailableBosses(
  userProgress: {
    mondaySessions: number;
    sGradeSessions: number;
    lateNightSessions: number;
    squadSessions: number;
    rivalBattles: number;
    distractionHistory: boolean;
    highQualityHistory: boolean;
  },
  currentTime: Date
): ExpansionBossTemplate[] {
  return EXPANSION_BOSSES.filter((boss) => {
    // Check unlock requirements
    switch (boss.id) {
      case 'boss-doomscroller':
        return userProgress.distractionHistory;
      case 'boss-burnout-beast':
        return userProgress.squadSessions >= 3;
      case 'boss-monday-demon':
        return userProgress.mondaySessions >= 5;
      case 'boss-perfectionist':
        return userProgress.sGradeSessions >= 3;
      case 'boss-midnight-procrastinator':
        return userProgress.lateNightSessions >= 2;
      case 'boss-comparison-trap':
        return userProgress.rivalBattles >= 5;
      default:
        return false;
    }
  }).filter((boss) => {
    // Check spawn conditions
    if (boss.spawnConditions.dayOfWeek) {
      const dayMap = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      if (dayMap[currentTime.getDay()] !== boss.spawnConditions.dayOfWeek) {
        return false;
      }
    }

    if (boss.spawnConditions.timeOfDay) {
      const [start, end] = boss.spawnConditions.timeOfDay.split('-');
      const currentHour = currentTime.getHours();
      const [startHour] = start.split(':').map(Number);
      const [endHour] = end.split(':').map(Number);

      // Handle midnight wraparound (22:00-02:00)
      if (startHour > endHour) {
        if (currentHour < startHour && currentHour > endHour) {
          return false;
        }
      } else {
        if (currentHour < startHour || currentHour >= endHour) {
          return false;
        }
      }
    }

    return true;
  });
}

/**
 * Get boss spawn schedule
 */
export function getBossSpawnSchedule(): {
  bossId: string;
  bossName: string;
  spawnWindow: string;
  daysAvailable: string[];
}[] {
  return EXPANSION_BOSSES.map((boss) => ({
    bossId: boss.id,
    bossName: boss.name,
    spawnWindow: boss.spawnConditions.timeOfDay || 'Any time',
    daysAvailable: boss.spawnConditions.dayOfWeek
      ? [boss.spawnConditions.dayOfWeek]
      : ['All days'],
  }));
}

/**
 * Get boss flavor text
 */
export function getBossFlavorText(bossId: string): string[] {
  const boss = getBossById(bossId);
  return boss?.flavorText || [];
}

/**
 * Get boss artwork description
 */
export function getBossArtworkDescription(bossId: string): string {
  const boss = getBossById(bossId);
  return boss?.artworkDescription || '';
}

// ============================================================================
// Type Exports
// ============================================================================
// ExpansionBossTemplate already exported as interface above
